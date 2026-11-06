/**
 * The free Elemental Style quiz: open with no sign-up, embedded full width with
 * AidaForm's own embed (PPS Admin, 2026-11-06), and live without a page_status row.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useDocumentSeo", () => ({ useDocumentSeo: () => {} }));
vi.mock("@/components/pps/ParallaxCTA", () => ({ ParallaxCTA: () => <div /> }));

import ElementalStyleAssessment from "../ElementalStyleAssessment";
import { resolvePageStatus } from "@/config/pageStatus";

describe("Elemental Style quiz page", () => {
  it("embeds the quiz with AidaForm's embed and loads its script once", () => {
    const { container, unmount } = render(
      <MemoryRouter>
        <ElementalStyleAssessment />
      </MemoryRouter>,
    );
    const embed = container.querySelector("[data-aidaform-app]") as HTMLElement;
    expect(embed.dataset.aidaformApp).toBe("form202405");
    expect(embed.dataset.url).toBe("https://paintedporchstrategies.aidaform.com/your-elemental-style-free");
    expect(embed.hasAttribute("data-do-resize")).toBe(true);
    expect(document.querySelectorAll("script#aidaform-app")).toHaveLength(1);
    // No sign-up form in front of it.
    expect(container.querySelector("form, input[type=email]")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What's Your Elemental Style?");
    unmount();
    render(
      <MemoryRouter>
        <ElementalStyleAssessment />
      </MemoryRouter>,
    );
    expect(document.querySelectorAll("script#aidaform-app")).toHaveLength(1);
  });

  it("is live without a page_status row", () => {
    expect(resolvePageStatus("/elemental-style-assessment", {})).toBe("live");
  });
});
