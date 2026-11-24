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
  // `image={photo}` for a bundled file, `image={photo.url}` for a Lovable asset pointer.
  const variable = band.match(/image=\{(\w+)(?:\.url)?\}/)?.[1];
  return variable ? assetOf(src, variable) : null;
}

/** The asset behind a page's hero video poster, or null for a page without one. */
function heroPoster(src: string): string | null {
  const variable = src.match(/video=\{\{ slotKey: "[a-z0-9-]+", poster: (\w+)/)?.[1];
  return variable ? assetOf(src, variable) : null;
}

describe("hero videos and closing photos", () => {
  const videos = Object.fromEntries(PAGES.map((p) => [p, heroVideo(source(p))]));

  it("animates the agreed pages, and leaves the homepage and About on their photos", () => {
    expect(videos).toEqual({
      HomeNext: null,
      AboutNext: null,
      EnvisionShift: "envision-hero",
      // Swapped in the Lovable editor on 2026-11-24 ("Swapped hero animations"): Architect
      // now opens on the temple, Embody on the lantern road.
      ArchitectShift: "embody-hero",
      EmbodyShift: "approach-hero",
      ThePath: "partner-hub-hero",
      PhaseZeroNext: "home-hero",
      ResultsImpact: "impact-hero",
      ForIndividuals: "amplify-hero",
    });
  });

  it("uses each closing photo on one page only", () => {
    const photos = PAGES.map((p) => closingPhoto(source(p))).filter((x): x is string => x !== null);
    expect(new Set(photos).size).toBe(photos.length);
  });

  it("darkens the closing bands that would otherwise run into the teal footer with the charcoal wash", () => {
    // Architect too: its burgundy wash left the light-raspberry IF under AA.
    // About joined on 2026-11-07 with the blue door; the homepage's band is not a photo band.
    // Embody's table was removed (PPS Admin, 2026-11-24: "No I dont want that table"); the painted columns replaced it.
    expect(closingPhoto(source("EmbodyShift"))).toBe("@/assets/v3/embody-painted-columns-porch.webp");
    for (const page of ["EmbodyShift", "AboutNext", "EnvisionShift", "ArchitectShift", "ThePath", "PhaseZeroNext", "ResultsImpact", "ForIndividuals"]) {
      const band = source(page).slice(source(page).lastIndexOf("<CTABand"));
      expect(band, page).toMatch(/photoProfile="cta-photo-charcoal\b/);
    }
  });

  it("closes About with the clarity lens (PPS Admin, 2026-11-24), and shows Rob centred at his desk on its team card (PPS Admin, 2026-11-07)", () => {
    const about = source("AboutNext");
    expect(closingPhoto(about)).toBe("@/assets/v3/about-clarity-lens.webp.asset.json");
    expect(assetOf(about, "robPhoto")).toBe("@/assets/team/rob-hunter-desk.jpg");
  });

  it("closes The P.A.T.H. with the colorful hanging mobile: \"Path final cta\" (PPS Admin, 2026-11-24)", () => {
    // It replaced the painted lanes (PPS Admin, 2026-11-07), placed in the Lovable editor.
    expect(closingPhoto(source("ThePath"))).toBe("@/assets/v3/path-kinetic-mobile.webp");
  });

  it("runs the v3 heroes up under the floating header (PPS Admin, 2026-11-07)", () => {
    const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");
    // The shared v3 hero and the homepage hero lead their pages, so they run up under the pill.
    expect(read("components/v3/Bits.tsx")).toMatch(/story-hero v3-under-header/);
    expect(source("HomeNext")).toMatch(/aria-labelledby="home-hero-heading" className="v3-under-header/);
    // The old full-bleed hero stays where it is: a speaker page's breadcrumb sits above it.
    expect(read("components/pps/TierHeroSection.tsx")).not.toMatch(/v3-under-header/);
  });

  it("moves the older pages to the v3 layout: a text block, then the image or video (PPS Admin, 2026-11-07)", () => {
    const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");
    const older = [
      "Speaking", "SpeakingWorkshopTopics", "resources/AsSeenOn", "PPSContact", "resources/ResourcesHub",
      "resources/FreeDownloads", "resources/YouTubePage", "TermsAndConditions", "PressKit", "PPSBlog",
    ];
    for (const page of older) {
      const src = read(`pages/pps/${page}.tsx`);
      expect(src, page).toMatch(/<PageHero\b/);
      expect(src, page).not.toMatch(/<TierHeroSection\b/);
    }
    // Contact: its own photo of porch chairs (PPS Admin, 2026-11-07). The stage photo is shared, for now, by the
    // speaking pages and the Press Kit. (The Press page was retired on 2026-11-08: /press now redirects to the Press Kit.)
    expect(read("pages/pps/PPSContact.tsx")).toMatch(/image=\{contactHero\}/);
    // 2026-11-24 (PPS Admin): Speaking opens on the colorful stage with the teal podium; the painted
    // stones are held unused. Topics keeps the same stage only until its compass-screen hero is approved.
    expect(read("pages/pps/PressKit.tsx")).toMatch(/image=\{speakingHero\}/);
    expect(read("pages/pps/Speaking.tsx")).toMatch(/image=\{emptyStage\}/);
    expect(read("pages/pps/SpeakingWorkshopTopics.tsx")).toMatch(/image=\{emptyStage\}/);
  });

  it("doesn't show a hero scene twice: no page's video poster is used on another page", () => {
    // Began as the lantern scene on Architect; generalised when Architect and Embody swapped
    // heroes, so each page's poster (and its fallback share image) stays its own.
    const posters = PAGES.map((p) => [p, heroPoster(source(p))] as const).filter(([, poster]) => poster);
    expect(posters.map(([p]) => p)).toEqual(expect.arrayContaining(["ArchitectShift", "EmbodyShift"]));
    for (const [owner, poster] of posters) {
      for (const page of PAGES.filter((p) => p !== owner)) {
        expect(source(page), `${owner}'s poster on ${page}`).not.toContain(`"${poster}"`);
      }
    }
  });

  it("covers the closing photos stored as Lovable asset pointers", () => {
    expect(closingPhoto(source("EnvisionShift"))).toBe("@/assets/v3/envision-painted-compass.jpg.asset.json");
    expect(closingPhoto(source("ArchitectShift"))).toBe("@/assets/v3/architect-shift-fortify-framework.webp.asset.json");
  });
});
