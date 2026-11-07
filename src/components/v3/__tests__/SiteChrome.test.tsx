import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * The redesign's header and footer (PPS Admin, 2026-11-05): the approved menu,
 * the quiz button, the full footer, Draft pages hidden from the public, and
 * the switch that keeps them on the Draft pages until go-live.
 */

const openQuiz = vi.fn();
const invoke = vi.fn();
let liveMap: Record<string, boolean> = {};

vi.mock("@/components/pps/quiz/PathFinderQuizProvider", () => ({
  usePathFinderQuiz: () => ({ open: openQuiz }),
}));
vi.mock("@/components/pps/SiteSearch", () => ({ SiteSearch: () => <button type="button">Search</button> }));
vi.mock("@/hooks/useIsPageLive", () => ({
  useArePagesLive: () => ({ liveMap, loading: false }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invoke(...args) } },
}));

import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { COMPANY_LINKS, HEADER_MENU, PATH_MENU_LABEL, PATHWAY_LINKS } from "../siteNav";
import { usesV3Chrome, V3_CHROME_EVERYWHERE, V3_CHROME_PREVIEW_ROUTES } from "@/config/siteChrome";

const flat = (s: string) => s.replace(/\s+/g, "");
/** Matches an accessible name whatever the spacing; jsdom reads the styled IF as "Sh IF t". */
const named = (label: string) => (name: string) => flat(name) === flat(label);

function renderAt(ui: JSX.Element, path = "/the-path") {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

beforeEach(() => {
  openQuiz.mockClear();
  invoke.mockReset();
  liveMap = {};
});

describe("site chrome switch", () => {
  it("shows the new header and footer site-wide since the relaunch", () => {
    expect(V3_CHROME_EVERYWHERE).toBe(true);
    expect([...V3_CHROME_PREVIEW_ROUTES]).toEqual(["/", "/the-path", "/architect-shift", "/embody-shift", "/about", "/about/impact"]);
    for (const route of [...V3_CHROME_PREVIEW_ROUTES, "/envision-shift", "/speaking", "/contact", "/partner/ignite", "/resources/insights"]) {
      expect(usesV3Chrome(route)).toBe(true);
      expect(usesV3Chrome(`${route}/`)).toBe(true);
    }
  });
});

describe("SiteHeader", () => {
  it("has the approved top-level menu, in order", () => {
    renderAt(<SiteHeader />);
    const nav = screen.getAllByRole("navigation", { name: "Main" })[0];
    const top = HEADER_MENU.map((g) => within(nav).getByRole("link", { name: named(g.label) }));
    expect(top.map((a) => a.getAttribute("href"))).toEqual(["/the-path", "/speaking", "/resources", "/about"]);
    expect(top[0]).toHaveAttribute("aria-current", "page");
  });

  it("names the first menu The P.A.T.H. to ShIFt, with the page, the three ShIFts and For Individuals", () => {
    const path = HEADER_MENU[0];
    expect(path.label).toBe("The P.A.T.H. to ShIFt");
    // For Individuals is the one offer page in the header (PPS Admin, 2026-11-07).
    expect(path.children.map((c) => c.href)).toEqual([
      "/the-path",
      "/envision-shift",
      "/architect-shift",
      "/embody-shift",
      "/for-individuals",
    ]);
    expect(HEADER_MENU.flatMap((g) => g.children).some((c) => c.href.startsWith("/partner"))).toBe(false);
  });

  it("puts Phase Zero under About, and nowhere else in the header (PPS Admin, 2026-11-06)", () => {
    const about = HEADER_MENU.find((g) => g.href === "/about")!;
    // Our Approach is part of the Phase Zero page (PPS Admin, 2026-11-06); /about/approach redirects there.
    expect(about.children.map((c) => c.href)).toEqual(["/phase-zero", "/about/impact"]);
    expect(HEADER_MENU.flatMap((g) => g.children).filter((c) => c.href === "/phase-zero")).toHaveLength(1);
  });

  it("styles the IF in the menu heading", () => {
    renderAt(<SiteHeader />);
    const nav = screen.getAllByRole("navigation", { name: "Main" })[0];
    const link = within(nav).getByRole("link", { name: named(PATH_MENU_LABEL) });
    expect(within(link).getByText("IF")).toHaveClass("text-raspberry");
  });

  it("opens the guide from the Find Your Next ShIFt button (PPS-DEC-0026)", () => {
    renderAt(<SiteHeader />);
    expect(document.body.textContent).not.toMatch(/Ready for Epic/);
    const buttons = screen.getAllByRole("button").filter((b) => flat(b.textContent ?? "") === "FindYourNextShIFt");
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    expect(openQuiz).toHaveBeenCalledTimes(1);
  });

  it("opens a mobile menu with each group's links", () => {
    renderAt(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const mobile = document.getElementById("site-mobile-menu")!;
    fireEvent.click(within(mobile).getByRole("button", { name: "Show The P.A.T.H. to ShIFt links" }));
    const links = within(mobile)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(links).toEqual(expect.arrayContaining(["/the-path", "/envision-shift", "/architect-shift", "/embody-shift"]));
    expect(links).not.toContain("/phase-zero");
  });

  it("hides Draft pages from the public, as today's header does", () => {
    liveMap = { "/architect-shift": false, "/embody-shift": false };
    renderAt(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const mobile = document.getElementById("site-mobile-menu")!;
    fireEvent.click(within(mobile).getByRole("button", { name: "Show The P.A.T.H. to ShIFt links" }));
    const hrefs = within(mobile)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).not.toContain("/architect-shift");
    expect(hrefs).not.toContain("/embody-shift");
    expect(hrefs).toContain("/envision-shift");
  });
});

describe("SiteFooter", () => {
  it("keeps the P.A.T.H., Leaders & Teams and company columns", () => {
    renderAt(<SiteFooter />);
    expect(screen.queryByText(/P\.A\.T\.H\.ways/)).not.toBeInTheDocument();
    const pathways = screen.getByRole("navigation", { name: "Leaders & Teams" });
    expect(within(pathways).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(
      PATHWAY_LINKS.map((l) => l.href),
    );
    const path = screen.getByRole("navigation", { name: named(PATH_MENU_LABEL) });
    expect(within(path).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/the-path",
      "/envision-shift",
      "/architect-shift",
      "/embody-shift",
    ]);
    const company = screen.getByRole("navigation", { name: "Company" });
    expect(within(company).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(
      COMPANY_LINKS.map((l) => l.href),
    );
    expect(COMPANY_LINKS.map((l) => l.href)).toContain("/phase-zero");
    expect(screen.getByRole("link", { name: /5% of your investment is donated to charity/ })).toHaveAttribute(
      "href",
      "/about/impact#do-good-shift",
    );
  });

  it("signs up for the newsletter through the existing opt-in function", async () => {
    invoke.mockResolvedValue({ error: null, data: { success: true } });
    renderAt(<SiteFooter />);
    fireEvent.change(screen.getByLabelText("Porch Perspectives Newsletter"), { target: { value: "lead@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("You're on the list!"));
    expect(invoke).toHaveBeenCalledWith("submit-newsletter-optin", {
      body: { email: "lead@example.com", source: "Footer Newsletter" },
    });
  });

  it("rejects an invalid email without calling the function", () => {
    renderAt(<SiteFooter />);
    fireEvent.change(screen.getByLabelText("Porch Perspectives Newsletter"), { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please enter a valid email.");
    expect(invoke).not.toHaveBeenCalled();
  });

  it("opens social links safely in a new tab", () => {
    renderAt(<SiteFooter />);
    for (const name of ["YouTube", "Facebook", "Instagram", "LinkedIn", "Spotify"]) {
      const link = screen.getByRole("link", { name: `${name} (opens in a new tab)` });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
