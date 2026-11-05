import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Link } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * About (Draft at /about-next; replaces /about at go-live). Guards the team
 * cards (titles and links match the live speaker pages), the shared
 * certification list, the IF in shIFt, the Clarity-first close, and that the
 * draft site's superseded links don't leak in.
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

import AboutNext from "../AboutNext";
import { CLARITY_CALL_CONTACT_HREF } from "@/config/epicShiftAppraisal";
import { CERTIFICATIONS } from "@/data/certifications";

function renderPage() {
  return render(
    <MemoryRouter>
      <AboutNext />
    </MemoryRouter>,
  );
}

describe("AboutNext (draft)", () => {
  beforeEach(() => openQuiz.mockClear());

  it("titles the page for the Painted Porch", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /^Named for a Porch Where Philosophy Went Public$/,
    );
  });

  it("links each practitioner to their live speaker page with the same title", () => {
    renderPage();
    const team = within(screen.getByRole("region", { name: "Different Disciplines. Shared Conviction." }));
    const expected: [string, string, string][] = [
      ["Amy Yackowski", "/speaking/amy", "Founder | Chief Evolution Officer | Organizational Shift Strategist"],
      ["Rob Hunter", "/speaking/rob", "Chief Storytelling Officer | M.C., Master of Communication"],
      ["Sierra Ramm Cantrell", "/speaking/sierra", "Chief Joy Officer | M.B.A., Mind-Body Architect | Mindfulness Sherpa"],
    ];
    for (const [name, href, title] of expected) {
      expect(team.getByRole("heading", { level: 3, name })).toBeInTheDocument();
      expect(team.getByText(title)).toBeInTheDocument();
      expect(team.getByRole("link", { name: `Meet ${name.split(" ")[0]} →` })).toHaveAttribute("href", href);
    }
  });

  it("shows every certification from the shared list", () => {
    renderPage();
    const credentials = within(screen.getByRole("region", { name: "Credentials & Certifications" }));
    for (const c of CERTIFICATIONS) expect(credentials.getByText(c.name)).toBeInTheDocument();
    expect(CERTIFICATIONS).toHaveLength(14);
  });

  it("styles every IF in shIFt", () => {
    const { container } = renderPage();
    const ifSpans = Array.from(container.querySelectorAll("span")).filter((s) => s.textContent === "IF");
    const ifInText = (container.textContent ?? "").match(/IF/g) ?? [];
    expect(ifSpans.length).toBeGreaterThan(3);
    expect(ifSpans.length).toBe(ifInText.length);
    for (const span of ifSpans) expect(span.className).toContain("font-bold");
  });

  it("starts with a Clarity Call and offers the quiz as the quiet alternative", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /Start with a Clarity Call/ })).toHaveAttribute(
      "href",
      CLARITY_CALL_CONTACT_HREF,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Take the Ready for Epic/ }));
    expect(openQuiz).toHaveBeenCalledTimes(1);
  });

  it("carries none of the draft site's superseded links or copy", () => {
    const { container } = renderPage();
    expect(container.querySelector('a[href="/ready"], a[href^="/about/amy"], a[href^="/about/rob"], a[href^="/about/sierra"]')).toBeNull();
    expect(container.textContent).not.toMatch(/Envision Epic ShIFt|Epic ShIFt Appraisal|placeholder|\[TBD\]/i);
  });
});
