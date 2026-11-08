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

  it("names the first menu The P.A.T.H. to ShIFt, linked to the page, with the three ShIFts and For Individuals under it", () => {
    const path = HEADER_MENU[0];
    expect(path.label).toBe("The P.A.T.H. to ShIFt");
    expect(path.href).toBe("/the-path");
    // For Individuals is the one offer page in the header (PPS Admin, 2026-11-07).
    expect(path.children.map((c) => c.href)).toEqual([
      "/envision-shift",
      "/architect-shift",
      "/embody-shift",
      "/for-individuals",
    ]);
    expect(HEADER_MENU.flatMap((g) => g.children).some((c) => c.href.startsWith("/partner"))).toBe(false);
  });

  it("never lists a heading's own page under it: the heading already links there (PPS Admin, 2026-11-07)", () => {
    for (const group of HEADER_MENU) {
      expect(group.children.map((c) => c.href), group.label).not.toContain(group.href);
    }
    // Both menus render from HEADER_MENU. Rendered on a phone, the opened menu has one link to The
    // P.A.T.H. page: its heading. The footer keeps "The P.A.T.H.", because its column heading is not a link.
    renderAt(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByRole("button", { name: `Show ${PATH_MENU_LABEL} links` }));
    const phone = document.getElementById("site-mobile-menu")!;
    expect(Array.from(phone.querySelectorAll('a[href="/the-path"]'))).toHaveLength(1);
  });

  it("puts Phase Zero under About, and nowhere else in the header (PPS Admin, 2026-11-06)", () => {
    const about = HEADER_MENU.find((g) => g.href === "/about")!;
    // Our Approach is part of the Phase Zero page (PPS Admin, 2026-11-06); /about/approach redirects there.
    expect(about.children.map((c) => c.href)).toEqual(["/phase-zero", "/about/impact"]);
    expect(HEADER_MENU.flatMap((g) => g.children).filter((c) => c.href === "/phase-zero")).toHaveLength(1);
  });

  it("keeps the IF bold but plain in the header's top labels and phone menu (PPS Admin, 2026-11-07)", () => {
    renderAt(<SiteHeader />);
    const nav = screen.getAllByRole("navigation", { name: "Main" })[0];
    const link = within(nav).getByRole("link", { name: named(PATH_MENU_LABEL) });
    const topIf = within(link).getByText("IF");
    expect(topIf).toHaveClass("font-bold");
    expect(topIf).not.toHaveClass("text-raspberry");
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const phone = document.getElementById("site-mobile-menu")!;
    const phoneLink = within(phone).getByRole("link", { name: named(PATH_MENU_LABEL) });
    expect(within(phoneLink).getByText("IF")).not.toHaveClass("text-raspberry");
  });

  it("marks the current section with an underline, not a colour (PPS Admin, 2026-11-07)", () => {
    renderAt(<SiteHeader />, "/envision-shift");
    const nav = screen.getAllByRole("navigation", { name: "Main" })[0];
    const current = within(nav).getByRole("link", { name: named(PATH_MENU_LABEL) });
    const other = within(nav).getByRole("link", { name: "Speaking" });
    expect(current).toHaveClass("underline", "decoration-teal-deep", "text-foreground");
    expect(current).not.toHaveClass("text-teal-deep");
    expect(other).not.toHaveClass("underline");
    expect(other).toHaveClass("hover:underline", "text-foreground");
  });

  it("opens a desktop menu without locking page scroll, so the sticky header stays in view (PPS Admin, 2026-11-07)", async () => {
    // A modal menu set overflow:hidden on <body>; with the site's overflow-x: clip there, <body> became
    // a scroll box that never scrolls and the sticky header scrolled away with the page.
    renderAt(<SiteHeader />);
    fireEvent.keyDown(screen.getByRole("button", { name: `Open ${PATH_MENU_LABEL} menu` }), { key: "Enter" });
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(document.body.style.pointerEvents).not.toBe("none");
  });

  it("floats as a pill that firms up once the page scrolls (pps-simplified style, PPS Admin 2026-11-07)", () => {
    renderAt(<SiteHeader />);
    const pill = screen.getByTestId("site-header").querySelector("[data-pill]")!;
    expect(pill).toHaveAttribute("data-pill", "rest");
    expect(pill).toHaveClass("rounded-full", "nav-pill-rest");
    Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
    fireEvent.scroll(window);
    expect(pill).toHaveAttribute("data-pill", "active");
    expect(pill).toHaveClass("nav-pill-active");
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    fireEvent.scroll(window);
    // Labels keep their case: uppercase would turn the ShIFt wordmark into SHIFT.
    expect(pill.className).not.toMatch(/\buppercase\b/);
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

// PPS Admin, 2026-11-07, choosing a compromise between square and pill: "4px on all buttons and form fields, with the
// header button staying a pill? yes". `rounded` is 4px at every size and inside or outside the new design's theme,
// unlike rounded-md/-lg, which follow the theme's --radius.
const cornerClasses = (el: HTMLElement) =>
  el.className.split(/\s+/).filter((t) => /^(?:[a-z0-9]+:)*rounded(?:-|$)/.test(t));

describe("buttons and form fields have 4px corners", () => {
  it("except the header's Find Your Next ShIFt, which matches the pill-shaped bar it sits in", () => {
    // PPS Admin, 2026-11-07, on the header: "That one can match the shape of the header".
    renderAt(<SiteHeader />);
    const buttons = screen.getAllByRole("button").filter((b) => flat(b.textContent ?? "") === "FindYourNextShIFt");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveClass("rounded-full");
  });

  it("the footer's Contact Us, email field and Subscribe", () => {
    renderAt(<SiteFooter />);
    expect(cornerClasses(screen.getByRole("link", { name: "Contact Us" }))).toEqual(["rounded"]);
    expect(cornerClasses(screen.getByRole("button", { name: "Subscribe" }))).toEqual(["rounded"]);
    expect(cornerClasses(screen.getByRole("textbox"))).toEqual(["rounded"]);
  });

  it("every Button, whatever its size", async () => {
    const { Button } = await import("@/components/ui/button");
    render(
      <>
        <Button>Default</Button>
        <Button size="sm">Small</Button>
        <Button size="lg" variant="outline">Large</Button>
      </>,
    );
    for (const name of ["Default", "Small", "Large"]) {
      expect(cornerClasses(screen.getByRole("button", { name }))).toEqual(["rounded"]);
    }
  });

  it("the shared text field, text area and select", async () => {
    const { Input } = await import("@/components/ui/input");
    const { Textarea } = await import("@/components/ui/textarea");
    const { Select, SelectTrigger, SelectValue } = await import("@/components/ui/select");
    render(
      <>
        <Input aria-label="Name" />
        <Textarea aria-label="Message" />
        <Select>
          <SelectTrigger aria-label="Topic">
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
        </Select>
      </>,
    );
    expect(cornerClasses(screen.getByRole("textbox", { name: "Name" }))).toEqual(["rounded"]);
    expect(cornerClasses(screen.getByRole("textbox", { name: "Message" }))).toEqual(["rounded"]);
    expect(cornerClasses(screen.getByRole("combobox", { name: "Topic" }))).toEqual(["rounded"]);
  });

  it("the closing band's button", async () => {
    const { CTABand } = await import("@/components/v3/Bits");
    renderAt(<CTABand title="Ready?" body="Let's talk." to="/contact" label="Start with a Clarity Call" />);
    expect(cornerClasses(screen.getByRole("link", { name: /Start with a Clarity Call/ }))).toEqual(["rounded"]);
  });
});

// PPS-DEC-0028: button text on the public site is set in spaced capitals (`cta-label`). PPS Admin, 2026-11-07: "I
// liked the spaced all caps cta buttons", then, of buttons that say ShIFt, choosing "ShIFt becomes SHIFT".
describe("public-site buttons are set in spaced capitals", () => {
  it("the header's Find Your Next ShIFt", () => {
    renderAt(<SiteHeader />);
    const button = screen.getAllByRole("button").find((b) => flat(b.textContent ?? "") === "FindYourNextShIFt")!;
    expect(button).toHaveClass("cta-label");
  });

  it("the footer's Contact Us and Subscribe", () => {
    renderAt(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveClass("cta-label");
    expect(screen.getByRole("button", { name: "Subscribe" })).toHaveClass("cta-label");
  });

  it("the closing band's button", async () => {
    const { CTABand } = await import("@/components/v3/Bits");
    renderAt(<CTABand title="Ready?" body="Let's talk." to="/contact" label="Start with a Clarity Call" />);
    expect(screen.getByRole("link", { name: /Start with a Clarity Call/ })).toHaveClass("cta-label");
  });

  it("every shared Button drawn as a button, inside the public site only", async () => {
    const { Button } = await import("@/components/ui/button");
    const { PublicSiteContext } = await import("@/components/v3/publicSiteContext");
    const set = (
      <>
        <Button>Solid</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Text link</Button>
        <Button size="icon" aria-label="Icon only" />
      </>
    );
    const { unmount } = render(<PublicSiteContext.Provider value={true}>{set}</PublicSiteContext.Provider>);
    for (const name of ["Solid", "Outline", "Secondary", "Destructive"]) {
      expect(screen.getByRole("button", { name })).toHaveClass("cta-label");
    }
    for (const name of ["Ghost", "Text link", "Icon only"]) {
      expect(screen.getByRole("button", { name })).not.toHaveClass("cta-label");
    }
    unmount();
    // Staff screens render outside the public layout and keep their own button text.
    render(set);
    expect(screen.getByRole("button", { name: "Solid" })).not.toHaveClass("cta-label");
  });
});
