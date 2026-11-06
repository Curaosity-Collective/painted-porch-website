import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter, Link } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * The go-forward homepage (Draft at /home-next). Guards the rules PPS Admin
 * set while approving its wireframe on 2026-11-05: the IF in shIFt
 * (PPS-DEC-0022, item 6), no prices on the homepage's ShIFt cards (item 5),
 * the P.A.T.H. as four stages with three ShIFts partnering on them, offer
 * names without "Epic" (PPS-DEC-0018), and Clarity Call calls to action.
 */

const openQuiz = vi.fn();

vi.mock("@/hooks/useFeaturedPosts", () => ({ useFeaturedPosts: () => ({ data: [] }) }));
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

import HomeNext from "../HomeNext";
import { CLARITY_CALL_CONTACT_HREF, clarityCallHrefFor } from "@/config/epicShiftAppraisal";

function renderHome(url = "/") {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <HomeNext />
    </MemoryRouter>,
  );
}

function sectionByHeading(name: RegExp): HTMLElement {
  return screen.getByRole("heading", { level: 2, name }).closest("section") as HTMLElement;
}

describe("HomeNext (draft go-forward homepage)", () => {
  beforeEach(() => openQuiz.mockClear());

  it("has one H1 carrying the headline", () => {
    renderHome();
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Build an Organization That Can Do Epic ShIFt");
  });

  it("styles every IF in shIFt: bold everywhere, raspberry except on solid fills", () => {
    const { container } = renderHome();
    const ifSpans = Array.from(container.querySelectorAll("span")).filter((s) => s.textContent === "IF");
    const ifInText = (container.textContent ?? "").match(/IF/g) ?? [];
    expect(ifSpans.length).toBeGreaterThan(10);
    expect(ifSpans.length).toBe(ifInText.length);
    for (const span of ifSpans) {
      expect(span.className).toContain("font-bold");
      const onFill = Boolean(span.closest("button, li.bg-lime-deep"));
      if (onFill) {
        expect(span.className).not.toMatch(/text-(raspberry|berry)/);
      } else {
        expect(span.className).toMatch(/text-(raspberry|raspberry-bright|berry-on-dark)\b/);
      }
    }
  });

  it("shows the P.A.T.H. as four stages and the three ShIFts with no prices", () => {
    renderHome();
    const path = sectionByHeading(/Who Is Your Organization Becoming\?/);
    const stages = within(path).getByRole("list", { name: "The four stages of change" });
    expect(within(stages).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      expect.stringContaining("Prepare"),
      expect.stringContaining("Align"),
      expect.stringContaining("Take Off"),
      expect.stringContaining("Habits"),
    ]);
    const offers = within(path).getByRole("list", { name: "How we partner on each stage" });
    const text = offers.textContent ?? "";
    for (const name of ["Envision ShIFt", "Architect ShIFt", "Embody ShIFt"]) expect(text).toContain(name);
    // Offer names drop "Epic" (PPS-DEC-0018); "Epic ShIFt" may still describe the work in body copy.
    expect(text).not.toMatch(/(Envision|Architect|Embody) Epic/);
    expect(path.textContent).not.toMatch(/\$\s?\d/);
  });

  it("lists Other Ways In without prices; workshop prices live on the Workshops page", () => {
    renderHome();
    // PPS-DEC-0022 item 5; PPS Admin (2026-11-05) took the workshop price off the homepage.
    // (The Clarity Call section keeps its own price, as the approved wireframe specifies.)
    const other = sectionByHeading(/Other Ways In/);
    expect(other.textContent).not.toMatch(/\$\s?\d/);
    expect(other.textContent).not.toMatch(/Starting at/i);
    expect(within(other).getByRole("link", { name: /Team Workshops/ })).toHaveAttribute("href", "/partner/amplify/workshops");
  });

  it("sends the Clarity Call button to the contact form and both quiz actions to the quiz", () => {
    renderHome();
    expect(screen.getByRole("link", { name: /Book a Clarity Call/ })).toHaveAttribute("href", CLARITY_CALL_CONTACT_HREF);
    // The form opens at the form, not the top of the contact page (PPS Admin, 2026-11-06).
    expect(CLARITY_CALL_CONTACT_HREF).toMatch(/#contact-form$/);
    fireEvent.click(screen.getByRole("button", { name: /^Ready for Epic/ }));
    fireEvent.click(screen.getByRole("button", { name: /Take the quiz/ }));
    expect(openQuiz).toHaveBeenCalledTimes(2);
  });

  it("passes the topic a Clarity Call link carried on to the form, and ignores unknown topics", () => {
    // PPS Admin (2026-11-06): Clarity Call links elsewhere land on this section first.
    const { unmount } = renderHome("/?clarity=architect#clarity-call");
    expect(screen.getByRole("link", { name: /Book a Clarity Call/ })).toHaveAttribute(
      "href",
      clarityCallHrefFor("Architect ShIFt"),
    );
    unmount();
    renderHome("/?clarity=anything-else");
    expect(screen.getByRole("link", { name: /Book a Clarity Call/ })).toHaveAttribute("href", CLARITY_CALL_CONTACT_HREF);
  });

  it("colors the Promise boxes green, yellow, red", () => {
    renderHome();
    const boxes = screen.getAllByTestId("home-promise-box");
    expect(boxes.map((b) => b.className.match(/\bbg-(lime-deep|gold|raspberry)\b/)?.[1])).toEqual([
      "lime-deep",
      "gold",
      "raspberry",
    ]);
    // Gold carries dark text (PPS-DEC-0022).
    expect(boxes[1].className).not.toContain("text-white");
  });

  it("keeps eyebrows a different color from their headings and drops the ™ from P.A.T.H.way", () => {
    const { container } = renderHome();
    const promise = sectionByHeading(/We Aren't Here to Tell You Yes/);
    const eyebrow = within(promise).getByText("The Painted Porch Promise");
    const heading = within(promise).getByRole("heading", { level: 2 });
    expect(eyebrow.className).toContain("text-raspberry");
    expect(heading.className).toContain("text-primary");
    expect(container.textContent).not.toContain("P.A.T.H.way™");
  });
});
