import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FAQSection } from "../FAQSection";

const OFF = '[data-money-highlight="off"]';

// Dollar amounts in FAQs keep the answer text's color, not the site's green money highlight
// (PPS Admin, 2026-11-09: "when displaying dollar amounts in the FAQs, they don't need to be green").
describe("FAQ dollar amounts are not highlighted", () => {
  it("the shared FAQ section opts out of the money highlight", () => {
    render(
      <MemoryRouter>
        <FAQSection tierName="Test" faqs={[{ question: "What does the Lab cost? It's $997.", answer: "The Lab is $997." }]} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/It's \$997\./).closest(OFF)).not.toBeNull();
  });

  it.each(["src/pages/pps/v3/ArchitectShift.tsx", "src/components/pps/blue-door/FAQSectionAlt.tsx"])(
    "%s, which draws its own FAQ, opts out too",
    (file) => {
      expect(readFileSync(join(process.cwd(), file), "utf-8")).toContain('data-money-highlight="off"');
    },
  );
});
