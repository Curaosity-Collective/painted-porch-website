/**
 * The share card for pages without their own share image: the dark Painted Porch card
 * (public/og/og-default.jpg, 1200x630). PPS Admin, 2026-11-23: "Dark works".
 *
 * Shared by the browser (useDocumentSeo) and the build (scripts/prerender.mjs), so crawlers
 * that read raw HTML and those that render the page get the same image. The homepage keeps
 * its own portico image. scripts/render-og-default.cjs redraws the card.
 */
export const DEFAULT_SHARE_IMAGE_PATH = "/og/og-default.jpg";
export const DEFAULT_SHARE_IMAGE_WIDTH = 1200;
export const DEFAULT_SHARE_IMAGE_HEIGHT = 630;
export const DEFAULT_SHARE_IMAGE_ALT =
  "Painted Porch Strategies: Build an Organization That Can Do Epic ShIFt, beside five painted porch columns in the brand colors";
