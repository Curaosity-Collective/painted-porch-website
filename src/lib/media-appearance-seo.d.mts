export interface MediaSeoRecord {
  id: string;
  review_status: string;
  title: string;
  media_type: string;
  show_name: string;
  description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  aeo_tags?: string[] | null;
  geo_tags?: string[] | null;
  external_url?: string | null;
  thumbnail_url?: string | null;
  appearance_date?: string | null;
  categories?: { title: string }[];
  media_appearance_categories?: { blog_categories: { title: string } | null }[];
}
export const MEDIA_PAGE_URL: string;
export function mediaAppearancePath(id: string): string;
export function buildMediaAppearancePage(appearance: MediaSeoRecord): {
  path: string; title: string; description: string; keywords: string[]; canonical: string;
  ogImage?: string; ogType: string; jsonLd: Record<string, unknown>;
} | null;
export function buildMediaAppearanceSchema(appearances: MediaSeoRecord[]): Record<string, unknown>;
export function serializeMediaAppearanceSchema(schema: Record<string, unknown>): string;