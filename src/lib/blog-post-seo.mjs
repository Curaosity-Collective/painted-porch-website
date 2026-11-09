/**
 * A blog post's page title, shared by the post page (src/pages/pps/PPSBlogPost.tsx)
 * and the prerender (scripts/prerender.mjs), so browsers and crawlers get the same
 * title.
 *
 * The title is the post's SEO title (or its title) with the brand once at the end.
 * Stored SEO titles end in "| Painted Porch Strategies", "| Painted Porch" or
 * nothing; the "| Painted Porch" ones used to come out as
 * "… | Painted Porch | Painted Porch Strategies".
 */

export const BLOG_TITLE_BRAND = "Painted Porch Strategies";

const TRAILING_BRAND = /\s*\|\s*Painted Porch(?: Strategies)?\s*$/i;

/** @param {{ seo_title?: string | null, title?: string | null } | null | undefined} post */
export function blogPostTitle(post) {
  const base = String(post?.seo_title || post?.title || "")
    .trim()
    .replace(TRAILING_BRAND, "")
    .trim();
  return base ? `${base} | ${BLOG_TITLE_BRAND}` : undefined;
}
