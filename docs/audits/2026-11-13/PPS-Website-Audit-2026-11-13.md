# Painted Porch Strategies — Website Audit

**Site:** onthepaintedporch.com
**Date:** 2026-11-13
**Pages reviewed:** 14 core pages plus a 147-URL sitemap crawl
**Method:** raw HTML inspection, header analysis, headless-render comparison, measured lab performance on throttled mobile, static accessibility analysis

---

## Executive summary

The site's biggest problem is invisible to anyone who visits it. Every page is rendered in the browser, so the HTML a crawler receives is an empty shell of 13,637 bytes with no words, links, or images. Google must run JavaScript before it sees anything, and AI crawlers, link unfurlers, and most social preview bots never do. Beyond rendering, the site returns HTTP 200 for pages that do not exist, rewrites its own canonical tags in the browser, and submits sitemap URLs that duplicate the homepage and then redirect. On the content side, every H1 is a brand name (Envision ShIFt, The P.A.T.H.™) and no title across 147 URLs targets a term a buyer would search, so the site competes for nothing it sells. Performance fails on mobile: a 3.1 MB JavaScript bundle, 10.1-second largest contentful paint, and layout shift up to 1.28. The copy and the offers are genuinely strong. The plumbing is not.

---

## Scores

| Area | Score | Note |
|---|---|---|
| Crawlability and indexing | 2/10 | Client-rendered, soft 404s, JS canonical rewriting |
| Keyword targeting | 2/10 | No category terms in any title or H1 |
| On-page SEO | 5/10 | Clean heading hierarchy, but titles and descriptions run long |
| Performance | 3/10 | 10.1s LCP mobile, 3.1 MB JS, multi-megabyte images |
| Structured data | 5/10 | Solid baseline, missing FAQ/Article, broken logo URL |
| Accessibility | Not scored | Client rendering blocks static verification; two H1s per page confirmed |
| Copy and messaging | 7/10 | Specific and confident; brand terms outrun plain language |
| Conversion architecture | 5/10 | Pricing is public (rare and good); routes compete |

---

## Critical

### C1. The site is invisible to any crawler that does not run JavaScript

A plain request to the homepage returns 13,637 bytes whose body is `<div id="root"></div>` and a noscript block. Headless Chromium renders 1,367 words, 87 links, and 47 images from that shell. Googlebot and desktop Chrome receive byte-identical HTML, both with an empty root, so Google must render every page before indexing it. AI crawlers, link unfurlers, and most social bots see nothing.

**Fix:** pre-render every route at build or request time. Astro, Next, Nuxt, or a prerender service will put the title, meta, H1, copy, links, and JSON-LD in the first response. Hydrate afterwards.

**Why it matters most:** this single change improves indexing, AI discoverability, link previews, and time to first paint at once.

### C2. Unknown URLs return HTTP 200

`/this-page-does-not-exist-xyz123` returns HTTP 200 with the homepage's title and canonical. Only after JavaScript runs does it become "Page Not Found" with a noindex tag. Google has to render every dead URL before learning it is dead, and soft 404s accumulate as index bloat.

**Fix:** return a real 404 status server-side for unmatched routes.

---

## High

### H1. The canonical tag is rewritten by JavaScript on every load

Every page carries an inline script that sets `canonical.href = origin + pathname`. The server-rendered canonical is overwritten. `/about/` and `/ABOUT` end up self-canonicalizing a "Coming Soon" page, and alias routes canonicalize themselves before redirecting.

**Fix:** remove the script. Emit one correct canonical per route server-side.

### H2. The sitemap submits pages that redirect or refuse indexing

- `/media`, `/blog`, and `/burnout-access` return the homepage's title, description, and canonical, then redirect in JavaScript. The sitemap lists all three.
- `/kick-the-habit-watch`, `/stoic-field-guide-access`, `/pilot-training-watch`, and `/6-communicator-styles-watch` are marked `noindex, nofollow` and are also in the sitemap.
- 98 of 147 sitemap URLs are legacy insight posts; the 49 core pages carry no `<lastmod>`.

**Fix:** replace the three alias URLs with server-side 301s, remove the four noindex pages from the sitemap, add `<lastmod>` to core pages, and consider a sitemap index that submits commercial pages separately.

### H3. No page targets a term a buyer would search

Across all 147 URLs: "leadership consulting" appears in 0 titles, "consulting" in 0, "executive coaching" in 0, "organizational transformation" in 0, "change management" in 4 (all blog posts). Every commercial page is titled with its product name. Rendered H1s are "Build an Organization That Can Do Epic ShIFt," "The P.A.T.H.™," "Envision ShIFt," "Architect ShIFt," "Embody ShIFt."

The site has no page competing for the queries that precede a $24,000 to $136,000 engagement.

**Fix:** build or re-optimize service pages around buyer language — organizational change consulting, leadership team development, executive offsite facilitation, change management consulting. Lead each H1 with the category and audience, and keep the brand line as a subhead or eyebrow.

### H4. The homepage title is a slogan

Title: "Painted Porch Strategies | Build an Organization That Can Do Epic ShIFt" — 71 characters, containing no "leadership," "change," "consulting," or audience descriptor, and long enough to truncate.

**Fix:** "Leadership & Organizational Change Consulting | Painted Porch Strategies" (66 characters), or trim the brand suffix.

### H5. Meta descriptions run past the truncation point on the highest-value pages

`/envision-shift` is 312 characters. `/architect-shift` and `/embody-shift` are 202. Across the sitemap, 34 of 147 exceed 160. The price and differentiator, which are the best parts, get cut off.

**Fix:** 140–155 characters with the price or outcome in the first 150.

### H6. Mobile performance fails

Measured on an emulated Pixel 5 at Slow 4G with 4x CPU throttling:

| Metric | Homepage | /speaking |
|---|---|---|
| Largest contentful paint | 10,148 ms | 7,536 ms |
| Time to first byte | 2,579 ms | — |
| Cumulative layout shift | 0.93 | 0.93 (1.28 on /workshops) |
| JavaScript bundle | 3,108,739 bytes raw / 826 KB gzip | same |

43 of 47 homepage images have no width or height attributes, which is where the layout shift comes from.

**Fix:** pre-render above-the-fold HTML, code-split and defer non-critical JS, set explicit dimensions or aspect ratios on every image, and reserve space for late-mounted sections.

### H7. Image payloads are multi-megabyte

Lab-measured image bytes per page: `/about` 4,617 KB (largest single image 2,014 KB), `/speaking` 3,352 KB (portrait 1,876 KB), `/workshops` 2,423 KB (1,824 KB), `/leadership-labs` 940 KB. All JPG or PNG, none WebP or AVIF.

**Fix:** convert heroes and portraits to WebP or AVIF at rendered dimensions, add srcset, preload the LCP image, lazy-load everything below the fold.

### H8. The header has no services menu and no booking link

Header links: logo, "The P.A.T.H. to ShIFt," "Speaking," "Insights & Resources," "About," and a "Find Your Next ShIFt" button that opens a dialog. All eight commercial pages live only in the footer.

**Fix:** add a "Work With Us" menu exposing Envision, Architect, Embody, Workshops, Labs, and Assessments, plus a persistent "Book a Clarity Call" link.

### H9. Hero CTAs compete

The homepage hero offers "Find Your Next ShIFt" and "Or book a Clarity Call →" side by side, plus a three-minute guide, then repeats routes to all three offers lower down. A $24,000 buyer is asked to choose between a paid call and an unspecified guide before they know what either is.

**Fix:** one primary action for organizational buyers (book the call), one clearly secondary low-commitment option, and present the three offers as steps in one path rather than equal destinations.

### H10. Pricing is public but incomplete

This is better than most competitors, and it still stops short of budgeting. Architect shows "Starting at $90,000" with a weekly and biweekly version but no range, no day count, and no combined cost with the $24,000 appraisal. Embody shows "$9,000–$18,000 per month" with no minimum term, no duration, and no explanation of what changes between the two ends.

**Fix:** publish the price per cadence, the time included, and the likely total including the appraisal. For Embody, state the cadence, who attends, and the minimum term.

---

## Medium

### M1. Structured data gaps

- Organization `logo` and `image` point to `/og-image.jpg`, which returns 404.
- `/assessments`, `/workshops`, `/leadership-labs`, and `/resources/faq` all render FAQ blocks with no FAQPage markup.
- 98 blog posts have no BlogPosting schema and no author markup; bylines are plain text.
- Only `/envision-shift` carries an Offer with a price. Architect and Embody have Service nodes with no offers. Five commercial pages have no Service schema at all.
- No PostalAddress, telephone, or priceRange anywhere.

### M2. Duplicate person pages

`/amy` and `/speaking/amy` both return 200 and both self-canonicalize. Same for Rob and Sierra. Brand-name searches split between a bio page and a speaker page.

### M3. A placeholder page is indexable

`/about/` (with trailing slash) and `/ABOUT` return HTTP 200 with "Painting this porch as we speak," marked `index, follow`, self-canonicalized. Every other tested trailing-slash variant resolves correctly, so this is route-specific.

### M4. The www redirect is temporary

`https://www.onthepaintedporch.com/` returns 302 instead of 301. The http-to-https redirect is correct at 301.

### M5. Two H1s per page in the raw HTML

Every page ships a page-specific H1 and a generic brand H1 inside the noscript fallback. Rendered pages are clean at one H1 with no skipped levels, but the fallback document contradicts the real one.

### M6. Alt text is thin where it matters

Homepage: 23 of 47 images have `alt=""`. `/about`: 34 of 61. `/speaking`: 19 of 44. No image is missing the attribute entirely, but the empty values cover logo walls and portraits where the brand name or person is the useful text.

### M7. Proof is present but hard to verify

Good: the 73% change-saturation stat links to Prosci, the 88% stat links to PwC, testimonials carry role labels, and client logos are recognizable. Weak: "28 organizations and counting" is undated and unsourced, testimonials are initials only with no outcome, and the three "For example" scenarios on /the-path are not labeled as illustrative, so a buyer may read them as client cases.

### M8. Proprietary terms arrive before plain language

Phase Zero is used in the homepage's opening paragraph before it is defined. P.A.T.H., the Painted Porch Pillars, and the P.A.T.H. Compass are all explained somewhere on the site but not at first use.

**Fix:** pair each term with a short plain definition at first mention — Phase Zero as the preparation and alignment work before execution, the Compass as the written findings and recommended next move, the Pillars as leadership and culture, systems and workflows, and human capacity.

### M9. Copy slop

| Instance | Page | Issue |
|---|---|---|
| "We only enter partnerships where we believe meaningful progress is possible - together." | Sitewide | Banned filler word, hyphen used as a dash |
| "Interviews. Appraisal. Clarity." | /envision-shift | Period-separated triad |
| "The Breaking Point Breakthrough." / "The Catalyst Event." / "The Vision Validation." | /envision-shift | Decorative headings with terminal periods |
| "not one that only looks right on a slide" | /envision-shift | Binary contrast tail that adds no claim |
| "A Continuous Practice, Not a Finish Line" / "It's Not Just You" | /embody-shift | Contrast construction as a headline |
| "Great organizations don't reach their next level by chance." | /architect-shift | Portability test failure — could sit on any consultancy's site |

### M10. Accessibility could not be fully verified

Because pages render client-side, static analysis sees zero images, zero forms, zero buttons, and zero video. What could be confirmed: `lang="en"` present on all pages, viewport configured, no skipped heading levels, no generic "learn more" links, focus-visible styles present in the CSS bundle, and touch-target classes at 44px and 52px defined. What cannot be confirmed without a browser pass: form labels on /contact, button accessible names, video captions, skip-to-content link (none in static HTML), and rendered image alt text.

**Action:** run one browser-based accessibility pass after pre-rendering is in place. Pre-rendering makes most of this statically testable.

---

## What is working

- **HTTPS everywhere**, with HSTS including subdomains, nosniff, and a strict referrer policy. The http-to-https redirect is a clean 301.
- **All 147 sitemap URLs return 200** with non-empty titles and descriptions. Nothing is missing metadata.
- **Exactly one canonical, viewport, og:title, og:image, og:description, and twitter:card** on all 14 pages.
- **Clean rendered heading hierarchy** — one H1 per page, no skipped levels.
- **Every page's footer links to all eight commercial pages.** Internal discovery to money pages is complete, which makes the header gap easy to fix.
- **Prices are published.** $24,000, $90,000, and $9,000–$18,000 per month are on the pages. Most consultancies at this tier hide them, and publishing them pre-qualifies every lead.
- **robots.txt is clean and permissive**, with 35 admin paths disallowed, CSS and JS not blocked, and the sitemap declared.
- **No cloaking.** Googlebot and Chrome receive byte-identical responses.
- **Core pages carry substantive copy** — 472 to 1,367 rendered words with process steps, pricing, and FAQs, not thin boilerplate.
- **The copy itself is strong.** "Clarity is valuable even when it changes the plan" is the best line on the site because it answers the buyer's real fear before they voice it. The six-interview method and the four possible recommendations (move now, reinforce, resequence, or stop) are genuinely differentiated.

---

## Fix order

1. **Pre-render the site.** Nothing else matters as much. It fixes indexing, AI visibility, link previews, and first paint together.
2. **Return real 404s** for unmatched routes.
3. **Remove the JavaScript canonical rewrite** and emit one server-side canonical per route.
4. **Fix the sitemap** — 301 the three alias URLs, drop the four noindex pages, add lastmod to core pages.
5. **Build one service page per buyer search term**, starting with organizational change consulting and leadership team development.
6. **Rewrite the homepage title and all over-length meta descriptions** to 60 and 155 characters, price and outcome first.
7. **Add the services menu and a persistent booking link** to the header.
8. **Compress images and set dimensions on every one**, then re-measure LCP and CLS on mobile.
9. **Fix the broken logo URL** and add FAQPage, BlogPosting, and Service/Offer schema.
10. **Publish complete pricing** for Architect and Embody, including the appraisal in the total.
11. **Resolve the duplicate person pages** and the indexable /about/ placeholder.
12. **Run the browser accessibility pass** once pre-rendering lands.
13. **Clean the copy** — the six slop instances above, plus first-use definitions for Phase Zero and the Compass.

---

## Note on scope

`docs/archive/landing-page-copy-2026-01.md` in this repository is the January 2026 draft, marked superseded on 2026-11-13. It quotes a $697 diagnostic and an $18,000–$69,000 Design Session, neither of which is a current offer. Archive it rather than edit it.
