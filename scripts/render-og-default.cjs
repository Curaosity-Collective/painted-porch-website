#!/usr/bin/env node
/**
 * Redraws public/og/og-default.jpg, the share card for pages without their own image
 * (PPS Admin, 2026-11-23: "Dark works"). Not part of the build; run it only to change the card.
 *
 *   npm install --no-save @fontsource/poppins@5
 *   npx playwright install chromium        # if Playwright has no browser yet
 *   node scripts/render-og-default.cjs
 *
 * Design: the Curaosity pattern (spaced-capital brand eyebrow over one big brand line) in PPS's
 * own brand. Deep teal ground (v3 --v3-teal-deep), Poppins, the approved homepage line with the
 * ShIFt "IF" in the on-dark raspberry (PPS-DEC-0022), and a small painted portico whose columns
 * run Raspberry, Purple, Teal, Lime, Gold so Gold never touches Raspberry (Brand Bible 1.7).
 * Abstract shapes only, no faces (PPS-DEC-0023).
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public/og/og-default.jpg");
const FONTS = path.join(ROOT, "node_modules/@fontsource/poppins/files");

const font = (weight) => {
  const data = fs.readFileSync(path.join(FONTS, `poppins-latin-${weight}-normal.woff2`)).toString("base64");
  return `@font-face{font-family:Poppins;src:url(data:font/woff2;base64,${data}) format('woff2');font-weight:${weight}}`;
};

const C = { teal: "#007697", lime: "#70A300", purple: "#523387", raspberry: "#DB0043", gold: "#E8A231" };
const ground = "#005461"; // --v3-teal-deep
const light = "#E6F7FB";
const ifOnDark = "#FF9EB1"; // --v3-berry-on-dark
const columns = [C.raspberry, C.purple, C.teal, C.lime, C.gold];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${font(600)}${font(700)}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${ground};overflow:hidden;position:relative;font-family:Poppins,sans-serif}
.copy{position:absolute;left:84px;top:0;bottom:0;width:760px;display:flex;flex-direction:column;justify-content:center}
.eyebrow{font-weight:600;font-size:20px;letter-spacing:.28em;text-transform:uppercase;color:${light};margin-bottom:26px}
h1{font-weight:700;font-size:62px;line-height:1.1;letter-spacing:-.01em;color:#fff;white-space:nowrap}
h1 b{font-weight:700;color:${ifOnDark}}
.porch{position:absolute;right:70px;top:92px;width:300px;height:446px}
.beam,.floor{position:absolute;left:0;right:0;height:14px;border-radius:4px;background:${light}}
.beam{top:0}.floor{bottom:0}
.cols{position:absolute;left:14px;right:14px;top:14px;bottom:14px;display:flex;justify-content:space-between}
.col{position:relative;width:38px;height:100%}
.col i{position:absolute;left:4px;right:4px;top:12px;bottom:12px;box-shadow:0 0 0 2px rgba(230,247,251,.45);
  background:linear-gradient(90deg,rgba(255,255,255,.25) 0,rgba(255,255,255,0) 40%,rgba(0,0,0,.12) 100%),var(--c)}
.col u,.col s{position:absolute;left:0;right:0;height:12px;background:var(--c);filter:brightness(.82)}
.col u{top:0;border-radius:2px 2px 0 0}.col s{bottom:0;border-radius:0 0 2px 2px}
</style></head><body>
<div class="copy"><div class="eyebrow">Painted Porch Strategies</div>
<h1>Build an Organization<br>That Can Do<br>Epic Sh<b>IF</b>t</h1></div>
<div class="porch"><div class="beam"></div>
<div class="cols">${columns.map((c) => `<div class="col" style="--c:${c}"><u></u><i></i><s></s></div>`).join("")}</div>
<div class="floor"></div></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  if (!(await page.evaluate(() => document.fonts.check("700 62px Poppins")))) {
    throw new Error("Poppins did not load; install @fontsource/poppins first.");
  }
  await page.screenshot({ path: OUT, type: "jpeg", quality: 85 });
  await browser.close();
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
})();
