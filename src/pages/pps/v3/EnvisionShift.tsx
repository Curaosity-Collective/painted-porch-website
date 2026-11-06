import { Check, MessageSquare } from "lucide-react";

import blueDoorImg from "@/assets/v3/blue-door.jpg";
import blueDoorDusk from "@/assets/v3/blue-door-dusk.jpg";
import porchEvening from "@/assets/v3/porch-evening.jpg";
import thresholdDusk from "@/assets/v3/threshold-dusk.jpg";
import { CTABand, EvidenceNote, Kicker, NumberedList, PageHero, Prose, V3_H2 } from "@/components/v3/Bits";
import { GhostLayer, ParallaxImage, StickyMedia } from "@/components/v3/Motion";
import { Reveal } from "@/components/v3/Reveal";
import { ShIFt } from "@/components/v3/ShIFt";
import { PartnershipPromiseNote } from "@/components/v3/PartnershipPromiseNote";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { EPIC_SHIFT_APPRAISAL, clarityCallSectionHref } from "@/config/epicShiftAppraisal";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { getSiteUrl } from "@/lib/site-url";

/*
 * Envision ShIFt — the Epic ShIFt Organizational Appraisal (PPS-DEC-0018).
 * Ported from pps-simplified src/routes/envision-shift.tsx. This is the page
 * every retired Blue Door link now lands on (PPS-DEC-0017).
 *
 * Changes from the draft:
 * - The closing call to action starts a Clarity Call through the working
 *   contact form until the GHL booking calendar is connected (PPS-DEC-0019),
 *   instead of the draft's unconnected /ready quiz.
 * - The "After your Compass" note linking to /architect-shift returns when that
 *   page is brought over (plan Phase 2).
 */

const TITLE = "The Epic ShIFt Organizational Appraisal | Painted Porch Strategies";
const DESCRIPTION =
  "An interview-led organizational 360 built on six interviews, from executives to the frontline. Your P.A.T.H. Compass clarifies which change and direction make sense to pursue NOW and what in your organization needs reinforcement first, so you can lead with clarity and build with confidence. Investment: $24,000.";

const produces = [
  {
    title: "Architecture read",
    body: "How your leadership, systems, and capacity currently fit together — including where they're working against each other.",
  },
  {
    title: "Capacity signal",
    body: "Whether your organization has the room, the judgment, and the energy to carry what you're about to ask of it.",
  },
  {
    title: "Move Now Map",
    body: "The handful of moves worth making immediately, in the order that makes them hold.",
  },
  {
    title: "Reinforce First priorities",
    body: "What needs strengthening before you accelerate, so momentum doesn't outrun alignment.",
  },
];

const whoItsFor = [
  {
    strong: "The Breaking Point.",
    body: "There's extraordinary potential in your team, but your current structures keep holding it back.",
  },
  {
    strong: "The Catalyst Event.",
    body: "A market shift, AI mandate, or leadership transition forces evolution — and you refuse to sacrifice your people in the process.",
  },
  {
    strong: "The Vision Validation.",
    body: "You're ready to build a legacy that outlives your tenure, and you need the architecture to make it real.",
  },
];

const steps = [
  {
    n: "01",
    title: "Organizational Interviews",
    time: "Six interviews, executive to frontline",
    body: "We conduct interviews to surface your organization's strengths, constraints, and capability — the change you envision, the direction of shift, and what must be considered before moving forward.",
  },
  {
    n: "02",
    title: "We Appraise Your Organization",
    time: "Across the three Painted Porch Pillars",
    body: "We bring the interview perspectives together to identify which change and direction your organization is realistically able to pursue — and what makes sense before committing.",
  },
  {
    n: "03",
    title: "Receive Your P.A.T.H. Compass",
    time: "Your best next step",
    body: "A strategic reading of your organization's architecture: where you can move now, what needs reinforcement, and your recommended next steps.",
  },
];

const expect = [
  "Six interviews: three executives, and three people from mid-level through the frontline",
  "An organizational 360 and strategic appraisal",
  "Your P.A.T.H. Compass and recommended next step",
];

const included = [
  "Interview-led perspectives on opportunity and capability",
  "Structural appraisal across the three Painted Porch Pillars",
  "Which shifts are viable now, which need groundwork, and which are premature",
  "Prerequisites for each potential shift",
  "Strategic recommendations for next steps",
];

export default function EnvisionShift() {
  const quiz = usePathFinderQuiz();
  useDocumentSeo({
    title: TITLE,
    description: DESCRIPTION,
    ogImage: blueDoorImg,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: EPIC_SHIFT_APPRAISAL.name,
      serviceType: "Organizational appraisal",
      description: DESCRIPTION,
      url: `${getSiteUrl()}${EPIC_SHIFT_APPRAISAL.path}`,
      provider: { "@type": "Organization", name: "Painted Porch Strategies" },
      offers: {
        "@type": "Offer",
        price: EPIC_SHIFT_APPRAISAL.priceUsd,
        priceCurrency: "USD",
      },
    },
  });

  return (
    <div className="pps-v3">
      <PageHero
        kicker="Prepare · Name It"
        title={
          <>
            Envision <ShIFt onDark />
          </>
        }
        intro={
          <>
            Every epic <ShIFt lowercase onDark /> begins at a threshold: an honest appraisal of what your organization is realistically able to carry. An interview-led organizational 360 determines which change and direction make sense to pursue next.
          </>
        }
        image={blueDoorImg}
        imageAlt="A cobalt blue door set in a pale stone wall"
        tone="prepare"
        ghost="B"
      />

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <StickyMedia
          src={blueDoorDusk}
          alt="An open cobalt blue door with lamplight spilling onto a porch at dusk"
          width={1920}
          height={1280}
        >
          <div>
            <Kicker>What It Is</Kicker>
            <h2 className={`mt-5 ${V3_H2}`}>
              An Interview-Led Organizational 360
            </h2>
            <Prose>
              <p>
                The Epic <ShIFt /> Organizational Appraisal is an interview-led organizational 360. We conduct six interviews across your
                organization, three with executives and three with people from mid-level through the frontline, to
                appraise its current architecture — the leadership and culture, the systems and workflows, and the
                human capacity underneath them.
              </p>
              <EvidenceNote
                emphasis="88%"
                href="https://www.pwc.com/us/en/library/pulse-survey/business-reinvention.html"
                source="PwC · Pulse Survey: Focused on reinvention"
              >
                of executives say their organizations struggle to capture value from technology investments. The
                earlier question is what the organization is prepared to carry—and what the investment is meant to
                make possible.
              </EvidenceNote>
              <p>
                It reveals what your organization is realistically positioned to pursue before your next initiative
                begins, so you commit to a direction you can actually carry rather than one that looks right on a slide.
              </p>
              <p>
                Your P.A.T.H. Compass isn't designed to funnel every organization toward the same next step. It may point toward
                moving now, reinforcing a foundation first, resequencing the initiative, or choosing not to proceed.
                Clarity is valuable even when it changes the plan.
              </p>
              <p>
                Every epic <ShIFt lowercase /> starts with seeing clearly, including whether your organization is ready to
                carry the one you're imagining.
              </p>
              <p>
                That clarity informs your best next step on the journey to do Epic <ShIFt />. When reinforcement
                is the right next move, it grounds the executive authorship intensive within your Architect <ShIFt />
                engagement.
              </p>
            </Prose>
          </div>
        </StickyMedia>
      </section>

      <section className="relative bg-linen">
        <GhostLayer>B</GhostLayer>
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Kicker>What It Produces</Kicker>
          <h2 className={`mt-5 max-w-2xl ${V3_H2}`}>
            Your P.A.T.H. Compass
          </h2>
          <div className="mt-10">
            <NumberedList items={produces} tone="prepare" />
          </div>
        </div>
      </section>

      <section className="relative">
        <ParallaxImage
          src={thresholdDusk}
          alt="An open blue wooden door with a brass kick plate above a stone threshold, with warm lamplight spilling onto porch boards at dusk."
          imagePositionClassName="object-[52%_65%] md:object-[50%_60%]"
          className="h-[42vh] w-full md:h-[62vh]"
          speed={55}
          width={1920}
          height={1280}
        />
      </section>

      <section className="surface-painted relative mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Kicker>Who It's For</Kicker>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {whoItsFor.map((item) => (
            <div key={item.strong} className="border-l-4 border-prepare bg-linen p-6 md:p-8">
              <h3 className="font-display text-lg font-semibold text-foreground">{item.strong}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-linen">
        <div className="story-content-space mx-auto max-w-7xl px-6">
          <Reveal>
            <Kicker>How It Works</Kicker>
            <h2 className={`mt-5 max-w-2xl ${V3_H2}`}>
              Interviews. Appraisal. Clarity.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <Reveal key={step.n}>
                <article className="flex h-full flex-col border border-prepare/10 bg-background p-6 md:p-8">
                  <span aria-hidden className="font-display text-4xl font-semibold text-prepare-deep/15">
                    {step.n}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="label-kicker mt-1 text-prepare-deep">{step.time}</p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground">{step.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <h3 className="mt-14 font-display text-2xl font-semibold text-foreground">Practicalities</h3>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Reveal>
              <div className="h-full border-l-4 border-prepare bg-linen p-6 md:p-8">
                <h3 className="font-display text-xl font-semibold text-foreground">Investment</h3>
                <p className="mt-4 font-display text-3xl font-semibold text-foreground">
                  {EPIC_SHIFT_APPRAISAL.priceDisplay}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-foreground">
                  Every appraisal begins with a Clarity Call.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="h-full border-l-4 border-prepare bg-linen p-6 md:p-8">
                <h3 className="font-display text-xl font-semibold text-foreground">What to expect</h3>
                <ul className="mt-5 space-y-3">
                  {expect.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-prepare-deep" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal>
              <div className="h-full border-l-4 border-prepare bg-linen p-6 md:p-8">
                <h3 className="font-display text-xl font-semibold text-foreground">What's included</h3>
                <ul className="mt-5 space-y-3">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-prepare-deep" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Our Partnership Promise, from Our Approach (PPS Admin, 2026-11-06) */}
      <PartnershipPromiseNote />

      <CTABand
        tone="prepare"
        photoProfile="cta-photo-envision"
        title="Ready to Begin?"
        body={
          <>
            The Epic <ShIFt onDark /> Organizational Appraisal begins with a Clarity Call. Start there, and the appraisal
            becomes your natural next step.
          </>
        }
        to={clarityCallSectionHref("appraisal")}
        label="Start with a Clarity Call"
        secondary={
          <>
            Not sure where to begin?{" "}
            <button
              type="button"
              onClick={quiz.open}
              className="underline underline-offset-4 transition-colors hover:text-gold"
            >
              Find Your Next <ShIFt onDark />
            </button>
            .
          </>
        }
        image={porchEvening}
        imageAlt="A hanging lantern illuminates a teal-painted porch with wooden railings, a blue front door, and stone steps beneath trees at dusk."
        imagePositionClassName="object-[64%_50%] md:object-[50%_55%]"
        imageWidth={2528}
        imageHeight={1696}
      />
    </div>
  );
}
