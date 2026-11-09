import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { MovedTo } from "@/components/pps/MovedTo";
import { movedPages, routes } from "../../scripts/prerender-content.mjs";
import { readGatedAppRoutePaths } from "../../scripts/lib/public-pages.mjs";
import { FORWARDS_TO, MOVED_FROM } from "@/config/movedPages";
import { resolvePageStatus } from "@/config/pageStatus";
import type { PageStatusMap, PageStatusRecord } from "@/hooks/usePageStatuses";
import { PATHWAY_LINKS } from "@/components/v3/siteNav";

/**
 * The pages under /partner/ignite and /partner/amplify moved to top-level addresses
 * (PPS-DEC-0025 amendment, PPS Admin 2026-11-06). Old links keep working.
 */

const read = (p: string) => readFileSync(resolve(__dirname, "..", "..", p), "utf8");

const MOVES: [string, string][] = [
  ["partner/ignite", "/for-individuals"],
  ["partner/ignite/assessments", "/assessments"],
  ["partner/ignite/assessments/working-genius", "/assessments/working-genius"],
  ["partner/ignite/masterclasses", "/masterclasses"],
  ["partner/ignite/courses", "/masterclasses"],
  ["partner/amplify", "/workshops"],
  ["partner/amplify/workshops", "/workshops"],
  ["partner/amplify/labs", "/leadership-labs"],
  ["partner/amplify/stractical-leader", "/leadership-labs/stractical-leader"],
  ["partner/amplify/stractical-leader/enroll", "/leadership-labs/stractical-leader/enroll"],
];

function Where() {
  const { pathname, search, hash } = useLocation();
  return <p data-testid="where">{pathname + search + hash}</p>;
}

describe("moved pages", () => {
  it("forwards an old address to the new one, keeping the query and #anchor", () => {
    render(
      <MemoryRouter initialEntries={["/partner/amplify/workshops?utm_source=email#topic-courageous-conversations"]}>
        <Routes>
          <Route path="/partner/amplify/workshops" element={<MovedTo to="/workshops" />} />
          <Route path="/workshops" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("where")).toHaveTextContent("/workshops?utm_source=email#topic-courageous-conversations");
  });

  it("routes every old address to its new one, and serves each page at its new address", () => {
    const app = read("src/App.tsx");
    for (const [from, to] of MOVES) {
      expect(app, from).toContain(`<Route path="${from}" element={<MovedTo to="${to}" />} />`);
    }
    for (const to of new Set(MOVES.map(([, t]) => t))) {
      expect(app, to).toMatch(new RegExp(`<Route path="${to.slice(1)}" element={<(?!MovedTo|Navigate)\\w+ />} />`));
    }
  });

  it("writes a forwarding page at each moved address that has prerendered content", () => {
    const paths = new Set(routes.map((r: { path: string }) => r.path));
    for (const { from, to } of movedPages as { from: string; to: string }[]) {
      expect(paths.has(to), to).toBe(true);
      expect(paths.has(from), from).toBe(false);
      expect(MOVES.some(([f, t]) => `/${f}` === from && t === to), from).toBe(true);
    }
  });

  it("lists every forwarding route in movedPages.ts, and nothing else", () => {
    const app = read("src/App.tsx");
    const forwards = new Map<string, string>();
    const route = /<Route path="([^"]+)" element=\{<(?:MovedTo to="([^"]+)" \/>|Navigate to="([^"]+)" replace \/>)\} \/>/g;
    const destinations = new Set(Object.values(FORWARDS_TO));
    for (const m of app.matchAll(route)) {
      const to = m[2] ?? m[3];
      if (m[2] || destinations.has(to)) forwards.set(`/${m[1]}`, to);
    }
    expect(Object.fromEntries(forwards)).toEqual(FORWARDS_TO);
    // No forward leads to another forward, so status resolution never chains or loops.
    for (const to of destinations) expect(FORWARDS_TO[to], to).toBeUndefined();
    // Each moved page's old address forwards to it, and the prerendered forwarding pages agree.
    for (const [to, from] of Object.entries(MOVED_FROM)) expect(FORWARDS_TO[from], from).toBe(to);
    for (const { from, to } of movedPages as { from: string; to: string }[]) expect(MOVED_FROM[to], to).toBe(from);
  });

  describe("page status through a move", () => {
    const rec = (path: string, status: "live" | "draft") =>
      ({ id: path, path, status, category: "other", note: null, updated_at: "" }) as unknown as PageStatusRecord;
    const mapOf = (...records: PageStatusRecord[]) => Object.fromEntries(records.map((r) => [r.path, r])) as PageStatusMap;

    it("lets every gated redirect through whenever its destination is live (the 2026-11-09 shortcuts)", () => {
      // A <Navigate> or <MovedTo> route behind the Draft gate with no status of its own showed "Coming Soon"
      // instead of redirecting (/services, /sprints, /free, /resources/burnout …). FORWARDS_TO gives it its
      // destination's status. These four have their own Live rows instead; three point at a query or #anchor.
      const OWN_ROW = new Set(["/about/approach", "/press", "/privacy", "/cookies"]);
      const gated = new Set<string>(readGatedAppRoutePaths());
      const redirects = [...read("src/App.tsx").matchAll(/<Route path="([^"]+)"[^\n]*?<(?:Navigate|MovedTo) to="([^"]+)"/g)]
        .map((m) => ({ from: m[1].startsWith("/") ? m[1] : `/${m[1]}`, to: m[2].split(/[?#]/)[0] }))
        .filter(({ from }) => gated.has(from) && !OWN_ROW.has(from));
      expect(redirects.length).toBeGreaterThan(40);
      for (const { from, to } of redirects) {
        expect(resolvePageStatus(from, mapOf(rec(to, "live"))), `${from} → ${to}`).toBe("live");
      }
    });

    it("keeps the footer's Leaders & Teams links when only the old addresses have rows (the 2026-11-06 incident)", () => {
      const map = mapOf(
        rec("/partner/ignite", "live"),
        rec("/partner/ignite/assessments", "live"),
        rec("/partner/ignite/masterclasses", "live"),
        rec("/partner/amplify/labs", "live"),
        rec("/partner/amplify/workshops", "live"),
      );
      for (const link of PATHWAY_LINKS) expect(resolvePageStatus(link.href, map), link.href).toBe("live");
    });

    it("carries the old address's status, Draft included, until the new address has its own row", () => {
      expect(resolvePageStatus("/workshops", mapOf(rec("/partner/amplify/workshops", "draft")))).toBe("draft");
      const both = mapOf(rec("/partner/amplify/workshops", "live"), rec("/workshops", "draft"));
      expect(resolvePageStatus("/workshops", both)).toBe("draft");
    });

    it("gives a forward-only address its destination's status, unless it has a row of its own", () => {
      const map = mapOf(rec("/partner/amplify/workshops", "live"), rec("/partner/amplify/labs", "draft"));
      expect(resolvePageStatus("/amplify", map)).toBe("live");
      expect(resolvePageStatus("/labs", map)).toBe("draft");
      expect(resolvePageStatus("/amplify", mapOf(rec("/workshops", "live"), rec("/amplify", "draft")))).toBe("draft");
    });

    it("still treats an address that never moved, with no row, as Draft", () => {
      expect(resolvePageStatus("/not-a-moved-page", mapOf(rec("/partner/amplify/workshops", "live")))).toBe("draft");
    });
  });

  it("links to the new addresses, not the old ones, in the menus, footer and guide data", () => {
    // The homepage too: on 2026-11-06 a Lovable fix pointed Team Workshops back at the old address while
    // /workshops had no page_status row. The old address forwards, but the new one is canonical.
    for (const file of [
      "src/components/v3/siteNav.ts",
      "src/pages/pps/v3/HomeNext.tsx",
      "src/data/pathFinderQuiz.ts",
      "src/config/tiers.ts",
      "src/components/pps/SiteSearch.tsx",
    ]) {
      expect(read(file), file).not.toMatch(/\/partner\/(ignite|amplify)\//);
    }
  });

  it("opens the guide from /start-here and the search result; the Start Here page is retired (PPS Admin, 2026-11-07)", () => {
    const app = read("src/App.tsx");
    expect(app).toContain('<Route path="start-here" element={<StartHere />} />');
    expect(app).toContain('<Route path="for-leaders" element={<Navigate to="/start-here" replace />} />');
    // /for-leaders takes /start-here's status, so the Draft gate doesn't stop it.
    expect(FORWARDS_TO["/for-leaders"]).toBe("/start-here");
    expect(resolvePageStatus("/for-leaders", { "/start-here": { path: "/start-here", status: "live" } } as unknown as PageStatusMap)).toBe("live");
    // The address opens the guide over the homepage; no Start Here page is built or listed.
    const startHere = read("src/pages/pps/StartHere.tsx");
    expect(startHere).toMatch(/openGuide\(\)/);
    expect(startHere).toMatch(/<Navigate to=\{`\/\$\{search\}\$\{hash\}`\} replace \/>/);
    expect(routes.some((r: { path: string }) => r.path === "/start-here")).toBe(false);
    expect(read("scripts/generate-sitemap.mjs")).not.toContain('"/start-here"');
    // The search result opens the guide where the visitor is.
    const search = read("src/components/pps/SiteSearch.tsx");
    expect(search).toMatch(/title: "Find Your Next ShIFt",[^\n]*opensGuide: true/);
    expect(search).toMatch(/if \(entry\.opensGuide\) setTimeout\(openGuide, 0\);/);
  });
});
