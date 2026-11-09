import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import approvedPages from "../config/approvedPageMetadata.json";

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
});