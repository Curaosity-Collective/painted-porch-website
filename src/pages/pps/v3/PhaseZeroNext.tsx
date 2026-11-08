import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import phaseZeroHero from "@/assets/heroes/phase-zero-hero.jpg";
import paintedFloor from "@/assets/heroes/home-hero.jpg";
import { CTABand, Kicker, PageHero, Prose, V3_H2 } from "@/components/v3/Bits";
import { PartnershipPromiseNote } from "@/components/v3/PartnershipPromiseNote";
import { ShIFt } from "@/components/v3/ShIFt";
import { SmartLink } from "@/components/pps/SmartLink";
import CostCalculatorDialog from "@/components/pps/blue-door/CostCalculatorDialog";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";

/**
 * Phase Zero™: Our Approach. One page in the new design, combining the old Phase Zero and
 * Our Approach pages (outline approved by PPS Admin, 2026-11-06). /about/approach redirects
 * here; both old pages are archived (Draft: admins only).
 *
 * Phase Zero spans Prepare and Align (PPS-DEC-0027). The core values and manifesto live on
 * About; the P.A.T.H. section moved to The P.A.T.H. page; the certifications are on About.
 * Images (PPS-DEC-0023): each page's own image moves with it, the Phase Zero hero here and
 * Our Approach's hero in the closing band. Styling and the IF in shIFt: PPS-DEC-0022.
 */

const TITLE = "Phase Zero™: Our Approach | Painted Porch Strategies";
const DESCRIPTION =
  "Phase Zero is the work before the work: the Prepare and Align stages of the P.A.T.H., where leaders get clear about people, systems, and culture, and decide what to author before the next big shIFt.";

const LINK = "font-semibold text-heading underline decoration-heading/40 underline-offset-4 hover:decoration-heading";

const BETTER_QUESTIONS = [
  "Is this the right direction?",
  "What assumptions are we making?",
  "What are we overlooking or underweighting?",
  "What will this require of our people, leaders, systems, and culture?",
];

const IS = [
  "A clear look at what your organization is realistically built to carry right now",
  "Deep questions about leadership, systems, and people before money or momentum gets locked in",
  "The strategic authorship phase that decides whether your next big move strengthens you or stretches you thin",
  "The point where organizational identity becomes strategic direction",
];

const IS_NOT = [
  "A readiness score, a health check, or a survey",
  "A template, a slide deck, or a one-size-fits-all playbook",
  "Standard training, coaching, or a workshop",
  "Change management (we design change; we don't simply manage it)",
];

// Phase Zero is Prepare and Align (PPS-DEC-0027). Fills carry dark ink, as on The P.A.T.H.
const STAGES = [
  { name: "Prepare", offer: "Envision", fill: "bg-prepare text-[#073B4C]" },
  { name: "Align", offer: "Architect", fill: "bg-align text-[#5A1420]" },
  { name: "Take Off", offer: "Embody", fill: "bg-gold text-[#1E2B30]" },
  { name: "Habits", offer: "Embody", fill: "bg-habits text-[#1F3A0C]" },
];

// Pillar colors are shared with the client report (PPS-DEC-0022, item 3).
const PILLARS = [
  {
    name: "Cultural Cornerstone",
    focus: "Leadership & Culture",
    bar: "border-navy",
    label: "text-navy",
    definition:
      "Your leaders, your culture, your values, and the way people work together. This is the pillar of progress that decides how your organization leads, decides, and grows.",
    questions: [
      "Can our leaders shape direction, or are they only reacting to pressure?",
      "Will our culture support this change, or quietly (or loudly) push against it?",
      "Do we have a clear way leaders make decisions together?",
    ],
    outcomes: [
      "Leaders who author change on purpose, not by accident.",
      "A culture that helps change stick instead of pulling it apart.",
      "Strategic muscle at the top of the organization.",
    ],
  },
  {
    name: "Operational Frame",
    focus: "Workflows & Systems",
    bar: "border-strategic",
    label: "text-strategic",
    definition:
      "Your systems, workflows, and decision pathways. This pillar of process is how strategy actually moves through the building and turns into real work.",
    questions: [
      "Do our workflows support the position we want to lead in our market?",
      "Are our systems built for value, or just for speed?",
      "Can our operations carry a real change, or will they crack under it?",
    ],
    outcomes: [
      "Operations that move strategy forward instead of slowing it down.",
      "Workflows designed for value, not just activity.",
      "Systems that can support real transformation.",
    ],
  },
  {
    name: "Living Ecosystem",
    focus: "Capacity & Judgment",
    bar: "border-gold",
    label: "text-[#8A5A00]",
    definition:
      "The judgment, communication, resilience, and mindset your people bring to the work. This is the pillar of people that decides whether change holds up over time.",
    questions: [
      "Can our people navigate the unknown, or only follow set steps?",
      "Is good judgment spread through the organization, or stuck at the top?",
      "Do we have the human capacity to adapt, not just to execute?",
    ],
    outcomes: [
      "People who can move through ambiguity with confidence.",
      "Judgment shared at the right levels across the organization.",
      "Real adaptive capacity in moments of uncertainty or when circumstances change.",
    ],
  },
];

const ESSENTIAL_ELEMENTS = [
  { label: "Communication", to: "/communication" },
  { label: "Collaboration", to: "/extraordinary-teams" },
  { label: "Clarity", to: "/envision-shift" },
  { label: "Resilience", to: "/radical-mindfulness" },
  // The Working Genius page lives under assessments; "/working-genius" was never a route (PPS Admin, 2026-11-06).
  { label: "Alignment", to: "/assessments/working-genius" },
  { label: "Organizational Health", to: "/eq" },
];

// White letters only on fills dark enough for them; Gold takes dark ink (PPS-DEC-0022).
const DECISION_FILTER = [
  { letter: "R", word: "Reason", bold: "Reality before assumptions.", rest: "Clear, logical thinking drives every recommendation.", fill: "bg-strategic text-white" },
  { letter: "L", word: "Logic", bold: "Structure before activity.", rest: "Structured frameworks that produce consistent results.", fill: "bg-primary text-white" },
  { letter: "P", word: "Purpose", bold: "Meaning before movement.", rest: "Every engagement tied to meaningful outcomes.", fill: "bg-lime-deep text-white" },
  { letter: "V", word: "Virtue", bold: "Integrity over convenience.", rest: "Integrity and ethics sit at the center of our work.", fill: "bg-gold text-[#1E2B30]" },
];

const ABILITIES = [
  "Show up strong, confident, and resilient when uncertainty or change shows up.",
  "Share ideas and challenge well-worn norms and habits.",
  "Spot and solve problems proactively and openly.",
  "Work in healthy, collaborative, accountable teams.",
  "Communicate with clarity, consistency, and impact.",
];

const CONDITIONS = [
  "Leaders who can name what they're really trying to build.",
  "Teams who can disagree well and decide together.",
  "Systems that match how work actually flows.",
  "Cultures where the next change doesn't feel like the first.",
];

function CheckList({ items, icon, tone }: { items: string[]; icon: "check" | "x"; tone: string }) {
  const Icon = icon === "check" ? Check : X;
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-foreground">
          <Icon className={`mt-1 h-5 w-5 shrink-0 ${tone}`} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Card({ bar, children }: { bar: string; children: ReactNode }) {
  return <div className={`rounded border border-border border-t-4 bg-white p-7 ${bar}`}>{children}</div>;
}

export default function PhaseZeroNext() {
  const { open: openQuiz } = usePathFinderQuiz();

  useDocumentSeo({ title: TITLE, description: DESCRIPTION, ogImage: phaseZeroHero, canonical: "/phase-zero" });

  return (
    <div className="pps-v3">
      {/* 1 · Hero */}
      <PageHero
        kicker="Our Approach"
        title="Phase Zero™"
        intro={
          <>
            <p>
              Before the kickoff. Before the rollout. Before the next big <ShIFt lowercase onDark />.
            </p>
            <p className="mt-4 font-semibold text-teal-foreground">Sustainable change is designed, not declared.</p>
          </>
        }
        video={{ slotKey: "home-hero", poster: paintedFloor, alt: "Porch floorboards painted in bands of color, glowing in the sun between white columns" }}
        ghost="0"
        action={{ label: "Start with a Clarity Call", to: clarityCallSectionHref() }}
      />

      {/* 2 · Why it exists */}
      <section aria-labelledby="pz-why" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Kicker>Why Phase Zero Exists</Kicker>
            <h2 id="pz-why" className={`mt-5 ${V3_H2}`}>
              Not Every Opportunity Strengthens the Organization Chasing It
            </h2>
            <Prose>
              <p>
                And not every change fortifies the future it's intended to create. Your organization isn't getting worn
                down from a lack of effort. It's carrying the accumulated weight of the continual drive to innovate,
                accelerate, adapt, and grow: unfinished work, competing priorities, disconnected initiatives, and
                directions that never fully aligned in the first place.
              </p>
              <p>
                Pushing harder in the wrong direction doesn't change the direction. It just{" "}
                <strong className="text-raspberry">compounds the cost of getting there</strong>.
              </p>
              <p>
                Every initiative is also built on assumptions: about leadership, communication, priorities, and culture,
                and about what people understand, believe, and are capable of doing. Phase Zero surfaces them before they
                become expensive realities, because the quality of the outcome is decided long before execution begins.
              </p>
            </Prose>
          </div>
          <aside aria-labelledby="pz-questions" className="rounded self-start border-l-4 border-gold bg-cream p-7 lg:col-span-5">
            <h3 id="pz-questions" className="label-kicker text-raspberry">
              The Better Questions
            </h3>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              The most important question is rarely “How do we make this work?” It's more often:
            </p>
            <ul className="mt-4 space-y-3">
              {BETTER_QUESTIONS.map((q) => (
                <li key={q} className="font-display text-lg italic leading-snug text-foreground">
                  “{q}”
                </li>
              ))}
            </ul>
          </aside>
        </div>
        <p className="mt-14 max-w-3xl font-display text-2xl font-semibold leading-snug text-heading md:text-3xl">
          The frustration that surfaces in moments like this is rarely random.{" "}
          <span className="text-raspberry">It's a signal.</span>
        </p>
      </section>

      {/* 3 · Where the real choices get made */}
      <section aria-labelledby="pz-choices" className="border-y border-border bg-cream">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
          <Kicker>The Work Before the Work</Kicker>
          <h2 id="pz-choices" className={`mt-5 ${V3_H2}`}>
            Where the Real Choices Get Made
          </h2>
          <Prose>
            <p>
              Phase Zero is where you decide what's worth committing your time, energy, resources, and credibility to.
              Not what to copy, catch up to, or react to, but what to <strong>author</strong>.
            </p>
            <p>
              That sounds simple; it's not. Teams often skip it because the pressure to move feels heavier than the cost
              of moving in the wrong direction. But when you skip Phase Zero, you stop designing your next move and
              start reacting to someone else's.
            </p>
            <p>
              It's the work that comes before the rollout: the thinking beneath the plan, and the examination that
              shapes everything that follows.
            </p>
          </Prose>
        </div>
      </section>

      {/* 4 · What it is and isn't, and the cost calculator */}
      <section aria-labelledby="pz-is" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Kicker>Clear About the Work</Kicker>
        <h2 id="pz-is" className={`mt-5 ${V3_H2}`}>
          What Phase Zero Is, and What It Isn't
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card bar="border-t-lime-deep">
            <h3 className="font-display text-2xl font-semibold text-foreground">Phase Zero is</h3>
            <CheckList items={IS} icon="check" tone="text-lime-deep" />
          </Card>
          <Card bar="border-t-raspberry">
            <h3 className="font-display text-2xl font-semibold text-foreground">Phase Zero isn't</h3>
            <CheckList items={IS_NOT} icon="x" tone="text-raspberry" />
          </Card>
        </div>
        <div className="rounded mt-10 max-w-3xl border-l-4 border-raspberry bg-cream p-7 md:p-8">
          <p className="label-kicker text-raspberry">See the Cost in Your Own Numbers</p>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground">
            The Hidden Cost of Misalignment and Building Before Clarity
          </h3>
          <p className="mt-3 text-base leading-relaxed text-foreground">
            Plug in your team size, focus, and timeline to see the industry-benchmarked cost of misaligned change, and
            what's recoverable when you start with Phase Zero.
          </p>
          <div className="mt-6">
            <CostCalculatorDialog
              triggerLabel="Calculate the cost of skipping Phase Zero"
              triggerVariant="default"
              triggerClassName="bg-raspberry text-white hover:bg-raspberry/90"
            />
          </div>
        </div>
      </section>

      {/* 5 · Where it sits on the P.A.T.H. (Prepare and Align; PPS-DEC-0027) */}
      <section aria-labelledby="pz-path" className="border-y border-border bg-linen">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <Kicker>Where It Sits on the P.A.T.H.</Kicker>
              <h2 id="pz-path" className={`mt-5 ${V3_H2}`}>
                Prepare and Align
              </h2>
              <p className="mt-5 text-base leading-relaxed text-foreground">
                Phase Zero spans the first two stages of the P.A.T.H.: Prepare, where Envision <ShIFt /> partners, and
                Align, where Architect <ShIFt /> partners. It's the groundwork that has to happen before you Take Off and
                build lasting Habits.
              </p>
              <p className="mt-6 text-base">
                <SmartLink to="/the-path" className={LINK}>
                  <span>See the full P.A.T.H. →</span>
                </SmartLink>
              </p>
            </div>
            <div className="lg:col-span-7">
              <ol aria-label="The four stages of the P.A.T.H., with Phase Zero spanning Prepare and Align" className="grid grid-cols-4 items-end gap-1.5">
                <li className="col-span-2">
                  <div className="relative rounded border-2 border-dashed border-gold px-1.5 pb-1.5 pt-7">
                    <span className="label-kicker absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gold px-3 py-1 text-[#1E2B30]">
                      Phase Zero™
                    </span>
                    <ol className="grid grid-cols-2 gap-1.5">
                      {STAGES.slice(0, 2).map((s) => (
                        <StageChip key={s.name} {...s} />
                      ))}
                    </ol>
                  </div>
                </li>
                {STAGES.slice(2).map((s) => (
                  <li key={s.name} className="pb-[8px]">
                    <StageChipBody {...s} />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 6 · The Painted Porch Pillars, Essential Elements, the Fortified Porch */}
      <section id="pillars" aria-labelledby="pz-pillars" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 md:py-28">
        <Kicker>The Painted Porch Pillars™: What Phase Zero Fortifies</Kicker>
        <h2 id="pz-pillars" className={`mt-5 max-w-3xl ${V3_H2}`}>
          The Foundations Beneath Every <ShIFt />
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground">
          Every organization relies on three foundational structures. When one is weak, progress is harder to maintain.
          When all three are strong, change has something solid to build on. Phase Zero examines and fortifies each one.
        </p>
        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <li key={p.name} className={`rounded flex flex-col gap-4 border border-border border-t-8 bg-white p-7 ${p.bar}`}>
              <span className={`text-xs font-bold uppercase tracking-[0.14em] ${p.label}`}>{p.focus}</span>
              <h3 className="font-display text-2xl font-semibold leading-tight text-foreground">{p.name}</h3>
              <p className="text-base leading-relaxed text-foreground">{p.definition}</p>
              <div>
                <h4 className="font-display text-base font-semibold text-foreground">The Questions</h4>
                <ul className="mt-2 space-y-1.5">
                  {p.questions.map((q) => (
                    <li key={q} className="text-base italic leading-relaxed text-foreground">
                      “{q}”
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-display text-base font-semibold text-foreground">Strong Foundation Looks Like</h4>
                <ul className="mt-2 space-y-1.5">
                  {p.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-base leading-relaxed text-foreground">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-lime-deep" aria-hidden="true" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded mt-10 bg-cream p-7 md:p-10">
          <Kicker>The Behavioral Bedrock</Kicker>
          <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">Essential Elements</h3>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground">
            Under all three Pillars sit the behaviors that decide whether an organization simply reacts to the future or
            is capable of authoring it.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {ESSENTIAL_ELEMENTS.map((el) => (
              <li key={el.label}>
                <SmartLink
                  to={el.to}
                  className="inline-flex rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-heading hover:text-heading"
                >
                  <span>{el.label}</span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded mt-10 bg-teal-deep p-8 text-center text-teal-foreground md:p-12">
          <Kicker tone="onDark">The Result</Kicker>
          <h3 className="mt-3 font-display text-2xl font-semibold md:text-3xl">The Fortified Porch</h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-teal-foreground">
            When the three Pillars stand strong and the Essential Elements show up every day, organizations gain the{" "}
            <strong className="text-[#F4C05E]">capability, capacity, and confidence to author whatever comes next</strong>.
          </p>
        </div>
      </section>

      {/* 7 · How we think (the core values and manifesto are on About) */}
      <section aria-labelledby="pz-think" className="border-y border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Kicker>How We Think</Kicker>
          <h2 id="pz-think" className={`mt-5 max-w-3xl ${V3_H2}`}>
            The Decision Filter Behind Every Recommendation
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground">
            Our Stoic operating system. Every recommendation, challenge, observation, and strategic conversation passes
            through the same four principles. Not because frameworks matter, but because disciplined thinking does.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DECISION_FILTER.map((v) => (
              <li key={v.letter} className="rounded bg-white p-6">
                <span
                  aria-hidden="true"
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-display text-xl font-bold ${v.fill}`}
                >
                  {v.letter}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{v.word}</h3>
                <p className="mt-2 text-base leading-relaxed text-foreground">
                  <strong>{v.bold}</strong> {v.rest}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8 · What the work makes possible, closing with Our Commitment */}
      <section aria-labelledby="pz-possible" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Kicker>What Our Work Makes Possible</Kicker>
        <h2 id="pz-possible" className={`mt-5 max-w-3xl ${V3_H2}`}>
          The Conditions That Shape Every Outcome
        </h2>
        <Prose>
          <p className="max-w-3xl">
            Meaningful change rarely succeeds because of a framework alone. It succeeds because the conditions required
            for success already exist or are intentionally reinforced.
          </p>
          <p className="max-w-3xl">
            We don't own change on your behalf. We fortify the conditions that allow the right change to take off, in
            your people and across your organization.
          </p>
        </Prose>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card bar="border-t-gold">
            <p className="label-kicker text-[#8A5A00]">In Your People</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">Five Foundational Abilities</h3>
            <CheckList items={ABILITIES} icon="check" tone="text-[#8A5A00]" />
          </Card>
          <Card bar="border-t-primary">
            <p className="label-kicker text-heading">In Your Organization</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">Four Conditions That Hold</h3>
            <CheckList items={CONDITIONS} icon="check" tone="text-heading" />
          </Card>
        </div>
        <div className="rounded mt-12 border-l-4 border-gold bg-teal-deep p-8 text-teal-foreground md:p-10">
          <Kicker tone="onDark">Our Commitment</Kicker>
          <p className="mt-3 font-display text-2xl font-semibold text-white md:text-3xl">You won't need us forever.</p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-teal-foreground">
            The point of partnership isn't a long contract. It's your team becoming the people who can author your next
            change on their own.
          </p>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-[#F4C05E]">
            Success is when your next major decision no longer requires us in the room.
          </p>
        </div>
      </section>

      {/* 9 · Our Partnership Promise, then the Clarity Call */}
      <PartnershipPromiseNote />

      <CTABand
        title="Every Future Begins With a Clearer Understanding of Who You're Becoming"
        body="Phase Zero starts with a Clarity Call: 60 minutes with Amy to see where your organization stands and what makes sense next."
        to={clarityCallSectionHref()}
        label="Start with a Clarity Call"
        image={phaseZeroHero}
        imageAlt="Weathered stone columns in warm evening light beside new scaffolding, a structure still being built"
        photoProfile="cta-photo-charcoal"
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

function StageChipBody({ name, offer, fill }: { name: string; offer: string; fill: string }) {
  return (
    <div className={`flex min-h-[76px] flex-col items-center justify-center rounded px-1.5 py-3 text-center ${fill}`}>
      <span className="label-kicker">{name}</span>
      <span className="mt-1 text-xs font-semibold leading-tight">
        {offer} <ShIFt onFill />
      </span>
    </div>
  );
}

function StageChip(props: { name: string; offer: string; fill: string }) {
  return (
    <li>
      <StageChipBody {...props} />
    </li>
  );
}
