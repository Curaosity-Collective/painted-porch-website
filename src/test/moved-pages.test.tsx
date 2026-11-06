import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { MovedTo } from "@/components/pps/MovedTo";
import { movedPages, routes } from "../../scripts/prerender-content.mjs";

/**
 * The pages under /partner/ignite and /partner/amplify moved to top-level addresses
 * (PPS-DEC-0025 amendment, PPS Admin 2026-11-06). Old links keep working.
 */

const read = (p: string) => readFileSync(resolve(__dirname, "..", "..", p), "utf8");

const MOVES: [string, string][] = [
  ["partner/ignite", "/assessments"],
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

  it("links to the new addresses, not the old ones, in the menus, footer and guide data", () => {
    for (const file of ["src/components/v3/siteNav.ts", "src/data/pathFinderQuiz.ts", "src/config/tiers.ts", "src/components/pps/SiteSearch.tsx"]) {
      expect(read(file), file).not.toMatch(/\/partner\/(ignite|amplify)\//);
    }
  });
});
