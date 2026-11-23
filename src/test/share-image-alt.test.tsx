import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import approvedPages from "../config/approvedPageMetadata.json";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { DEFAULT_SHARE_IMAGE_ALT, DEFAULT_SHARE_IMAGE_PATH } from "@/lib/default-share-image.mjs";

// PPS Admin, 2026-11-23: "yes, fix the alt text". Pages with their own share image carried the
// homepage portico's description (from index.html) instead of one for their own image.
type Approved = { title: string; description: string; ogImage?: string; ogImageAlt?: string; imageSource?: string };
const pages = Object.entries(approvedPages as Record<string, Approved>);
const withImage = pages.filter(([, page]) => page.ogImage);
const HOME_ALT = (approvedPages as Record<string, Approved>)["/"].ogImageAlt!;

const location = vi.hoisted(() => ({ pathname: "/about" }));
vi.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: location.pathname, search: "", hash: "" }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) }),
  },
}));

describe("share image descriptions in the approved inventory", () => {
  it("gives every page with its own share image a description of that image", () => {
    for (const [path, page] of withImage) {
      expect(page.ogImageAlt, path).toBeTruthy();
      expect(page.ogImageAlt!.length, path).toBeLessThanOrEqual(125);
      expect(page.ogImageAlt!, path).not.toMatch(/^(an? )?(image|picture|photo) of/i);
      // Public copy never casts Painted Porch as the one who helps or serves (AGENTS.md).
      expect(page.ogImageAlt!, path).not.toMatch(/\b(help|support|assist|provide|deliver|serve)/i);
    }
  });

  it("describes the same image the same way, and different images differently", () => {
    // The press kit's share image is its own file but the same stage photo as Speaking
    // (pixel difference 0.010 at 320x168, against 0.38 for a different photo such as About's).
    const SAME_PHOTO: Record<string, string> = {
      "public/images/press-kit-share.jpg": "src/assets/heroes/speaking-hero.jpg",
    };
    const altByPhoto = new Map<string, string>();
    for (const [path, page] of withImage) {
      const photo = SAME_PHOTO[page.imageSource!] ?? page.imageSource!;
      const known = altByPhoto.get(photo);
      if (known) expect(page.ogImageAlt, path).toBe(known);
      altByPhoto.set(photo, page.ogImageAlt!);
    }
    expect(new Set(altByPhoto.values()).size).toBe(altByPhoto.size);
  });

  it("keeps the homepage portico description for the homepage only", () => {
    expect(readFileSync("index.html", "utf8")).toContain(`<meta property="og:image:alt" content="${HOME_ALT}">`);
    expect(withImage.filter(([, page]) => page.ogImageAlt === HOME_ALT).map(([path]) => path)).toEqual(["/"]);
  });
});

describe("the build writes each page's own description", () => {
  it("replaces the template's portico description for a page with its own image", () => {
    const source = readFileSync("scripts/prerender.mjs", "utf8");
    const ctx = vm.createContext({
      template:
        '<html><head><title>Home</title><meta name="description" content="Home">' +
        '<link rel="canonical" href="https://onthepaintedporch.com/">' +
        '<meta property="og:image" content="https://onthepaintedporch.com/portico.jpg">' +
        `<meta property="og:image:alt" content="${HOME_ALT}">` +
        '<meta name="twitter:image" content="https://onthepaintedporch.com/portico.jpg">' +
        '</head><body><div id="root"></div></body></html>',
      SITE: "https://onthepaintedporch.com", DEFAULT_SHARE_IMAGE_PATH, DEFAULT_SHARE_IMAGE_ALT,
      serializeMediaAppearanceSchema: JSON.stringify, console,
    });
    vm.runInContext(
      source.slice(source.indexOf("const escapeHtml"), source.indexOf("const template =")) +
        source.slice(source.indexOf("function replaceTag"), source.indexOf("let ok =")),
      ctx,
    );
    const about = (approvedPages as Record<string, Approved>)["/about"];
    const route = { ...about, path: "/about", h1: "About", ogImage: `https://onthepaintedporch.com${about.ogImage}` };
    const html = vm.runInContext(`buildHtml(${JSON.stringify(route)})`, ctx) as string;
    expect(html).toContain(`<meta property="og:image:alt" content="${about.ogImageAlt}">`);
    expect(html).not.toContain(HOME_ALT);
  });
});

describe("the browser sets each page's own description", () => {
  const alt = () => document.head.querySelector('meta[property="og:image:alt"]')?.getAttribute("content");

  beforeEach(() => {
    document.head.innerHTML = `<meta property="og:image:alt" content="${HOME_ALT}">`;
  });

  it("uses the approved description when the page shows its approved image", async () => {
    location.pathname = "/about";
    const about = (approvedPages as Record<string, Approved>)["/about"];
    renderHook(() => useDocumentSeo({ title: about.title, description: about.description, ogImage: about.ogImage }));
    await waitFor(() => expect(alt()).toBe(about.ogImageAlt));
  });

  it("uses the default card's description on a page without its own image", async () => {
    location.pathname = "/workshops";
    renderHook(() => useDocumentSeo({ title: "Workshops", description: "Team workshops" }));
    await waitFor(() => expect(alt()).toBe(DEFAULT_SHARE_IMAGE_ALT));
  });

  it("leaves the description alone for an image it doesn't know, such as a blog cover", async () => {
    location.pathname = "/resources/insights/a-post";
    document.head.innerHTML = '<meta property="og:image:alt" content="Cover image for A Post">';
    renderHook(() => useDocumentSeo({ title: "A Post", description: "A post", ogImage: "https://example.com/cover.jpg" }));
    await waitFor(() => expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe("https://example.com/cover.jpg"));
    expect(alt()).toBe("Cover image for A Post");
  });
});
