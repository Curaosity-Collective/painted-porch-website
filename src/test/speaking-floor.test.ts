import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf-8");

const SPEAKING_PAGES = [
  "src/pages/pps/Speaking.tsx",
  "src/pages/pps/speaking/SpeakerDetailPage.tsx",
  "src/pages/pps/SpeakingWorkshopTopics.tsx",
];

describe("speaking pricing transparency", () => {
  it.each(SPEAKING_PAGES)("%s shows the approved $5,000 speaking floor", (path) => {
    expect(read(path)).toContain("Speaking engagements start at $5,000.");
  });

  it("the contact page names 1:1 coaching in the $5,000 floor", () => {
    expect(read("src/pages/pps/PPSContact.tsx")).toContain(
      "Workshops start at $7,500; speaking, advisory, and 1:1 coaching start at $5,000.",
    );
  });
});
