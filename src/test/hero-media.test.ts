import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Hero videos and closing photos on the main pages (PPS Admin, 2026-11-07). Each animation and each
 * closing photo appears on one page only (PPS-DEC-0023); the homepage and About keep their hero photos.
 */

const PAGES = [
  "HomeNext",
  "AboutNext",
  "EnvisionShift",
  "ArchitectShift",
  "EmbodyShift",
  "ThePath",
  "PhaseZeroNext",
  "ResultsImpact",
  "ForIndividuals",
] as const;

const source = (page: string) => readFileSync(resolve(__dirname, "../pages/pps/v3", `${page}.tsx`), "utf8");

/** The asset path behind an imported image variable. */
function assetOf(src: string, variable: string): string {
  const m = src.match(new RegExp(`import ${variable} from "([^"]+)"`));
  if (!m) throw new Error(`no import for ${variable}`);
  return m[1];
}

function heroVideo(src: string): string | null {
  return src.match(/video=\{\{ slotKey: "([a-z0-9-]+)"/)?.[1] ?? null;
}

function closingPhoto(src: string): string | null {
  const band = src.slice(src.lastIndexOf("<CTABand"));
  const variable = band.match(/image=\{(\w+)\}/)?.[1];
  return variable ? assetOf(src, variable) : null;
}

describe("hero videos and closing photos", () => {
  const videos = Object.fromEntries(PAGES.map((p) => [p, heroVideo(source(p))]));

  it("animates the agreed pages, and leaves the homepage and About on their photos", () => {
    expect(videos).toEqual({
      HomeNext: null,
      AboutNext: null,
      EnvisionShift: "amplify-hero",
      ArchitectShift: "approach-hero",
      EmbodyShift: "embody-hero",
      ThePath: "partner-hub-hero",
      PhaseZeroNext: "home-hero",
      ResultsImpact: "impact-hero",
      ForIndividuals: "ignite-hero",
    });
  });

  it("uses each closing photo on one page only", () => {
    const photos = PAGES.map((p) => closingPhoto(source(p))).filter((x): x is string => x !== null);
    expect(new Set(photos).size).toBe(photos.length);
  });

  it("darkens the closing bands that would otherwise run into the teal footer with the charcoal wash", () => {
    // Architect and Embody too: their burgundy and green washes left the light-raspberry IF under AA.
    // About joined on 2026-11-07 with the blue door; the homepage's band is not a photo band.
    for (const page of ["AboutNext", "EnvisionShift", "ArchitectShift", "EmbodyShift", "ThePath", "PhaseZeroNext", "ResultsImpact", "ForIndividuals"]) {
      const band = source(page).slice(source(page).lastIndexOf("<CTABand"));
      expect(band, page).toMatch(/photoProfile="cta-photo-charcoal\b/);
    }
  });

  it("closes About with the blue door, and shows Rob centred at his desk on its team card (PPS Admin, 2026-11-07)", () => {
    const about = source("AboutNext");
    expect(closingPhoto(about)).toBe("@/assets/v3/blue-door.jpg");
    expect(assetOf(about, "robPhoto")).toBe("@/assets/team/rob-hunter-desk.jpg");
  });

  it("closes The P.A.T.H. with the painted lanes: \"Find Out Where You Are on the P.A.T.H.\" (PPS Admin, 2026-11-07)", () => {
    expect(closingPhoto(source("ThePath"))).toBe("@/assets/heroes/start-here-hero.jpg");
  });

  it("runs a hero under the floating header only where it is the first thing on the page (PPS Admin, 2026-11-07)", () => {
    const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");
    // The shared v3 hero and the homepage hero always lead their pages.
    expect(read("components/v3/Bits.tsx")).toMatch(/story-hero v3-under-header/);
    expect(source("HomeNext")).toMatch(/aria-labelledby="home-hero-heading" className="v3-under-header/);
    // TierHeroSection opts in per page: a speaker page's breadcrumb and an archive banner sit above it.
    expect(read("components/pps/TierHeroSection.tsx")).toMatch(/underHeader = false/);
    expect(read("pages/pps/speaking/SpeakerDetailPage.tsx")).not.toMatch(/underHeader/);
    expect(read("pages/pps/partner/EmbodyPathAltArchiveV2.tsx")).not.toMatch(/underHeader/);
    expect(read("pages/pps/Speaking.tsx")).toMatch(/<TierHeroSection underHeader/);
  });

  it("doesn't show the lantern scene twice: Architect's video poster isn't another page's photo", () => {
    const lantern = assetOf(source("ArchitectShift"), "lanternPath");
    for (const page of PAGES.filter((p) => p !== "ArchitectShift")) {
      expect(source(page), page).not.toContain(`"${lantern}"`);
    }
  });
});
