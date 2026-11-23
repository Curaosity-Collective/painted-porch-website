import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import archivedPages from "../config/archivedPages.json";
import approvedPages from "../config/approvedPageMetadata.json";
import { archivedDestination } from "@/config/archivedPages";
import { canonicalPath } from "@/lib/canonical-url";

// PPS Admin, 2026-11-23: "If its archived it should redirect vs just saying page not found."
const app = readFileSync("src/App.tsx", "utf8");

/** Archived routes in App.tsx that still render a page (not ones that only forward). */
function archivedRoutesInApp(): string[] {
  const routes = [...app.matchAll(/<Route\s+path="([^"]*-archive[^"]*)"\s+element=\{<([A-Za-z0-9_]+)/g)];
  return routes
    .filter(([, , element]) => element !== "Navigate" && element !== "MovedTo")
    .map(([, path]) => (path.startsWith("/") ? path : `/${path}`))
    .sort();
}

describe("Archived pages", () => {
  it("lists every archived page App.tsx still renders, and nothing else", () => {
    expect(Object.keys(archivedPages).sort()).toEqual(archivedRoutesInApp());
  });

  it("sends each archived page to an approved public page", () => {
    for (const [from, to] of Object.entries(archivedPages)) {
      expect(to, `${from} → ${to}`).toBe(canonicalPath(to));
      expect(Object.keys(approvedPages), `${from} → ${to}`).toContain(to);
      expect(archivedDestination(to), `${to} must not itself be archived`).toBeUndefined();
    }
  });

  it("only treats listed addresses as archived", () => {
    expect(archivedDestination("/about-archive")).toBe("/about");
    expect(archivedDestination("/about")).toBeUndefined();
    expect(archivedDestination("/toString")).toBeUndefined();
  });
});

describe("index.html crawler fallback", () => {
  const html = readFileSync("index.html", "utf8");

  it("has no hand-written homepage fallback, so each page's raw HTML carries one H1", () => {
    // scripts/prerender.mjs writes each page's own text into #root, the homepage included.
    expect(html).not.toContain("<noscript>");
    expect(html).not.toMatch(/<h1[\s>]/);
  });

  it("points the structured-data logo at a file the site serves", () => {
    const logo = html.match(/"logo":\s*\{[^}]*"url":\s*"https:\/\/onthepaintedporch\.com(\/[^"]+)"/);
    expect(logo?.[1]).toBe("/pps-logo.png");
    expect(existsSync(`public${logo?.[1]}`)).toBe(true);
  });
});
