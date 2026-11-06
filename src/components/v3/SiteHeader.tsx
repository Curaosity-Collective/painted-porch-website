import { useMemo, useState } from "react";
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
 * The redesign's header (PPS Admin, 2026-11-05): The P.A.T.H., Speaking,
 * Insights & Resources and About, then search and the "Ready for Epic ShIFt?"
 * button, which opens the live quiz. Draft pages are hidden from the public,
 * as in today's header. Shown on the Draft pages until go-live
 * (src/config/siteChrome.ts).
 */

// Between 1024 and 1279 px the menu runs a little tighter, so "The P.A.T.H. to Epic ShIFt"
// (PPS Admin, 2026-11-06) fits beside the Ready for Epic ShIFt? button without wrapping it.
const TOP_LINK =
  "whitespace-nowrap rounded-sm text-[14px] font-semibold xl:text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  return pathname === path || pathname.startsWith(`${path}/`);
}

function QuizButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center justify-center rounded bg-gold px-5 text-[15px] font-bold lg:px-4 xl:px-5 text-[#1E2B30] transition-colors hover:bg-gold/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    >
      <span>
        Ready for Epic <ShIFt onFill />?
      </span>
    </button>
  );
}

export default function SiteHeader() {
  const { pathname } = useLocation();
  const { open: openQuiz } = usePathFinderQuiz();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

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
    <header data-testid="site-header" className="pps-v3 sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-6 lg:h-20 lg:gap-4 xl:gap-6">
        <Link to="/" aria-label="Painted Porch Strategies home" className="shrink-0" onClick={closeMenu}>
          <img src={ppsLogo} alt="Painted Porch Strategies" width={640} height={276} className="h-10 w-auto lg:h-12" />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className="hidden items-center gap-3.5 lg:flex xl:gap-6">
          {menu.map((group) => {
            const active = isActive(pathname, group.href) || group.children.some((c) => isActive(pathname, c.href));
            return (
              <DropdownMenu key={group.href}>
                <div className="flex items-center">
                  <Link
                    to={group.href}
                    aria-current={pathname === group.href ? "page" : undefined}
                    className={`${TOP_LINK} ${active ? "text-heading" : "text-foreground hover:text-heading"}`}
                  >
                    <NavLabel label={group.label} />
                  </Link>
                  <DropdownMenuTrigger
                    aria-label={`Open ${group.label} menu`}
                    className="ml-0.5 rounded-sm p-1 text-foreground transition-colors hover:text-heading focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent align="start" className="pps-v3 w-64 rounded border-border p-1.5">
                  {group.children.map((child) => (
                    <DropdownMenuItem key={`${group.href}-${child.href}`} asChild>
                      <Link
                        to={child.href}
                        aria-current={pathname === child.href.split("?")[0] ? "page" : undefined}
                        // asChild joins class lists without resolving conflicts, so the
                        // item's defaults (items-center, lime focus) need overriding.
                        className="flex cursor-pointer flex-col gap-0.5 rounded-sm !items-start !px-3 !py-2 hover:bg-cream focus:!bg-cream focus:!text-foreground"
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
        <div className="flex items-center gap-2 lg:hidden">
          <SiteSearch />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-sm p-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="site-mobile-menu"
          aria-label="Main"
          className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-border px-5 pb-6 pt-2 lg:hidden"
        >
          <ul>
            {menu.map((group) => {
              const isOpen = expanded === group.href;
              const panelId = `site-mobile-${group.href.replace(/\W+/g, "-")}`;
              return (
                <li key={group.href} className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <Link
                      to={group.href}
                      onClick={closeMenu}
                      aria-current={pathname === group.href ? "page" : undefined}
                      className="flex-1 py-3 font-display text-lg font-semibold text-foreground"
                    >
                      <NavLabel label={group.label} />
                    </Link>
                    <button
                      type="button"
                      aria-label={`${isOpen ? "Hide" : "Show"} ${group.label} links`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setExpanded(isOpen ? null : group.href)}
                      className="rounded-sm p-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
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
