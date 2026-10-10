import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Paste-a-link autofill for Media Appearances.
 * Reads the page (or YouTube API), then asks AI to shape it into the
 * media appearance fields: title, show/publication, date, description,
 * media type, SEO/AEO/GEO tags, and matching categories.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MEDIA_TYPES = ["podcast", "interview", "article", "webinar", "video", "panel"] as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)));
}

function meta(html: string, key: string): string | null {
  const re1 = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${key}["']`, "i");
  const v = html.match(re1)?.[1] ?? html.match(re2)?.[1];
  return v ? decode(v).trim() : null;
}

function jsonLdBlocks(html: string): any[] {
  const out: any[] = [];
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const arr = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];
      out.push(...arr);
    } catch { /* ignore bad blocks */ }
  }
  return out;
}

function pageText(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

function youTubeId(url: string): string | null {
  return url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )?.[1] ?? null;
}

interface Scraped {
  title?: string | null;
  siteName?: string | null;
  description?: string | null;
  image?: string | null;
  published?: string | null;
  author?: string | null;
  text?: string;
  hint?: string;
}

async function scrapeYouTube(id: string): Promise<Scraped | null> {
  const key = Deno.env.get("YOUTUBE_API_KEY");
  if (key) {
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${key}`,
    );
    const d = await r.json().catch(() => ({}));
    const sn = d?.items?.[0]?.snippet;
    if (sn) {
      return {
        title: sn.title,
        siteName: sn.channelTitle,
        description: sn.description,
        image: sn.thumbnails?.maxres?.url || sn.thumbnails?.high?.url || null,
        published: sn.publishedAt,
        text: sn.description?.slice(0, 6000),
        hint: "YouTube video. The show/publication is the channel name.",
      };
    }
  }
  const o = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
  if (!o.ok) return null;
  const od = await o.json();
  return {
    title: od.title,
    siteName: od.author_name,
    image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    hint: "YouTube video. The show/publication is the channel name.",
  };
}

async function scrapePage(url: string): Promise<Scraped | null> {
  const agents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  ];
  for (const ua of agents) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": ua, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
        redirect: "follow",
      });
      if (!res.ok) { await res.body?.cancel(); continue; }
      const html = await res.text();
      const ld = jsonLdBlocks(html);
      const pick = (k: string) => ld.map((b) => b?.[k]).find((v) => typeof v === "string") as string | undefined;
      const series = ld
        .map((b) => b?.partOfSeries?.name || b?.isPartOf?.name || b?.publisher?.name)
        .find((v) => typeof v === "string");
      const author = ld
        .map((b) => (Array.isArray(b?.author) ? b.author[0]?.name : b?.author?.name))
        .find((v) => typeof v === "string");
      return {
        title: meta(html, "og:title") || meta(html, "twitter:title") || pick("name") ||
          decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim(),
        siteName: series || meta(html, "og:site_name") || meta(html, "application-name"),
        description: meta(html, "og:description") || meta(html, "description") || pick("description"),
        image: meta(html, "og:image") || meta(html, "twitter:image") || null,
        published: meta(html, "article:published_time") || meta(html, "datePublished") ||
          pick("datePublished") || pick("uploadDate") || meta(html, "date") || null,
        author: author || meta(html, "author"),
        text: pageText(html),
      };
    } catch (e) {
      console.warn(`Fetch failed (${ua}):`, e instanceof Error ? e.message : e);
    }
  }
  // Fallback: Firecrawl for sites that block plain fetches.
  const fc = Deno.env.get("FIRECRAWL_API_KEY");
  if (fc) {
    const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${fc}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, onlyMainContent: true, formats: ["markdown"] }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d?.success) {
      const md = d.data?.metadata ?? {};
      return {
        title: md.ogTitle || md.title,
        siteName: md.ogSiteName,
        description: md.ogDescription || md.description,
        image: md.ogImage || null,
        published: md.publishedTime || md["article:published_time"] || null,
        text: (d.data?.markdown || "").slice(0, 6000),
      };
    }
  }
  return null;
}

async function rehostThumbnail(src: string, client: any): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) { await res.body?.cancel(); return null; }
    const type = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
    if (!type.startsWith("image/")) return null;
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : "jpg";
    const path = `media-appearances/${Date.now()}.${ext}`;
    const { error } = await client.storage.from("blog-images").upload(path, new Uint8Array(await res.arrayBuffer()), {
      contentType: type,
    });
    if (error) return null;
    return client.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await admin.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
    if (!profile || !["admin", "editor"].includes(profile.role)) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url.trim() : "";
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol)) throw new Error();
    } catch {
      return json({ error: "Please paste a full link that starts with https://" }, 400);
    }

    const yt = youTubeId(url);
    const scraped = (yt ? await scrapeYouTube(yt) : null) ?? (await scrapePage(url));
    if (!scraped) {
      return json({ error: "Could not read that page. It may block automated readers. You can still fill the fields in by hand." }, 422);
    }

    const { data: cats } = await admin.from("blog_categories").select("id, title").order("title");
    const categories = (cats || []) as { id: string; title: string }[];

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "AI not configured" }, 500);

    const prompt = `You are filling in a "Media Appearance" record for Amy Yackowski (Founder, Painted Porch Strategies), an organizational change strategist. Amy was a guest, speaker, panelist, or author on this piece of media.

URL: ${url}
${scraped.hint ? `Note: ${scraped.hint}\n` : ""}Page title: ${scraped.title ?? "?"}
Site / publication / channel: ${scraped.siteName ?? "?"}
Author: ${scraped.author ?? "?"}
Published: ${scraped.published ?? "?"}
Page description: ${scraped.description ?? "?"}
Page text (truncated): ${scraped.text ?? ""}

Available categories (pick 1-3 that truly fit, by id):
${categories.map((c) => `- ${c.id}: ${c.title}`).join("\n")}

Rules:
- title: the episode/article/video title, cleaned of site suffixes like " | Spotify" or " - YouTube".
- show_name: the podcast, show, channel, or publication name (NOT the episode title, NOT "Spotify"/"Apple Podcasts"/"YouTube").
- media_type: one of ${MEDIA_TYPES.join(", ")}.
- appearance_date: YYYY-MM-DD if known, else null. Never guess.
- description: 2-3 sentences, plain English at a 6th-grade level, what listeners/readers will get from Amy's appearance. No em-dashes. No hype.
- seo_title under 60 chars. seo_description under 160 chars.
- seo_keywords: 6-10. aeo_tags: 3-5 natural questions this appearance answers. geo_tags: 2-4 (e.g. "United States", "Global").
- No em-dashes anywhere.`;

    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "fill_media_appearance",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                show_name: { type: "string" },
                media_type: { type: "string", enum: [...MEDIA_TYPES] },
                appearance_date: { type: ["string", "null"] },
                description: { type: "string" },
                seo_title: { type: "string" },
                seo_description: { type: "string" },
                seo_keywords: { type: "array", items: { type: "string" } },
                aeo_tags: { type: "array", items: { type: "string" } },
                geo_tags: { type: "array", items: { type: "string" } },
                category_ids: { type: "array", items: { type: "string" } },
              },
              required: ["title", "show_name", "media_type", "description", "seo_title", "seo_description", "seo_keywords", "aeo_tags", "geo_tags", "category_ids"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "fill_media_appearance" } },
      }),
    });

    if (ai.status === 429) return json({ error: "AI is busy right now. Try again in a minute." }, 429);
    if (ai.status === 402) return json({ error: "AI credits are used up. Add credits in Settings, then retry." }, 402);
    if (!ai.ok) {
      console.error("AI error", ai.status, await ai.text());
      return json({ error: "AI could not process this link." }, 500);
    }
    const aiData = await ai.json();
    const args = aiData?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let filled: any = {};
    try { filled = typeof args === "string" ? JSON.parse(args) : args || {}; } catch { filled = {}; }

    const noDash = (s: unknown) => (typeof s === "string" ? s.replace(/\s*—\s*/g, " - ").trim() : s);
    const validIds = new Set(categories.map((c) => c.id));
    let date: string | null = typeof filled.appearance_date === "string" ? filled.appearance_date : null;
    if (!date && scraped.published) {
      const d = new Date(scraped.published);
      if (!isNaN(d.getTime())) date = d.toISOString().slice(0, 10);
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) date = null;

    const thumbnail = scraped.image ? (await rehostThumbnail(scraped.image, admin)) ?? scraped.image : null;

    return json({
      success: true,
      external_url: url,
      title: noDash(filled.title || scraped.title || ""),
      show_name: noDash(filled.show_name || scraped.siteName || ""),
      media_type: MEDIA_TYPES.includes(filled.media_type) ? filled.media_type : (yt ? "video" : "article"),
      appearance_date: date,
      description: noDash(filled.description || scraped.description || ""),
      thumbnail_url: thumbnail,
      seo_title: noDash(filled.seo_title || ""),
      seo_description: noDash(filled.seo_description || ""),
      seo_keywords: (filled.seo_keywords || []).map(noDash),
      aeo_tags: (filled.aeo_tags || []).map(noDash),
      geo_tags: (filled.geo_tags || []).map(noDash),
      category_ids: (filled.category_ids || []).filter((id: string) => validIds.has(id)),
    });
  } catch (e) {
    console.error("fetch-media-metadata error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
