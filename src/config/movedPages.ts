/**
 * Pages that moved address, and addresses that only forward (PPS-DEC-0025 amendment, PPS Admin
 * 2026-11-06). The page-status gate reads these so a move never hides a page.
 *
 * On 2026-11-06 the site was published after the address move but before the migration that gives
 * the new addresses their Live rows. With no row, /workshops, /assessments, /masterclasses and
 * /leadership-labs resolved to Draft: they showed "Coming Soon" and the footer's Leaders & Teams
 * column went blank. With these lists, a page keeps its status through a move until its own row
 * exists, whichever happens first: the publish or the migration.
 *
 * Keep in step with the <MovedTo> and <Navigate> routes in App.tsx and with `movedPages` in
 * scripts/prerender-content.mjs; src/test/moved-pages.test.tsx checks all three.
 */

/** New address → the address the page had before it moved. */
export const MOVED_FROM: Readonly<Record<string, string>> = {
  "/assessments": "/partner/ignite/assessments",
  "/assessments/working-genius": "/partner/ignite/assessments/working-genius",
  "/masterclasses": "/partner/ignite/masterclasses",
  "/workshops": "/partner/amplify/workshops",
  "/leadership-labs": "/partner/amplify/labs",
  "/leadership-labs/stractical-leader": "/partner/amplify/stractical-leader",
  "/leadership-labs/stractical-leader/enroll": "/partner/amplify/stractical-leader/enroll",
};

/** Address that only forwards → where it forwards to. */
export const FORWARDS_TO: Readonly<Record<string, string>> = {
  // The old addresses.
  "/partner/ignite": "/assessments",
  "/partner/ignite/courses": "/masterclasses",
  "/partner/ignite/assessments": "/assessments",
  "/partner/ignite/assessments/working-genius": "/assessments/working-genius",
  "/partner/ignite/masterclasses": "/masterclasses",
  "/partner/amplify": "/workshops",
  "/partner/amplify/workshops": "/workshops",
  "/partner/amplify/labs": "/leadership-labs",
  "/partner/amplify/stractical-leader": "/leadership-labs/stractical-leader",
  "/partner/amplify/stractical-leader/enroll": "/leadership-labs/stractical-leader/enroll",
  // Shortcuts.
  "/programs": "/assessments",
  "/ignite": "/assessments",
  "/radical-mindfulness": "/masterclasses",
  "/communication": "/masterclasses",
  "/extraordinary-teams": "/masterclasses",
  "/courses": "/masterclasses",
  "/masterclass": "/masterclasses",
  "/amplify": "/workshops",
  "/labs": "/leadership-labs",
  "/stracticalleader": "/leadership-labs/stractical-leader",
};
