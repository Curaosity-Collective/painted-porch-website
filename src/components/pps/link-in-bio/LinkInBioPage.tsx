import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import ppsLogo from "@/assets/pps-logo.png";

/**
 * The shared layout for the link-in-bio pages (/amy, /rob, /sierra), built for a
 * tap from a social bio (PPS Admin, 2026-11-09: "link in bio" fast links for socials
 * that highlights who we are, a short about and a couple offers or resources).
 *
 * Order: photo, name, title and one line; the links; two featured offers or
 * resources; a short about; socials; the Painted Porch mark. Offers that haven't
 * launched are left out (PPS Admin: "Skip coming soons"). These pages render outside
 * PPSLayout, so they set the new design's skin and the button classes themselves.
 */

export interface BioLink {
  label: ReactNode;
  /** Plain text for keys and accessible names when `label` holds markup. */
  text: string;
  href: string;
  external?: boolean;
}

export interface FeaturedItem {
  kicker: string;
  title: ReactNode;
  text: string;
  description: ReactNode;
  href: string;
  external?: boolean;
  cta: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

/** Each person's accent, carried over from their old page: Amy teal, Rob slate, Sierra gold. */
export type BioAccent = "teal" | "slate" | "gold";

const ACCENTS: Record<BioAccent, { ring: string; cardTop: string }> = {
  teal: { ring: "border-primary", cardTop: "border-t-primary" },
  slate: { ring: "border-muted-foreground", cardTop: "border-t-muted-foreground" },
  gold: { ring: "border-gold", cardTop: "border-t-gold" },
};

export interface LinkInBioProps {
  accent: BioAccent;
  seo: { title: string; description: string; canonical: string };
  photo: string;
  photoAlt: string;
  name: string;
  title: string;
  intro: ReactNode;
  links: BioLink[];
  featured: FeaturedItem[];
  aboutHeading: string;
  about: ReactNode;
  socials: SocialLink[];
}

const BUTTON_BASE =
  "cta-label flex w-full items-center justify-between gap-3 rounded px-5 py-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function SmartLink({
  href,
  external,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  external?: boolean;
  className: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function LinkInBioPage({
  accent,
  seo,
  photo,
  photoAlt,
  name,
  title,
  intro,
  links,
  featured,
  aboutHeading,
  about,
  socials,
}: LinkInBioProps) {
  useDocumentSeo(seo);
  const tone = ACCENTS[accent];

  return (
    <div className="v3-skin min-h-screen bg-cream">
      {/* ── WHO ─────────────────────────────────────────────────────────── */}
      <header className="bg-teal-deep px-4 pb-20 pt-12 text-center text-teal-foreground">
        <div className="mx-auto max-w-md">
          <div className={`mx-auto h-32 w-32 overflow-hidden rounded-full border-4 ${tone.ring} shadow-lg ring-2 ring-white/80`}>
            <img src={photo} alt={photoAlt} className="h-full w-full object-cover" loading="eager" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight">{name}</h1>
          <p className="label-kicker mt-2 text-[#F4C05E]">{title}</p>
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-teal-foreground/90">{intro}</p>
        </div>
      </header>

      <main className="mx-auto -mt-12 max-w-md px-4 pb-12">
        {/* ── LINKS ───────────────────────────────────────────────────── */}
        <nav aria-label={`${name}'s links`} className="flex flex-col gap-3">
          {links.map((link, i) => (
            <SmartLink
              key={link.text}
              href={link.href}
              external={link.external}
              className={
                i === 0
                  ? `${BUTTON_BASE} bg-gold text-gold-foreground shadow-md hover:bg-linen`
                  : `${BUTTON_BASE} border border-border bg-white text-heading shadow-sm hover:border-primary`
              }
            >
              <span>{link.label}</span>
              {link.external ? (
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
            </SmartLink>
          ))}
        </nav>

        {/* ── FEATURED ────────────────────────────────────────────────── */}
        <section aria-labelledby="featured-heading" className="mt-12">
          <h2 id="featured-heading" className="font-display text-2xl font-bold text-heading">
            Start Here
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {featured.map((item) => (
              <SmartLink
                key={item.text}
                href={item.href}
                external={item.external}
                className={`group block rounded border border-border border-t-4 ${tone.cardTop} bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}
              >
                <p className="label-kicker text-raspberry">{item.kicker}</p>
                <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-heading">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {item.cta}
                  {item.external ? (
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  )}
                </span>
              </SmartLink>
            ))}
          </div>
        </section>

        {/* ── ABOUT ───────────────────────────────────────────────────── */}
        <section aria-labelledby="about-heading" className="mt-12">
          <h2 id="about-heading" className="font-display text-2xl font-bold text-heading">
            {aboutHeading}
          </h2>
          <div className="mt-3 space-y-3 text-base leading-relaxed text-foreground/85">{about}</div>
        </section>

        {/* ── SOCIALS ─────────────────────────────────────────────────── */}
        <section aria-labelledby="socials-heading" className="mt-12">
          <h2 id="socials-heading" className="font-display text-2xl font-bold text-heading">
            Follow Along
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary"
                >
                  {s.label}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* ── PAINTED PORCH ─────────────────────────────────────────────── */}
      <footer className="border-t border-border px-4 py-8 text-center">
        <Link to="/" className="inline-block" aria-label="Painted Porch Strategies home">
          <img src={ppsLogo} alt="Painted Porch Strategies" className="mx-auto h-12 w-auto" loading="lazy" />
        </Link>
      </footer>
    </div>
  );
}
