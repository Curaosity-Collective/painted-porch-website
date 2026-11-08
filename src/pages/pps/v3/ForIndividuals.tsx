import type { ComponentType, ReactNode } from "react";
import { ArrowRight, CheckCircle, Compass, Layers, Lightbulb, Target } from "lucide-react";
import igniteHeroFlame from "@/assets/ignite-hero-flame.jpg";
import paintedWall from "@/assets/ignite-final-cta-bg.jpg";
import { CTABand, Kicker, PageHero, V3_H2 } from "@/components/v3/Bits";
import { ShIFt } from "@/components/v3/ShIFt";
import { SmartLink } from "@/components/pps/SmartLink";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { getSiteUrl } from "@/lib/site-url";

/**
 * For Individuals (/for-individuals): the retired IGNITE page, repurposed for individual leaders, with
 * Leadership Labs brought in from the retired AMPLIFY page (outline approved by PPS Admin, 2026-11-07).
 *
 * - The IGNITE names and P.A.T.H.way badges stay retired (PPS-DEC-0025).
 * - No "Phase Zero foundations": Phase Zero is an organization's Prepare and Align work (PPS-DEC-0027).
 * - No prices: they stay on each offering's own page.
 * - The four types keep IGNITE's colour shading; titles and icons use AA-passing inks on their tints.
 * - The hero is IGNITE's spark animation (site_videos slot "ignite-hero"), under the title as on the
 *   ShIFt pages, with a pause button.
 * - /partner/ignite and /ignite forward here (src/config/movedPages.ts).
 */

const TITLE = "For Individual Leaders | Painted Porch Strategies";
const DESCRIPTION =
  "Assessments, masterclasses and mini courses, and Leadership Labs for leaders investing in their own growth: on your own schedule, or alongside peers.";

type Tint = { card: string; iconBg: string; ink: string };

const TINTS: Record<"gold" | "teal" | "lime" | "purple", Tint> = {
  gold: { card: "bg-gold/10 border-gold/40", iconBg: "bg-gold/25", ink: "text-[#8A5A00]" },
  teal: { card: "bg-primary/10 border-primary/30", iconBg: "bg-primary/20", ink: "text-heading" },
  lime: { card: "bg-lime/10 border-lime/40", iconBg: "bg-lime/20", ink: "text-lime-deep" },
  purple: { card: "bg-strategic/10 border-strategic/30", iconBg: "bg-strategic/20", ink: "text-strategic" },
};

const TYPES: { title: string; icon: ComponentType<{ className?: string }>; tint: Tint; traits: string[] }[] = [
  {
    title: "The Curious Explorer",
    icon: Compass,
    tint: TINTS.gold,
    traits: [
      "You're curious about how we approach change",
      "You want to test the frameworks before a bigger commitment",
      "You're asking, “Could this work for me?”",
      "You prefer to learn at your own pace",
    ],
  },
  {
    title: "The Individual Innovator",
    icon: Lightbulb,
    tint: TINTS.teal,
    traits: [
      "You're investing in your own leadership development",
      "Your organization doesn't sponsor training",
      "You want to build capacity on your own",
      "You're stepping into strategic authorship",
    ],
  },
  {
    title: "The Strategic Seeker",
    icon: Target,
    tint: TINTS.lime,
    traits: [
      "You want to test the ideas with a small group first",
      "Your organization is exploring its options",
      "You need proof before a larger investment",
      "You're building the case for broader adoption",
    ],
  },
  {
    title: "The Foundation Fortifier",
    icon: Layers,
    tint: TINTS.purple,
    traits: [
      "You've seen quick fixes or wins fade and want something that lasts",
      "You see strategic capacity as the starting point",
      "You want frameworks, not just tips",
      "You're ready to build the foundation before the next change",
    ],
  },
];

const OPTIONS: { title: string; body: ReactNode; inside: string[]; bestWhen: string; to: string; cta: string }[] = [
  {
    title: "Assessments",
    body: "Decode what drives your success. Reveal your emotional intelligence, your strengths and the talents that make you extraordinary.",
    inside: ["Comprehensive report", "Optional personal debrief", "Action recommendations", "Development roadmap"],
    bestWhen: "you want to see your strengths, and how you lead, before choosing what to develop.",
    to: "/assessments",
    cta: "Explore Assessments",
  },
  {
    title: "Masterclasses & Mini Courses",
    body: (
      <>
        Strategic insight in under 90 minutes, one small <ShIFt lowercase /> at a time.
      </>
    ),
    inside: ["30–90 minute focused sessions", "Live and recorded access", "Immediately actionable"],
    bestWhen: "you want a focused insight on one topic, on your own schedule.",
    to: "/masterclasses",
    cta: "Explore Masterclasses",
  },
  {
    title: "Leadership Labs",
    body: "Grow alongside peers who are as committed as you are: structured, guided development with real accountability.",
    inside: [
      "6–12 week cohorts",
      "Peer learning and accountability",
      "Individual coaching touchpoints",
      "Up to 25 leaders from different organizations",
    ],
    bestWhen: "you want depth, community and structure that go beyond self-study.",
    to: "/leadership-labs",
    cta: "Explore Leadership Labs",
  },
];

const NEXT: { title: string; body: ReactNode; to: string; cta: ReactNode }[] = [
  {
    title: "Bring it to your team",
    body: "Team Workshops for leadership and cross-functional teams.",
    to: "/workshops",
    cta: "Explore Team Workshops",
  },
  {
    title: "Lead change across your organization",
    body: (
      <>
        The Epic <ShIFt /> Organizational Appraisal shows what change your organization can carry, and what needs to
        hold first.
      </>
    ),
    to: "/envision-shift",
    cta: (
      <>
        Explore Envision <ShIFt />
      </>
    ),
  },
];

const LINK = "inline-flex items-center gap-1.5 font-semibold text-heading underline decoration-heading/40 underline-offset-4 hover:decoration-heading";

export default function ForIndividuals() {
  const { open: openGuide } = usePathFinderQuiz();

  useDocumentSeo({
    title: TITLE,
    description: DESCRIPTION,
    ogImage: igniteHeroFlame,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "For Individual Leaders",
      description: DESCRIPTION,
      url: `${getSiteUrl()}/for-individuals`,
      publisher: { "@type": "Organization", name: "Painted Porch Strategies" },
    },
  });

  return (
    <div className="pps-v3">
      <PageHero
        kicker="For Individual Leaders"
        title={
          <>
            Spark Your Next <ShIFt onDark />, at Your Own Pace
          </>
        }
        intro="Assessments, masterclasses and mini courses, and Leadership Labs for leaders investing in their own growth: on your own schedule, or alongside peers."
        action={{
          label: (
            <>
              Find Your Next <ShIFt onFill />
            </>
          ),
          onClick: openGuide,
        }}
        video={{ slotKey: "ignite-hero", poster: igniteHeroFlame, alt: "Sparks of colored light rising like a flame" }}
        ghost="S"
      />

      {/* Who it's for */}
      <section aria-labelledby="who" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Kicker>Who It's For</Kicker>
        <h2 id="who" className={`mt-5 ${V3_H2}`}>
          Designed for…
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TYPES.map((t) => (
            <li key={t.title} className={`rounded border p-6 ${t.tint.card}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.tint.iconBg}`}>
                  <t.icon className={`h-5 w-5 ${t.tint.ink}`} aria-hidden />
                </span>
                <h3 className={`font-display text-xl font-bold leading-tight ${t.tint.ink}`}>{t.title}</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {t.traits.map((trait) => (
                  <li key={trait} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                    <CheckCircle className={`mt-0.5 h-4 w-4 shrink-0 ${t.tint.ink}`} aria-hidden />
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-lg font-semibold text-foreground">
          If any of these spark a &ldquo;<ShIFt /> yeah!&rdquo;, start below.
        </p>
      </section>

      {/* Three ways to grow */}
      <section id="options" aria-labelledby="options-title" className="scroll-mt-24 bg-linen">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Kicker>Three Ways to Grow</Kicker>
          <h2 id="options-title" className={`mt-5 ${V3_H2}`}>
            Start Where You're Pulled
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {OPTIONS.map((o) => (
              <li key={o.title} className="rounded flex flex-col border border-border bg-white p-6">
                <h3 className="font-display text-xl font-bold text-heading">{o.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground">{o.body}</p>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-foreground">What's inside</p>
                <ul className="mt-2 space-y-1.5">
                  {o.inside.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-heading" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-l-2 border-raspberry pl-3 text-sm leading-relaxed text-foreground">
                  <span className="font-semibold">Best when</span> {o.bestWhen}
                </p>
                <div className="mt-auto pt-6">
                  <SmartLink to={o.to} className={LINK}>
                    <span>{o.cta}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </SmartLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* From spark to momentum */}
      <section aria-labelledby="next" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Kicker>What Comes Next</Kicker>
        <h2 id="next" className={`mt-5 ${V3_H2}`}>
          From Spark to Momentum
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground">
          When you're ready to bring it to your team or your organization:
        </p>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {NEXT.map((n) => (
            <li key={n.title} className="rounded flex flex-col border border-border bg-linen p-6">
              <h3 className="font-display text-xl font-bold text-heading">{n.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{n.body}</p>
              <div className="mt-auto pt-5">
                <SmartLink to={n.to} className={LINK}>
                  <span>{n.cta}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </SmartLink>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing: the retired IGNITE page's own closing photo, a painted brick wall, under a charcoal wash so
          the band stands apart from the teal footer (PPS Admin, 2026-11-07). */}
      <CTABand
        title={
          <>
            What <ShIFt onDark /> Will You Spark First?
          </>
        }
        body={
          <>
            One assessment, one masterclass or one Lab. Not sure where to start? Find Your Next <ShIFt onDark />{" "}
            points you to the right one.
          </>
        }
        onClick={openGuide}
        label={
          <>
            Find Your Next <ShIFt onFill />
          </>
        }
        image={paintedWall}
        imageAlt="A brick wall painted in bold blocks of red, blue, green, yellow and pink"
        imageWidth={1368}
        imageHeight={1824}
        photoProfile="cta-photo-charcoal"
      />
    </div>
  );
}
