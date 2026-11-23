/**
 * Archived pre-relaunch pages and the page that replaced each one.
 *
 * PPS Admin, 2026-11-23: "If its archived it should redirect vs just saying page not found."
 * Visitors who reach an archived address are sent on to its replacement. Admins and editors
 * still see the archived page itself, for reference (see AGENTS.md).
 *
 * Each destination follows a move that was already decided: drop "-archive" from the address,
 * then follow that address's existing forward (PPS-DEC-0025) or its live replacement.
 *
 * The list lives in archivedPages.json so the build (scripts/prerender.mjs) writes forwarding
 * pages from the same list. src/test/archived-pages.test.ts checks it against App.tsx.
 */
import archivedPages from "./archivedPages.json";

export const ARCHIVED_TO: Readonly<Record<string, string>> = archivedPages;

/** The page that replaced an archived address, or undefined if the address isn't archived. */
export function archivedDestination(pathname: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(ARCHIVED_TO, pathname) ? ARCHIVED_TO[pathname] : undefined;
}
