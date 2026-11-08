import paintSplash from "@/assets/images/our-impact-hero.jpg";
import openDoors from "@/assets/images/impact-cta-begin.jpg";
import { CTABand, Kicker, PageHero, Prose, V3_H2 } from "@/components/v3/Bits";
import { ShIFt } from "@/components/v3/ShIFt";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import { SmartLink } from "@/components/pps/SmartLink";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";
import { CHARITIES } from "@/data/charities";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { CLIENT_TESTIMONIALS } from "./testimonials";

/**
 * Results & Impact: the draft site's /results and /impact pages combined
 * with the live Our Impact page, as PPS Admin directed on 2026-11-05. No case
 * studies yet: the draft's were all placeholders.
 *
 * It became /about/impact at the relaunch (plan Phase 5); the Our Impact page
 * before it is archived at /about/impact-archive.
 *
 * Figures: 28 organizations (homepage and draft site), $31,474 given (the
 * Our Impact counter), 5% of every fee. PPS Admin kept them as they are for
 * the relaunch (2026-11-05).
 * Images (PPS-DEC-0023): both come from the live Our Impact page and move
 * with it. Styling and the IF in shIFt: PPS-DEC-0022.
 */

const TITLE = "Results & Impact | Painted Porch Strategies";
const DESCRIPTION =
  "What our clients say, the organizations we've worked alongside, and where 5% of every fee has gone: $31,474 given to client-chosen charities to date.";

const LINK = "font-semibold text-heading underline decoration-heading/40 underline-offset-4 hover:decoration-heading";

const STATS = [
  { value: "28", label: "Organizations we've worked with" },
  { value: "$31,474", label: "Given to client-chosen charities to date" },
  { value: "5%", label: "Of every engagement donated, in the client's name" },
];

const TESTIMONIALS = CLIENT_TESTIMONIALS;

export default function ResultsImpact() {
  const { open: openQuiz } = usePathFinderQuiz();

  useDocumentSeo({
    title: TITLE,
    description: DESCRIPTION,
    ogImage: openDoors,
  });

  return (
    <div className="pps-v3">
      <PageHero
        kicker="Results & Impact"
        title="Proof, Not Promises"
        intro="We'd rather show you a running tally than tell you we care. Here's what clarity before commitment looks like in practice: in our clients' words, in the organizations we've worked alongside, and in where 5% of every fee has gone."
        video={{ slotKey: "impact-hero", poster: paintSplash, alt: "Teal, lime, gold, raspberry and purple paint bursting outward against a dark background" }}
        ghost="5%"
      />

      {/* The running tally */}
      <section aria-labelledby="impact-tally" className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <Kicker>Outcomes at a Glance</Kicker>
          <h2 id="impact-tally" className={`mt-5 ${V3_H2}`}>
            The Running Tally
          </h2>
          <dl className="mt-10 grid gap-10 sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-3 border-t-2 border-heading pt-6">
                <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">{s.label}</dt>
                <dd className="font-display text-5xl font-bold tabular-nums text-heading md:text-6xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* In their words */}
      <section aria-labelledby="impact-words" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Kicker>What Clients Say</Kicker>
        <h2 id="impact-words" className={`mt-5 ${V3_H2}`}>
          In Their Words
        </h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.who}>
              <figure className="rounded flex h-full flex-col border-l-4 border-gold bg-cream p-7">
                <blockquote className="flex-1">
                  {/* Italic, as on the homepage (PPS Admin, 2026-11-07). */}
                  <p className="font-display text-lg font-medium italic leading-snug text-foreground">
                    <span aria-hidden="true" className="font-bold text-raspberry">
                      “
                    </span>
                    {t.quote}”
                  </p>
                </blockquote>
                <figcaption className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                  {t.who}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <ClientLogoMarquee
        className="border-y border-border"
        heading={
          <span className="block text-[13px] font-bold uppercase tracking-[0.14em] text-[#5F6B70]">
            Organizations we've worked alongside
          </span>
        }
      />

      {/* Do Good ShIFt */}
      <section id="do-good-shift" aria-labelledby="impact-giving" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Kicker>
              Do Good <ShIFt />
            </Kicker>
            <h2 id="impact-giving" className={`mt-5 ${V3_H2}`}>
              5% of Every Fee Goes to a Charity of Your Choosing, in Your Name
            </h2>
          </div>
          <div className="lg:col-span-7">
            <Prose>
              <p>
                When an organization works with us, 5% of that investment goes straight to a cause the client chooses,
                donated in their name, not ours. Good work should compound beyond the room it happened in.
              </p>
              <p>
                Painted Porch Strategies was created to model the Stoic principles of Reason, Logic, Purpose, and
                Virtue. We follow Seneca's advice of <em>works, not words</em>, and believe that to do <em>well</em>,
                we must also do <em>good</em>.
              </p>
              <p>
                When you partner with the Painted Porch, you're not just investing in your organization. You're
                contributing to causes that can create epic <ShIFt lowercase /> in the world.
              </p>
            </Prose>
          </div>
        </div>
      </section>

      {/* Who you've helped support */}
      <section aria-labelledby="impact-charities" className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <Kicker>Who You've Helped Support</Kicker>
          <h2 id="impact-charities" className={`mt-5 max-w-3xl ${V3_H2}`}>
            The Organizations Our Clients' Engagements Support
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground">
            Every partnership makes a difference. These are the organizations that have benefited so far.
          </p>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {CHARITIES.map((c) => (
              <li key={c.name}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  // White cards with a light shadow, like Our Approach's credentials (PPS Admin, 2026-11-06), at the
                  // site's 4px card corner (PPS-DEC-0028; PPS Admin, 2026-11-08: "4px on all cards and boxes").
                  className="flex h-full flex-col items-center justify-center gap-3 rounded bg-white px-4 py-5 text-center text-sm font-semibold leading-snug text-foreground shadow-sm transition-shadow hover:text-heading hover:shadow-md"
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${new URL(c.href).hostname}&sz=64`}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    className="h-8 w-8 object-contain"
                  />
                  <span>
                    {c.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why it's built in */}
      <section aria-labelledby="impact-why" className="mx-auto max-w-4xl px-6 py-20 md:py-24">
        <Kicker>Why It's Built In</Kicker>
        <h2 id="impact-why" className={`mt-5 ${V3_H2}`}>
          Stewardship Is Part of the Architecture
        </h2>
        <Prose>
          <p>
            We ask organizations to build for the long term: to think about what their choices sustain. It would be
            strange to run our own practice any other way. Giving isn't a campaign here; it's load-bearing.
          </p>
          <p>
            It also keeps us honest about who we want as clients. The leaders who light up at this page tend to be the
            ones building organizations worth carrying change.
          </p>
          <p>
            Serious about the work, not about the way. If you're the kind of leader who reads an impact page before a
            services page, we'll probably get along.{" "}
            <SmartLink to="/about" className={LINK}>
              <span>Meet the practice →</span>
            </SmartLink>
          </p>
        </Prose>
      </section>

      <CTABand
        title="Do Work That Goes Further"
        body="Every journey starts with a Clarity Call, and 5% of the fee goes somewhere good while you're at it."
        to={clarityCallSectionHref()}
        label="Start with a Clarity Call"
        image={openDoors}
        photoProfile="cta-photo-charcoal"
        imageAlt="Open double doors onto a sunlit garden path"
        imageWidth={1920}
        imageHeight={1080}
        secondary={
          <>
            Not sure yet?{" "}
            <button type="button" onClick={openQuiz} className="font-semibold underline underline-offset-4">
              Find Your Next <ShIFt onDark />
            </button>
          </>
        }
      />
    </div>
  );
}
