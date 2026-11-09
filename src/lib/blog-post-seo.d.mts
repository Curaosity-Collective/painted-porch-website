export const BLOG_TITLE_BRAND: string;
export function blogPostTitle(
  post: { seo_title?: string | null; title?: string | null } | null | undefined,
): string | undefined;
