import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ALWAYS_LIVE_PREFIXES as APP_ALWAYS_LIVE,
  resolvePageStatus,
  type PageStatusMap,
} from "@/config/pageStatus";
import { FORWARDS_TO, MOVED_FROM } from "@/config/movedPages";
import { collectSitemapPaths, sitemapData } from "@/pages/pps/Sitemap";
import {
  loadAppPageRules,
  pageVisibility,
  readGatedAppRoutePaths,
  readSitemapRegistryPaths,
  robotsDisallowRules,
} from "../../scripts/lib/public-pages.mjs";
import { SITEMAP_STATIC_PAGES } from "../../scripts/lib/sitemap-pages.mjs";

/**
 * The build writes public/sitemap.xml and public/robots.txt and prerenders
 * pages from page_status data read with the public key, which only returns
 * live rows. These tests pin the rules those scripts share
 * (scripts/lib/public-pages.mjs) to the app's own Draft gate.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");

const appRules = loadAppPageRules();

// Small fixed rules for the robots examples, so they don't change with the site.
const testRules = {
  alwaysLive: ["/admin", "/reset-password", "/resources/insights"],
  movedFrom: { "/new-home": "/old-home" },
  forwardsTo: { "/old-home": "/new-home" },
};

const liveRows = [
  { path: "/", status: "live", category: "public" },
  { path: "/about", status: "live", category: "public" },
  { path: "/speaking", status: "live", category: "public" },
  { path: "/speaking/media/:id", status: "live", category: "public" },
  { path: "/old-landing", status: "live", category: "archived" },
  { path: "/team-notes", status: "live", category: "internal" },
];

describe("build scripts follow the app's Draft gate", () => {
  it("read ALWAYS_LIVE_PREFIXES, MOVED_FROM and FORWARDS_TO from the app's config", () => {
    expect(appRules.alwaysLive).toEqual([...APP_ALWAYS_LIVE]);
    expect(appRules.movedFrom).toEqual({ ...MOVED_FROM });
    expect(appRules.forwardsTo).toEqual({ ...FORWARDS_TO });
  });

  it("treat a page as public exactly when the app shows it to visitors", () => {
    // What a visitor's browser sees: only live rows (RLS).
    const map: PageStatusMap = Object.fromEntries(
      liveRows.map((r, i) => [
        r.path,
        { id: String(i), path: r.path, status: "live", category: r.category, note: null, updated_at: "" },
      ]),
    ) as PageStatusMap;
    const rows = [
      ...liveRows,
      // An old address that is live: its new address inherits that (MOVED_FROM).
      { path: Object.values(MOVED_FROM)[0], status: "live", category: "public" },
    ];
    for (const r of rows.slice(liveRows.length)) {
      map[r.path] = { id: r.path, path: r.path, status: "live", category: "public", note: null, updated_at: "" } as never;
    }
    const { isPublic } = pageVisibility(rows, appRules);
    const paths = [
      ...collectSitemapPaths(),
      ...SITEMAP_STATIC_PAGES.map((p: { path: string }) => p.path),
      ...Object.keys(MOVED_FROM),
      ...Object.values(MOVED_FROM),
      ...Object.keys(FORWARDS_TO),
      ...Object.values(FORWARDS_TO),
      "/speaking/media/abc-123",
      "/resources/insights/some-post",
      "/not-a-page",
    ];
    let publicCount = 0;
    for (const p of paths) {
      expect({ p, public: isPublic(p) }).toEqual({ p, public: resolvePageStatus(p, map) === "live" });
      if (isPublic(p)) publicCount++;
    }
    // Both outcomes are exercised.
    expect(publicCount).toBeGreaterThan(0);
    expect(publicCount).toBeLessThan(paths.length);
  });

  it("keep internal and archived pages out of search but not hidden from visitors", () => {
    const { isPublic, isSearchable } = pageVisibility(liveRows, testRules);
    expect(isPublic("/old-landing")).toBe(true);
    expect(isSearchable("/old-landing")).toBe(false);
    expect(isSearchable("/team-notes")).toBe(false);
    expect(isSearchable("/about")).toBe(true);
    expect(isSearchable("/draft-page")).toBe(false);
  });

  it("ignore draft rows even if a key that can see them is used", () => {
    const { isPublic } = pageVisibility([{ path: "/draft-page", status: "draft", category: "public" }], testRules);
    expect(isPublic("/draft-page")).toBe(false);
  });

  it("read the /sitemap page registry the same way the app does", () => {
    expect(readSitemapRegistryPaths()).toEqual(collectSitemapPaths(sitemapData));
  });
});

describe("router reading (robots.txt known pages)", () => {
  it("lists pages behind the Draft gate and leaves out admin, ungated redirects and wildcards", () => {
    const routes = readGatedAppRoutePaths();
    for (const p of ["/", "/amy", "/phase-zero", "/resources/free"]) expect(routes).toContain(p);
    for (const p of ["/admin", "/admin/users", "/admin/login", "/users", "/pps", "/reset-password"]) {
      expect(routes).not.toContain(p);
    }
    expect(routes.some((p) => p.includes("*") || p.includes(":"))).toBe(false);
  });

  it("can rely on one <Route> tag per line in src/App.tsx", () => {
    const tags = read("src/App.tsx")
      .split("\n")
      .filter((line) => /^\s*<Route[\s/>]/.test(line));
    expect(tags.length).toBeGreaterThan(50);
    for (const line of tags) expect(line, line.trim()).toMatch(/>\s*$/);
  });
});

describe("robots.txt rules", () => {
  it("disallow known pages that aren't live or are hidden from search, and nothing live", () => {
    const rules = robotsDisallowRules(["/", "/about", "/draft-page", "/old-landing", "/team-notes"], liveRows, testRules);
    expect(rules).toEqual(["/draft-page", "/old-landing", "/team-notes"]);
  });

  it("leave /admin and /reset-password to the fixed rules", () => {
    expect(robotsDisallowRules(["/admin", "/admin/pages", "/reset-password"], [], testRules)).toEqual([]);
  });

  it("end-anchor a hidden page that has public pages beneath it", () => {
    // A plain `Disallow: /resources` would also block the always-live /resources/insights.
    expect(robotsDisallowRules(["/resources", "/speaking-old"], liveRows, testRules)).toEqual([
      "/resources$",
      "/speaking-old",
    ]);
    // Draft parent of a live child.
    expect(
      robotsDisallowRules(["/partner", "/partner/embody"], [{ path: "/partner/embody", status: "live" }], testRules),
    ).toEqual(["/partner$"]);
  });

  it("keep a moved page's old and new addresses crawlable while the old one is live", () => {
    const rows = [{ path: "/old-home", status: "live" }];
    expect(robotsDisallowRules(["/old-home", "/new-home"], rows, testRules)).toEqual([]);
    expect(robotsDisallowRules(["/old-home", "/new-home"], [], testRules)).toEqual(["/new-home", "/old-home"]);
  });
});

describe("generators keep the committed files when the database can't be read", () => {
  const run = (script: string, env: Record<string, string>) => {
    const dir = mkdtempSync(join(tmpdir(), "seo-build-"));
    try {
      mkdirSync(join(dir, "public"));
      writeFileSync(join(dir, "public/sitemap.xml"), "SENTINEL-SITEMAP");
      writeFileSync(join(dir, "public/robots.txt"), "SENTINEL-ROBOTS");
      const res = spawnSync(process.execPath, [join(process.cwd(), "scripts", script)], {
        cwd: dir,
        env: {
          PATH: process.env.PATH ?? "",
          VITE_SUPABASE_URL: "",
          VITE_SUPABASE_PUBLISHABLE_KEY: "",
          SUPABASE_URL: "",
          ...env,
        },
        encoding: "utf8",
        timeout: 30000,
      });
      return {
        status: res.status,
        output: `${res.stdout}${res.stderr}`,
        sitemap: readFileSync(join(dir, "public/sitemap.xml"), "utf8"),
        robots: readFileSync(join(dir, "public/robots.txt"), "utf8"),
      };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  for (const script of ["generate-sitemap.mjs", "generate-robots-txt.mjs"]) {
    it(`${script}: no Supabase settings → exits cleanly, files untouched`, () => {
      const r = run(script, {});
      expect(r.status, r.output).toBe(0);
      expect(r.output).toMatch(/keeping the existing/);
      expect(r.sitemap).toBe("SENTINEL-SITEMAP");
      expect(r.robots).toBe("SENTINEL-ROBOTS");
    });

    it(`${script}: database unreachable → exits cleanly, files untouched`, () => {
      const r = run(script, {
        VITE_SUPABASE_URL: "http://127.0.0.1:9",
        VITE_SUPABASE_PUBLISHABLE_KEY: "test-key",
      });
      expect(r.status, r.output).toBe(0);
      expect(r.output).toMatch(/keeping the existing/);
      expect(r.sitemap).toBe("SENTINEL-SITEMAP");
      expect(r.robots).toBe("SENTINEL-ROBOTS");
    });
  }
});

describe("wiring", () => {
  it("every SEO build script loads .env and needs no service-role key", () => {
    for (const f of ["scripts/generate-sitemap.mjs", "scripts/generate-robots-txt.mjs", "scripts/prerender.mjs"]) {
      const src = read(f);
      expect(src, f).toMatch(/from "\.\/lib\/load-env\.mjs"/);
      expect(src, f).not.toMatch(/SERVICE_ROLE/);
    }
  });

  it("prerender skips pages that aren't live, including moved-page targets", () => {
    const src = read("scripts/prerender.mjs");
    expect(src).toMatch(/if \(!isPublicPage\(route\.path\)\)/);
    expect(src).toMatch(/if \(!isPublicPage\(to\)\)/);
  });
});
