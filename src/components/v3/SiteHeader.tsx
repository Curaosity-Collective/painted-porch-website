import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import ppsLogo from "@/assets/pps-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiteSearch } from "@/components/pps/SiteSearch";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { useArePagesLive } from "@/hooks/useIsPageLive";
import { NavLabel } from "./NavLabel";
import { ShIFt } from "./ShIFt";
import { HEADER_MENU, type NavGroup } from "./siteNav";

/**
 * The site header: The P.A.T.H. to ShIFt, Speaking, Insights & Resources and About, then search and
 * the "Find Your Next ShIFt" button, which opens the directional guide (PPS-DEC-0026). Draft pages are
 * hidden from the public.
 *
 * Style (PPS Admin, 2026-11-07): the floating pill designed in pps-simplified. It floats over the page,
 * translucent at the top and firmer with a shadow once the page scrolls; menus open as floating cards;
 * the guide button is a gold pill. What the menu holds and how it works are unchanged: the same items,
 * arrow buttons that open each menu (so keyboard and touch users can reach them), and on phones the
 * same sections that expand when tapped, now in a floating card.
 *
 * Kept from the website rather than pps-simplified: labels in normal case, since uppercase turns the
 * ShIFt wordmark into SHIFT; and a more opaque pill at rest than pps-simplified's 55% (88%). The top-level labels are dark, with a plain
 * bold IF and an underline for the current section, so they stay readable on the see-through pill over any hero
 * (PPS Admin, 2026-11-07; PPS-DEC-0022 exception). Heroes that run under the pill use
 * `.v3-under-header` (src/styles/v3.css).
 */

// Between 1024 and 1279 px the menu runs a little tighter, so "The P.A.T.H. to ShIFt" fits beside the
// Find Your Next ShIFt button without wrapping it.
const TOP_LINK =
  "whitespace-nowrap rounded-full text-[14px] font-semibold xl:text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

// The current section is marked with a deep-teal underline, and hovering shows a lighter one (PPS Admin chose this
// on 2026-11-07 over a tinted chip or a dot). The label itself stays in the dark text colour, which keeps it
// readable on the see-through pill over any hero; the underline measures well over 3:1 against the pill.
const ACTIVE_LINK = "text-foreground underline decoration-teal-deep decoration-2 underline-offset-[7px]";
const IDLE_LINK = "text-foreground decoration-teal-deep/40 decoration-2 underline-offset-[7px] hover:underline";

/** The pill firms up once the page has scrolled this far. */
const SCROLLED_AT = 40;

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  return pathname === path || pathname.startsWith(`${path}/`);
}

function QuizButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-full bg-gold px-5 text-[15px] font-bold lg:px-4 xl:px-5 text-[#1E2B30] transition-colors hover:bg-gold/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    >
      <span className="whitespace-nowrap">
        Find Your Next <ShIFt onFill />
      </span>
    </button>
  );
}

export default function SiteHeader() {
  const { pathname } = useLocation();
  const { open: openQuiz } = usePathFinderQuiz();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_AT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const allPaths = useMemo(() => HEADER_MENU.flatMap((g) => [g.href, ...g.children.map((c) => c.href)]), []);
  const { liveMap } = useArePagesLive(allPaths);

  const menu: NavGroup[] = useMemo(
    () =>
      HEADER_MENU.map((g) => ({ ...g, children: g.children.filter((c) => liveMap[c.href] !== false) })).filter(
        (g) => liveMap[g.href] !== false || g.children.length > 0,
      ),
    [liveMap],
  );

  const closeMenu = () => {
    setMenuOpen(false);
    setExpanded(null);
  };

  return (
    <header
      data-testid="site-header"
      className="pps-v3 site-header sticky top-0 z-50 h-[var(--site-header-h)] px-3 pt-2 md:px-4 lg:pt-3"
    >
      <div
        data-pill={scrolled || menuOpen ? "active" : "rest"}
        className={`mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 rounded-full pl-4 pr-2 transition-[background-color,border-color,box-shadow] duration-300 md:pl-5 lg:h-[68px] lg:gap-4 lg:pl-6 lg:pr-3 xl:gap-6 ${scrolled || menuOpen ? "nav-pill-active" : "nav-pill-rest"}`}
      >
        <Link to="/" aria-label="Painted Porch Strategies home" className="shrink-0 rounded-full" onClick={closeMenu}>
          <img src={ppsLogo} alt="Painted Porch Strategies" width={640} height={276} className="h-9 w-auto lg:h-10" />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className="hidden items-center gap-3.5 lg:flex xl:gap-6">
          {menu.map((group) => {
            const active = isActive(pathname, group.href) || group.children.some((c) => isActive(pathname, c.href));
            return (
              // Not modal: a modal menu locks page scroll with overflow:hidden on <body>. With the
              // site's overflow-x: clip there, <body> becomes a scroll box that never scrolls, the
              // sticky header sticks to it instead of the window, and it vanished whenever a menu
              // was opened lower down a page (reported by PPS Admin, 2026-11-07).
              <DropdownMenu key={group.href} modal={false}>
                <div className="flex items-center">
                  <Link
                    to={group.href}
                    aria-current={pathname === group.href ? "page" : undefined}
                    className={`${TOP_LINK} ${active ? ACTIVE_LINK : IDLE_LINK}`}
                  >
                    <NavLabel label={group.label} plain />
                  </Link>
                  <DropdownMenuTrigger
                    aria-label={`Open ${group.label} menu`}
                    className="ml-0.5 rounded-full p-1 text-foreground transition-colors hover:text-teal-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent
                  align="start"
                  sideOffset={18}
                  className="pps-v3 w-64 rounded-xl border-border bg-background/95 p-2 shadow-lg backdrop-blur"
                >
                  {group.children.map((child) => (
                    <DropdownMenuItem key={`${group.href}-${child.href}`} asChild>
                      <Link
                        to={child.href}
                        aria-current={pathname === child.href.split("?")[0] ? "page" : undefined}
                        // asChild joins class lists without resolving conflicts, so the
                        // item's defaults (items-center, lime focus) need overriding.
                        className="flex cursor-pointer flex-col gap-0.5 rounded-md !items-start !px-3 !py-2 hover:bg-cream focus:!bg-cream focus:!text-foreground"
                      >
                        <span className="text-[15px] font-semibold text-foreground">
                          <NavLabel label={child.label} />
                        </span>
                        {child.note && <span className="text-xs text-muted-foreground">{child.note}</span>}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <SiteSearch />
          <QuizButton onClick={openQuiz} />
        </div>

        {/* Mobile and tablet */}
        <div className="flex items-center gap-1 lg:hidden">
          <SiteSearch />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-2.5 text-teal-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="site-mobile-menu"
          aria-label="Main"
          className="absolute inset-x-3 top-full mt-1 max-h-[calc(100svh-var(--site-header-h)-1.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background/95 px-5 pb-5 pt-2 shadow-lg backdrop-blur md:inset-x-4 lg:hidden"
        >
          <ul>
            {menu.map((group) => {
              const isOpen = expanded === group.href;
              const panelId = `site-mobile-${group.href.replace(/\W+/g, "-")}`;
              return (
                <li key={group.href} className="border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <Link
                      to={group.href}
                      onClick={closeMenu}
                      aria-current={pathname === group.href ? "page" : undefined}
                      className="flex-1 py-3 font-display text-lg font-semibold text-teal-deep"
                    >
                      <NavLabel label={group.label} />
                    </Link>
                    <button
                      type="button"
                      aria-label={`${isOpen ? "Hide" : "Show"} ${group.label} links`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setExpanded(isOpen ? null : group.href)}
                      className="rounded-full p-3 text-teal-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                  </div>
                  {isOpen && (
                    <ul id={panelId} className="pb-3 pl-4">
                      {group.children.map((child) => (
                        <li key={`${group.href}-${child.href}`}>
                          <Link
                            to={child.href}
                            onClick={closeMenu}
                            aria-current={pathname === child.href.split("?")[0] ? "page" : undefined}
                            className="block py-2 text-base text-foreground"
                          >
                            <NavLabel label={child.label} />
                            {child.note && <span className="block text-sm text-muted-foreground">{child.note}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <QuizButton
            onClick={() => {
              closeMenu();
              openQuiz();
            }}
            className="mt-5 w-full"
          />
        </nav>
      )}
    </header>
  );
}
