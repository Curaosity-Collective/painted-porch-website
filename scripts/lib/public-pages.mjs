/**
 * Which pages the public can see, decided the way the app decides it.
 *
 * The app's Draft gate is resolvePageStatus (src/config/pageStatus.ts): a page
 * is live when it sits under ALWAYS_LIVE_PREFIXES, has its own live
 * page_status row (exact or a pattern such as /speaking/media/:id), inherits
 * the status of the old address it moved from (MOVED_FROM), or forwards to a
 * live page (FORWARDS_TO, src/config/movedPages.ts). Every other page shows
 * Coming Soon. The public key can read only live rows (RLS), so this sees
 * exactly what a visitor's browser sees.
 *
 * The rules are read from those two source files at build time, so there is
 * no second copy to keep in sync (src/test/seo-build-files.test.ts checks the
 * parse against the real modules). Internal and archived pages are public but
 * kept out of search.
 *
 * Shared by generate-sitemap.mjs, generate-robots-txt.mjs and prerender.mjs.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

/** Always disallowed in robots.txt, whatever their status. */
export const ROBOTS_ALWAYS_DISALLOWED = ["/admin", "/admin/", "/reset-password"];

const HIDDEN_FROM_SEARCH = new Set(["internal", "archived"]);

const readSource = (root, rel) => readFileSync(path.join(root, rel), "utf8");

/** The text of `export const NAME ... ;`, with full-line comments removed first. */
function declaration(src, name, file) {
  const code = src.replace(/^\s*\/\/.*$/gm, "");
  const start = code.indexOf(`export const ${name}`);
  const end = start === -1 ? -1 : code.indexOf(";\n", start);
  if (start === -1 || end === -1) throw new Error(`${name} not found in ${file}`);
  return code.slice(start, end);
}

function parseStringArray(src, name, file) {
  const list = [...declaration(src, name, file).matchAll(/["'](\/[^"']*)["']/g)].map((m) => m[1]);
  if (list.length === 0) throw new Error(`could not read ${name} from ${file}`);
  return list;
}

function parseStringRecord(src, name, file) {
  const record = {};
  for (const m of declaration(src, name, file).matchAll(/["'](\/[^"']*)["']\s*:\s*["'](\/[^"']*)["']/g)) {
    record[m[1]] = m[2];
  }
  if (Object.keys(record).length === 0) throw new Error(`could not read ${name} from ${file}`);
  return record;
}

/** The app's page rules, read from src/config. Throws if they can't be read. */
export function loadAppPageRules(root = process.cwd()) {
  const statusFile = "src/config/pageStatus.ts";
  const movedFile = "src/config/movedPages.ts";
  const statusSrc = readSource(root, statusFile);
  const movedSrc = readSource(root, movedFile);
  return {
    alwaysLive: parseStringArray(statusSrc, "ALWAYS_LIVE_PREFIXES", statusFile),
    movedFrom: parseStringRecord(movedSrc, "MOVED_FROM", movedFile),
    forwardsTo: parseStringRecord(movedSrc, "FORWARDS_TO", movedFile),
  };
}

/**
 * @param {Array<{path: string, status?: string, category?: string|null}>} rows page_status rows
 * @param {{alwaysLive: string[], movedFrom: Record<string,string>, forwardsTo: Record<string,string>}} rules
 */
export function pageVisibility(rows, rules) {
  const live = new Map();
  for (const row of rows ?? []) {
    if (row?.path && row.status === "live") live.set(row.path, row.category ?? "public");
  }
  const patterns = [...live].filter(([p]) => p.includes(":"));
  const matches = (pattern, p) => {
    const a = pattern.split("/");
    const b = p.split("/");
    return a.length === b.length && a.every((seg, i) => seg.startsWith(":") || seg === b[i]);
  };
  const ownCategory = (p) => (live.has(p) ? live.get(p) : patterns.find(([pattern]) => matches(pattern, p))?.[1]);
  const isAlwaysLive = (p) => rules.alwaysLive.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));

  // Mirrors resolvePageStatus: returns the live page's category, or undefined when the page shows Coming Soon.
  const liveCategory = (p, depth = 0) => {
    const own = ownCategory(p);
    if (isAlwaysLive(p)) return own ?? "public";
    if (own !== undefined) return own;
    const previous = rules.movedFrom[p];
    if (previous !== undefined && ownCategory(previous) !== undefined) return ownCategory(previous);
    const destination = rules.forwardsTo[p];
    if (destination !== undefined && depth < 10) return liveCategory(destination, depth + 1);
    return undefined;
  };

  const isPublic = (p) => liveCategory(p) !== undefined;
  const isSearchable = (p) => {
    const category = liveCategory(p);
    return category !== undefined && !HIDDEN_FROM_SEARCH.has(category);
  };
  return { isPublic, isSearchable, livePaths: new Set(live.keys()) };
}

async function getJson(env, resource) {
  const res = await fetch(new URL(`/rest/v1/${resource}`, env.url), {
    headers: { apikey: env.key, Authorization: `Bearer ${env.key}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`${resource.split("?")[0]}: HTTP ${res.status}`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error(`${resource.split("?")[0]}: unexpected response`);
  return rows;
}

/** Live page_status rows (all the public key can see). Throws on any failure. */
export function fetchLivePageRows(env) {
  return getJson(env, "page_status?select=path,status,category&status=eq.live");
}

/** Published blog posts, newest first. Throws on any failure. */
export function fetchPublishedPosts(env) {
  return getJson(
    env,
    "blog_posts?select=slug,updated_at,publish_date&status=eq.published&order=publish_date.desc",
  );
}

/**
 * Every path listed on the site's /sitemap page (src/pages/pps/Sitemap.tsx),
 * the registry the admin Page Status manager also uses. A test checks it
 * matches collectSitemapPaths().
 */
export function readSitemapRegistryPaths(root = process.cwd()) {
  const src = readSource(root, "src/pages/pps/Sitemap.tsx");
  const start = src.indexOf("export const sitemapData");
  if (start === -1) throw new Error("sitemapData not found in src/pages/pps/Sitemap.tsx");
  return [...new Set([...src.slice(start).matchAll(/\bpath:\s*["'](\/[^"']*)["']/g)].map((m) => m[1]))].sort();
}

/**
 * Every page path in the router (src/App.tsx) that sits behind the Draft gate:
 * routes inside the PPSLayout route (which wraps its pages in PageGate) and
 * top-level routes that wrap their element in <PageGate>. Wildcards and
 * :params are skipped. Routes outside the gate (admin, the /pps redirects)
 * are always reachable, so they are never listed. Reads one <Route> per line,
 * as App.tsx is written; a test pins known examples.
 */
export function readGatedAppRoutePaths(root = process.cwd()) {
  const src = readSource(root, "src/App.tsx");
  const join = (parent, child) =>
    child.startsWith("/") ? child : `${parent === "/" ? "" : parent}/${child}`;
  const stack = [];
  const out = new Set();
  for (const line of src.split("\n")) {
    const tag = line.trim();
    if (tag.startsWith("</Route>")) {
      stack.pop();
      continue;
    }
    if (!/^<Route[\s/>]/.test(tag)) continue; // not <Routes>

    const parent = stack.at(-1);
    const own = tag.match(/\bpath="([^"]*)"/)?.[1];
    const fullPath = own === undefined ? parent?.path : join(parent?.path ?? "/", own);
    const gated = parent ? parent.gated : /<PageGate\b|<PPSLayout\b/.test(tag);
    if (!tag.endsWith("/>")) {
      stack.push({ path: fullPath, gated });
      continue;
    }
    if (fullPath && gated && !fullPath.includes("*") && !fullPath.includes(":")) out.add(fullPath);
  }
  if (out.size === 0) throw new Error("no gated routes read from src/App.tsx");
  return [...out].sort();
}

/**
 * Disallow rules for robots.txt: every known page that isn't live or is hidden
 * from search. Robots rules match by prefix, so a hidden page with public pages
 * beneath it (a draft /resources over the always-live /resources/insights)
 * gets an end-anchored rule (`/resources$`) instead of hiding the whole branch.
 */
export function robotsDisallowRules(knownPaths, rows, rules) {
  const { isPublic, isSearchable, livePaths } = pageVisibility(rows, rules);
  const publicCandidates = [
    ...new Set([...knownPaths, ...livePaths, ...rules.alwaysLive, ...Object.keys(rules.movedFrom)]),
  ].filter(isPublic);
  const out = new Set();
  for (const p of [...new Set(knownPaths)].sort()) {
    if (!p.startsWith("/") || p === "/") continue;
    if (p === "/admin" || p.startsWith("/admin/") || p === "/reset-password") continue;
    if (isSearchable(p)) continue;
    const shadowsPublic = publicCandidates.some((q) => q.startsWith(`${p}/`));
    out.add(shadowsPublic ? `${p}$` : p);
  }
  return [...out];
}
