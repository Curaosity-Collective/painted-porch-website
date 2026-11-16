# Client-Side Rendering and Crawler Visibility

## Problem documentation and solution design

| | |
|---|---|
| **Site** | onthepaintedporch.com |
| **Version** | 1.0 |
| **Date** | 2026-11-13 |
| **Status** | Problem confirmed. Solution designed. Not yet implemented. |
| **Audience** | Leadership (sections 1–4), engineering and vendors (sections 5–12) |
| **Related** | `PPS-Website-Audit-2026-11-13.md`, `Pre-rendering-Implementation-Guide-2026-11-13.md` |

---

## 1. Executive summary

Every page on the site is assembled in the visitor's browser. The server sends an empty container, and a 3.1 MB program fills it in. People see a finished page. Crawlers that do not run that program see nothing at all.

Google can run JavaScript, but it does so on a deferred schedule, with a rendering queue, and without a guarantee that every page gets rendered. Most other crawlers — AI assistants, link previews, social unfurlers — do not run it at all. The practical result is that a site selling $24,000 to $136,000 engagements is invisible to the systems buyers increasingly use to find and evaluate vendors, and it is dependent on Google's good behavior for the traffic it does get.

The fix is well understood: render the pages on the server or at build time, so the first response contains the content. The complication is that the site is hosted on Lovable, which builds and serves a static single-page app and offers no server rendering. Fixing this requires taking ownership of the build.

Estimated effort is one to two days for the initial fix, with a further three to five days available for a cleaner long-term architecture. The decision required is not technical. It is whether publishing moves from Lovable's pipeline to a build the team controls.

---

## 2. The problem in one page

| Question | Answer |
|---|---|
| What does a crawler receive? | 13,637 bytes of HTML with an empty `<div id="root">` and a fallback block |
| What does a visitor receive? | The same 13,637 bytes, then 1,367 words, 87 links, and 47 images after a 3.1 MB download executes |
| Is the content in the HTML? | No. Zero words outside the noscript fallback |
| Can Google index it? | Yes, eventually, through its rendering queue. Not guaranteed, not immediate, not free. |
| Can AI assistants read it? | Generally no. Most do not execute JavaScript. |
| Can social platforms preview it? | Title and image tags are present, so links unfurl. Body content is absent. |
| Does it hurt speed? | Yes. Largest contentful paint is 10.1 seconds on throttled mobile. |
| Is this a bug? | No. It is the architecture the site was built with. |

The distinction matters. Nothing is broken in the sense of a defect someone can patch. The site works exactly as a single-page app is designed to work. The design is simply incompatible with how discovery works today.

---

## 3. How this was discovered

The finding came out of a full site audit on 2026-11-13 covering 14 core pages and a crawl of the 147-URL sitemap. The rendering question surfaced because every page returned suspiciously small and suspiciously similar HTML.

Three independent tests established it:

**Test 1 — raw response size.** A plain HTTP GET of the homepage returns 13,637 bytes, and stripping the tags from that response leaves no readable content.

**Test 2 — content extraction.** Stripping tags from the raw response yields zero words outside the noscript fallback. The fallback contains a generic brand heading, not the page's actual content.

**Test 3 — user agent comparison.** Googlebot and desktop Chrome user agents received byte-identical responses, both with an empty root container. There is no server-side differentiation, which rules out cloaking but confirms that no version of the page exists in HTML.

A headless browser loading the same URL rendered 1,367 words, 87 links, and 47 images — all created after the response arrived.

---

## 4. Root cause

The site is a React single-page application built with Vite, hosted by Lovable, and served through Cloudflare.

**How a request flows today:**

1. Browser requests `https://onthepaintedporch.com/envision-shift`
2. Cloudflare returns the same static `index.html` for every route
3. That file contains `<div id="root"></div>` and a `<script src="/assets/index-CoV4V7Md.js">` tag
4. Browser downloads 3,108,739 bytes of JavaScript (826 KB compressed)
5. React Router reads the URL and mounts the matching component tree
6. Components fetch content and render it into the empty div
7. The visitor sees a page

At step 3, a crawler without JavaScript stops. There is nothing to index.

**Why Lovable cannot fix it:** Lovable builds a static bundle and serves it as a static site. It has no server runtime to render React, and no build hook to insert a prerendering step. The `__l5e` runtime in the page is Lovable's own client-side instrumentation, which confirms the hosting model.

This is a product boundary, not a defect in Lovable. It means the fix has to happen outside the current pipeline.

---

## 5. Impact assessment

### 5.1 Organic search

Google renders JavaScript, so pages can be indexed. The costs are real but invisible:

- **Rendering queue.** Google defers JavaScript rendering to a separate, budgeted process. New or updated pages can wait days or weeks before rendering.
- **No guarantee.** Google's documentation states rendering is not guaranteed for every page. Pages that time out or error during rendering may be indexed with no content.
- **Crawl budget.** Rendering is expensive, so Google renders fewer pages per crawl than it fetches. On a 147-URL site, this slows discovery of new content.
- **Soft signals.** A page Google cannot render confidently tends to rank for less, not more.

### 5.2 AI and answer engines

This is the fastest-growing discovery channel and the one most damaged. Assistants that answer "who does organizational change consulting for mid-market companies" generally fetch HTML and read text. They do not run React.

The consequence: the site cannot be cited, summarized, or recommended by systems that never see its content. For a consultancy whose differentiation is method and judgment, this removes the site from the conversation entirely.

Crawler behavior varies by vendor and changes often. The safe assumption is that any crawler not named Google does not execute JavaScript.

### 5.3 Link previews and sharing

Title, description, and Open Graph image are in the static head, so links unfurl correctly. This part works and should not be disturbed during the fix.

### 5.4 Performance

The rendering model and the performance problem share a root cause. Because content arrives only after the bundle executes, the largest contentful paint on throttled mobile is 10,148 ms, time to first byte is 2,579 ms, and cumulative layout shift reaches 0.93 on the homepage and 1.28 on /workshops.

Pre-rendering improves all three by moving content earlier in the timeline. It does not fix image weight or bundle size, which remain separate work.

### 5.5 Accessibility

Static analysis of the site can verify almost nothing: zero images, zero forms, zero buttons, and zero video are visible in the HTML. Every accessibility check depends on a rendered DOM, which means accessibility testing requires a browser on every pass, and automated tools that read HTML see an empty page.

Pre-rendering makes most of the site statically testable, which is the difference between accessibility being verifiable and being assumed.

### 5.6 Analytics and conversion tracking

Page views register after hydration. Visitors who bounce before the bundle executes — a real risk at 10-second load times — may never be counted. Reported traffic is likely understated.

---

## 6. What is not affected

Scope discipline matters here. The fix should not become a redesign.

- **Meta tags are already correct.** Titles, descriptions, canonicals, and Open Graph tags are in the static head on all 14 pages and work today.
- **The design, copy, and brand are not in question.** This is a delivery problem, not a content problem.
- **Client-side navigation is fine.** Once the first page is prerendered, in-app navigation can stay as it is.
- **Form submissions, booking flows, and authenticated areas** should not be prerendered and are not affected by this fix.
- **Cloudflare caching and security headers** are working correctly and should be preserved.

---

## 7. Solution options

Four options were evaluated.

### Option A — Build-time prerendering on Cloudflare Pages

The existing React app is rendered to static HTML for each route during the build, using a headless browser after `vite build`. Each route ships a complete HTML file. The app hydrates as normal on the client.

- **Effort:** 1–2 days
- **Code change:** configuration and a route list; no component rewrite
- **Result:** every route ships real content in the first response
- **Risk:** moderate — build time increases, and components that touch `window` at module scope need guarding
- **Reversibility:** high — reverting is a redeploy of the previous build
- **Tradeoff:** publishing moves from Lovable to Cloudflare Pages

### Option B — True static generation with vite-react-ssg

React renders each route through its own renderer rather than a headless browser. Faster builds, no timing guesswork, cleaner architecture.

- **Effort:** 3–5 days
- **Code change:** export the route array; restructure the entry point
- **Result:** same as A, with more reliable output
- **Risk:** moderate — entry-point refactor can surface routing assumptions
- **Reversibility:** high
- **Tradeoff:** same hosting change as A

### Option C — Dynamic rendering in a Cloudflare Worker

A Worker detects bot user agents and serves a prerendered snapshot, while people receive the SPA.

- **Effort:** half a day
- **Code change:** none in the app; a Worker and DNS access
- **Result:** bots see content
- **Risk:** high — depends on maintaining two content paths
- **Reversibility:** high
- **Tradeoff:** Google's guidance treats dynamic rendering as a workaround. Serving materially different content to crawlers than to visitors is the definition of cloaking if the paths diverge. Requires DNS control the team may not have.

### Option D — Do nothing

- **Effort:** none
- **Result:** status quo
- **Risk:** accumulates — Google's rendering budget, AI crawlers, and accessibility verification all stay degraded
- **Verdict:** not recommended, but worth stating plainly so the decision is explicit rather than by default

### Comparison

| | A. Prerender | B. SSG | C. Worker | D. Nothing |
|---|---|---|---|---|
| Content in HTML | Yes | Yes | Bots only | No |
| Effort | 1–2 days | 3–5 days | 0.5 day | 0 |
| Build time | +4 min | +10 sec | unchanged | unchanged |
| Cloaking risk | None | None | Real | None |
| Fixes 404s and canonicals too | Yes | Yes | No | No |
| Needs DNS control | No | No | Yes | No |
| Publishing leaves Lovable | Yes | Yes | No | No |

---

## 8. Recommendation

**Implement Option A now. Plan Option B for the next quarter.**

Option A fixes the problem in two days with no component rewrite and carries almost no risk of breaking the visible site. Option B is better engineering, but it is a refactor, and a refactor is the wrong thing to do under time pressure when a configuration change solves the problem.

Option C should be held in reserve as a 48-hour bridge only if a business event requires content to be crawlable before Option A can ship. It does not fix the problem and should not be treated as a destination.

### The decision that has to be made explicitly

Moving to Cloudflare Pages means Lovable stops being the publisher. It remains the editor through GitHub sync, but production is built and deployed by Cloudflare from the repository.

This is a governance change, not a technical one, and it should be made by whoever owns the website rather than discovered halfway through implementation. The alternatives are to accept a Worker-based workaround with its cloaking risk, or to stay on Lovable and accept the visibility loss.

---

## 9. Recommended solution in detail

### 9.1 Target architecture

```
GitHub repository (synced from Lovable)
        │
        ▼
Cloudflare Pages build
   npm ci
   npm run build        ← vite build + prerender pass
        │
        ▼
dist/
   index.html                    (prerendered homepage)
   envision-shift/index.html     (prerendered offer page)
   architect-shift/index.html
   ... one complete HTML file per route
   404.html                      (real 404 status)
   _redirects                    (301s for aliases and slashes)
        │
        ▼
Cloudflare edge (existing CDN, existing security headers)
        │
        ▼
Visitor or crawler receives complete HTML immediately
React hydrates and the app behaves as before
```

### 9.2 What a request looks like after the fix

**Before:**

```html
<body>
  <div id="root"></div>
  <noscript>Build an Organization That Can Do Epic ShIFt</noscript>
  <script src="/assets/index-CoV4V7Md.js"></script>
</body>
```

**After:**

```html
<body>
  <div id="root">
    <header>...</header>
    <main>
      <h1>Envision ShIFt</h1>
      <p>Every epic shIFt begins at a threshold...</p>
      <!-- full page content -->
    </main>
    <footer>...</footer>
  </div>
  <script src="/assets/index-CoV4V7Md.js" defer></script>
</body>
```

The crawler indexes the content in the first response. The browser hydrates the same markup into a live app.

### 9.3 Implementation steps

Full code, configuration, and troubleshooting are in `Pre-rendering-Implementation-Guide-2026-11-13.md`. Summary:

1. Sync the Lovable repository to GitHub; confirm the local build matches production
2. Add the prerender plugin to `vite.config.ts`
3. Generate the route list from `sitemap.xml`, excluding noindex and redirecting URLs
4. Create a Cloudflare Pages project: build `npm run build`, output `dist`
5. Add `public/404.html` and `public/_redirects`
6. Remove the JavaScript canonical rewrite from the app shell
7. Point the domain at Cloudflare Pages
8. Verify with the protocol in section 11

### 9.4 Fix these in the same deploy

Pre-rendering alone does not fix four adjacent problems. Doing them together avoids a second maintenance window.

| Issue | Fix |
|---|---|
| Unknown URLs return HTTP 200 | `404.html` gives Cloudflare Pages a real 404 to serve |
| `/media`, `/blog`, `/burnout-access` duplicate the homepage then redirect in JS | 301 rules in `_redirects` |
| `/about/` and `/ABOUT` serve an indexable "Coming Soon" page | 301 to `/about` |
| Canonical tag rewritten by JavaScript on every load | Delete the script; emit one canonical per route |
| Four noindex pages listed in the sitemap | Remove from `sitemap.xml` |
| www returns 302 instead of 301 | Change to a permanent redirect at the edge |
| Two H1s per page from duplicated noscript content | Single H1 per route once prerendered |

---

## 10. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hydration mismatch causes a flash or console errors | Medium | Low | Move `Date.now()`, `Math.random()`, `localStorage`, and viewport checks into `useEffect` before deploying |
| `window` or `document` at module scope crashes the prerender | Medium | Medium | Guard with `typeof window !== "undefined"`; the build fails loudly rather than silently |
| Lazy-loaded routes snapshot a loading state | Medium | Medium | Raise `renderAfterTime`, or await chunks during prerender |
| Prerendered content drifts from client content | Low | High | Render from the same components; never hand-write HTML per page |
| Authenticated or post-purchase pages get published | Low | High | Exclude them from the route list explicitly; keep noindex on them |
| Build times slow development | High | Low | Prerender only changed routes locally; full prerender in CI |
| Lovable sync overwrites manual changes | Medium | Medium | Do the work in a branch; never edit generated files by hand |
| Losing Lovable's publish workflow causes confusion | High | Medium | Document the new process before switching; name who publishes |

---

## 11. Verification protocol

Run before declaring the fix complete. Each command returns a clear pass or fail.

```bash
# 1. Content present without JavaScript
curl -s https://onthepaintedporch.com/envision-shift | grep -c "P.A.T.H. Compass"
# Pass: >= 1     Current: 0

# 2. Unknown paths return 404
curl -s -o /dev/null -w "%{http_code}\n" https://onthepaintedporch.com/does-not-exist
# Pass: 404      Current: 200

# 3. Canonical is the page's own URL in raw HTML
curl -s https://onthepaintedporch.com/architect-shift | grep -o '<link rel="canonical"[^>]*>'
# Pass: points to /architect-shift

# 4. Aliases redirect permanently
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://onthepaintedporch.com/media
# Pass: 301 -> /speaking/media

# 5. www redirect is permanent
curl -s -o /dev/null -w "%{http_code}\n" https://www.onthepaintedporch.com/
# Pass: 301      Current: 302

# 6. Only one H1 in raw HTML
curl -s https://onthepaintedporch.com/ | grep -o "<h1" | wc -l
# Pass: 1        Current: 2

# 7. Word count in raw HTML
curl -s https://onthepaintedporch.com/ | sed 's/<[^>]*>/ /g' | wc -w
# Pass: > 500    Current: < 100
```

**Search Console confirmation:** URL Inspection → Test live URL → view the HTML tab. Copy must appear before any rendering. Then request indexing for the eight commercial pages.

**Post-deploy monitoring:** watch Crawl Stats for a rise in pages with content indexed, and Core Web Vitals for LCP improvement over four weeks. CrUX field data lags by 28 days, so do not judge performance from lab scores alone.

---

## 12. Rollback plan

Cloudflare Pages keeps every deployment. If the prerendered build causes problems in production, roll back to the previous deployment from the dashboard, which restores the prior build in under a minute.

The original Lovable deployment remains live at its own URL throughout. If Cloudflare Pages fails entirely, point DNS back to Lovable and accept the crawler problem rather than accept downtime.

**Rollback triggers:** visible rendering errors on any commercial page, broken navigation, or a booking flow that stops working. Cosmetic differences in hydration are not a rollback trigger.

---

## 13. Open questions for the owner

1. Who controls DNS for onthepaintedporch.com, and is the zone in the Painted Porch Cloudflare account or Lovable's?
2. Is the Lovable repository already synced to GitHub, and does the team have write access?
3. Who publishes to production after the change, and who is on call if a deploy fails?
4. Is there a business reason to preserve Lovable as the publisher that outweighs the visibility loss?
5. What is the acceptable downtime window for the DNS cutover?

Answers to these determine the timeline, not the design. The design is settled.

---

## Appendix A — Reproduction commands

Every claim in this document can be re-verified:

```bash
# Raw HTML size and emptiness
curl -s https://onthepaintedporch.com/ | wc -c

# Visible words in raw HTML
curl -s https://onthepaintedporch.com/ | sed 's/<[^>]*>/ /g' | wc -w

# Rendered word count (requires a headless browser)
# npx playwright screenshot --full-page https://onthepaintedporch.com/ /tmp/home.png

# JavaScript bundle size
curl -s https://onthepaintedporch.com/ | grep -o '/assets/index-[^"]*\.js'

# Confirm Lovable hosting markers
curl -s https://onthepaintedporch.com/ | grep -o '__l5e'
curl -sI https://onthepaintedporch.com/ | grep -i server

# Sitemap contents
curl -s https://onthepaintedporch.com/sitemap.xml | grep -c '<loc>'
```

## Appendix B — Glossary

| Term | Meaning |
|---|---|
| **SSR** | Server-side rendering. The server builds HTML for each request. |
| **SSG** | Static site generation. HTML is built once at build time and served as a file. |
| **Prerendering** | Rendering each route to HTML during the build so the first response contains content. |
| **Hydration** | React attaching event handlers to existing HTML without rebuilding it. |
| **CSR** | Client-side rendering. The browser builds the page. What the site does today. |
| **Hydration mismatch** | Server HTML and client render disagree, so React discards the server markup. |
| **Soft 404** | A missing page that returns HTTP 200, so crawlers must render it to learn it is dead. |
| **Dynamic rendering** | Serving prerendered HTML to bots and an SPA to users. A workaround, not a solution. |
| **LCP** | Largest contentful paint. When the main content becomes visible. Target under 2.5 s. |
| **CLS** | Cumulative layout shift. How much the page moves while loading. Target under 0.1. |

## Appendix C — References

- Google Search Central — JavaScript SEO basics and rendering guidance
- Google Search Central — Dynamic rendering as a workaround
- web.dev — Core Web Vitals thresholds
- Cloudflare Pages — Build configuration, `_redirects`, and 404 handling
- Vite — Build and plugin configuration
