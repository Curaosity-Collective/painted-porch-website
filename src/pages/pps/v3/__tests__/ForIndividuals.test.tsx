import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Link } from "react-router-dom";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * For Individuals (/for-individuals): the IGNITE page repurposed for individual leaders, with
 * Leadership Labs (outline approved by PPS Admin, 2026-11-07).
 */

const openGuide = vi.fn();

vi.mock("@/hooks/useDocumentSeo", () => ({ useDocumentSeo: () => {} }));
vi.mock("@/components/pps/SmartLink", () => ({
  SmartLink: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <Link to={to} className={className}>
      {children}
    </Link>
  ),
}));
vi.mock("@/components/pps/quiz/PathFinderQuizProvider", () => ({
  usePathFinderQuiz: () => ({ open: openGuide }),
}));
vi.mock("@/components/pps/LazyHeroVideo", () => ({
  default: ({ slotKey }: { slotKey: string }) => <div data-testid="hero-video" data-slot={slotKey} />,
}));

import ForIndividuals from "../ForIndividuals";

const flat = (s: string) => s.replace(/\s+/g, "");

function renderPage() {
  return render(
    <MemoryRouter>
      <ForIndividuals />
    </MemoryRouter>,
  );
}

describe("For Individuals", () => {
  beforeEach(() => openGuide.mockClear());

  it("opens with the spark animation under the title and the guide as its one action", () => {
    renderPage();
    expect(flat(screen.getByRole("heading", { level: 1 }).textContent ?? "")).toBe(
      flat("Spark Your Next ShIFt, at Your Own Pace"),
    );
    expect(screen.getByTestId("hero-video")).toHaveAttribute("data-slot", "ignite-hero");
    expect(screen.getByRole("button", { name: "Pause the background video" })).toBeInTheDocument();
    const guideButtons = screen.getAllByRole("button").filter((b) => flat(b.textContent ?? "") === "FindYourNextShIFt");
    expect(guideButtons).toHaveLength(2);
    fireEvent.click(guideButtons[0]);
    expect(openGuide).toHaveBeenCalledTimes(1);
  });

  it("keeps the approved section order", () => {
    renderPage();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => flat(h.textContent ?? ""))).toEqual(
      ["Designed for…", "Start Where You Are", "From Spark to Momentum", "What ShIFt Will You Spark First?"].map(flat),
    );
  });

  it("shows IGNITE's four types, Strategic Seeker included, each with its own shading", () => {
    renderPage();
    const types = ["The Curious Explorer", "The Individual Innovator", "The Strategic Seeker", "The Foundation Fortifier"];
    const tints = types.map((name) => {
      const card = screen.getByRole("heading", { level: 3, name }).closest("li")!;
      expect(within(card).getAllByRole("listitem")).toHaveLength(4);
      return card.className.match(/bg-[a-z]+\/10/)?.[0];
    });
    expect(new Set(tints).size).toBe(4);
  });

  it("offers three ways to grow, each with a Best when line and its page", () => {
    renderPage();
    const section = screen.getByRole("heading", { level: 2, name: "Start Where You Are" }).closest("section")!;
    const expected: [string, string][] = [
      ["Assessments", "/assessments"],
      ["Masterclasses & Mini Courses", "/masterclasses"],
      ["Leadership Labs", "/leadership-labs"],
    ];
    for (const [title, href] of expected) {
      const card = within(section).getByRole("heading", { level: 3, name: title }).closest("li")!;
      expect(card.textContent).toMatch(/Best when you/);
      expect(within(card).getByRole("link")).toHaveAttribute("href", href);
    }
    // The Lab details shown match the Leadership Labs page.
    expect(section.textContent).toContain("6–12 week cohorts");
    expect(section.textContent).toContain("Up to 25 leaders from different organizations");
  });

  it("points onward to Team Workshops and Envision ShIFt", () => {
    renderPage();
    const section = screen.getByRole("heading", { level: 2, name: "From Spark to Momentum" }).closest("section")!;
    expect(within(section).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["/workshops", "/envision-shift"]);
  });

  it("leaves out the retired names, Phase Zero, the old quiz and prices", () => {
    const { container } = renderPage();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/IGNITE|AMPLIFY|EMBODY|P\.A\.T\.H\.way/);
    expect(text).not.toMatch(/Phase Zero/);
    expect(text).not.toMatch(/\bquiz\b/i);
    expect(text).not.toMatch(/\$\d/);
    expect(text).not.toMatch(/Is a Lab Right for You/);
  });

  it("styles every IF in shIFt", () => {
    const { container } = renderPage();
    const ifSpans = Array.from(container.querySelectorAll("span")).filter((s) => s.textContent === "IF");
    const ifInText = (container.textContent ?? "").match(/IF/g) ?? [];
    expect(ifSpans.length).toBeGreaterThan(3);
    expect(ifSpans.length).toBe(ifInText.length);
    for (const span of ifSpans) expect(span.className).toContain("font-bold");
  });

  it("is reachable: routed, in both menus, on the homepage, and where the old IGNITE addresses go", () => {
    const read = (p: string) => readFileSync(resolve(__dirname, "../../../../..", p), "utf8");
    expect(read("src/App.tsx")).toContain('<Route path="for-individuals" element={<ForIndividuals />} />');
    const nav = read("src/components/v3/siteNav.ts");
    expect(nav).toMatch(/PATHWAY_LINKS: NavLink\[\] = \[[^\]]*?\{ label: "For Individuals", href: "\/for-individuals" \},\s*\{ label: "Assessments"/s);
    expect(nav).toContain('{ label: "For Individuals", href: "/for-individuals", note:');
    expect(read("src/pages/pps/v3/HomeNext.tsx")).toContain('{ title: "For individuals", to: "/for-individuals",');
  });
});
