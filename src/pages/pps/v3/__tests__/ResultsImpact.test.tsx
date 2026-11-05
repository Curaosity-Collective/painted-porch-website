import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Link } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * Results & Impact (Draft at /about/impact-next; replaces /about/impact at
 * go-live). PPS Admin combined the draft site's Results and Impact pages on
 * 2026-11-05 with no case studies yet. Guards the figures, the shared
 * testimonials and charity list, the IF in shIFt, the Clarity-first close,
 * and that no case-study placeholders or individual (B2C) quotes leak in.
 */

const openQuiz = vi.fn();

vi.mock("@/hooks/useDocumentSeo", () => ({ useDocumentSeo: () => {} }));
vi.mock("@/components/pps/ClientLogoMarquee", () => ({
  __esModule: true,
  default: ({ heading }: { heading?: ReactNode }) => <div data-testid="logo-strip">{heading}</div>,
}));
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

import ResultsImpact from "../ResultsImpact";
import { CLARITY_CALL_CONTACT_HREF } from "@/config/epicShiftAppraisal";
import { CHARITIES } from "@/data/charities";
import { BY_ROLE_TESTIMONIALS, NAMED_TESTIMONIALS } from "../testimonials";

function renderPage() {
  return render(
    <MemoryRouter>
      <ResultsImpact />
    </MemoryRouter>,
  );
}

describe("ResultsImpact (draft)", () => {
  beforeEach(() => openQuiz.mockClear());

  it("titles the page and shows the running tally", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Proof, Not Promises$/);
    const tally = screen.getByRole("region", { name: "The Running Tally" });
    for (const figure of ["28", "$31,474", "5%"]) {
      expect(within(tally).getByText(figure)).toBeInTheDocument();
    }
  });

  it("has no case studies and no placeholder text", () => {
    const { container } = renderPage();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/case stud/i);
    expect(text).not.toMatch(/placeholder|\[TBD\]|\[Title\]/i);
  });

  it("shows the shared business testimonials and none of the individual quotes", () => {
    renderPage();
    const quotes = within(screen.getByRole("region", { name: "In Their Words" })).getAllByRole("figure");
    expect(quotes).toHaveLength(NAMED_TESTIMONIALS.length + BY_ROLE_TESTIMONIALS.length);
    expect(screen.getByText("Dianne R. · Project Manager")).toBeInTheDocument();
    expect(screen.getByText("VP of Operations · Healthcare Staffing Company")).toBeInTheDocument();
    expect(screen.queryByText(/mental massages|Wayne R\.|Bruce H\.|Cindy Y\./)).toBeNull();
  });

  it("lists every charity from the shared list, opening safely in a new tab", () => {
    renderPage();
    const list = within(screen.getByRole("region", { name: /Our Clients' Engagements Support/ }));
    const links = list.getAllByRole("link");
    expect(links).toHaveLength(CHARITIES.length);
    links.forEach((link, i) => {
      expect(link).toHaveAttribute("href", CHARITIES[i].href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("styles every IF in shIFt", () => {
    const { container } = renderPage();
    const ifSpans = Array.from(container.querySelectorAll("span")).filter((s) => s.textContent === "IF");
    const ifInText = (container.textContent ?? "").match(/IF/g) ?? [];
    expect(ifSpans.length).toBeGreaterThan(2);
    expect(ifSpans.length).toBe(ifInText.length);
    for (const span of ifSpans) expect(span.className).toContain("font-bold");
  });

  it("starts with a Clarity Call and offers the quiz as the quiet alternative", () => {
    const { container } = renderPage();
    expect(screen.getByRole("link", { name: /Start with a Clarity Call/ })).toHaveAttribute(
      "href",
      CLARITY_CALL_CONTACT_HREF,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Take the Ready for Epic/ }));
    expect(openQuiz).toHaveBeenCalledTimes(1);
    expect(container.querySelector('a[href="/ready"], a[href="/start-here"], a[href="/results"]')).toBeNull();
  });
});
