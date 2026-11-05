export const MEDIA_PAGE_URL = "https://onthepaintedporch.com/speaking/media";

const text = (value) => typeof value === "string" ? value.trim() : "";
const tags = (values) => [...new Set((values ?? []).map(text).filter(Boolean))];

export const mediaAppearancePath = (id) => `/speaking/media/${encodeURIComponent(id)}`;

/** Shared browser/prerender metadata. Unapproved entries never get public metadata. */
export function buildMediaAppearancePage(appearance) {
  if (appearance.review_status !== "published") return null;
  const path = mediaAppearancePath(appearance.id);
  const title = text(appearance.seo_title) || appearance.title;
  const description = text(appearance.seo_description) || text(appearance.description);
  const keywords = tags([...(appearance.seo_keywords ?? []), ...(appearance.aeo_tags ?? []), ...(appearance.geo_tags ?? [])]);
  const canonical = `https://onthepaintedporch.com${path}`;
  const item = buildMediaAppearanceSchema([appearance]).mainEntity.itemListElement[0].item;
  return {
    path, title, description, keywords, canonical,
    ogImage: text(appearance.thumbnail_url) ? `https://onthepaintedporch.com/media-share/${encodeURIComponent(appearance.id)}.jpg` : undefined,
    ogType: appearance.media_type === "article" ? "article" : "website",
    jsonLd: { "@context": "https://schema.org", ...item, "@id": `${canonical}#appearance`, url: canonical, ...(text(appearance.external_url) ? { sameAs: appearance.external_url } : {}) },
  };
}

/** Only approved records belong in the public search/AI summary. */
export function buildMediaAppearanceSchema(appearances) {
  const approved = appearances.filter((item) => item.review_status === "published");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${MEDIA_PAGE_URL}#collection`,
    url: MEDIA_PAGE_URL,
    name: "As Seen On | Painted Porch Strategies",
    description: "Podcasts, interviews, and media appearances featuring the Painted Porch Strategies team discussing change, leadership, and transformation.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: approved.length,
      itemListElement: approved.map((appearance, index) => {
        const categories = appearance.categories?.map((category) => category.title) ??
          appearance.media_appearance_categories?.map((link) => link.blog_categories?.title) ?? [];
        const topics = tags([...categories, ...(appearance.aeo_tags ?? [])]);
        const keywords = tags(appearance.seo_keywords);
        const locations = tags(appearance.geo_tags);
        const seoTitle = text(appearance.seo_title);
        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": appearance.media_type === "article" ? "Article" :
              appearance.media_type === "podcast" ? "PodcastEpisode" : "CreativeWork",
            "@id": `${MEDIA_PAGE_URL}#appearance-${appearance.id}`,
            name: appearance.title,
            ...(seoTitle ? { alternativeHeadline: seoTitle } : {}),
            ...(text(appearance.seo_description) || text(appearance.description) ? {
              description: text(appearance.seo_description) || text(appearance.description),
            } : {}),
            ...(text(appearance.external_url) ? { url: appearance.external_url } : {}),
            ...(text(appearance.thumbnail_url) ? { image: appearance.thumbnail_url } : {}),
            ...(appearance.appearance_date ? { datePublished: appearance.appearance_date } : {}),
            ...(text(appearance.show_name) ? {
              isPartOf: { "@type": "CreativeWork", name: appearance.show_name },
            } : {}),
            ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
            ...(topics.length ? { about: topics.map((name) => ({ "@type": "Thing", name })) } : {}),
            ...(locations.length ? { spatialCoverage: locations.map((name) => ({ "@type": "Place", name })) } : {}),
          },
        };
      }),
    },
  };
}

/** Escape HTML-sensitive characters before embedding saved text in a script. */
export function serializeMediaAppearanceSchema(schema) {
  return JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}