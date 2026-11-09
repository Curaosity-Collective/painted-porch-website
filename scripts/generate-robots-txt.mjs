/**
 * Build-time script: generate public/robots.txt, disallowing every known page
 * that the public can't see or that is hidden from search. Runs during
 * prebuild.
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (from the
 * environment or .env, via lib/load-env.mjs). The public key only returns live
 * page_status rows, so drafts are found as the known pages the app's Draft gate
 * hides (lib/public-pages.mjs): the gated routes in src/App.tsx, the /sitemap
 * page registry (src/pages/pps/Sitemap.tsx), the XML sitemap's page list, the
 * prerendered routes and moved pages. No service-role key is needed.
 *
 * If the database can't be read, the committed public/robots.txt is kept as it
 * is rather than replaced with one that has no draft rules.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { publicSupabaseEnv } from "./lib/load-env.mjs";
import {
  ROBOTS_ALWAYS_DISALLOWED,
  fetchLivePageRows,
  loadAppPageRules,
  readGatedAppRoutePaths,
  readSitemapRegistryPaths,
  robotsDisallowRules,
} from "./lib/public-pages.mjs";
import { SITEMAP_STATIC_PAGES } from "./lib/sitemap-pages.mjs";
import { routes as prerenderRoutes, movedPages } from "./prerender-content.mjs";

const OUT_PATH = resolve("public/robots.txt");
const ROOT = fileURLToPath(new URL("..", import.meta.url));

async function main() {
  const env = publicSupabaseEnv();
  if (!env) {
    console.warn(
      `[generate-robots-txt] No Supabase URL or publishable key — keeping the existing ${OUT_PATH}.`,
    );
    return;
  }

  let rules;
  let rows;
  let registry;
  let appRoutes;
  try {
    rules = loadAppPageRules(ROOT);
    registry = readSitemapRegistryPaths(ROOT);
    appRoutes = readGatedAppRoutePaths(ROOT);
    rows = await fetchLivePageRows(env);
  } catch (err) {
    console.warn(
      `[generate-robots-txt] Could not read page status (${err.message}) — keeping the existing ${OUT_PATH}.`,
    );
    return;
  }

  // Old addresses of moved pages take their new page's status (FORWARDS_TO),
  // so they stay crawlable whenever the new page is live.
  const knownPaths = [
    ...appRoutes,
    ...rows.map((row) => row.path).filter((p) => p && !p.includes(":")),
    ...registry,
    ...SITEMAP_STATIC_PAGES.map((page) => page.path),
    ...prerenderRoutes.map((route) => route.path),
    ...movedPages.flatMap((moved) => [moved.from, moved.to]),
  ];
  const disallow = robotsDisallowRules(knownPaths, rows, rules);

  let content = "User-agent: *\nAllow: /\n";
  for (const rule of ROBOTS_ALWAYS_DISALLOWED) content += `Disallow: ${rule}\n`;
  if (disallow.length > 0) {
    content += "\n# Draft / internal / archived pages — hidden from search engines\n";
    for (const rule of disallow) content += `Disallow: ${rule}\n`;
  }
  content += "\nSitemap: https://onthepaintedporch.com/sitemap.xml\n";

  writeFileSync(OUT_PATH, content);
  console.log(
    `[generate-robots-txt] Wrote ${OUT_PATH} (${disallow.length} Disallow rules for pages that aren't live or are hidden from search)`,
  );
}

main().catch((err) => {
  console.error("[generate-robots-txt] Failed:", err.message);
  process.exit(1);
});
