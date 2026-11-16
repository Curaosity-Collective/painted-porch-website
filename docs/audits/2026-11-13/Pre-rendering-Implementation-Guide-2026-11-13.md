# Fixing Crawler Visibility — Pre-rendering Implementation Guide

**Site:** onthepaintedporch.com
**Stack confirmed:** React + Vite single-page app, built and hosted by Lovable, served through Cloudflare
**Problem:** every route returns a 13,637-byte HTML shell with an empty `<div id="root">`
**Date:** 2026-11-13

---

## The constraint that decides the approach

The site is served by Lovable's hosting pipeline. Evidence:

- Vite asset hashing (`/assets/index-CoV4V7Md.js`)
- Lovable's injected runtime (`/__l5e/events.270c78a44fc53e7b.js`)
- `server: cloudflare`, `cache-control: no-cache, must-revalidate, max-age=0` on HTML

Lovable builds and serves a static SPA. It has no SSR runtime and no build hook you can extend with a prerender step. **No configuration inside Lovable will fix this.** The build has to run somewhere you control.

That gives three real options.

| Option | Effort | Result | Verdict |
|---|---|---|---|
| **A. Own the build, prerender at build time, deploy to Cloudflare Pages** | 1–2 days | Every route ships real HTML. Permanent fix. | **Recommended** |
| **B. Refactor to true SSG (vite-react-ssg)** | 3–5 days | Same result, faster builds, cleaner architecture | Do after A proves out |
| **C. Dynamic rendering in a Cloudflare Worker** | Half a day | Bots get prerendered HTML, users get the SPA | Stopgap only — Google calls this a workaround, and divergent content risks a cloaking judgment |

Option C is worth knowing about because it can ship today, but it does not fix the underlying problem. A site that renders for bots and not for people is one Google policy change away from losing everything it gained.

---

## Option A — step by step

### Step 1. Get the source into GitHub

Lovable syncs two-way with GitHub. Connect the repo, then verify it builds locally:

```bash
git clone <repo> && cd <repo>
npm install
npm run build
npx serve dist
```

If the local build does not match production, stop here and resolve that first. Everything downstream assumes the repo is the real source.

### Step 2. Choose the prerender mechanism

**Fastest path — puppeteer prerender, no refactor.** Add the Rollup-compatible prerender plugin:

```bash
npm i -D @prerenderer/rollup-plugin puppeteer
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import prerender from "@prerenderer/rollup-plugin";
import routes from "./scripts/routes.json"; // array of path strings

export default defineConfig({
  plugins: [
    react(),
    prerender({
      staticDir: "dist",
      routes,
      renderAfterTime: 1500,   // let async content settle
      postProcess(renderedRoute) {
        renderedRoute.route = renderedRoute.originalRoute;
        return renderedRoute;
      },
    }),
  ],
});
```

`renderAfterTime` matters here because the app fetches content after mount. If sections still come through empty, increase it to 2500 ms rather than chasing each component.

**Generate the route list from the sitemap** so it never drifts:

```bash
curl -s https://onthepaintedporch.com/sitemap.xml \
  | grep -o '<loc>[^<]*</loc>' \
  | sed 's|<loc>https://onthepaintedporch.com||; s|</loc>||' \
  | sed 's|^$|/|' > scripts/routes.json
```

Exclude the four noindex pages and the three redirecting aliases from that file. Prerendering a page you have told Google not to index is wasted build time.

**Better path once it works — true SSG.** `vite-react-ssg` renders through React itself rather than a headless browser, so builds drop from minutes to seconds and there is no timing guesswork:

```bash
npm i vite-react-ssg
```

```tsx
// src/main.tsx
import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";

export const createRoot = ViteReactSSG({ routes });
```

This requires exporting your route array instead of declaring `<BrowserRouter>` inline. Worth doing, but not on day one.

### Step 3. Deploy to Cloudflare Pages

Cloudflare Pages already sits in front of the domain, so this changes the origin, not the network path.

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 |

Then point `onthepaintedporch.com` at the Pages project. Lovable stays your editor through the GitHub sync; publishing moves to Pages. That trade needs to be an explicit decision, because once publishing moves, Lovable's publish button no longer controls production.

### Step 4. Fix the 404s in the same deploy

Cloudflare Pages serves `public/404.html` with a real 404 status for any unmatched path. Create it:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <title>Page Not Found | Painted Porch Strategies</title>
  </head>
  <body>
    <h1>Page not found</h1>
    <p>This page doesn't exist. <a href="/">Start from the homepage</a>.</p>
  </body>
</html>
```

Add redirects for the alias URLs and the trailing-slash variants:

```
# public/_redirects
/media          /speaking/media          301
/blog           /resources/insights      301
/burnout-access /burnout                 301
/about/         /about                   301
/*              /404.html                404
```

### Step 5. Remove the canonical rewrite

Delete this from the app shell. It is overwriting correct server-rendered canonicals with whatever path the browser happens to be on:

```js
var origin = window.location.origin;
var pageUrl = origin + window.location.pathname;
var canonical = document.querySelector('link[rel="canonical"]');
if (canonical) canonical.setAttribute('href', pageUrl);
```

Replace it with a per-route canonical set in the document head. With prerendering in place, that value now ships in the HTML where crawlers can read it.

### Step 6. Verify before announcing anything

```bash
# Content must be present without JavaScript
curl -s https://onthepaintedporch.com/envision-shift | grep -c "P.A.T.H. Compass"
# Expect: 1 or more. Currently: 0.

# Unknown paths must 404
curl -s -o /dev/null -w "%{http_code}\n" https://onthepaintedporch.com/nope
# Expect: 404. Currently: 200.

# Canonical must be the page's own URL in raw HTML
curl -s https://onthepaintedporch.com/architect-shift | grep -o '<link rel="canonical"[^>]*>'

# www must redirect permanently
curl -s -o /dev/null -w "%{http_code}\n" https://www.onthepaintedporch.com/
# Expect: 301. Currently: 302.
```

Then confirm in Google Search Console with URL Inspection → "Test live URL" → view the rendered HTML. If the HTML tab shows your copy before rendering, the fix worked.

---

## Gotchas that will bite

**Hydration mismatches.** If the prerendered HTML differs from what React renders on the client, React throws away the server markup and re-renders. Symptoms are a flash of content and console warnings. Causes: `Date.now()`, `Math.random()`, `localStorage` reads, and viewport checks at render time. Move all of them inside `useEffect`.

**`window` and `document` at module scope.** Any top-level reference crashes the prerender step. Guard it:

```ts
const isBrowser = typeof window !== "undefined";
```

**Lazy routes.** If routes use `React.lazy`, the prerenderer may snapshot the fallback. Either await the chunks or prerender with `renderAfterTime` high enough to cover them.

**Third-party scripts.** The `__l5e` events script and any analytics should load after hydration, not block the prerender snapshot.

**Authenticated routes.** Never prerender admin, portal, or post-purchase pages. They will snapshot a signed-out state into a public file.

**Build time.** At roughly 1.5 seconds per route, 147 routes is about four minutes. Acceptable in CI, painful locally. Prerender only routes that change, or switch to `vite-react-ssg`.

---

## The stopgap, if you need something live today

If DNS sits in a Cloudflare zone you control, a Worker can intercept bot user agents, fetch a prerendered copy from a headless render service, and return that. Users still get the SPA.

I'd hold this to 48 hours. Google's guidance is that dynamic rendering is a workaround, not a solution, and serving materially different content to crawlers than to people is the definition of cloaking if it ever diverges. It buys time while Option A gets built. It does not replace it.

---

## Order of work

1. Sync the Lovable repo to GitHub and confirm the local build matches production.
2. Add the prerender plugin with a sitemap-derived route list.
3. Deploy to Cloudflare Pages and verify content in raw HTML on three routes.
4. Add `404.html` and `_redirects` in the same deploy.
5. Delete the canonical rewrite script.
6. Remove the three aliases and four noindex pages from the sitemap.
7. Request indexing in Search Console for the eight commercial pages.
8. Re-run the mobile performance measurement. Pre-rendering will improve LCP on its own, and the remaining gap is images and the JavaScript bundle.
