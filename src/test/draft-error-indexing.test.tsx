import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import PageGate from "@/components/pps/PageGate";
import { SITEMAP_STATIC_PAGES } from "../../scripts/lib/sitemap-pages.mjs";

// PPS Admin, 2026-11-23: "If its a draft/unfinished/pending it [can] show the coming soon
// page. If its archived it should redirect vs just saying page not found."
const state = vi.hoisted(() => ({
  status: "draft",
  role: null as string | null,
  pathname: "/about",
  search: "",
  hash: "",
  loading: false,
}));
vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: state.pathname, search: state.search, hash: state.hash }),
  Navigate: ({ to }: { to: string }) => <p data-testid="redirect">{to}</p>,
}));
vi.mock("@/hooks/usePageStatuses", () => ({ usePageStatuses: () => ({ map: {}, loading: state.loading }) }));
vi.mock("@/hooks/useUserRole", () => ({ useUserRole: () => ({ role: state.role, loading: false }) }));
vi.mock("@/config/pageStatus", () => ({ resolvePageStatus: () => state.status }));
vi.mock("@/lib/lovablePreview", () => ({ isLovableEditorPreview: () => false }));
vi.mock("@/pages/pps/ComingSoon", () => ({ default: () => <h1>Painting this porch as we speak</h1> }));

function visit(pathname: string, opts: Partial<typeof state> = {}) {
  Object.assign(state, { status: "draft", role: null, search: "", hash: "", loading: false }, opts, { pathname });
  render(<PageGate><h1>Private content</h1></PageGate>);
}

afterEach(cleanup);

describe("Public draft access", () => {
  it("shows visitors the Coming Soon page instead of a draft's content", () => {
    visit("/team-superpowers");
    expect(screen.queryByText("Private content")).toBeNull();
    expect(screen.getByRole("heading").textContent).toBe("Painting this porch as we speak");
  });
  it("lets admins and editors see draft pages", () => {
    visit("/team-superpowers", { role: "admin" });
    expect(screen.getByText("Private content")).toBeTruthy();
    cleanup();
    visit("/team-superpowers", { role: "editor" });
    expect(screen.getByText("Private content")).toBeTruthy();
  });
  it("renders live pages for everyone", () => {
    visit("/about", { status: "live" });
    expect(screen.getByText("Private content")).toBeTruthy();
  });
  it("renders nothing until page status and role are known", () => {
    visit("/home-archive-v2", { loading: true });
    expect(screen.queryByText("Private content")).toBeNull();
    expect(screen.queryByTestId("redirect")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
  });
});

describe("Archived pages", () => {
  it("sends visitors on to the page that replaced them, keeping the query and anchor", () => {
    visit("/partner/embody-archive", { search: "?utm_source=x", hash: "#faq" });
    expect(screen.getByTestId("redirect").textContent).toBe("/embody-shift?utm_source=x#faq");
    expect(screen.queryByText("Private content")).toBeNull();
  });
  it("sends the old homepage to the homepage", () => {
    visit("/home-archive-v2");
    expect(screen.getByTestId("redirect").textContent).toBe("/");
  });
  it("still shows admins the archived page for reference", () => {
    visit("/partner/embody-archive", { role: "admin" });
    expect(screen.getByText("Private content")).toBeTruthy();
    expect(screen.queryByTestId("redirect")).toBeNull();
  });
});

describe("Wrong-case and trailing-slash addresses", () => {
  it.each([
    ["/ABOUT", "/about"],
    ["/about/", "/about"],
    ["/Partner/Embody-Archive", "/partner/embody-archive"],
  ])("sends %s to %s instead of treating it as a draft", (pathname, expected) => {
    visit(pathname, { search: "?a=1" });
    expect(screen.getByTestId("redirect").textContent).toBe(`${expected}?a=1`);
    expect(screen.queryByRole("heading")).toBeNull();
  });
  it("sends staff to the real address too", () => {
    visit("/ABOUT", { role: "admin" });
    expect(screen.getByTestId("redirect").textContent).toBe("/about");
  });
});

describe("Crawler error and access output", () => {
  it("lists the live About page but excludes legacy media and private burnout access", () => {
    const paths = SITEMAP_STATIC_PAGES.map((p: { path: string }) => p.path);
    expect(paths).toContain("/about");
    expect(paths).not.toContain("/media");
    expect(paths).not.toContain("/burnout-access");
  });
  it("writes Coming Soon for drafts, forwards for archived pages, and noindex HTML for private and legacy addresses", async () => {
    const source = readFileSync("scripts/prerender.mjs", "utf8");
    const files = new Map<string, string>();
    const ctx = vm.createContext({
      template: '<html><head><title>Home</title><meta name="description" content="Home"><link rel="canonical" href="https://onthepaintedporch.com/"></head><body><div id="root"></div></body></html>',
      SITE: "https://onthepaintedporch.com", DIST: "/output", ROOT: "/project",
      approvedRoutes: [
        { path: "/about", title: "About", description: "Private About copy", h1: "Private About copy" },
        { path: "/speaking/media", title: "Media", description: "Approved media", h1: "Media", intro: "Approved media" },
      ], movedPages: [], publicSupabaseEnv: () => ({}),
      archivedPages: { "/speaking/media-archive": "/speaking/media", "/about-archive": "/about" },
      DEFAULT_SHARE_IMAGE_PATH: "/og/og-default.jpg", DEFAULT_SHARE_IMAGE_ALT: "Default card",
      fetchLivePageRows: async () => [], loadAppPageRules: () => ({}),
      pageVisibility: () => ({ isPublic: (p: string) => p !== "/about" }),
      path: { join: (...parts: string[]) => parts.join("/") },
      mkdir: async () => {}, writeFile: async (p: string, html: string) => files.set(p, html),
      serializeMediaAppearanceSchema: JSON.stringify, console,
    });
    const functions = source.slice(source.indexOf("const escapeHtml"), source.indexOf("const template ="))
      + source.slice(source.indexOf("function replaceTag"), source.indexOf("let ok ="));
    vm.runInContext(functions, ctx);
    const loops = source.slice(source.indexOf("let ok ="), source.indexOf("// ── Dynamic:"));
    await vm.runInContext(`(async () => {${loops}})()`, ctx);

    const draft = files.get("/output/about/index.html") || "";
    expect(draft).toContain('content="noindex, nofollow"');
    expect(draft).toContain("Painting this porch as we speak");
    expect(draft).toContain("Coming Soon | Painted Porch Strategies");
    expect(draft).not.toContain("Private About copy");

    expect(files.get("/output/burnout-access/index.html")).toContain('content="noindex, nofollow"');

    const media = files.get("/output/media/index.html") || "";
    expect(media).toContain('content="noindex, follow"');
    expect(media).toContain('href="https://onthepaintedporch.com/speaking/media"');

    const archived = files.get("/output/speaking/media-archive/index.html") || "";
    expect(archived).toContain('content="noindex, follow"');
    expect(archived).toContain('<link rel="canonical" href="https://onthepaintedporch.com/speaking/media"');
    expect(archived).toContain('location.replace("/speaking/media"');
    // An archived page whose replacement isn't live is left to the app, never written.
    expect(files.has("/output/about-archive/index.html")).toBe(false);

    // Extractors that discard noscript must still receive the generated text.
    const html = files.get("/output/speaking/media/index.html") || "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("noscript").forEach((el) => el.remove());
    expect(doc.querySelector("#root h1")?.textContent).toBe("Media");
    expect(doc.querySelector("#root p")?.textContent).toBe("Approved media");
  });
});
