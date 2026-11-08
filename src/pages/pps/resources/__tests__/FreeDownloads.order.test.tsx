/**
 * PPS Admin (2026-11-06): on Free Resources, anything coming soon sits at the bottom, and
 * the Elemental Style quiz is open (it links to its own page, no sign-up).
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useDocumentSeo", () => ({ useDocumentSeo: () => {} }));
vi.mock("@/components/pps/TierHeroSection", () => ({ TierHeroSection: () => <div /> }));

import FreeDownloads from "../FreeDownloads";

describe("Free Resources order", () => {
  it("lists every available resource before any that are coming soon", () => {
    render(
      <MemoryRouter>
        <FreeDownloads />
      </MemoryRouter>,
    );
    const cards = screen.getAllByRole("heading", { level: 3 }).map((h) => h.closest("div.rounded") as HTMLElement);
    const soon = cards.map((c) => /Coming Soon/.test(c.textContent ?? ""));
    const firstSoon = soon.indexOf(true);
    expect(firstSoon).toBeGreaterThan(0);
    expect(soon.slice(firstSoon).every(Boolean)).toBe(true);
  });

  it("opens the Elemental Style quiz", () => {
    render(
      <MemoryRouter>
        <FreeDownloads />
      </MemoryRouter>,
    );
    const card = screen.getByRole("heading", { level: 3, name: "Your Elemental Style Assessment" }).closest("div.rounded") as HTMLElement;
    expect(card.textContent).not.toMatch(/Coming Soon/);
    expect(card.querySelector('a[href="/elemental-style-assessment"]')).not.toBeNull();
  });
});
