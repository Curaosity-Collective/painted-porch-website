import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  canonicalPulseUrl,
  extractAuthorPulseUrls,
  fetchAsCrawler,
} from "../_shared/linkedin-article.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Finds new LinkedIn articles and imports them through `import-linkedin-article`
 * (one importer = one set of cleanup rules).
 *
 * Discovery (no search engine needed):
 *   1. Read each newsletter page, which lists recent editions.
 *   2. Read each article found, which links to "More articles by" the author.
 * Anything not already in the blog (by slug OR title) gets imported as pending.
 */

// Newsletters to watch. Add new ones here.
const NEWSLETTER_URLS = [
  "https://www.linkedin.com/newsletters/do-epic-shift-7434676165245661184",
  "https://www.linkedin.com/newsletters/a-little-bit-aurelius-7448806777187635200",
];
// Pulse slugs contain the author's name; only import articles by these authors.
const AUTHOR_SLUGS = ["amy-yackowski", "-yackowski-"];
// Edge functions have a time budget; import at most this many per click.
const MAX_IMPORTS_PER_RUN = 5;

const KNOWN_AUTHOR_SUFFIXES = ["amy-yackowski", "rob-hunter", "sierra-ramm-cantrell", "sierra-cantrell"];

function slugFromUrl(url: string): string {
  const match = url.match(/\/pulse\/([^/?]+)/);
  if (!match) return "";
  let slug = match[1].replace(/-[a-z0-9]{5}$/, "");
  for (const suffix of KNOWN_AUTHOR_SUFFIXES) {
    if (slug.endsWith(`-${suffix}`)) {
      slug = slug.slice(0, -1 - suffix.length);
      break;
    }
  }
  return slug.replace(/[^a-z0-9-]/g, "");
}

function normTitle(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Words of the slug, used to fuzzy-match posts that were added by hand. */
function slugWords(s: string): Set<string> {
  return new Set(s.split(/[-\s]+/).filter((w) => w.length > 2));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // === AuthN + AuthZ: admin/editor only ===
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile || !["admin", "editor"].includes(profile.role)) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));

    // ---- Discovery ----
    const found = new Set<string>();
    if (typeof body.url === "string" && body.url.includes("linkedin.com/pulse/")) {
      found.add(canonicalPulseUrl(body.url));
    } else {
      for (const nl of NEWSLETTER_URLS) {
        const html = await fetchAsCrawler(nl);
        if (html) extractAuthorPulseUrls(html, AUTHOR_SLUGS).forEach((u) => found.add(u));
      }
      // One hop: each article page links to the author's other recent articles.
      const seeds = [...found].slice(0, 4);
      for (const s of seeds) {
        const html = await fetchAsCrawler(s);
        if (html) extractAuthorPulseUrls(html, AUTHOR_SLUGS).forEach((u) => found.add(u));
      }
    }
    console.log(`Discovered ${found.size} LinkedIn article URLs`);

    // ---- Dedupe against the blog ----
    const { data: posts } = await adminClient.from("blog_posts").select("slug, title");
    const existingSlugs = new Set((posts || []).map((p: any) => p.slug));
    const existingTitleWords = (posts || []).map((p: any) => slugWords(normTitle(p.title)));

    const alreadyHave = (u: string) => {
      const slug = slugFromUrl(u);
      if (!slug) return true;
      if (existingSlugs.has(slug)) return true;
      // Hand-entered posts often have a slightly different slug; compare words.
      const words = slugWords(slug);
      if (words.size < 2) return false;
      return existingTitleWords.some((tw) => {
        let hit = 0;
        for (const w of words) if (tw.has(w)) hit++;
        return hit / words.size >= 0.8;
      });
    };

    const candidates = [...found].filter((u) => !alreadyHave(u));
    const toImport = candidates.slice(0, MAX_IMPORTS_PER_RUN);

    // ---- Import via the single importer ----
    const imported: string[] = [];
    const errors: string[] = [];
    for (const articleUrl of toImport) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/import-linkedin-article`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            apikey: anonKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: articleUrl }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) imported.push(data.slug);
        else if (res.status === 409) existingSlugs.add(data?.slug);
        else errors.push(`${articleUrl}: ${data?.detail || data?.error || res.status}`);
      } catch (e) {
        errors.push(`${articleUrl}: ${e instanceof Error ? e.message : e}`);
      }
    }

    return json({
      success: true,
      total_found: found.size,
      imported: imported.length,
      skipped: found.size - candidates.length,
      remaining: Math.max(0, candidates.length - toImport.length),
      errors: errors.length,
      imported_slugs: imported,
      error_details: errors,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
