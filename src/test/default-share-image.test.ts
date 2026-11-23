import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import {
  DEFAULT_SHARE_IMAGE_ALT,
  DEFAULT_SHARE_IMAGE_HEIGHT,
  DEFAULT_SHARE_IMAGE_PATH,
  DEFAULT_SHARE_IMAGE_WIDTH,
} from "@/lib/default-share-image.mjs";

// PPS Admin, 2026-11-23: "Dark works" — the dark Painted Porch card is the share image for
// every page without its own. It replaced /og-image.jpg, which never existed (404).
const SITE = "https://onthepaintedporch.com";

/** Width and height from a JPEG's start-of-frame marker. */
function jpegSize(bytes: Buffer): { width: number; height: number } | null {
  let i = 2;
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    const length = bytes.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
    }
    i += 2 + length;
  }
  return null;
}

describe("Default share image", () => {
  it("is a 1200x630 JPEG the site serves", () => {
    const file = `public${DEFAULT_SHARE_IMAGE_PATH}`;
    expect(existsSync(file)).toBe(true);
    const bytes = readFileSync(file);
    expect(bytes.subarray(0, 2).toString("hex")).toBe("ffd8");
    expect(jpegSize(bytes)).toEqual({ width: DEFAULT_SHARE_IMAGE_WIDTH, height: DEFAULT_SHARE_IMAGE_HEIGHT });
    expect(bytes.length).toBeLessThan(300 * 1024);
  });

  it("is never replaced by the missing /og-image.jpg", () => {
    let hits = "";
    try {
      hits = execFileSync("git", ["grep", "-n", "og-image\\.jpg", "--", "index.html", "src", "scripts", ":!src/test"], { encoding: "utf8" });
    } catch {
      hits = ""; // git grep exits 1 when nothing matches
    }
    expect(hits).toBe("");
  });

  it("is the Organization image in the structured data", () => {
    expect(readFileSync("index.html", "utf8")).toContain(`"image": "${SITE}${DEFAULT_SHARE_IMAGE_PATH}"`);
  });

  it("is what the build gives pages without their own image; the homepage keeps its portico", () => {
    const source = readFileSync("scripts/prerender.mjs", "utf8");
    const ctx = vm.createContext({
      template:
        '<html><head><title>Home</title><meta name="description" content="Home">' +
        '<link rel="canonical" href="https://onthepaintedporch.com/">' +
        '<meta property="og:image" content="https://onthepaintedporch.com/portico.jpg">' +
        '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">' +
        '<meta property="og:image:alt" content="A sunlit portico">' +
        '<meta name="twitter:image" content="https://onthepaintedporch.com/portico.jpg">' +
        '</head><body><div id="root"></div></body></html>',
      SITE, DEFAULT_SHARE_IMAGE_PATH, DEFAULT_SHARE_IMAGE_ALT,
      serializeMediaAppearanceSchema: JSON.stringify, console,
    });
    const functions = source.slice(source.indexOf("const escapeHtml"), source.indexOf("const template ="))
      + source.slice(source.indexOf("function replaceTag"), source.indexOf("let ok ="));
    vm.runInContext(functions, ctx);
    const build = (route: object) => vm.runInContext(`buildHtml(${JSON.stringify(route)})`, ctx) as string;
    const card = `${SITE}${DEFAULT_SHARE_IMAGE_PATH}`;

    const workshops = build({ path: "/workshops", title: "Workshops", description: "Team workshops", h1: "Workshops" });
    expect(workshops).toContain(`<meta property="og:image" content="${card}">`);
    expect(workshops).toContain(`<meta name="twitter:image" content="${card}">`);
    expect(workshops).toContain(`<meta property="og:image:alt" content="${DEFAULT_SHARE_IMAGE_ALT}">`);
    expect(workshops).toContain('<meta property="og:image:width" content="1200">');
    expect(workshops).not.toContain("portico");

    const about = build({ path: "/about", title: "About", description: "About", h1: "About", ogImage: `${SITE}/about.jpg` });
    expect(about).toContain(`<meta property="og:image" content="${SITE}/about.jpg">`);
    expect(about).not.toContain(DEFAULT_SHARE_IMAGE_PATH);

    const home = build({ path: "/", title: "Home", description: "Home", h1: "Home" });
    expect(home).toContain('<meta property="og:image" content="https://onthepaintedporch.com/portico.jpg">');
    expect(home).not.toContain(DEFAULT_SHARE_IMAGE_PATH);
  });
});
