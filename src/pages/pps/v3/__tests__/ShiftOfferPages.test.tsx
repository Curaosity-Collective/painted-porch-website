import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Link } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * Architect ShIFt and Embody ShIFt (Drafts at /architect-shift and
 * /embody-shift). Guards the approved prices (PPS-DEC-0020), offer names
 * (PPS-DEC-0018), the IF in shIFt (PPS-DEC-0022) and the Clarity-first calls
 * to action, and that nothing from the draft site's superseded copy leaks in.
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

import ArchitectShift from "../ArchitectShift";
import EmbodyShift from "../EmbodyShift";
import { clarityCallHrefFor } from "@/config/epicShiftAppraisal";

function renderPage(Page: () => JSX.Element) {
  return render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  );
}

function expectEveryIfStyled(container: HTMLElement) {
  const ifSpans = Array.from(container.querySelectorAll("span")).filter((s) => s.textContent === "IF");
  const ifInText = (container.textContent ?? "").match(/IF/g) ?? [];
  expect(ifSpans.length).toBeGreaterThan(3);
  expect(ifSpans.length).toBe(ifInText.length);
  for (const span of ifSpans) expect(span.className).toContain("font-bold");
}

function expectNoDraftLeftovers(text: string) {
  expect(text).not.toMatch(/Epic ShIFt Appraisal/);
  expect(text).not.toMatch(/placeholder|\[TBD\]/i);
  expect(text).not.toContain("P.A.T.H.way™");
}

describe("ArchitectShift (draft)", () => {
  beforeEach(() => openQuiz.mockClear());

  it("names the offer without Epic and shows the approved starting price", () => {
    const { container } = renderPage(ArchitectShift);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Architect ShIFt$/);
    const text = container.textContent ?? "";
    expect(text).toContain("Starting at $90,000");
    expect(text).toMatch(/weekly and a biweekly version/);
    expect(text).not.toContain("136,000");
    expectNoDraftLeftovers(text);
  });

  it("styles every IF in shIFt", () => {
    const { container } = renderPage(ArchitectShift);
    expectEveryIfStyled(container);
  });

  it("starts with a Clarity Call and offers the quiz as the quiet alternative", () => {
    renderPage(ArchitectShift);
    expect(screen.getByRole("link", { name: /Start with a Clarity Call/ })).toHaveAttribute(
      "href",
      clarityCallHrefFor("Architect ShIFt"),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Take the Ready for Epic/ }));
    expect(openQuiz).toHaveBeenCalledTimes(1);
  });
});

describe("EmbodyShift (draft)", () => {
  beforeEach(() => openQuiz.mockClear());

  it("names the offer without Epic and shows the approved monthly range", () => {
    const { container } = renderPage(EmbodyShift);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Embody ShIFt$/);
    const text = container.textContent ?? "";
    expect(text).toContain("$9,000–$18,000");
    expect(text).toMatch(/per month/);
    expectNoDraftLeftovers(text);
  });

  it("styles every IF in shIFt", () => {
    const { container } = renderPage(EmbodyShift);
    expectEveryIfStyled(container);
  });

  it("starts with a Clarity Call", () => {
    renderPage(EmbodyShift);
    expect(screen.getByRole("link", { name: /Start with a Clarity Call/ })).toHaveAttribute(
      "href",
      clarityCallHrefFor("Embody ShIFt"),
    );
  });
});
