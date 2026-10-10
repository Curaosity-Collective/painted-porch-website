/**
 * Shared LinkedIn Pulse article reader.
 *
 * LinkedIn serves a server-rendered copy of every public article to crawler
 * user agents. The body lives inside `data-test-id="article-content-blocks"`
 * and is made of sibling blocks, each tagged with a data-test-id:
 *   - publishing-text-block      → paragraphs, headings, lists, quotes
 *   - publishing-image-block     → <figure><img data-delayed-url=…><figcaption>
 *   - publishing-divider-block   → horizontal rule
 *   - publishing-*-block (other) → embeds / videos
 * Between blocks LinkedIn injects a "Recommended by LinkedIn" widget
 * (`class="inline-articles …"`) that must never reach the post body.
 *
 * This parser walks the blocks in order, so only real article content is kept.
 */

export const CRAWLER_USER_AGENTS = [
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  "LinkedInBot/1.0 (compatible; Mozilla/5.0; +https://www.linkedin.com)",
];

export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)));
}

function inlineHtmlToMarkdown(html: string): string {
  let out = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, inner) => {
      const text = inlineHtmlToMarkdown(inner).trim();
      return text ? `[${text}](${decodeEntities(href)})` : "";
    })
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, inner) => {
      const text = inlineHtmlToMarkdown(inner).trim();
      return text ? `**${text}**` : "";
    })
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, inner) => {
      const text = inlineHtmlToMarkdown(inner).trim();
      return text ? `*${text}*` : "";
    })
    // LinkedIn marks bold+italic spans with Tailwind classes.
    .replace(/<span\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/span>/gi, (_m, cls, inner) => {
      const isItalic = /\bitalic\b/.test(cls);
      const isBold = /font-\[(6|7|8|9)00\]|\bfont-bold\b|\bbold\b/.test(cls);
      const raw = inlineHtmlToMarkdown(inner);
      const text = raw.trim();
      if (!text || (!isItalic && !isBold)) return raw;
      // Keep surrounding whitespace outside the markers so marks parse cleanly.
      const lead = raw.match(/^\s*/)?.[0] ?? "";
      const trail = raw.match(/\s*$/)?.[0] ?? "";
      const marker = isBold && isItalic ? "***" : isBold ? "**" : "*";
      return `${lead}${marker}${text}${marker}${trail}`;
    })
    .replace(/<\/?span\b[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "");
  out = decodeEntities(out).replace(/[ \t]+/g, " ");
  return out;
}

/** Paragraphs that are LinkedIn newsletter chrome, not article content. */
function isNewsletterChrome(html: string, text: string): boolean {
  if (/build-relation\/newsletter-follow/i.test(html)) return true;
  if (/^\*?enjoyed this (edition|article|newsletter)\b/i.test(text)) return true;
  return false;
}

function textBlockToMarkdown(html: string): string[] {
  const parts: string[] = [];
  const blockRe = /<(h[1-6]|p|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const inner = match[2];
    if (tag === "ul" || tag === "ol") {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((m, i) => {
          const text = inlineHtmlToMarkdown(m[1]).replace(/\s*\n\s*/g, " ").trim();
          return text ? (tag === "ul" ? `- ${text}` : `${i + 1}. ${text}`) : "";
        })
        .filter(Boolean);
      if (items.length) parts.push(items.join("\n"));
      continue;
    }
    const text = inlineHtmlToMarkdown(inner).replace(/\n{2,}/g, "\n").trim();
    if (!text) continue;
    if (isNewsletterChrome(inner, text)) continue;
    if (tag === "blockquote") {
      parts.push(text.split("\n").map((l) => `> ${l.trim()}`).join("\n"));
    } else if (tag.startsWith("h")) {
      const level = Math.min(Math.max(Number(tag[1]), 2), 4);
      parts.push(`${"#".repeat(level)} ${text.replace(/\n/g, " ")}`);
    } else {
      // A <br> inside a paragraph becomes a separate paragraph.
      for (const line of text.split("\n")) {
        const t = line.trim();
        if (t) parts.push(t);
      }
    }
  }
  return parts;
}

export function extractYouTubeId(s: string): string | null {
  const m = s.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?[^"'\s]*v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i,
  );
  return m ? m[1] : null;
}

function imageBlockToMarkdown(html: string): string[] {
  const parts: string[] = [];
  const img = html.match(/<img\b[^>]*>/i)?.[0] ?? "";
  const src =
    img.match(/data-delayed-url="([^"]+)"/i)?.[1] ??
    img.match(/\bsrc="([^"]+)"/i)?.[1] ??
    "";
  if (src) {
    let alt = decodeEntities(img.match(/\balt="([^"]*)"/i)?.[1] ?? "").trim();
    if (/^article content$/i.test(alt)) alt = "";
    parts.push(`![${alt.replace(/[[\]]/g, "")}](${decodeEntities(src)})`);
  }
  const cap = html.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1];
  if (cap) {
    const text = inlineHtmlToMarkdown(cap).replace(/\s+/g, " ").trim().replace(/^\*+|\*+$/g, "");
    if (text) parts.push(`*${text}*`);
  }
  return parts;
}

/** Embeds / videos. YouTube becomes a real video; anything else a "watch" link. */
function embedBlockToMarkdown(html: string, pageUrl: string): string[] {
  const yt = extractYouTubeId(decodeEntities(html));
  if (yt) return [`@@YOUTUBE:${yt}@@`];
  const urls = [...html.matchAll(/(?:data-delayed-url|data-embed-url|data-src|src|href)="([^"]+)"/gi)]
    .map((m) => decodeEntities(m[1]))
    .filter((u) => /^https?:\/\//.test(u))
    .filter((u) => !/static\.licdn\.com|media\.licdn\.com\/dms\/image/i.test(u));
  const vimeo = urls.find((u) => /vimeo\.com/i.test(u));
  if (vimeo) return [`[▶ Watch the video](${vimeo})`];
  const isVideo = /<video\b|data-sources=|video/i.test(html);
  if (isVideo) {
    // Native LinkedIn video URLs expire, so link back to the article instead.
    return [`[▶ Watch the video in the original article on LinkedIn](${pageUrl})`];
  }
  const link = urls.find((u) => !/linkedin\.com\/(?:pulse|newsletters|build-relation)/i.test(u));
  return link ? [`[${link.replace(/^https?:\/\//, "").slice(0, 80)}](${link})`] : [];
}

export interface ParsedLinkedInArticle {
  title: string;
  coverUrl: string | null;
  publishedAt: string | null;
  markdown: string;
  stats: { text: number; images: number; videos: number; other: number; skippedWidgets: number };
}

export function parseLinkedInArticleHtml(html: string, pageUrl: string): ParsedLinkedInArticle | null {
  const start = html.indexOf('data-test-id="article-content-blocks"');
  if (start === -1) return null;
  const endIdx = html.indexOf("</article>", start);
  const body = html.slice(start, endIdx === -1 ? undefined : endIdx);

  const blockStartRe = /<(\w+)\b[^>]*data-test-id="(publishing-[a-z-]+-block)"[^>]*>/gi;
  const starts: { index: number; type: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = blockStartRe.exec(body)) !== null) {
    // Skip nested markers like publishing-image-block-caption (they don't end in -block)
    starts.push({ index: m.index, type: m[2] });
  }

  const stats = { text: 0, images: 0, videos: 0, other: 0, skippedWidgets: 0 };
  const parts: string[] = [];
  for (let i = 0; i < starts.length; i++) {
    let chunk = body.slice(starts[i].index, i + 1 < starts.length ? starts[i + 1].index : undefined);
    // Cut off any "Recommended by LinkedIn" widget that sits after this block.
    const widget = chunk.search(/<div\b[^>]*class="[^"]*\binline-articles\b/i);
    if (widget !== -1) {
      chunk = chunk.slice(0, widget);
      stats.skippedWidgets++;
    }
    const type = starts[i].type;
    if (type === "publishing-text-block") {
      const p = textBlockToMarkdown(chunk);
      if (p.length) stats.text++;
      parts.push(...p);
    } else if (type === "publishing-image-block") {
      const p = imageBlockToMarkdown(chunk);
      if (p.length) stats.images++;
      parts.push(...p);
    } else if (type === "publishing-divider-block") {
      parts.push("---");
    } else {
      const p = embedBlockToMarkdown(chunk, pageUrl);
      if (p.some((x) => x.startsWith("@@YOUTUBE") || /watch the video/i.test(x))) stats.videos++;
      else if (p.length) stats.other++;
      if (!p.length) console.warn(`Unhandled LinkedIn block type "${type}"`);
      parts.push(...p);
    }
  }

  // Trim leading/trailing dividers
  while (parts[0] === "---") parts.shift();
  while (parts[parts.length - 1] === "---") parts.pop();

  const markdown = parts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();

  const title = decodeEntities(
    html.match(/<h1[^>]*class="[^"]*pulse-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ??
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ??
      html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ??
      "",
  )
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*\|\s*LinkedIn$/i, "")
    .trim();

  const cover =
    html.match(/class="cover-img__image[^"]*"[^>]*?(?:data-delayed-url|src)="([^"]+)"/i)?.[1] ??
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] ??
    null;

  const publishedAt =
    html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1] ??
    html.match(/<meta[^>]+property="article:published_time"[^>]+content="([^"]+)"/i)?.[1] ??
    null;

  return {
    title,
    coverUrl: cover ? decodeEntities(cover) : null,
    publishedAt,
    markdown,
    stats,
  };
}

export async function fetchAsCrawler(url: string): Promise<string | null> {
  for (const ua of CRAWLER_USER_AGENTS) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      });
      if (!res.ok) {
        console.warn(`Fetch ${url} with "${ua}" → ${res.status}`);
        await res.body?.cancel();
        continue;
      }
      return await res.text();
    } catch (e) {
      console.warn(`Fetch ${url} with "${ua}" threw: ${e instanceof Error ? e.message : e}`);
    }
  }
  return null;
}

export async function scrapeLinkedInArticle(url: string): Promise<ParsedLinkedInArticle | null> {
  for (const ua of CRAWLER_USER_AGENTS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": ua, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
        redirect: "follow",
      });
      if (!res.ok) {
        await res.body?.cancel();
        continue;
      }
      const parsed = parseLinkedInArticleHtml(await res.text(), url);
      if (parsed && parsed.markdown.length >= 200) {
        console.log(`LinkedIn parse OK via "${ua}"`, parsed.stats);
        return parsed;
      }
    } catch (e) {
      console.warn(`LinkedIn fetch threw: ${e instanceof Error ? e.message : e}`);
    }
  }
  return null;
}

/** Canonical pulse URL (no query/trailing slash). */
export function canonicalPulseUrl(u: string): string {
  const m = u.match(/https?:\/\/(?:[a-z]+\.)?linkedin\.com\/pulse\/([^/?#"'\s]+)/i);
  return m ? `https://www.linkedin.com/pulse/${m[1]}` : u;
}

/** Pull every pulse link out of a page that belongs to one of the given authors. */
export function extractAuthorPulseUrls(html: string, authorSlugs: string[]): string[] {
  const found = new Set<string>();
  for (const mm of html.matchAll(/https?:\/\/(?:[a-z]+\.)?linkedin\.com\/pulse\/[A-Za-z0-9%_-]+/gi)) {
    const u = canonicalPulseUrl(mm[0]);
    const lower = u.toLowerCase();
    if (authorSlugs.some((a) => lower.includes(a))) found.add(u);
  }
  return [...found];
}
