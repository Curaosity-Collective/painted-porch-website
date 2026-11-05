import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildMediaAppearanceSchema, serializeMediaAppearanceSchema, type MediaSeoRecord } from "../lib/media-appearance-seo.mjs";

const approved: MediaSeoRecord = {
  id: "approved-1", review_status: "published", title: "Real episode title",
  media_type: "podcast", show_name: "Publication name", description: "Visible description",
  seo_title: "Search title", seo_description: "Saved search and AI description",
  seo_keywords: ["leadership", "leadership"], aeo_tags: ["authoring change"],
  geo_tags: ["Phoenix"], external_url: "https://example.com/episode",
  thumbnail_url: "https://example.com/photo.jpg", appearance_date: "2026-11-04",
  categories: [{ title: "Leadership & Culture" }],
};
const list = (rows: MediaSeoRecord[]) => buildMediaAppearanceSchema(rows).mainEntity as {
  numberOfItems: number; itemListElement: { position: number; item: Record<string, unknown> }[];
};

describe("media search and AI summaries", () => {
  it("limits anonymous media reads to approved records without calling private reviewer functions", () => {
    const sql = readFileSync("drizzle/migrations/0002_separate_public_media_reads_from_reviewer_checks.sql", "utf8");
    for (const table of ["media_appearances", "youtube_videos"]) {
      expect(sql).toMatch(new RegExp(`ON public\\.${table} FOR SELECT TO anon USING \\(review_status = 'published'\\)`));
      expect(sql).toMatch(new RegExp(`ALTER POLICY [^;]+ ON public\\.${table} TO authenticated`));
    }
  });
  it("excludes pending appearances even when the viewer can read them", () => {
    const summary = list([approved, { ...approved, id: "pending-1", review_status: "pending" }]);
    expect(summary.numberOfItems).toBe(1);
    expect(summary.itemListElement.map((entry) => entry.item["@id"])).toEqual([
      "https://onthepaintedporch.com/speaking/media#appearance-approved-1",
    ]);
  });
  it("maps saved SEO, AEO, GEO and source facts without inventing authors", () => {
    expect(list([approved]).itemListElement[0].item).toMatchObject({
      "@type": "PodcastEpisode", name: "Real episode title", alternativeHeadline: "Search title",
      description: "Saved search and AI description", keywords: "leadership",
      about: [{ "@type": "Thing", name: "Leadership & Culture" }, { "@type": "Thing", name: "authoring change" }],
      spatialCoverage: [{ "@type": "Place", name: "Phoenix" }],
      datePublished: "2026-11-04", url: "https://example.com/episode",
      image: "https://example.com/photo.jpg", isPartOf: { name: "Publication name" },
    });
    expect(list([approved]).itemListElement[0].item).not.toHaveProperty("author");
  });
  it("falls back to existing description and leaves unknown dates and tags absent", () => {
    const { seo_title, seo_description, seo_keywords, aeo_tags, geo_tags, appearance_date, ...fallback } = approved;
    const item = list([fallback]).itemListElement[0].item;
    expect(item.description).toBe("Visible description");
    for (const field of ["alternativeHeadline", "keywords", "spatialCoverage", "datePublished"]) {
      expect(item).not.toHaveProperty(field);
    }
  });
  it("uses joined categories from build-time records and includes all entries", () => {
    const rows = Array.from({ length: 38 }, (_, index) => ({
      ...approved, id: String(index), categories: undefined,
      media_appearance_categories: [{ blog_categories: { title: "Team Dynamics" } }],
    }));
    const summary = list(rows);
    expect(summary.numberOfItems).toBe(38);
    expect(summary.itemListElement[37].position).toBe(38);
    expect(summary.itemListElement[0].item.about).toContainEqual({ "@type": "Thing", name: "Team Dynamics" });
  });
  it("cannot break out of a JSON-LD script via saved content", () => {
    const schema = buildMediaAppearanceSchema([{ ...approved, seo_description: "</script><script>alert(1)</script>" }]);
    const serialized = serializeMediaAppearanceSchema(schema);
    expect(serialized).not.toContain("</script>");
    expect(JSON.parse(serialized)).toEqual(schema);
  });
});