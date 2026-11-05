import { fileURLToPath } from "node:url";
import { test, expect } from "../playwright-fixture";

// The sticky site header overlaps tall element screenshots at a
// scroll-dependent offset, so it is hidden while the section is captured.
const HIDE_SITE_HEADER = fileURLToPath(
  new URL("./visual-hide-site-header.css", import.meta.url),
);

/**
 * Visual regression check for the homepage's Painted Porch Promise.
 *
 * Since the relaunch (plan Phase 5, PPS Admin 2026-11-05) the homepage is the
 * redesign's. This replaces the check of the old homepage's "Discover" cards,
 * which now live only on the archived page (/home-archive-v2, admins only).
 *
 * Three solid boxes ("If yes", "If not yet", "If not us") sit in one row from
 * tablet width up and stack on phones. At every breakpoint this test loads a
 * real browser and:
 *   1. Asserts the layout contract: one row of equal-height boxes on tablet
 *      and desktop, and a clean stack on mobile.
 *   2. Captures the boxes as a baseline snapshot, so a later change that
 *      shifts them fails the comparison.
 */

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

test.describe("Homepage — Painted Porch Promise boxes", () => {
  for (const vp of VIEWPORTS) {
    test(`three boxes, laid out for ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      const list = page.getByTestId("home-promise");
      await list.scrollIntoViewIfNeeded();
      const boxes = list.getByTestId("home-promise-box");
      await expect(boxes).toHaveCount(3);
      await expect(boxes.nth(0)).toContainText("If yes");
      await expect(boxes.nth(1)).toContainText("If not yet");
      await expect(boxes.nth(2)).toContainText("If not us");

      const rects = await Promise.all([0, 1, 2].map((i) => boxes.nth(i).boundingBox()));
      for (const r of rects) expect(r, "box bounding box").not.toBeNull();
      const [a, b, c] = rects as Array<{ x: number; y: number; width: number; height: number }>;

      if (vp.width >= 768) {
        // One row: same top edge and same height, left to right.
        for (const r of [b, c]) {
          expect(Math.abs(r.y - a.y), "boxes share a top edge").toBeLessThanOrEqual(1);
          expect(Math.abs(r.height - a.height), "boxes share a height").toBeLessThanOrEqual(1);
        }
        expect(a.x).toBeLessThan(b.x);
        expect(b.x).toBeLessThan(c.x);
      } else {
        // Stacked: each box starts below the one before it.
        expect(b.y).toBeGreaterThanOrEqual(a.y + a.height);
        expect(c.y).toBeGreaterThanOrEqual(b.y + b.height);
      }

      await expect(list).toHaveScreenshot(`home-promise-${vp.name}.png`, {
        maxDiffPixelRatio: 0.02,
        animations: "disabled",
        stylePath: HIDE_SITE_HEADER,
      });
    });
  }
});
