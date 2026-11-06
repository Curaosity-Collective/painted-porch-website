import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Phase Zero spans the first two stages of the P.A.T.H., Prepare and Align
 * (PPS Admin, 2026-11-06: "Phase zero is NOT just prepare. It's prepare and
 * align"; PPS-DEC-0027). Source-level, so copy and the SEO generator's brand
 * context can't drift back to "Phase Zero is the Prepare stage".
 */

const read = (p: string) => readFileSync(resolve(__dirname, "..", "..", p), "utf8");

const SOURCES = [
  "src/pages/pps/v3/HomeNext.tsx",
  "scripts/prerender-content.mjs",
  "src/pages/pps/resources/FAQPage.tsx",
  "src/pages/pps/PhaseZero.tsx",
  "src/pages/pps/about/OurApproach.tsx",
  "supabase/functions/generate-page-seo/index.ts",
];

const PREPARE_ONLY =
  /inside Prepare|Prepare is Phase Zero|Phase Zero is the\s+(<[^>]+>)?\s*Prepare(<\/span>)?\s+stage|(within|during) the Prepare (stage|phase)/i;

describe("Phase Zero is Prepare and Align, never Prepare alone (PPS-DEC-0027)", () => {
  for (const file of SOURCES) {
    it(`${file} doesn't place Phase Zero inside Prepare`, () => {
      expect(read(file)).not.toMatch(PREPARE_ONLY);
    });
  }

  it("says so where Phase Zero's scope is described", () => {
    expect(read("src/pages/pps/v3/HomeNext.tsx")).toMatch(/Phase Zero™, which spans Prepare and Align/);
    expect(read("scripts/prerender-content.mjs")).toMatch(/Phase Zero™, which spans Prepare and Align/);
    expect(read("src/pages/pps/resources/FAQPage.tsx")).toMatch(/It spans Prepare and Align, the first two stages of the P\.A\.T\.H\./);
    expect(read("src/pages/pps/about/OurApproach.tsx")).toMatch(/Prepare and Align are Phase Zero\./);
    expect(read("supabase/functions/generate-page-seo/index.ts")).toMatch(/Phase Zero™ \([^)]*Prepare and Align, never Prepare alone\)/);
    const phaseZero = read("src/pages/pps/PhaseZero.tsx");
    expect(phaseZero).toMatch(/Phase Zero spans the first two stages of our P\.A\.T\.H\. methodology/);
    expect(phaseZero).not.toContain('to="/about/approach#path"');
  });
});
