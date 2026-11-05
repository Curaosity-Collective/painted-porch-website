#!/usr/bin/env node
/**
 * Postbuild prerender: bake per-route SEO metadata + real content into
 * static HTML files under dist/ so crawlers (ChatGPT, Perplexity,
 * Google, Bing) see full content instead of the empty SPA shell.
 *
 * How it works:
 *   - Reads the built dist/index.html as a template.
 *   - For each route in scripts/prerender-content.mjs, produces
 *     dist/<route>/index.html with:
 *       • rewritten <title>, meta description, canonical, og:*, twitter:*
 *       • real HTML content injected into <div id="root"> (H1, intro,
 *         section headings, key links)
 *   - Real users still get the SPA. main.tsx uses createRoot (not
 *     hydrateRoot), so React replaces the #root children on mount —
 *     no hydration mismatch warnings.
 *
 * Failures are non-fatal: warnings logged, build continues.
 * Skip entirely with PRERENDER=0.
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routes, SITE } from "./prerender-content.mjs";
import { buildMediaAppearanceSchema, buildMediaAppearancePage, serializeMediaAppearanceSchema } from "../src/lib/media-appearance-seo.mjs";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

if (process.env.PRERENDER === "0") {
  console.log("[prerender] skipped (PRERENDER=0)");
  process.exit(0);
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(DIST))) {
  console.log("[prerender] no dist/ — skipping");
  process.exit(0);
}

// Never fail the build on prerender errors.
process.on("uncaughtException", (err) => {
  console.warn(`[prerender] uncaught: ${err.message}`);
  process.exit(0);
});
process.on("unhandledRejection", (err) => {
  console.warn(`[prerender] rejection: ${err?.message ?? err}`);
  process.exit(0);
});

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const escapeAttr = escapeHtml;

const template = await readFile(path.join(DIST, "index.html"), "utf8");

/**
 * Replace the first matching tag in the HTML document.
 * Returns unchanged HTML if the pattern doesn't match (never throws).
 */
function replaceTag(html, regex, replacement) {
  return regex.test(html) ? html.replace(regex, replacement) : html;
}

function renderBody(route) {
  const url = SITE + (route.path === "/" ? "" : route.path);
  const sections = (route.sections ?? [])
    .map(
      (s) =>
        `      <section><h2>${escapeHtml(s.h2)}</h2><p>${escapeHtml(
          s.body,
        )}</p></section>`,
    )
    .join("\n");
  const links = (route.links ?? [])
    .map(
      (l) =>
        `        <li><a href="${escapeAttr(l.href)}">${escapeHtml(l.label)}</a></li>`,
    )
    .join("\n");

  // This content lives inside <div id="root">. Since main.tsx uses
  // createRoot (not hydrateRoot), React replaces these children on
  // mount — no hydration warnings, no visual flash for users because
  // the SPA styles hide untyped body content behind the app shell.
  return `<div style="max-width:760px;margin:2rem auto;padding:1.5rem;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a1a2e">
      <h1>${escapeHtml(route.h1)}</h1>
      <p>${escapeHtml(route.intro)}</p>
${sections}
${
  links
    ? `      <nav aria-label="Explore"><h2>Explore</h2><ul>\n${links}\n        </ul></nav>`
    : ""
}
      <p><a href="${escapeAttr(url)}">${escapeHtml(url)}</a></p>
    </div>`;
}

// Auto-generated Service / Offer JSON-LD keyed by route path. Keeps
// prerender-content.mjs focused on copy while still emitting rich
// structured data for crawlers on our highest-intent pages.
const ORG_REF = { "@id": `${SITE}/#organization` };

// Blue Door launch state is derived from src/config/blueDoor.ts so prerendered
// structured data can never drift from the runtime pages. Verified by
// src/test/blue-door-offer-schema.test.ts.
const blueDoorConfig = await readFile(
  path.join(ROOT, "src/config/blueDoor.ts"),
  "utf8",
).catch(() => "");
const blueDoorLaunchIso =
  blueDoorConfig.match(/BLUE_DOOR_LAUNCH_DATE = new Date\("([^"]+)"\)/)?.[1] ?? "";
// Mirrors isBlueDoorPreLaunch(): driven by the explicit BLUE_DOOR_LAUNCHED
// switch, never by the calendar.
const blueDoorPreLaunch =
  (blueDoorConfig.match(/BLUE_DOOR_LAUNCHED = (true|false)/)?.[1] ?? "false") === "false";
const blueDoorAvailability = blueDoorPreLaunch
  ? "https://schema.org/PreOrder"
  : "https://schema.org/InStock";

const SERVICE_LD = {
  "/blue-door": {
    "@type": "Service",
    name: "The Blue Door — Strategic Organizational Appraisal",
    serviceType: "Strategic Organizational Appraisal",
    category: "Management Consulting",
    provider: ORG_REF,
    areaServed: { "@type": "Country", name: "United States" },
    offers: {
      "@type": "Offer",
      price: "1500",
      priceCurrency: "USD",
      availability: blueDoorAvailability,
      url: `${SITE}/blue-door`,
      ...(blueDoorPreLaunch
        ? { availabilityStarts: new Date(blueDoorLaunchIso).toISOString() }
        : {}),
    },
  },
  "/partner": {
    "@type": "Service",
    name: "The Painted Porch Partnership",
    serviceType: "Organizational Transformation Partnership",
    category: "Management Consulting",
    provider: ORG_REF,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Partnership Tiers",
      itemListElement: [
        { "@type": "Offer", name: "IGNITE — self-led", url: `${SITE}/partner/ignite` },
        { "@type": "Offer", name: "AMPLIFY — 3–6 month partnership", url: `${SITE}/partner/amplify` },
        { "@type": "Offer", name: "EMBODY — embedded partnership", url: `${SITE}/partner/embody` },
      ],
    },
  },
  "/partner/ignite": {
    "@type": "Service",
    name: "IGNITE — Self-led Transformation",
    serviceType: "Leadership Development",
    category: "Professional Training",
    provider: ORG_REF,
  },
  "/partner/amplify": {
    "@type": "Service",
    name: "AMPLIFY — 3–6 Month Partnership",
    serviceType: "Organizational Transformation Partnership",
    category: "Management Consulting",
    provider: ORG_REF,
  },
  "/partner/embody": {
    "@type": "Service",
    name: "EMBODY — Embedded Executive Partnership",
    serviceType: "Executive Advisory",
    category: "Management Consulting",
    provider: ORG_REF,
  },
  "/partner/amplify/stractical-leader": {
    "@type": "Course",
    name: "The Stractical Leader 6-Week Intensive",
    description:
      "A 6-week AMPLIFY cohort that builds strategic-plus-tactical leadership capacity.",
    provider: ORG_REF,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT18H",
    },
  },
  "/eq": {
    "@type": "Service",
    name: "EQ-i 2.0 Emotional Intelligence Assessment",
    serviceType: "Assessment & Coaching",
    category: "Professional Training",
    provider: ORG_REF,
  },
  "/speaking": {
    "@type": "Service",
    name: "Keynotes & Executive Workshops",
    serviceType: "Speaking & Workshops",
    category: "Professional Speaking",
    provider: ORG_REF,
  },
};

function breadcrumbLd(path) {
  if (path === "/") return null;
  const segments = path.split("/").filter(Boolean);
  const items = [{ name: "Home", url: SITE + "/" }];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    items.push({
      name: seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      url: SITE + acc,
    });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

function autoJsonLd(route) {
  const out = [];
  const svc = SERVICE_LD[route.path];
  if (svc) {
    out.push({
      "@context": "https://schema.org",
      url: SITE + (route.path === "/" ? "" : route.path),
      ...svc,
    });
  }
  const crumbs = breadcrumbLd(route.path);
  if (crumbs) out.push(crumbs);
  return out;
}

function buildHtml(route) {
  const url = SITE + (route.path === "/" ? "" : route.path);
  let html = template;

  // Title & meta description
  html = replaceTag(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(route.title)}</title>`,
  );
  html = replaceTag(
    html,
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escapeAttr(route.description)}">`,
  );

  // Canonical
  html = replaceTag(
    html,
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
  );

  // Open Graph
  html = replaceTag(
    html,
    /<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
  );
  html = replaceTag(
    html,
    /<meta property="og:title"[^>]*>/,
    `<meta property="og:title" content="${escapeAttr(route.title)}">`,
  );
  html = replaceTag(
    html,
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${escapeAttr(route.description)}">`,
  );

  // og:image / twitter:image — per-route override, else keep sitewide.
  if (route.ogImage) {
    const img = route.ogImage;
    html = replaceTag(
      html,
      /<meta property="og:image"[^>]*>/,
      `<meta property="og:image" content="${escapeAttr(img)}">`,
    );
    html = replaceTag(
      html,
      /<meta name="twitter:image"[^>]*>/,
      `<meta name="twitter:image" content="${escapeAttr(img)}">`,
    );
    // Strip fixed 1200x630 dimension hints — per-route images may differ.
    html = html
      .replace(/\n\s*<meta property="og:image:width"[^>]*>/g, "")
      .replace(/\n\s*<meta property="og:image:height"[^>]*>/g, "");
    if (route.ogImageAlt) {
      html = replaceTag(
        html,
        /<meta property="og:image:alt"[^>]*>/,
        `<meta property="og:image:alt" content="${escapeAttr(route.ogImageAlt)}">`,
      );
    }
  }

  // og:type — default "website"; blog posts pass "article".
  if (route.ogType) {
    html = replaceTag(
      html,
      /<meta property="og:type"[^>]*>/,
      `<meta property="og:type" content="${escapeAttr(route.ogType)}">`,
    );
  }

  // Article-only tags (published_time, author).
  if (route.ogType === "article") {
    const articleTags = [];
    if (route.publishedTime)
      articleTags.push(
        `<meta property="article:published_time" content="${escapeAttr(route.publishedTime)}">`,
      );
    if (route.author)
      articleTags.push(
        `<meta property="article:author" content="${escapeAttr(route.author)}">`,
      );
    if (articleTags.length) {
      html = replaceTag(
        html,
        /<\/head>/,
        `    ${articleTags.join("\n    ")}\n  </head>`,
      );
    }
  }

  // Twitter
  html = replaceTag(
    html,
    /<meta name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${escapeAttr(route.title)}">`,
  );
  html = replaceTag(
    html,
    /<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}">`,
  );

  // Per-route JSON-LD (Service, BreadcrumbList, etc.) injected right
  // before </head> so it stacks with the sitewide Organization/WebSite
  // graph already in the template.
  const jsonLd = [...(route.jsonLd ?? []), ...autoJsonLd(route)];
  if (jsonLd.length) {
    const scripts = jsonLd
      .map(
        (obj) =>
          `<script type="application/ld+json">${JSON.stringify(obj)}</script>`,
      )
      .join("\n    ");
    html = replaceTag(html, /<\/head>/, `    ${scripts}\n  </head>`);
  }

  // Inject body content inside #root. Preserves everything after it
  // (noscript, script tags).
  html = replaceTag(
    html,
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${renderBody(route)}</div>`,
  );

  return html;
}

let ok = 0;
let failed = 0;

for (const route of routes) {
  try {
    const html = buildHtml(route);
    const outDir =
      route.path === "/" ? DIST : path.join(DIST, route.path.replace(/^\//, ""));
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), html, "utf8");
    console.log(`[prerender] ✓ ${route.path}`);
    ok++;
  } catch (err) {
    console.warn(`[prerender] ✗ ${route.path} — ${err.message}`);
    failed++;
  }
}

// ── Dynamic: prerender blog posts from Supabase ─────────────────────
// Pulls published + scheduled posts and generates
// dist/resources/insights/<slug>/index.html for each one. Non-fatal
// on any error (network, missing env, schema drift).
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

async function prerenderBlogPosts() {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.log("[prerender] blog: no Supabase env — skipping");
    return { ok: 0, failed: 0 };
  }
  let posts = [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,excerpt,cover_image_url,publish_date&status=in.(published,scheduled)&order=publish_date.desc&limit=500`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON, authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!res.ok) {
      console.warn(`[prerender] blog: fetch ${res.status} — skipping`);
      return { ok: 0, failed: 0 };
    }
    posts = await res.json();
  } catch (err) {
    console.warn(`[prerender] blog: fetch failed — ${err.message}`);
    return { ok: 0, failed: 0 };
  }

  let ok = 0;
  let failed = 0;
  for (const post of posts) {
    if (!post?.slug) continue;
    try {
      const path_ = `/resources/insights/${post.slug}`;
      const title = post.title
        ? `${post.title} | Painted Porch Strategies`
        : "Insight | Painted Porch Strategies";
      const description =
        post.excerpt ||
        "Insight from Painted Porch Strategies on change origination, Phase Zero™ strategy, and Stoic leadership.";
      const route = {
        path: path_,
        title,
        description,
        h1: post.title || "Insight",
        intro: post.excerpt || description,
        ogImage: post.cover_image_url || undefined,
        ogImageAlt: post.title ? `Cover image for ${post.title}` : undefined,
        ogType: "article",
        publishedTime: post.publish_date || undefined,
        author: "Painted Porch Strategies",
        sections: [],
        links: [
          { href: "/resources/insights", label: "All insights" },
          { href: "/resources", label: "Resources hub" },
          { href: "/blue-door", label: "The Blue Door" },
          { href: "/contact", label: "Contact us" },
        ],
      };
      const html = buildHtml(route);
      const outDir = path.join(DIST, path_.replace(/^\//, ""));
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, "index.html"), html, "utf8");
      ok++;
    } catch (err) {
      console.warn(`[prerender] blog ✗ ${post.slug} — ${err.message}`);
      failed++;
    }
  }
  console.log(`[prerender] blog — ${ok} ok, ${failed} failed`);
  return { ok, failed };
}

async function prerenderMediaAppearances() {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.warn("[prerender] media: no public credentials, summaries unavailable");
    return;
  }
  try {
    const fields = "id,review_status,title,media_type,show_name,description,seo_title,seo_description,seo_keywords,aeo_tags,geo_tags,external_url,thumbnail_url,appearance_date,media_appearance_categories(blog_categories(title))";
    const appearances = [];
    // Fetch every approved entry, not just the first gallery page or API range.
    for (let offset = 0; ; offset += 500) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/media_appearances?select=${fields}&review_status=eq.published&order=featured.desc,appearance_date.desc.nullslast,created_at.desc,id.asc&limit=500&offset=${offset}`, {
        headers: { apikey: SUPABASE_ANON, authorization: `Bearer ${SUPABASE_ANON}` },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`fetch status ${response.status}`);
      const batch = await response.json();
      appearances.push(...batch);
      if (batch.length < 500) break;
    }
    const route = routes.find((entry) => entry.path === "/speaking/media");
    if (!route) throw new Error("media route missing");
    const schema = buildMediaAppearanceSchema(appearances);
    const script = `<script id="media-appearances-jsonld" type="application/ld+json">${serializeMediaAppearanceSchema(schema)}</script>`;
    const html = buildHtml(route).replace("</head>", `${script}\n</head>`);
    await writeFile(path.join(DIST, "speaking/media/index.html"), html, "utf8");
    for (const appearance of appearances) {
      const metadata = buildMediaAppearancePage(appearance);
      if (!metadata) continue;
      if (appearance.thumbnail_url) {
        try {
          const image = await fetch(appearance.thumbnail_url, { signal: AbortSignal.timeout(15000) });
          if (!image.ok) throw new Error(`image status ${image.status}`);
          const imageDir = path.join(DIST, "media-share");
          await mkdir(imageDir, { recursive: true });
          await sharp(Buffer.from(await image.arrayBuffer())).rotate().resize(1200, 630, { fit: "cover" }).jpeg({ quality: 80 }).toFile(path.join(imageDir, `${appearance.id}.jpg`));
        } catch (error) {
          console.warn(`[prerender] media image ${appearance.id}: ${error.message}`);
          metadata.ogImage = undefined;
        }
      }
      const detailRoute = {
        ...metadata, h1: appearance.title, intro: appearance.description || metadata.description,
        ogImageAlt: appearance.title, publishedTime: appearance.appearance_date,
        jsonLd: [metadata.jsonLd], sections: [],
        links: [{ href: "/speaking/media", label: "As Seen On" }, ...(appearance.external_url ? [{ href: appearance.external_url, label: appearance.show_name || "Original publication" }] : [])],
      };
      let detailHtml = buildHtml(detailRoute).replace("</head>", `<meta name="keywords" content="${escapeAttr(metadata.keywords.join(", "))}" />\n</head>`);
      if (!metadata.ogImage) detailHtml = detailHtml.replace(/<meta (?:property="og:image[^\"]*"|name="twitter:image")[^>]*>/g, "");
      if (appearance.thumbnail_url) detailHtml = detailHtml.replace("</h1>", `</h1><img src="${escapeAttr(appearance.thumbnail_url)}" alt="${escapeAttr(appearance.title)}" width="1200" style="max-width:100%;height:auto" />`);
      const outDir = path.join(DIST, metadata.path.replace(/^\//, ""));
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, "index.html"), detailHtml, "utf8");
    }
    console.log(`[prerender] media: ${appearances.length} approved summaries`);
  } catch (error) {
    console.warn(`[prerender] media: summaries unavailable (${error.message})`);
  }
}

await prerenderMediaAppearances();
const blog = await prerenderBlogPosts();

console.log(
  `[prerender] done — ${ok + blog.ok} ok, ${failed + blog.failed} failed`,
);
process.exit(0);
