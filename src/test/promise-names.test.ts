import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Three related statements, three distinct names (PPS Admin, 2026-11-06):
 * - "The Painted Porch Promise": the homepage's If yes / If not yet / If not us;
 * - "Our Partnership Promise": the short version of the same message on other pages;
 * - "Our Commitment": "You won't need us forever", on Our Approach.
 */

const read = (p: string) => readFileSync(resolve(__dirname, "..", "..", p), "utf8");

const ACTIVE_PAGES = [
  "src/pages/pps/about/OurApproach.tsx",
  "src/pages/pps/PhaseZero.tsx",
  "src/pages/pps/v3/PhaseZeroNext.tsx",
  "src/pages/pps/v3/AboutNext.tsx",
  "src/pages/pps/v3/ArchitectShift.tsx",
  "src/pages/pps/v3/EmbodyShift.tsx",
  "src/pages/pps/v3/EnvisionShift.tsx",
  "src/pages/pps/v3/ResultsImpact.tsx",
  "src/pages/pps/v3/ThePath.tsx",
];

describe("promise and commitment names", () => {
  it("keeps 'The Painted Porch Promise' for the homepage section only", () => {
    expect(read("src/pages/pps/v3/HomeNext.tsx")).toContain("The Painted Porch Promise");
    for (const page of ACTIVE_PAGES) expect(read(page), page).not.toContain("The Painted Porch Promise");
  });

  it("closes the Phase Zero page's 'What the work makes possible' with Our Commitment", () => {
    const page = read("src/pages/pps/v3/PhaseZeroNext.tsx");
    expect(page).toMatch(/>Our Commitment</);
    expect(page).toContain("You won't need us forever.");
  });

  it("heads Our Approach's 'You won't need us forever' as Our Commitment", () => {
    const approach = read("src/pages/pps/about/OurApproach.tsx");
    expect(approach).toMatch(/>Our Commitment</);
    expect(approach).toContain("You won't need us forever.");
    expect(approach).not.toMatch(/You will not need us forever/);
  });
});
