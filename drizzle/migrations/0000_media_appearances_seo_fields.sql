ALTER TABLE public.media_appearances
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS aeo_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS geo_tags text[] NOT NULL DEFAULT '{}';