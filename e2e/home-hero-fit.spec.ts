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

/**
 * WCAG contrast of each line of hero text against the photo behind it: the text is hidden, and its color is
 * compared with the brightest 2% of the pixels where it sits. The IF stays its bright raspberry over the photo
 * (PPS-DEC-0022 item 6, 3:1 for a large heading); a soft shade behind the text block, not a darker photo, keeps it
 * readable (PPS Admin, 2026-11-07: "JUST darken the area behind the text as a gradient").
 */
const MINIMUM = { eyebrow: 4.5, headline: 3, IF: 3, paragraph: 4.5, caption: 4.5, link: 4.5 } as const;
type Item = keyof typeof MINIMUM;

async function heroTextContrast(page: Page) {
  await page.goto("/");
  const hero = page.locator('section[aria-labelledby="home-hero-heading"]');
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  await hero.locator("img").first().evaluate((img: HTMLImageElement) => img.decode());
  await page.evaluate(() => document.fonts.ready);
  const items = await hero.evaluate((section) => {
    const h1 = section.querySelector("h1")!;
    const block = [...h1.parentElement!.children];
    const elements = {
      eyebrow: h1.previousElementSibling!,
      headline: h1,
      IF: h1.querySelector("span.font-bold")!,
      paragraph: h1.nextElementSibling!,
      caption: block.find((c) => c.querySelector("button"))!.querySelector("p")!,
      link: block.find((c) => c.tagName === "A")!,
    };
    return Object.fromEntries(
      Object.entries(elements).map(([name, el]) => {
        const r = el.getBoundingClientRect();
        const rgb = getComputedStyle(el).color.match(/\d+/g)!.slice(0, 3).map(Number);
        return [name, { x: r.x, y: r.y, width: r.width, height: r.height, rgb }];
      }),
    ) as Record<Item, { x: number; y: number; width: number; height: number; rgb: number[] }>;
  });
  await page.addStyleTag({
    content: 'section[aria-labelledby="home-hero-heading"] :is(h1, p, a, button, span) { visibility: hidden !important; }',
  });
  const ratios = {} as Record<Item, number>;
  for (const [name, { rgb, ...clip }] of Object.entries(items) as [Item, (typeof items)[Item]][]) {
    const png = (await page.screenshot({ clip })).toString("base64");
    ratios[name] = await page.evaluate(
      async ({ png, rgb }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${png}`;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, img.width, img.height).data;
        const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        const behind: number[] = [];
        for (let i = 0; i < px.length; i += 4) behind.push(lum(px[i], px[i + 1], px[i + 2]));
        behind.sort((a, b) => b - a);
        const bg = behind[Math.floor(behind.length * 0.02)];
        const fg = lum(rgb[0], rgb[1], rgb[2]);
        return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
      },
      { png, rgb },
    );
  }
  return ratios;
}

async function expectHeroTextReadable(page: Page) {
  const ratios = await heroTextContrast(page);
  for (const name of Object.keys(MINIMUM) as Item[]) {
    expect(ratios[name], `${name} contrast ${ratios[name].toFixed(2)}:1`).toBeGreaterThanOrEqual(MINIMUM[name]);
  }
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
const DESKTOPS = [{ name: "1920x1080 desktop", width: 1920, height: 969 }];

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

test.describe("Homepage hero text stays readable over the photo", () => {
  for (const vp of [...PHONES, ...TABLETS]) {
    test.describe(vp.name, () => {
      test.use({ viewport: { width: vp.width, height: vp.height }, hasTouch: true, isMobile: true });
      test(`every line meets its contrast minimum (${vp.width}x${vp.height})`, async ({ page }) => {
        await expectHeroTextReadable(page);
      });
    });
  }
  for (const vp of [...LAPTOPS, ...DESKTOPS]) {
    test.describe(vp.name, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });
      test(`every line meets its contrast minimum (${vp.width}x${vp.height})`, async ({ page }) => {
        await expectHeroTextReadable(page);
      });
    });
  }
});
