import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Link } from "react-router-dom";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Phase Zero™: Our Approach (/phase-zero), the one page that replaces the old Phase Zero
 * and Our Approach pages (outline approved by PPS Admin, 2026-11-06). Guards the approved
 * section order, Phase Zero as Prepare and Align (PPS-DEC-0027), what was cut, the
 * Clarity-first calls to action, and the IF in shIFt.
 */

const openQuiz = vi.fn();

vi.mock("@/hooks/useDocumentSeo", () => ({ useDocumentSeo: () => {} }));
vi.mock("@/components/pps/SmartLink", () => ({
  SmartLink: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <Link to={to} className={className}>
      {children}
    </Link>
  ),
}));
vi.mock("@/components/pps/quiz/PathFinderQuizProvider", () => ({
  usePathFinderQuiz: () => ({ open: openQuiz }),
}));
vi.mock("@/components/pps/blue-door/CostCalculatorDialog", () => ({
  __esModule: true,
  default: ({ triggerLabel }: { triggerLabel?: string }) => <button type="button">{triggerLabel}</button>,
}));

import PhaseZeroNext from "../PhaseZeroNext";
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";
import { PARTNERSHIP_PROMISE } from "@/data/partnershipPromise";

const flat = (s: string) => s.replace(/\s+/g, "");

function renderPage() {
  return render(
    <MemoryRouter>
      <PhaseZeroNext />
    </MemoryRouter>,
  );
}

describe("Phase Zero: Our Approach", () => {
  beforeEach(() => openQuiz.mockClear());

  it("opens with the approved hero and a Clarity Call button", () => {
    const { container } = renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Phase Zero™");
    expect(screen.getByText("Our Approach")).toBeInTheDocument();
    expect(flat(container.textContent ?? "")).toContain(flat("Before the kickoff. Before the rollout. Before the next big shIFt."));
    expect(container.textContent).toContain("Sustainable change is designed, not declared.");
    const ctas = screen.getAllByRole("link", { name: /Start with a Clarity Call/ });
    expect(ctas.length).toBe(2);
    for (const cta of ctas) expect(cta).toHaveAttribute("href", clarityCallSectionHref());
  });

  it("keeps the approved section order", () => {
    renderPage();
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => flat(h.textContent ?? ""));
    const expected = [
      "Not Every Opportunity Strengthens the Organization Chasing It",
      "Where the Real Choices Get Made",
      "What Phase Zero Is, and What It Isn't",
      "Prepare and Align",
      "The Foundations Beneath Every ShIFt",
      "The Decision Filter Behind Every Recommendation",
      "The Conditions That Shape Every Outcome",
      PARTNERSHIP_PROMISE.title,
      "Every Future Begins With a Clearer Understanding of Who You're Becoming",
    ].map(flat);
    expect(h2s).toEqual(expected);
  });

  it("places Phase Zero across Prepare and Align, never Prepare alone (PPS-DEC-0027)", () => {
    const { container } = renderPage();
    const path = screen.getByRole("heading", { level: 2, name: "Prepare and Align" }).closest("section")!;
    const stages = within(path).getByRole("list", { name: /Phase Zero spanning Prepare and Align/ });
    const bracket = within(stages).getByText("Phase Zero™").parentElement!;
    expect(bracket.textContent).toMatch(/Prepare.*Align/);
    expect(bracket.textContent).not.toMatch(/Take Off|Habits/);
    expect(within(path).getByRole("link", { name: /See the full P\.A\.T\.H\./ })).toHaveAttribute("href", "/the-path");
    expect(container.textContent).not.toMatch(/inside Prepare|Prepare is Phase Zero|the Prepare stage of/);
  });

  it("brings the detailed Pillars, Essential Elements, the Fortified Porch and the decision filter", () => {
    const { container } = renderPage();
    for (const pillar of ["Cultural Cornerstone", "Operational Frame", "Living Ecosystem"]) {
      expect(screen.getByRole("heading", { level: 3, name: pillar })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { level: 3, name: "Essential Elements" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "The Fortified Porch" })).toBeInTheDocument();
    for (const word of ["Reason", "Logic", "Purpose", "Virtue"]) {
      expect(screen.getByRole("heading", { level: 3, name: word })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Calculate the cost of skipping Phase Zero" })).toBeInTheDocument();
    expect(container.textContent).toContain("Five Foundational Abilities");
    expect(container.textContent).toContain("Four Conditions That Hold");
  });

  it("links each Essential Element to a page that exists", () => {
    renderPage();
    const app = readFileSync(resolve(__dirname, "../../../../App.tsx"), "utf8");
    const box = screen.getByRole("heading", { level: 3, name: "Essential Elements" }).parentElement!;
    const links = within(box).getAllByRole("link");
    expect(links).toHaveLength(6);
    for (const link of links) {
      const href = link.getAttribute("href")!;
      expect(app, href).toContain(`path="${href.slice(1)}"`);
    }
    expect(within(box).getByRole("link", { name: "Alignment" })).toHaveAttribute(
      "href",
      "/assessments/working-genius",
    );
  });

  it("closes section 8 with Our Commitment, then the Partnership Promise, then the Clarity Call", () => {
    renderPage();
    const commitment = screen.getByText("You won't need us forever.");
    const possible = screen.getByRole("heading", { level: 2, name: "The Conditions That Shape Every Outcome" }).closest("section")!;
    expect(possible).toContainElement(commitment);
    expect(within(possible).getByText("Our Commitment")).toBeInTheDocument();
    const promise = screen.getByTestId("partnership-promise");
    expect(promise).toHaveTextContent(PARTNERSHIP_PROMISE.body);
    const closing = screen.getAllByRole("link", { name: /Start with a Clarity Call/ }).at(-1)!;
    expect(commitment.compareDocumentPosition(promise) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(promise.compareDocumentPosition(closing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("offers Find Your Next ShIFt as the quiet alternative", () => {
    renderPage();
    const guide = screen.getAllByRole("button").find((b) => flat(b.textContent ?? "") === "FindYourNextShIFt")!;
    fireEvent.click(guide);
    expect(openQuiz).toHaveBeenCalledTimes(1);
  });

  it("leaves out what the outline cut, and the retired names", () => {
    const { container } = renderPage();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/Trained, certified|Certifications/);
    expect(text).not.toMatch(/Three clear ways to begin|Explore Partnership|Strategic Partnership/);
    expect(text).not.toMatch(/What we believe|What we reject|Our Core Values/);
    expect(text).not.toMatch(/The Painted Porch Promise/);
    expect(text).not.toMatch(/\bquiz\b|Blue Door|P\.A\.T\.H\.way/i);
    // The retired style names, in capitals as they were used (PPS-DEC-0025); Embody ShIFt is a current offer.
    expect(text).not.toMatch(/IGNITE|AMPLIFY|EMBODY/);
    for (const a of Array.from(container.querySelectorAll("a"))) {
      expect(a.getAttribute("href")).not.toMatch(/^\/partner$|^\/about\/approach/);
    }
  });

  it("styles every IF in shIFt", () => {
    const { container } = renderPage();
    const ifSpans = Array.from(container.querySelectorAll("span")).filter((s) => s.textContent === "IF");
    const ifInText = (container.textContent ?? "").match(/IF/g) ?? [];
    expect(ifSpans.length).toBeGreaterThan(3);
    expect(ifSpans.length).toBe(ifInText.length);
    for (const span of ifSpans) expect(span.className).toContain("font-bold");
  });
});
