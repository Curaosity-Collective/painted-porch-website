import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
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
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";

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
      "/?clarity=architect#clarity-call",
    );
    fireEvent.click(screen.getByRole("button", { name: /^Find Your Next Sh ?IF ?t$/ }));
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
      clarityCallSectionHref("embody"),
    );
  });
});

import EnvisionShift from "../EnvisionShift";
import { PARTNERSHIP_PROMISE } from "@/data/partnershipPromise";

// Envision's Reveal blocks watch the viewport; jsdom has no IntersectionObserver, so an inert one stands in.
beforeEach(() => {
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});

describe("Our Partnership Promise on the three ShIFt pages (PPS Admin, 2026-11-06)", () => {
  for (const [name, Page] of [
    ["Envision ShIFt", EnvisionShift],
    ["Architect ShIFt", ArchitectShift],
    ["Embody ShIFt", EmbodyShift],
  ] as const) {
    it(`${name} shows it once, before the closing Clarity Call, and not the homepage's If yes / If not yet / If not us`, () => {
      const { container } = renderPage(Page);
      const heading = screen.getByRole("heading", { level: 2, name: PARTNERSHIP_PROMISE.title });
      expect(screen.getAllByTestId("partnership-promise")).toHaveLength(1);
      expect(screen.getByTestId("partnership-promise")).toHaveTextContent(PARTNERSHIP_PROMISE.body);
      const clarity = screen.getAllByRole("link", { name: /Start with a Clarity Call/ })[0];
      expect(heading.compareDocumentPosition(clarity) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      // The If yes / If not yet / If not us boxes stay on the homepage only.
      expect(container.textContent).not.toMatch(/If not yet|We Aren't Here to Tell You Yes/);
    });
  }
});

describe("The six trigger moments (ICP Intelligence §3; PPS Admin, 2026-11-06)", () => {
  const MOMENTS = [
    "Technology or AI Initiative",
    "Growth Inflection",
    "Leadership Transition",
    "Merger or Restructure",
    "Change That Hasn't Stuck",
    "Board or Market Mandate",
  ];

  function catalystsSection() {
    renderPage(ArchitectShift);
    // The test library reads the styled IF as "Sh IF t", so compare without spaces.
    const heading = screen.getByRole("heading", {
      level: 2,
      name: (n) => n.replace(/\s+/g, "") === "TheCommonCatalystsforArchitectingShIFt",
    });
    return heading.closest("section")!;
  }

  it("Architect ShIFt lists the six moments, in order, each with the leader's own words in Raspberry", () => {
    const section = catalystsSection();
    const items = within(section).getAllByRole("listitem");
    expect(items).toHaveLength(6);
    expect(within(section).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(MOMENTS);
    for (const item of items) {
      const quote = Array.from(item.querySelectorAll("p")).find((el) => /^\u201c.+\u201d$/.test(el.textContent ?? ""));
      expect(quote, item.textContent ?? "").toBeTruthy();
      expect(quote!.className).toContain("text-raspberry");
    }
  });

  it("drops the old five catalysts", () => {
    const text = catalystsSection().textContent ?? "";
    for (const old of ["Major Technology Implementation", "Organizational Restructure", "Cultural Transformation", "Strategic Planning"]) {
      expect(text).not.toContain(old);
    }
  });

  it("says the appraisal comes first whether or not a moment is listed", () => {
    const section = catalystsSection();
    const intro = section.querySelector("h2 + p")!;
    expect(intro.textContent).toMatch(/Whether or not yours is listed, the Epic ShIFt Organizational Appraisal comes first\./);
    expect(intro.textContent).not.toMatch(/If yours isn't listed/);
    const link = intro.querySelector('a[href="/envision-shift"]');
    expect(link?.textContent).toBe("Epic ShIFt Organizational Appraisal");
  });

  it("describes merger work as after the deal, since the appraisal holds back on an active merger", () => {
    const section = catalystsSection();
    const merger = within(section).getByRole("heading", { level: 3, name: "Merger or Restructure" }).closest("li")!;
    expect(merger.textContent).toContain("Once the deal closes");
  });

  it("Envision ShIFt's Catalyst Event card names all six moments", () => {
    renderPage(EnvisionShift);
    const card = screen.getByRole("heading", { level: 3, name: "The Catalyst Event." }).parentElement!;
    const text = card.textContent ?? "";
    for (const moment of [/AI or new technology/, /rapid growth/, /new leadership/, /a merger/, /a mandate/, /change that hasn't stuck/]) {
      expect(text).toMatch(moment);
    }
  });
});
