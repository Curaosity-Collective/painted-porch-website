/**
 * The FAQ, rewritten from the outline PPS Admin approved on 2026-11-06: organized around the
 * Clarity Call, the three ShIFts, team workshops and self-led resources, with IGNITE, AMPLIFY
 * and EMBODY no longer used as names (PPS-DEC-0025) and no retired offers.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useDocumentSeo", () => ({ useDocumentSeo: () => {} }));
vi.mock("@/hooks/useHeroLoaded", () => ({ useHeroLoaded: () => true }));
vi.mock("@/components/pps/LazyHeroVideo", () => ({ __esModule: true, default: () => <div /> }));

import FAQPage from "../FAQPage";

function renderFaq() {
  return render(
    <MemoryRouter>
      <FAQPage />
    </MemoryRouter>,
  );
}

describe("FAQ page", () => {
  it("has the five approved sections and 36 questions", () => {
    const { container } = renderFaq();
    for (const name of ["General", "Getting Started", "The Three ShIFts", "Team Workshops & Leadership Labs", "Self-Led: Assessments & Masterclasses"]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
    expect(container.querySelectorAll("[data-state][data-orientation] button[aria-expanded]").length).toBe(36);
  });

  it("never uses the retired names or offers, in questions or answers", () => {
    const { container } = renderFaq();
    // Each list opens one answer at a time, so check every answer as it opens.
    const triggers = Array.from(container.querySelectorAll<HTMLButtonElement>("button[aria-expanded]"));
    let checked = 0;
    for (const trigger of triggers) {
      if (trigger.getAttribute("aria-expanded") === "false") fireEvent.click(trigger);
      const region = document.getElementById(trigger.getAttribute("aria-controls") ?? "");
      const text = `${trigger.textContent} ${region?.textContent ?? ""}`;
      expect(region?.textContent?.length ?? 0, trigger.textContent ?? "").toBeGreaterThan(20);
      expect(text).not.toMatch(/\b(IGNITE|AMPLIFY|EMBODY)\b/);
      expect(text).not.toMatch(/Blue Door|Strategic Sprint|\$\s?\d/);
      checked += 1;
    }
    expect(checked).toBe(36);
  });

  it("sends Clarity Call questions to the homepage section", () => {
    const { container } = renderFaq();
    fireEvent.click(screen.getByRole("button", { name: "What happens in a Clarity Call?" }));
    expect(screen.getByRole("link", { name: "Book a Clarity Call" })).toHaveAttribute("href", "/#clarity-call");
    expect(container).toBeTruthy();
  });
});
