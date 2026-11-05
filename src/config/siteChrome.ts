/**
 * Which header and footer a page uses.
 *
 * PPS Admin (2026-11-05): the redesign's header and footer replace today's
 * site-wide at go-live (plan Phase 5), together with the Draft pages. Until
 * then they show only on the Draft pages, so they can be reviewed in context.
 *
 * Go-live: set V3_CHROME_EVERYWHERE to true. PPSNavigation and PPSFooter can
 * be retired after that.
 */
export const V3_CHROME_EVERYWHERE = false;

/** The Phase 2 Draft pages, which preview the new header and footer. */
export const V3_CHROME_PREVIEW_ROUTES = [
  "/home-next",
  "/the-path",
  "/architect-shift",
  "/embody-shift",
  "/about-next",
  "/about/impact-next",
] as const;

export function usesV3Chrome(pathname: string): boolean {
  if (V3_CHROME_EVERYWHERE) return true;
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return (V3_CHROME_PREVIEW_ROUTES as readonly string[]).includes(clean);
}
