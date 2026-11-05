/**
 * Which header and footer a page uses.
 *
 * PPS Admin (2026-11-05): the redesign's header and footer replace the old
 * ones site-wide at the relaunch (plan Phase 5), and the restyled speaking,
 * workshops and contact pages switch on with them. Setting this back to
 * false restores the old header and footer everywhere except the redesign's
 * own pages. PPSNavigation and PPSFooter can be retired once the relaunch
 * has settled.
 */
export const V3_CHROME_EVERYWHERE = true;

/** The redesign's own pages, which always use the new header and footer. */
export const V3_CHROME_PREVIEW_ROUTES = [
  "/",
  "/the-path",
  "/architect-shift",
  "/embody-shift",
  "/about",
  "/about/impact",
] as const;

/**
 * Live pages restyled in place (plan Phase 3, §8; PPS Admin, 2026-11-05):
 * same layout and content, the redesign's colors through the `.v3-skin`
 * layer in src/styles/v3.css, plus a few compact additions. They switch on
 * with V3_CHROME_EVERYWHERE; with it off, admins and editors preview them
 * with `?v3=1`.
 */
export const V3_SKIN_ROUTES = [
  "/speaking",
  "/speaking/topics",
  "/speaking/amy",
  "/speaking/rob",
  "/speaking/sierra",
  "/partner/amplify/workshops",
  "/contact",
] as const;

function clean(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function isV3SkinRoute(pathname: string): boolean {
  return (V3_SKIN_ROUTES as readonly string[]).includes(clean(pathname));
}

/** The restyle layer: on the restyled pages at go-live, or when previewing. */
export function usesV3Skin(pathname: string, preview = false): boolean {
  return isV3SkinRoute(pathname) && (V3_CHROME_EVERYWHERE || preview);
}

/** The new header and footer: Draft pages now, restyled pages in preview, everywhere at go-live. */
export function usesV3Chrome(pathname: string, preview = false): boolean {
  if (V3_CHROME_EVERYWHERE) return true;
  if ((V3_CHROME_PREVIEW_ROUTES as readonly string[]).includes(clean(pathname))) return true;
  return usesV3Skin(pathname, preview);
}
