import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import PageGate from "@/components/pps/PageGate";
import { SITEMAP_STATIC_PAGES } from "../../scripts/lib/sitemap-pages.mjs";

const state = vi.hoisted(() => ({ status: "draft", role: null as string | null }));
vi.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: "/about" }) }));
vi.mock("@/hooks/usePageStatuses", () => ({ usePageStatuses: () => ({ map: {}, loading: false }) }));
vi.mock("@/hooks/useUserRole", () => ({ useUserRole: () => ({ role: state.role, loading: false }) }));
vi.mock("@/config/pageStatus", () => ({ resolvePageStatus: () => state.status }));
vi.mock("@/lib/lovablePreview", () => ({ isLovableEditorPreview: () => false }));
vi.mock("@/pages/NotFound", () => ({ default: () => <h1>Page not found</h1> }));

describe("Public draft access", () => {
  it("replaces draft content with the error page for visitors", () => {
    state.status = "draft"; state.role = null;
    render(<PageGate><h1>Private content</h1></PageGate>);
    expect(screen.queryByText("Private content")).toBeNull();
    expect(screen.getByRole("heading").textContent).toBe("Page not found");
    cleanup();
  });
  it("preserves staff preview and live About content", () => {
    state.role = "admin";
    render(<PageGate><h1>Private content</h1></PageGate>);
    expect(screen.getByText("Private content")).toBeTruthy();
    cleanup();
    state.role = null; state.status = "live";
    render(<PageGate><h1>About</h1></PageGate>);
    expect(screen.getByText("About")).toBeTruthy();
    cleanup();
  });
});

describe("Crawler error and access output", () => {
  it("lists the live About page but excludes legacy media and private burnout access", () => {
    const paths = SITEMAP_STATIC_PAGES.map((p: { path: string }) => p.path);
    expect(paths).toContain("/about");
    expect(paths).not.toContain("/media");
    expect(paths).not.toContain("/burnout-access");
  });
  it("writes noindex HTML for drafts, burnout access and the legacy media address", async () => {
    const source = readFileSync("scripts/prerender.mjs", "utf8");
    const files = new Map<string, string>();
    const ctx = vm.createContext({
      template: '<html><head><title>Home</title><meta name="description" content="Home"><link rel="canonical" href="https://onthepaintedporch.com/"></head><body><div id="root"></div></body></html>',
      SITE: "https://onthepaintedporch.com", DIST: "/output", ROOT: "/project",
      approvedRoutes: [
        { path: "/about", title: "About", description: "Private About copy", h1: "Private About copy" },
        { path: "/speaking/media", title: "Media", description: "Approved media", h1: "Media", intro: "Approved media" },
      ], movedPages: [], publicSupabaseEnv: () => ({}),
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
    expect(draft).not.toContain("Private About copy");
    expect(files.get("/output/burnout-access/index.html")).toContain('content="noindex, nofollow"');
    const media = files.get("/output/media/index.html") || "";
    expect(media).toContain('content="noindex, follow"');
    expect(media).toContain('href="https://onthepaintedporch.com/speaking/media"');
    // Extractors that discard noscript must still receive the generated text.
    const html = files.get("/output/speaking/media/index.html") || "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("noscript").forEach((el) => el.remove());
    expect(doc.querySelector("#root h1")?.textContent).toBe("Media");
    expect(doc.querySelector("#root p")?.textContent).toBe("Approved media");
  });
});