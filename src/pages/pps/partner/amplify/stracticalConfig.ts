/**
 * Centralized config for the Stractical Leader Lab.
 * Update WORKSHOP_START_DATE when scheduling the next cohort.
 */

// The start date/time for the current/next workshop round, in Pacific time: sessions run at 11 AM PT / 2 PM ET
// (PPS Admin, 2026-11-09). Use -07:00 while daylight saving is on (March to early November), -08:00 otherwise.
// When this date passes, pages automatically switch to waitlist mode.
export const WORKSHOP_START_DATE = new Date("2026-07-29T11:00:00-07:00");

// Human-readable label for display
export const WORKSHOP_DATE_LABEL = "Wednesday, July 29th, 2026 at 11:00 AM PT (2:00 PM ET)";
export const WORKSHOP_DATE_SHORT = "July 29th, 2026";

// Display price for the workshop; update here to change across all pages.
export const WORKSHOP_PRICE_DISPLAY = "$997";
