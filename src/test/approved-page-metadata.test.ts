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
