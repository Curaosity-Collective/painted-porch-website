import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import approvedPages from "../config/approvedPageMetadata.json";

type Approved = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  source: string;
  pageOwnsSeo: boolean;
};

describe("approved page metadata inventory", () => {
  const reviewedPaths = ["/", "/the-path", "/envision-shift", "/architect-shift", "/embody-shift", "/workshops", "/leadership-labs", "/assessments", "/masterclasses", "/for-individuals"];
  it.each(reviewedPaths)("%s keeps the approved search title under 60 characters", (path) => {
    expect((approvedPages as Record<string, Approved>)[path].title.length).toBeLessThan(60);
  });
  it.each(reviewedPaths)("%s keeps the approved search description under 155 characters", (path) => {
    expect((approvedPages as Record<string, Approved>)[path].description.length).toBeLessThan(155);
  });
  it("uses unique titles across all ten reviewed routes", () => {
    const titles = reviewedPaths.map((path) => (approvedPages as Record<string, Approved>)[path].title);
    expect(new Set(titles).size).toBe(10);
  });
  it("keeps page-specific defaults traceable to current page sources", () => {
    for (const metadata of Object.values(approvedPages)) {
      expect(readFileSync(metadata.source, "utf8").length).toBeGreaterThan(0);
      expect(metadata.title.length).toBeGreaterThan(0);
      expect(metadata.description.length).toBeGreaterThan(0);
      expect(metadata.ogTitle).toBe(metadata.title);
      expect(metadata.ogDescription).toBe(metadata.description);
    }
  });

  // Browsers show a page's own useDocumentSeo text, while prerendered HTML for crawlers uses this inventory.
  // When a page sets its own SEO, the two must match, or crawlers see stale text (as /rob did after its
  // link-in-bio rewrite).
  it.each(
    Object.entries(approvedPages as Record<string, Approved>).filter(([, metadata]) => metadata.pageOwnsSeo),
  )("%s matches the title and description its page sets", (_path, metadata) => {
    const source = readFileSync(metadata.source, "utf8").replace(/\s+/g, " ");
    expect(source).toContain(metadata.title);
    expect(source).toContain(metadata.description);
  });
});
