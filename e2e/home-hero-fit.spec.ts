import { test, expect, type Page } from "../playwright-fixture";

/**
 * The homepage hero's whole text block is visible on the first screen on phones, tablets and laptops (PPS Admin,
 * 2026-11-07: "On mobile and tablet the hero text should fully load and be visible on page", then "Yes" to
 * extending it to short laptop screens).
 *
 * Viewports are the visible area a browser leaves on load, toolbars subtracted: an iPhone SE in Safari is
 * 375x553, the shortest common phone; a 1366x768 laptop shows about 1366x657 in a browser.
 */

async function expectHeroTextOnFirstScreen(page: Page) {
  await page.goto("/");
  const hero = page.locator('section[aria-labelledby="home-hero-heading"]');
  const eyebrow = hero.getByText("Are You Built for What's Next?");
  const lastLine = hero.getByRole("link", { name: /Or book a Clarity Call/ });
  await expect(lastLine).toBeVisible();

  const header = await page.getByTestId("site-header").boundingBox();
  const top = await eyebrow.boundingBox();
  const bottom = await lastLine.boundingBox();
  const viewport = page.viewportSize()!;
  expect(header && top && bottom).toBeTruthy();
  // Starts below the floating header and ends above the bottom of the screen.
  expect(top!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
  expect(bottom!.y + bottom!.height).toBeLessThanOrEqual(viewport.height);
}

const PHONES = [
  { name: "iPhone SE, Safari", width: 375, height: 553 },
  { name: "small Android, Chrome", width: 360, height: 652 },
  { name: "iPhone 13, Safari", width: 390, height: 664 },
  { name: "Pixel 7, Chrome", width: 412, height: 839 },
];
const TABLETS = [
  { name: "iPad Mini portrait", width: 768, height: 1024 },
  { name: "iPad Pro 11 portrait", width: 834, height: 1194 },
  { name: "iPad landscape, Safari", width: 1024, height: 700 },
  { name: "iPad Pro 11 landscape, Safari", width: 1194, height: 770 },
];
const LAPTOPS = [
  { name: "1280x720 laptop", width: 1280, height: 609 },
  { name: "1366x768 laptop", width: 1366, height: 657 },
  { name: "1280x800 Mac", width: 1280, height: 689 },
  { name: "1440x900 Mac", width: 1440, height: 789 },
];

test.describe("Homepage hero fits the first screen", () => {
  for (const vp of [...PHONES, ...TABLETS]) {
    test.describe(vp.name, () => {
      test.use({ viewport: { width: vp.width, height: vp.height }, hasTouch: true, isMobile: true });
      test(`whole text block visible on load (${vp.width}x${vp.height})`, async ({ page }) => {
        await expectHeroTextOnFirstScreen(page);
      });
    });
  }
  for (const vp of LAPTOPS) {
    test.describe(vp.name, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });
      test(`whole text block visible on load (${vp.width}x${vp.height})`, async ({ page }) => {
        await expectHeroTextOnFirstScreen(page);
      });
    });
  }
});
