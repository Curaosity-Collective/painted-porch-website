import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";

// Sierra's name is "Sierra Ramm Cantrell", no hyphen (PPS Admin, 2026-11-09: "Ramm Cantrell"). The site
// had used "Sierra Ramm-Cantrell" on /sierra and /overview, and "Sierra Cantrell" in the navigation and
// on the homepage.
function find(pattern: string): string {
  try {
    return execFileSync(
      "git",
      ["grep", "-n", "-E", pattern, "--", "src", "scripts", "public", "index.html", ":!src/test/team-names.test.ts"],
      { encoding: "utf8" },
    );
  } catch {
    return ""; // git grep exits 1 when nothing matches
  }
}

describe("team names", () => {
  it('spells Sierra\'s name "Sierra Ramm Cantrell", without a hyphen', () => {
    expect(find("Ramm-Cantrell")).toBe("");
  });

  it('never shortens it to "Sierra Cantrell"', () => {
    expect(find("Sierra Cantrell")).toBe("");
  });
});
