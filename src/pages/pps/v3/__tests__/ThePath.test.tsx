import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Link } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * The P.A.T.H. (Draft at /the-path). Guards the stage-to-offer mapping
 * PPS Admin set on 2026-11-05: the P.A.T.H. is the four stages of change, and
 * Envision partners at Prepare, Architect at Align, Embody from Take Off through
 * Habits. Also guards no prices (PPS-DEC-0022 item 5), offer names
 * (PPS-DEC-0018), the IF in shIFt, the Clarity-first call to action, and that
 * the draft site's superseded copy doesn't leak in.
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

import ThePath from "../ThePath";
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";

// jsdom's accessible-name computation puts spaces around the styled IF span
// ("Sh IF t"); browsers don't. Compare names with whitespace removed.
const named = (label: string) => (name: string) => name.replace(/\s+/g, "") === label.replace(/\s+/g, "");

function renderPage() {
  return render(
    <MemoryRouter>
      <ThePath />
    </MemoryRouter>,
  );
}

describe("ThePath (draft)", () => {
  beforeEach(() => openQuiz.mockClear());

  it("titles the page The P.A.T.H.™", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^The P\.A\.T\.H\.™$/);
  });

  it("presents the four stages of change in order, each with the ShIFt that partners on it", () => {
    renderPage();
    const expected: [string, string, string][] = [
      ["Prepare", "Envision ShIFt", "/envision-shift"],
      ["Align", "Architect ShIFt", "/architect-shift"],
      ["Take Off", "Embody ShIFt", "/embody-shift"],
      ["Habits", "Embody ShIFt", "/embody-shift"],
    ];
    const stages = within(screen.getByRole("region", { name: "The four stages of change" })).getAllByRole("article");
    expect(stages).toHaveLength(4);
    stages.forEach((article, i) => {
      const [name, offer, href] = expected[i];
      expect(within(article).getByRole("heading", { level: 2 })).toHaveTextContent(name);
      expect(within(article).getByRole("link", { name: named(offer) })).toHaveAttribute("href", href);
    });
  });

  it("names the three ShIFts without Epic and shows no prices", () => {
    const { container } = renderPage();
    const text = container.textContent ?? "";
    for (const name of ["Envision", "Architect", "Embody"]) {
      expect(screen.getAllByRole("heading", { level: 3, name: named(`${name} ShIFt`) })).toHaveLength(1);
    }
    expect(text).not.toMatch(/\$\s?\d/);
    expect(text).not.toMatch(/per month|Investment/i);
  });

  it("styles every IF in shIFt", () => {
    const { container } = renderPage();
    const ifSpans = Array.from(container.querySelectorAll("span")).filter((s) => s.textContent === "IF");
    const ifInText = (container.textContent ?? "").match(/IF/g) ?? [];
    expect(ifSpans.length).toBeGreaterThan(10);
    expect(ifSpans.length).toBe(ifInText.length);
    for (const span of ifSpans) expect(span.className).toContain("font-bold");
  });

  it("starts with a Clarity Call and offers the quiz as the quiet alternative", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /Start with a Clarity Call/ })).toHaveAttribute(
      "href",
      clarityCallSectionHref("path"),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Find Your Next Sh ?IF ?t$/ }));
    expect(openQuiz).toHaveBeenCalledTimes(1);
  });

  it("carries none of the draft site's superseded copy", () => {
    const { container } = renderPage();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/Epic ShIFt Appraisal/);
    expect(text).not.toMatch(/(Envision|Architect|Embody) Epic ShIFt/);
    expect(text).not.toContain("136,000");
    expect(text).not.toContain("P.A.T.H.way™");
    expect(container.querySelector('a[href="/ready"]')).toBeNull();
  });
});
