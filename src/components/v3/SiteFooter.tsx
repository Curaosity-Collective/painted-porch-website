import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Loader2, Youtube } from "lucide-react";
import ppsLogoWhite from "@/assets/pps-logo-white.png";
import { useArePagesLive } from "@/hooks/useIsPageLive";
import { useNewsletterSignup } from "@/hooks/useNewsletterSignup";
import { NavLabel } from "./NavLabel";
import { ShIFt } from "./ShIFt";
import { COMPANY_LINKS, LEGAL_LINKS, PATH_LINKS, PATHWAY_LINKS, type NavLink } from "./siteNav";

/**
 * The redesign's footer (PPS Admin, 2026-11-05): today's working parts in the
 * new style. The P.A.T.H., the offers for leaders and teams (kept here when they
 * left the header; named "Leaders & Teams", PPS Admin 2026-11-06), company links, the Porch Perspectives newsletter, social links,
 * Do Good ShIFt and the legal links. Eyebrows are light Gold on dark
 * (PPS-DEC-0022); the Subscribe button is Gold with dark text, replacing
 * today's white-on-Lime (3:1). Shown on the Draft pages until go-live.
 */

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

const SOCIALS: { label: string; href: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: "YouTube", href: "https://www.youtube.com/@onthepaintedporch", icon: Youtube },
  { label: "Facebook", href: "https://www.facebook.com/paintedporchstrategies", icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/paintedporchstrategies/", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/paintedporchstrategies/", icon: Linkedin },
  { label: "Spotify", href: "https://open.spotify.com/playlist/1F6mkBYTllBzwawCXDEmry", icon: SpotifyIcon },
];

const EYEBROW = "text-[13px] font-bold uppercase tracking-[0.14em] text-[#F4C05E]";
const FOOTER_LINK =
  "rounded-sm text-[15px] text-teal-foreground underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4C05E]";

function LinkColumn({ title, links, id }: { title: string; links: NavLink[]; id: string }) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className={EYEBROW}>
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link to={link.href} className={FOOTER_LINK}>
              <NavLabel label={link.label} onDark />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function SiteFooter() {
  const { email, setEmail, status, message, submit } = useNewsletterSignup("Footer Newsletter");

  const linked = [...PATH_LINKS, ...PATHWAY_LINKS, ...COMPANY_LINKS];
  const { liveMap, loading } = useArePagesLive(linked.map((l) => l.href));
  // While statuses load, show every link so the footer doesn't jump.
  const visible = (links: NavLink[]) => (loading ? links : links.filter((l) => liveMap[l.href] !== false));

  return (
    <footer className="pps-v3">
      {/* #00505C, not teal-deep: the light-raspberry IF needs it for 4.5:1 (PPS-DEC-0022). */}
      <div className="bg-[#00505C] text-teal-foreground">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))_minmax(0,1.4fr)] lg:gap-8">
            {/* Brand */}
            <div>
              <img src={ppsLogoWhite} alt="Painted Porch Strategies" width={1920} height={1080} className="h-16 w-auto" />
              <p className="mt-5 font-display text-xl font-semibold leading-snug text-white">
                It's time to do epic <ShIFt lowercase onDark />.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-teal-foreground">
                Painted Porch Strategies partners with leaders to architect strategic <ShIFt lowercase onDark /> that
                shapes not just what's next, but what lasts. This is Phase Zero, the work before the work.
              </p>
            </div>

            <LinkColumn id="footer-path" title="The P.A.T.H." links={visible(PATH_LINKS)} />
            <LinkColumn id="footer-leaders-teams" title="Leaders & Teams" links={visible(PATHWAY_LINKS)} />
            <LinkColumn id="footer-company" title="Company" links={visible(COMPANY_LINKS)} />

            {/* Stay in touch */}
            <div>
              <h2 className={EYEBROW}>Stay in Touch</h2>
              <Link
                to="/contact?interest=general"
                className="mt-4 inline-flex min-h-[44px] items-center rounded border-2 border-white px-5 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-[#00505C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4C05E]"
              >
                Contact Us
              </Link>

              <form onSubmit={submit} className="mt-6" noValidate>
                <label htmlFor="site-footer-newsletter" className="block text-[15px] font-semibold text-white">
                  Porch Perspectives Newsletter
                </label>
                {status === "success" ? (
                  <p className="mt-2 text-sm text-white" role="status">
                    {message}
                  </p>
                ) : (
                  <>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        id="site-footer-newsletter"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={status === "loading"}
                        aria-invalid={status === "error"}
                        aria-describedby={status === "error" ? "site-footer-newsletter-error" : undefined}
                        className="min-h-[44px] min-w-0 flex-1 rounded border border-white/40 bg-white/10 px-3 text-[15px] text-white placeholder:text-white/70 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F4C05E] disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="inline-flex min-h-[44px] items-center justify-center rounded bg-gold px-5 text-[15px] font-bold text-[#1E2B30] transition-colors hover:bg-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4C05E]"
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            <span className="sr-only">Subscribing</span>
                          </>
                        ) : (
                          "Subscribe"
                        )}
                      </button>
                    </div>
                    {status === "error" && (
                      <p id="site-footer-newsletter-error" className="mt-2 text-sm text-[#FF9EB1]" role="alert">
                        {message}
                      </p>
                    )}
                  </>
                )}
              </form>

              <ul className="mt-6 flex items-center gap-4" aria-label="Painted Porch Strategies on social media">
                {SOCIALS.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} (opens in a new tab)`}
                      className="block rounded-sm text-teal-foreground transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4C05E]"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Do Good ShIFt */}
          <div className="mt-12 border-t border-white/20 pt-8 text-center">
            {/* Not uppercase: capitals would flatten the ShIFt wordmark. */}
            <p className="font-display text-lg font-bold text-[#F4C05E]">
              Let's Do Good <ShIFt onDark />
            </p>
            <p className="mt-2 text-[15px] text-teal-foreground">
              To do <em>well</em>, we must also do <em>good</em>.{" "}
              <Link
                to="/about/impact#do-good-shift"
                className="font-semibold text-white underline underline-offset-4 hover:text-[#F4C05E]"
              >
                5% of your investment is donated to charity.
              </Link>
            </p>
          </div>

          {/* Legal */}
          <div className="mt-8 flex flex-col items-center gap-3 text-center text-sm text-teal-foreground">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={FOOTER_LINK}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p>
              © {new Date().getFullYear()} Painted Porch Strategies. All rights reserved. Phase Zero, P.A.T.H., and The
              Painted Porch Pillars are trademarks.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
