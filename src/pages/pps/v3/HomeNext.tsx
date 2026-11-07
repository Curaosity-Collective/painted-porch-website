import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Lightbulb } from "lucide-react";
import porchColumns from "@/assets/v3/painted-porch-columns.jpg";
import amySquare from "@/assets/v3/amy-yackowski-square.jpg";
import { ShIFt } from "@/components/v3/ShIFt";
import { FEATURED_TESTIMONIALS } from "./testimonials";
import { SmartLink } from "@/components/pps/SmartLink";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { CLARITY_CALL_CONTACT_HREF, CLARITY_CALL_TOPICS, clarityCallHrefFor, clarityCallTopicFrom } from "@/config/epicShiftAppraisal";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useFeaturedPosts } from "@/hooks/useFeaturedPosts";

/**
 * The go-forward homepage, built from the homepage wireframe PPS Admin approved
 * on 2026-11-05. It became the homepage at the relaunch (plan Phase 5); the
 * homepage before it is archived at /home-archive-v2.
 *
 * Spec: pps-ops-hub docs/wireframes/PPS-Homepage-v3-Approved-Wireframe.md
 * Color and type rules: PPS-DEC-0022. Offer names: PPS-DEC-0018.
 */

const SECTION = "mx-auto max-w-[1200px] px-5 py-14 md:px-6 md:py-24";
const H2 =
  "font-display text-[30px] font-bold leading-[1.12] text-primary [text-wrap:balance] md:text-[40px] lg:text-[48px]";
const H3 = "font-display text-xl font-semibold leading-tight text-foreground md:text-2xl";
const LINK = "font-bold text-primary underline underline-offset-4 hover:text-primary/80";
const GOLD_BUTTON =
  "inline-flex min-h-[52px] items-center gap-2.5 rounded bg-gold px-7 text-[17px] font-bold text-[#1E2B30] transition-colors hover:bg-gold/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

function Eyebrow({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <p
      className={`text-[13px] font-bold uppercase tracking-[0.14em] ${onDark ? "text-[#F4C05E]" : "text-raspberry"}`}
    >
      {children}
    </p>
  );
}

const THREE_AM = [
  "What are we truly being called to build?",
  "What if our boldest initiatives landed as big as the vision we started with?",
  "What becomes possible when our ambition, our leaders, and our architecture finally pull in the same direction?",
];

const STANDARD: { letter: string; label: string; body: ReactNode }[] = [
  {
    letter: "E",
    label: "Envision further",
    body: "Refuse to let the last plan set the ceiling, and own what your organization is actually capable of becoming.",
  },
  {
    letter: "P",
    label: "Phase out the inherited",
    body: "The old playbooks, meetings, beliefs, and reflexes that tax momentum before you ever take off.",
  },
  {
    letter: "I",
    label: "Inhabit what's new",
    body: "Change becomes the way things are done: the shared cadence and decision rituals that outlast any single initiative.",
  },
  {
    letter: "C",
    label: "Co-create what's next",
    body: (
      <>
        The architecture your leaders own, so extraordinary teams make <ShIFt lowercase /> happen when you're not in
        the room.
      </>
    ),
  },
];

// Pillar colors are shared with the client report (PPS-DEC-0022, item 3).
const PILLARS = [
  {
    name: "Cultural Cornerstone",
    question: "Who authors and carries the work",
    body: "Leadership, culture, values, and the relationships that shape how your organization leads, decides, and evolves.",
    bar: "border-navy",
    label: "text-navy",
  },
  {
    name: "Operational Frame",
    question: "How decisions and work move",
    body: "Systems, workflows, structures, and the decision paths that move strategy from intention into reality.",
    bar: "border-strategic",
    label: "text-strategic",
  },
  {
    name: "Living Ecosystem",
    question: "How people use judgment and grow",
    body: (
      <>
        The individual and collective capacity, judgment, and communication that keep a meaningful{" "}
        <ShIFt lowercase /> going.
      </>
    ),
    bar: "border-gold",
    label: "text-[#8A5A00]",
  },
];

const STAGES = [
  { letter: "P", name: "Prepare", question: "What are we actually built to carry?", bar: "border-prepare", ink: "text-prepare-deep" },
  { letter: "A", name: "Align", question: "Does the room actually agree, on the same thing?", bar: "border-align", ink: "text-align-deep" },
  { letter: "T", name: "Take Off", question: "How do we launch so the vision holds?", bar: "border-gold", ink: "text-[#8A5A00]" },
  { letter: "H", name: "Habits", question: "What keeps this from evaporating?", bar: "border-habits", ink: "text-habits-deep" },
];

const OFFERS = [
  {
    tag: "Prepare · Name It",
    band: "bg-prepare",
    tagInk: "text-[#073B4C]",
    name: "Envision",
    to: "/envision-shift",
    body: (
      <>
        An honest read of what your organization can carry before you commit: the Epic <ShIFt /> Organizational
        Appraisal, six interviews from executives to the frontline.
      </>
    ),
    note: "Begins with a Clarity Call",
    cta: "Explore Envision",
  },
  {
    tag: "Align · Shape It",
    band: "bg-align",
    tagInk: "text-[#5A1420]",
    name: "Architect",
    to: "/architect-shift",
    body: "Your senior team works the same evidence, agrees on what must hold first, and fortifies those structures and capabilities before you execute.",
    note: "Weekly or biweekly cadence",
    cta: "Explore Architect",
  },
  {
    tag: "Take Off and Habits · Become It",
    band: "bg-habits",
    tagInk: "text-[#1F3A0C]",
    name: "Embody",
    to: "/embody-shift",
    body: (
      <>
        The invitation at Take Off. Retained advisory while your team designs and leads its own Epic <ShIFt />,
        reinforcing the habits that make it how you work.
      </>
    ),
    note: "Retained monthly advisory",
    cta: "Explore Embody",
  },
];

const TESTIMONIALS = FEATURED_TESTIMONIALS;

const PROMISE = [
  {
    label: "If yes",
    box: "bg-lime-deep text-white",
    body: (
      <>
        We co-architect what it takes to author and shape your next <ShIFt lowercase onFill />.
      </>
    ),
  },
  {
    label: "If not yet",
    // Green, yellow, red (PPS Admin, 2026-11-06). Gold takes dark text: white on Gold is
    // 2.2:1, #1E2B30 is 7:1 (PPS-DEC-0022).
    box: "bg-gold text-[#1E2B30]",
    body: "We tell you the truth, and create a map to build the capacity you need first.", // PPS Admin, 2026-11-06
  },
  {
    label: "If not us",
    box: "bg-raspberry text-white",
    body: "We tell you that, too, and connect you with the right partner for your stage.",
  },
];

const OTHER_WAYS = [
  // No price here (PPS-DEC-0022). Workshops start at $7,500; each one's price is on the
  // Workshops page (PPS Admin, 2026-11-05).
  { title: "Team Workshops", to: "/workshops", body: "For leadership and cross-functional teams." },
  { title: "Speaking", to: "/speaking", body: "Keynotes from Amy Yackowski, Rob Hunter and Sierra Cantrell." },
  { title: "For individuals", to: "/for-individuals", body: "Assessments, masterclasses and mini courses, and Leadership Labs, in one place." },
];

export default function HomeNext() {
  const { open: openQuiz } = usePathFinderQuiz();
  const { data: posts } = useFeaturedPosts(3);
  // Clarity Call links elsewhere land on this page's Clarity Call section and carry their
  // topic (?clarity=architect), which the section's Book button passes on to the form.
  const [searchParams] = useSearchParams();
  const clarityTopic = clarityCallTopicFrom(searchParams.get("clarity"));
  const bookClarityCallHref = clarityTopic ? clarityCallHrefFor(CLARITY_CALL_TOPICS[clarityTopic]) : CLARITY_CALL_CONTACT_HREF;

  useDocumentSeo({
    title: "Painted Porch Strategies | Build an Organization That Can Do Epic ShIFt",
    description:
      "You have a vision for who your organization can become next. Is that future being authored with intention, or inherited through assumption?",
  });

  return (
    <div className="bg-white text-foreground">
      {/* 1 · Hero: headline and photo as one piece */}
      <section aria-labelledby="home-hero-heading" className="v3-under-header relative overflow-hidden bg-[#0B3A44]">
        <img
          src={porchColumns}
          alt="A columned porch painted blue, purple, lime and gold, looking out over a city at sunrise"
          width={1264}
          height={848}
          className="absolute inset-0 h-full w-full object-cover object-[78%_50%] md:object-[50%_42%]"
        />
        {/* Light overlay across the photo, deepening toward the text side on tablets and desktops; on phones the
            shade travels with the text block, below. */}
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(4,40,50,0.2)] md:hidden" />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(4,40,50,0.86) 0%, rgba(4,40,50,0.7) 32%, rgba(4,40,50,0.2) 52%, rgba(4,40,50,0) 66%), linear-gradient(rgba(4,40,50,0.2), rgba(4,40,50,0.2))",
          }}
        />
        {/* The whole text block fits the first screen on phones, tablets and laptops (PPS Admin, 2026-11-07):
            on phones the hero is one screen tall with the text at the bottom and the photo filling whatever is
            left above, and short phones tighten the type and spacing. From tablet width up, the padding, gaps,
            headline and paragraph scale down with the screen's height on screens under about 820px tall (a
            landscape tablet, a 1366x768 laptop); taller screens keep the approved sizes. */}
        <div className="relative mx-auto flex min-h-[calc(100svh-var(--site-header-h))] max-w-[1200px] flex-col justify-end px-5 pb-7 pt-10 md:min-h-[min(660px,calc(100svh-var(--site-header-h)))] md:justify-center md:px-6 md:py-[clamp(24px,calc(100svh-744px),96px)]">
          <div className="relative isolate flex max-w-[560px] flex-col gap-4 md:gap-[clamp(12px,calc(5svh-18px),22px)] [@media(max-width:767px)_and_(max-height:600px)]:gap-3">
            {/* Phones: the shade starts above the eyebrow and runs to the bottom of the hero, however tall the
                screen and however the text wraps. */}
            <div
              aria-hidden="true"
              className="absolute -bottom-7 -left-5 -top-24 -z-10 w-[100vw] md:hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(4,40,50,0) 0, rgba(4,40,50,0.82) 96px, rgba(4,40,50,0.94) 100%)",
              }}
            />
            {/* Tablets and up: on top of the side shade above, a soft shade behind the text block only, fading
                out at its edges, so the pillars around the text stay bright (PPS Admin, 2026-11-07: "JUST darken
                the area behind the text as a gradient"; "Too much of the pillars get hidden if its too dark"; then,
                choosing between the mock-ups, "I like the option that includes the side shade"). It keeps the
                bright IF at 3:1 or better over the photo, as PPS-DEC-0022 item 6 requires, without changing the
                IF's color. */}
            <div
              aria-hidden="true"
              className="absolute -inset-x-14 -inset-y-9 -z-10 hidden rounded-[48px] bg-[rgba(4,40,50,0.8)] blur-[40px] md:block"
            />
            <Eyebrow onDark>Are You Built for What's Next?</Eyebrow>
            <h1
              id="home-hero-heading"
              className="font-display text-[36px] font-bold leading-[1.04] tracking-[-0.01em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.3)] [text-wrap:balance] md:text-[length:clamp(40px,calc(14svh-38px),56px)] lg:text-[length:clamp(40px,calc(14svh-38px),72px)] [@media(max-width:767px)_and_(max-height:600px)]:text-[32px]"
            >
              Build an Organization That Can Do Epic <ShIFt onDark large />
            </h1>
            <p className="max-w-[30em] text-[17px] leading-normal text-[#F1F6F7] [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] md:text-[length:clamp(17px,calc(2.5svh+1px),20px)] md:leading-[1.4] [@media(max-width:767px)_and_(max-height:600px)]:text-base">
              You have a vision for who your organization can become next. Is that future being authored with
              intention, or inherited through assumption?
            </p>
            <div className="flex flex-col items-start gap-2.5">
              <button type="button" onClick={openQuiz} className={`${GOLD_BUTTON} focus-visible:outline-white`}>
                <span>
                  Find Your Next <ShIFt onFill />
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-sm text-[#E3EFF1]">A three-minute guide to where your journey begins.</p>
            </div>
            <a
              href="#clarity-call"
              className="self-start font-semibold text-white underline underline-offset-4 hover:text-white/85"
            >
              Or book a Clarity Call →
            </a>
          </div>
        </div>
      </section>

      {/* 2 · It's not just you */}
      <section aria-labelledby="home-recognition" className="bg-cream">
        <div className={`${SECTION} grid gap-12 lg:grid-cols-2 lg:gap-[72px]`}>
          <div className="flex min-w-0 flex-col gap-5">
            <Eyebrow>It's Not Just You</Eyebrow>
            <h2 id="home-recognition" className={H2}>
              There's a Lot of <ShIFt /> Happening Right Now
            </h2>
            <p className="max-w-[34em] text-[17px] leading-relaxed">
              Leaders are carrying more change than their organizations were built to hold. The strategy makes sense in
              the boardroom, then shifts somewhere between the announcement and the people bringing it to life. The
              change moves forward, just not as far as you knew it could.
            </p>
            <figure className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
              <span className="font-display text-[56px] font-bold leading-none text-raspberry md:text-[72px]">73%</span>
              <figcaption className="min-w-0 flex-1 basis-60 text-base leading-relaxed">
                More than 73% of respondents said their organizations were near, at, or beyond change saturation.{" "}
                <a
                  href="https://www.prosci.com/blog/6-strategies-for-reducing-change-saturation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline underline-offset-2"
                >
                  Prosci, 6 Strategies for Reducing Change Saturation
                </a>
              </figcaption>
            </figure>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
              The 3 AM questions that decide what you build next
            </h3>
            <ul className="flex flex-col gap-3">
              {THREE_AM.map((q) => (
                <li key={q} className="bg-white px-5 py-4 italic leading-normal">
                  “{q}”
                </li>
              ))}
            </ul>
            <blockquote className="mt-3 font-display text-[22px] font-semibold italic leading-snug text-primary md:text-[28px]">
              Your organization is becoming something. The only question is whether you're the{" "}
              <span className="text-raspberry">author</span> of it or the audience.
            </blockquote>
          </div>
        </div>
      </section>

      {/* 3 · The Standard */}
      <section aria-labelledby="home-standard" className="bg-white">
        <div className={`${SECTION} flex flex-col gap-10`}>
          <div className="flex max-w-[860px] flex-col gap-5">
            <Eyebrow>The Standard</Eyebrow>
            <h2 id="home-standard" className={H2}>
              What Does It Mean to Do Epic <ShIFt />?
            </h2>
            <p className="max-w-[40em] text-[17px] leading-relaxed">
              To do epic <ShIFt lowercase /> is to reject the idea that organizational drift and resistance are
              inevitable. It means turning ambition into an architectural discipline, and holding yourself to it when
              the stakes are highest.
            </p>
          </div>
          <ul className="grid gap-x-14 gap-y-8 md:grid-cols-2">
            {STANDARD.map((item) => (
              <li key={item.letter} className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-[18px] gap-y-1">
                <span
                  aria-hidden="true"
                  className="row-span-2 font-display text-[56px] font-bold leading-none text-raspberry"
                >
                  {item.letter}
                </span>
                <span className="font-display text-xl font-semibold leading-tight text-foreground">{item.label}</span>
                <span className="leading-relaxed">{item.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 · Three things at once (the Painted Porch Pillars) */}
      <section aria-labelledby="home-pillars" className="bg-cream">
        <div className={`${SECTION} flex flex-col gap-10`}>
          <div className="flex max-w-[860px] flex-col gap-5">
            <Eyebrow>The Painted Porch Pillars™</Eyebrow>
            <h2 id="home-pillars" className={H2}>
              Every Major <ShIFt /> Changes Three Things at Once
            </h2>
            <p className="max-w-[40em] text-[17px] leading-relaxed">
              A good idea still meets the organization you already have. Before anything is built, we read all three.
            </p>
          </div>
          <ul className="grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.name} className={`flex flex-col gap-3 border-t-8 bg-white p-7 ${p.bar}`}>
                <span className={`text-xs font-bold uppercase tracking-[0.14em] ${p.label}`}>{p.name}</span>
                <h3 className={H3}>{p.question}</h3>
                <p className="text-base leading-relaxed">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-raspberry">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 py-10 md:flex-row md:items-center md:gap-16 md:px-6 md:py-16">
            <p className="font-display text-[28px] font-bold leading-tight text-white md:flex-1 md:text-[36px] lg:text-[42px]">
              AI can accelerate change. It cannot author it.
            </p>
            <p className="text-lg leading-relaxed text-white md:flex-1">
              AI can expand the options in front of you. Your leaders still hold the ownership, context, and conviction to
              choose what comes next, and to build an organization capable of carrying it.
            </p>
          </div>
        </div>
      </section>

      {/* 5 · The P.A.T.H.: four stages of change, three ShIFts that partner on them */}
      <section aria-labelledby="home-path" className="bg-white">
        <div className={`${SECTION} flex flex-col gap-10`}>
          <div className="flex max-w-[860px] flex-col gap-5">
            <Eyebrow>The P.A.T.H.™</Eyebrow>
            <h2 id="home-path" className={H2}>
              Who Is Your Organization Becoming?
            </h2>
            <p className="max-w-[40em] text-[17px] leading-relaxed">
              The P.A.T.H. is the four stages of change: Prepare, Align, Take Off, Habits. Most change work starts at
              Take Off. Ours starts at Phase Zero™, which spans Prepare and Align: the first act of becoming, before
              your next major decision hardens into execution.
            </p>
            <SmartLink to="/the-path" className={`self-start text-[15px] ${LINK}`}>
              <span>See the full P.A.T.H. →</span>
            </SmartLink>
          </div>
          <ol aria-label="The four stages of change" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s) => (
              <li key={s.name} className={`flex flex-col gap-1.5 border-t-[6px] pt-3.5 ${s.bar}`}>
                <span className="font-display text-xl font-bold leading-tight text-foreground">
                  <span className={s.ink}>{s.letter}</span> · {s.name}
                </span>
                <span className="text-[15px] italic leading-normal">{s.question}</span>
              </li>
            ))}
          </ol>
          <h3 className={H3}>
            Four stages. Three <ShIFt plural />. One map.
          </h3>
          <ul aria-label="How we partner on each stage" className="-mt-4 grid gap-6 lg:grid-cols-3">
            {OFFERS.map((o) => (
              <li key={o.name} className="flex flex-col border border-[#E6E1D6] bg-white">
                <div className={`px-6 py-4 ${o.band}`}>
                  <span className={`text-[13px] font-bold uppercase tracking-[0.14em] ${o.tagInk}`}>{o.tag}</span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <span className="font-display text-2xl font-semibold leading-tight text-foreground">
                    {o.name} <ShIFt />
                  </span>
                  <p className="text-base leading-relaxed">{o.body}</p>
                  <p className="mt-auto pt-2 text-[15px] font-semibold text-foreground">{o.note}</p>
                  <SmartLink to={o.to} className={`self-start text-[15px] ${LINK}`}>
                    {o.cta} →
                  </SmartLink>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
            <a
              href="#clarity-call"
              className="inline-flex min-h-[48px] items-center rounded border-2 border-primary px-6 font-bold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Start with a Clarity Call
            </a>
            <span className="text-[15px]">Not sure where you are? Start with a 60-minute conversation.</span>
          </div>
        </div>
      </section>

      {/* 6 · In practice */}
      <section aria-labelledby="home-proof" className="bg-cream">
        <div className={`${SECTION} grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-[72px]`}>
          <div className="flex min-w-0 flex-col gap-5">
            <Eyebrow>In Practice</Eyebrow>
            <h2 id="home-proof" className={H2}>
              Our Clients Doing Epic <ShIFt />
            </h2>
            <p className="text-[17px] leading-relaxed">
              The leaders who come to the Painted Porch can already see a greater possibility. They want a partner who
              will name it with them, test it honestly, and co-architect the organization capable of carrying it.
            </p>
            <p className="text-[17px] font-semibold leading-relaxed">
              28 organizations and counting. And 5% of every fee goes to a charity of the client's choosing, in their
              name.
            </p>
            <SmartLink to="/about/impact" className={`self-start text-[15px] ${LINK}`}>
              See results and impact →
            </SmartLink>
          </div>
          <ul className="flex min-w-0 flex-col gap-7">
            {TESTIMONIALS.map((t) => (
              <li key={t.who}>
                <blockquote>
                  <p className="font-display text-lg font-medium italic leading-snug text-foreground md:text-xl">
                    <span aria-hidden="true" className="font-bold text-raspberry">
                      “
                    </span>
                    {t.quote}”
                  </p>
                  <footer className="mt-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5F6B70]">
                    {t.who}
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ClientLogoMarquee
        heading={
          <span className="block text-[13px] font-bold uppercase tracking-[0.14em] text-[#5F6B70]">
            Our partners and clients making <ShIFt lowercase /> happen
          </span>
        }
      />

      {/* 7 · The Painted Porch Promise */}
      <section aria-labelledby="home-promise" className="bg-cream">
        <div className={`${SECTION} flex flex-col gap-9`}>
          <div className="flex max-w-[860px] flex-col gap-5">
            <Eyebrow>The Painted Porch Promise</Eyebrow>
            <h2 id="home-promise" className={H2}>
              We Aren't Here to Tell You Yes
            </h2>
            <p className="max-w-[40em] text-[17px] leading-relaxed">
              We're here to tell you what will actually work, and what it will take to make it happen. The question we
              begin with is whether what you're considering is the right thing to do right now.
            </p>
          </div>
          <ul data-testid="home-promise" className="grid gap-6 md:grid-cols-3">
            {PROMISE.map((p) => (
              <li key={p.label} data-testid="home-promise-box" className={`flex flex-col gap-2.5 p-8 ${p.box}`}>
                <span className="font-display text-[22px] font-bold leading-tight">{p.label}</span>
                <p className="text-[17px] leading-relaxed">{p.body}</p>
              </li>
            ))}
          </ul>
          <p className="max-w-[30em] font-display text-[22px] font-semibold leading-snug text-primary md:text-[30px]">
            We don't believe in slowing you down. We make sure you're building on ground that holds.
          </p>
        </div>
      </section>

      {/* 8 · Clarity Call */}
      <section id="clarity-call" aria-labelledby="home-clarity" className="scroll-mt-24 bg-[#00505C] text-white">
        <div className={`${SECTION} flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-[72px]`}>
          <figure className="w-full max-w-md shrink-0 lg:w-[400px]">
            <img
              src={amySquare}
              alt="Portrait of Amy Yackowski, Strategic Architect at Painted Porch Strategies"
              width={800}
              height={800}
              loading="lazy"
              className="aspect-square w-full object-cover object-top"
            />
            <figcaption className="mt-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#D5E7EA]">
              Amy Yackowski · Strategic Architect
            </figcaption>
          </figure>
          <div className="flex min-w-0 flex-col gap-5">
            <Eyebrow onDark>Start With a Clarity Call</Eyebrow>
            <h2 id="home-clarity" className={H2.replace("text-primary", "text-white")}>
              What's Your Organization Built to Lead Next?
            </h2>
            <p className="max-w-[36em] text-[17px] leading-relaxed text-[#E3EFF1]">
              Bring the vision you haven't had the words for, or the roadblock everyone else has accepted as normal. In
              60 minutes with Amy, you'll read whether your current architecture can carry the{" "}
              <ShIFt lowercase onDark />, where misalignment would tax your momentum, and the first decisive move to
              make. It's also where the Epic <ShIFt onDark /> Organizational Appraisal begins.
            </p>
            <p className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
              <span className="font-display text-[40px] font-bold leading-none text-[#F4C05E]">$750</span>
              <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[#D5E7EA]">
                60 minutes · Normally $1,000
              </span>
            </p>
            <blockquote>
              <p className="font-display text-lg font-medium italic leading-normal">
                “Every time I talk to Amy, I realize I missed a step somewhere… I guarantee you'll come out thinking
                something differently or knowing something you hadn't known before.”
              </p>
              <footer className="mt-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#D5E7EA]">
                Paul L. · Director of Implementation &amp; Change Management
              </footer>
            </blockquote>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5 pt-1">
              <Link to={bookClarityCallHref} className={`${GOLD_BUTTON} focus-visible:outline-white`}>
                Book a Clarity Call <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={openQuiz}
                className="font-semibold text-white underline underline-offset-4 hover:text-white/85"
              >
                Not sure yet? Find Your Next <ShIFt onDark />
              </button>
            </div>
            <p className="font-display text-[22px] font-semibold italic text-[#F4C05E]">The porch is open.</p>
          </div>
        </div>
      </section>

      {/* 9 · Other ways in */}
      <section aria-labelledby="home-other" className="bg-white">
        <div className={`${SECTION} grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-[72px]`}>
          <div className="flex min-w-0 flex-col gap-2">
            <h2 id="home-other" className="text-[13px] font-bold uppercase tracking-[0.14em] text-raspberry">
              Other Ways In
            </h2>
            <ul className="flex flex-col">
              {OTHER_WAYS.map((w, i) => (
                <li key={w.title} className={`py-[18px] ${i < OTHER_WAYS.length - 1 ? "border-b border-[#E6E1D6]" : ""}`}>
                  <SmartLink
                    to={w.to}
                    className="font-display text-xl font-semibold text-primary no-underline hover:underline"
                  >
                    {w.title} →
                  </SmartLink>
                  <p className="mt-1 text-[15px] leading-normal">{w.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-raspberry">Thoughts From the Porch</p>
              <Link to="/resources/insights" className={`text-[15px] ${LINK}`}>
                Explore Insights →
              </Link>
            </div>
            {posts && posts.length > 0 && (
              <ul className="grid gap-5 sm:grid-cols-3">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link to={`/resources/insights/${post.slug}`} className="group flex flex-col gap-2.5">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt=""
                          loading="lazy"
                          className="aspect-[16/10] w-full bg-muted object-cover"
                        />
                      ) : (
                        <span className="flex aspect-[16/10] items-center justify-center bg-muted">
                          <Lightbulb className="h-8 w-8 text-primary/40" aria-hidden="true" />
                        </span>
                      )}
                      <span className="font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary">
                        {post.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
