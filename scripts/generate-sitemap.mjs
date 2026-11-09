/**
 * Build-time script: generate public/sitemap.xml with the live static pages
 * plus published blog posts. Runs during prebuild / predev.
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (from the
 * environment or .env, via lib/load-env.mjs).
 *
 * Only pages visitors can see are listed, decided by the same rules as the
 * app's Draft gate (lib/public-pages.mjs); internal and archived pages are left
 * out. If the database can't be read, the committed public/sitemap.xml is kept
 * as it is rather than replaced with a partial one.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { publicSupabaseEnv } from "./lib/load-env.mjs";
import { fetchLivePageRows, fetchPublishedPosts, loadAppPageRules, pageVisibility } from "./lib/public-pages.mjs";
import { SITEMAP_STATIC_PAGES } from "./lib/sitemap-pages.mjs";

const BASE_URL = "https://onthepaintedporch.com";
const OUT_PATH = resolve("public/sitemap.xml");
const ROOT = fileURLToPath(new URL("..", import.meta.url));

function generateSitemap(entries) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${entry.path}</loc>\n`;
    // <lastmod> is emitted only when we have a page-specific, authoritative
    // timestamp (e.g. blog_posts.updated_at). Never derived from build time.
    if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

async function main() {
  const env = publicSupabaseEnv();
  if (!env) {
    console.warn(
      `[generate-sitemap] No Supabase URL or publishable key — keeping the existing ${OUT_PATH}.`,
    );
    return;
  }

  let rules;
  let rows;
  let posts;
  try {
    rules = loadAppPageRules(ROOT);
    [rows, posts] = await Promise.all([fetchLivePageRows(env), fetchPublishedPosts(env)]);
  } catch (err) {
    console.warn(
      `[generate-sitemap] Could not read page status or blog posts (${err.message}) — keeping the existing ${OUT_PATH}.`,
    );
    return;
  }

  const { isSearchable } = pageVisibility(rows, rules);
  const listed = SITEMAP_STATIC_PAGES.filter((page) => isSearchable(page.path));
  const entries = listed.map((page) => ({
    path: page.path,
    changefreq: page.changefreq,
    priority: page.priority,
  }));

  let postCount = 0;
  for (const post of posts) {
    if (!post.slug) continue;
    const postPath = `/resources/insights/${post.slug}`;
    if (!isSearchable(postPath)) continue;
    const source = post.updated_at || post.publish_date;
    entries.push({
      path: postPath,
      lastmod: source ? String(source).split("T")[0] : undefined,
      changefreq: "monthly",
      priority: "0.7",
    });
    postCount++;
  }

  writeFileSync(OUT_PATH, generateSitemap(entries));
  console.log(
    `[generate-sitemap] Wrote ${OUT_PATH} (${entries.length} URLs: ${listed.length} pages, ${postCount} blog posts; ` +
      `${SITEMAP_STATIC_PAGES.length - listed.length} pages left out as not live or hidden from search)`,
  );
}

main().catch((err) => {
  console.error("[generate-sitemap] Failed:", err.message);
  process.exit(1);
});
