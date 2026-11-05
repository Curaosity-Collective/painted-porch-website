import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";

import { GhostLayer, Parallax } from "./Motion";

/*
 * Editorial building blocks for the Epic ShIFt redesign ("v3").
 * Ported from pps-simplified src/components/site/Bits.tsx and adapted to
 * React Router. The draft's <Placeholder> block is intentionally not ported:
 * public pages carry no placeholder text.
 */

export function Kicker({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "teal" }) {
  // Mid teal so the eyebrow reads distinctly from the deep-teal section headings.
  const cls = tone === "gold" ? "text-gold" : "text-primary";
  return <p className={`label-kicker ${cls}`}>{children}</p>;
}

const HERO_TONES = {
  teal: "bg-teal-deep",
  cobalt: "bg-bluedoor-deep",
  purple: "bg-strategic-deep",
  lime: "bg-lime-deep",
  prepare: "bg-prepare-ink border-t-4 border-prepare",
  align: "bg-align-ink border-t-4 border-align",
  habits: "bg-habits-ink border-t-4 border-habits",
} as const;

export function PageHero({
  kicker,
  title,
  intro,
  image,
  imageAlt,
  tone = "teal",
  ghost = "P",
}: {
  kicker: string;
  title: ReactNode;
  intro: ReactNode;
  image?: string;
  imageAlt?: string;
  tone?: keyof typeof HERO_TONES;
  ghost?: string;
}) {
  return (
    <section className={`story-hero relative overflow-hidden ${HERO_TONES[tone]} text-teal-foreground`}>
      <GhostLayer className="text-teal-foreground">{ghost}</GhostLayer>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 md:py-28 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Kicker>{kicker}</Kicker>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            {title}
          </h1>
        </div>
        <div className="lg:col-span-5">
          <p className="text-base leading-relaxed text-teal-foreground/75">{intro}</p>
        </div>
      </div>
      {image && (
        <div className="story-hero-image relative h-[38vh] overflow-hidden md:h-[52vh]">
          <Parallax speed={70} className="absolute -inset-y-16 inset-x-0">
            <img
              src={image}
              alt={imageAlt ?? ""}
              width={1408}
              height={1008}
              className="h-full w-full object-cover"
            />
          </Parallax>
        </div>
      )}
      {!image && <div className="h-10" aria-hidden />}
    </section>
  );
}

const CTA_TONES = {
  teal: { bg: "bg-teal-deep", overlay: "bg-door-gradient" },
  cobalt: { bg: "bg-bluedoor-deep", overlay: "bg-door-gradient" },
  purple: { bg: "bg-strategic-deep", overlay: "bg-strategic-deep/70" },
  lime: { bg: "bg-lime-deep", overlay: "bg-lime-deep/70" },
  prepare: { bg: "bg-prepare-ink", overlay: "bg-prepare-ink/70" },
  align: { bg: "bg-align-ink", overlay: "bg-align-ink/70" },
  habits: { bg: "bg-habits-ink", overlay: "bg-habits-ink/70" },
} as const;

export function CTABand({
  title,
  body,
  to,
  label,
  image,
  imageAlt,
  imagePositionClassName = "object-center",
  imageWidth = 1920,
  imageHeight = 1280,
  tone = "teal",
  photoProfile,
  secondary,
}: {
  title: ReactNode;
  body: string;
  /** Internal destination for the main button. */
  to: string;
  label: string;
  /** When set, renders the full-bleed photo panel instead of the linen band. */
  image?: string;
  imageAlt?: string;
  /** Explicit mobile and desktop focal positions for the photograph. */
  imagePositionClassName?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Colour identity of the page this CTA sits on. */
  tone?: keyof typeof CTA_TONES;
  /** Per-photo contrast profile class from src/styles/v3.css (e.g. "cta-photo-envision"). */
  photoProfile?: string;
  /** Optional quiet secondary action under the main button. */
  secondary?: ReactNode;
}) {
  const toneCls = CTA_TONES[tone];
  if (image) {
    return (
      <section className={`story-dark story-cta relative ${photoProfile ?? ""} ${toneCls.bg} text-teal-foreground`}>
        <div className="absolute inset-0 overflow-hidden">
          <Parallax speed={50} className="absolute -inset-y-14 inset-x-0">
            <img
              src={image}
              alt={imageAlt ?? ""}
              loading="lazy"
              width={imageWidth}
              height={imageHeight}
              className={`h-full w-full object-cover ${imagePositionClassName}`}
            />
          </Parallax>
          <div aria-hidden="true" className={`absolute inset-0 ${photoProfile ? "cta-photo-wash" : toneCls.overlay}`} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center md:py-36">
          <h2 className="font-display text-4xl font-semibold leading-tight text-shadow-cta md:text-5xl">{title}</h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-teal-foreground text-shadow-cta">{body}</p>
          <Link
            to={to}
            className="label-kicker mt-10 inline-flex items-center gap-3 bg-gold px-8 py-4 text-gold-foreground transition-colors hover:bg-linen"
          >
            {label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          {secondary && <div className="mt-6 text-sm text-teal-foreground text-shadow-cta">{secondary}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="story-cta relative bg-linen">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        <h2 className="font-display text-3xl font-semibold leading-tight text-teal-deep md:text-4xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-foreground">{body}</p>
        <Link
          to={to}
          className="label-kicker mt-10 inline-flex items-center gap-3 bg-teal-deep px-8 py-4 text-teal-foreground transition-colors hover:bg-bluedoor"
        >
          {label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        {secondary && <div className="mt-6 text-sm text-muted-foreground">{secondary}</div>}
      </div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 space-y-5 text-base leading-relaxed text-foreground after:clear-both after:block after:content-['']">
      {children}
    </div>
  );
}

export function EvidenceNote({
  emphasis,
  children,
  href,
  source,
  layout = "float",
}: {
  emphasis: string;
  children: ReactNode;
  href: string;
  source: string;
  layout?: "float" | "block";
}) {
  const frame =
    layout === "float" ? "my-6 w-full md:float-right md:my-2 md:ml-8 md:w-80 lg:w-[22rem]" : "my-6 w-full";
  return (
    <aside className={`${frame} border-l-2 border-primary/70 bg-muted/45 px-5 py-5`} aria-label="Research evidence">
      <p className="font-display text-3xl font-semibold leading-none text-teal-deep">{emphasis}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{children}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex max-w-full items-start gap-2 text-xs font-semibold leading-relaxed text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-teal-deep"
        aria-label={`${source} (opens in a new tab)`}
      >
        {source}
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      </a>
    </aside>
  );
}

const NUMBERED_TONES = {
  "teal-deep": "text-teal-deep",
  bluedoor: "text-bluedoor",
  strategic: "text-strategic",
  "lime-deep": "text-lime-deep",
  prepare: "text-prepare-deep",
} as const;

export function NumberedList({
  items,
  tone = "teal-deep",
}: {
  items: { title: string; body: string }[];
  tone?: keyof typeof NUMBERED_TONES;
}) {
  const headCls = NUMBERED_TONES[tone];
  return (
    <ol className="divide-y divide-border border-y border-border">
      {items.map((item, i) => (
        <li key={item.title} className="grid gap-4 py-8 md:grid-cols-12">
          <span className="label-kicker text-gold md:col-span-2">{String(i + 1).padStart(2, "0")}</span>
          <h3 className={`font-display text-xl font-semibold ${headCls} md:col-span-4`}>{item.title}</h3>
          <p className="text-base leading-relaxed text-foreground md:col-span-6">{item.body}</p>
        </li>
      ))}
    </ol>
  );
}
