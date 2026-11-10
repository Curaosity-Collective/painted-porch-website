import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";

// Sierra's surname is "Ramm Cantrell", no hyphen (PPS Admin, 2026-11-09: "Ramm Cantrell"). The site had
// used "Sierra Ramm-Cantrell" on /sierra and /overview. The short form "Sierra Cantrell" is fine
// (PPS Admin, 2026-11-09: "Short form is ok for Sierra Cantrell").
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
});
