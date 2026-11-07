import type { Page } from "@playwright/test";
import { expect } from "../../playwright-fixture";

/**
 * Opens the Find Your Next ShIFt guide from the header button, as a visitor does. The specs used to land
 * on /start-here, which opened the guide by itself; Start Here is retired and forwards to The P.A.T.H.
 * (PPS Admin, 2026-11-07).
 *
 * With `keyboard`, the button is focused and pressed with Enter, so keyboard-only specs stay keyboard-only.
 */
export async function openGuide(page: Page, { keyboard = false }: { keyboard?: boolean } = {}) {
  await page.goto("/");
  const button = page.getByTestId("site-header").getByRole("button", { name: /Find Your Next/i });
  await expect(button).toBeVisible();
  if (keyboard) {
    await button.focus();
    await page.keyboard.press("Enter");
  } else {
    await button.click();
  }
  await expect(page.getByText(/I'm here because I'm thinking about/i)).toBeVisible({ timeout: 5000 });
}
