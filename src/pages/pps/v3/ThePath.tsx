import type { ReactNode } from "react";
import { Check } from "lucide-react";
import colorfulPath from "@/assets/colorful-path.jpg";
import lightbulb from "@/assets/amplify-hero-lightbulb.jpg";
import colorBurst from "@/assets/amplify-hero-energy.jpg";
import { CTABand, Kicker, PageHero, Prose, V3_H2 } from "@/components/v3/Bits";
import { ShIFt } from "@/components/v3/ShIFt";
import { SmartLink } from "@/components/pps/SmartLink";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { clarityCallHrefFor } from "@/config/epicShiftAppraisal";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { getSiteUrl } from "@/lib/site-url";

/**
 * The P.A.T.H.™: the four stages of change (Prepare, Align, Take Off, Habits)
 * and the three ShIFts that partner on them. Envision partners at Prepare,
 * Architect at Align, Embody from Take Off through Habits. Ported from
 * pps-simplified src/routes/the-path.tsx. Draft at /the-path (PageGate in
 * PPSLayout) until release; /partner redirects here at go-live (plan §4).
 *
 * No prices on this page: they live on the offer pages (PPS-DEC-0022 item 5).
 * Names: PPS-DEC-0018. Styling and the IF in shIFt: PPS-DEC-0022.
 * Images: PPS-DEC-0023. The hero is the /partner page's image, which moves
 * here when /partner redirects.
 */

const TITLE = "The P.A.T.H.™ | Painted Porch Strategies";
const DESCRIPTION =
  "Prepare, Align, Take Off, Habits: the four stages of change behind every Painted Porch engagement, and how Envision, Architect and Embody ShIFt partner on each.";

const LINK = "font-semibold text-heading underline decoration-heading/40 underline-offset-4 hover:decoration-heading";
const LINK_ON_DARK = "font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white";

type Offer = { label: ReactNode; to: string };

const ENVISION: Offer = { label: <>Envision <ShIFt /></>, to: "/envision-shift" };
const ARCHITECT: Offer = { label: <>Architect <ShIFt /></>, to: "/architect-shift" };
const EMBODY: Offer = { label: <>Embody <ShIFt /></>, to: "/embody-shift" };

// Stage fills carry dark ink, as on the homepage: white on these fills fails AA.
const STAGES = [
  {
    letter: "P",
    name: "Prepare",
    question: "What are we actually built to carry?",
    body: "Before a single initiative is announced, get an honest read of the organization's current architecture: the leadership and culture, the systems and workflows, and the human capacity underneath them. Preparation is where momentum is either created or mortgaged.",
    example: (
      <>
        A healthcare staffing firm about to double its headcount begins with the Epic <ShIFt /> Organizational
        Appraisal. The appraisal shows that the onboarding system, not the recruiting pipeline, is the real constraint.
        The growth plan is re-sequenced before a single hire is made.
      </>
    ),
    partner: ENVISION,
    fill: "bg-prepare text-[#073B4C]",
  },
  {
    letter: "A",
    name: "Align",
    question: "Does the room actually agree, on the same thing?",
    body: "Alignment isn't a survey where everyone picks “strongly agree.” It's your senior team working the same evidence in the executive authorship intensive, identifying which pillars need reinforcement first, and fortifying those structures and capabilities through a strategic sprint before you execute your change.",
    example:
      "In the intensive, a leadership team discovers that two executives hold opposite definitions of the transformation's success. Having that argument in week one saves the eighteen months it would have cost in week forty.",
    partner: ARCHITECT,
    fill: "bg-align text-[#5A1420]",
  },
  {
    letter: "T",
    name: "Take Off",
    question: "How do we launch so the vision holds, and accelerates?",
    body: "Most methodologies start here, which is why the outcome can feel smaller than the vision that set it in motion. The industry default is to move straight into action: launch the tool, announce the initiative, reorganize the chart. We begin earlier. With Preparation and Alignment in place, Take Off becomes the confident translation of ambition into a living reality, with clear decisions, reinforcing structures, and the organizational capacity to sustain velocity.",
    example:
      "A mid-market company begins designing and delivering its AI initiative only after fortifying its governance, communication architecture, and manager capability, with ongoing advisory reinforcing the new way of working.",
    partner: EMBODY,
    fill: "bg-gold text-[#1E2B30]",
  },
  {
    letter: "H",
    name: "Habits",
    question: "What keeps this from evaporating?",
    body: (
      <>
        Change holds when it becomes the way things are done: the rituals, the meeting rhythms, the accountability
        structures, the stories the organization tells about itself. Habits is the stage that turns an initiative into
        an identity: an extraordinary organization with the confidence, shared vocabulary, and cultural stamina to
        author the next chapter without hesitation, and to make <ShIFt lowercase /> happen again.
      </>
    ),
    example:
      "Six months after the sprint, the new decision cadence is still running. Nobody is enforcing it; it's simply how the leadership team now meets.",
    partner: EMBODY,
    fill: "bg-habits text-[#1F3A0C]",
  },
];

// Pillar colors are shared with the client report (PPS-DEC-0022, item 3).
const PILLARS = [
  {
    name: "Cultural Cornerstone",
    focus: "Leadership & Culture",
    body: "Your leadership, culture, values, and the relational architecture that shape how your organization leads, decides, and evolves.",
    bar: "border-navy",
    label: "text-navy",
  },
  {
    name: "Operational Frame",
    focus: "Workflows & Systems",
    body: "Your systems, workflows, structures, and decision pathways that move strategy from intention into reality.",
    bar: "border-strategic",
    label: "text-strategic",
  },
  {
    name: "Living Ecosystem",
    focus: "Capacity & Judgment",
    body: (
      <>
        Your individual and collective capacity, judgment, communication, resilience, and mindset needed to sustain a
        meaningful <ShIFt lowercase />.
      </>
    ),
    bar: "border-gold",
    label: "text-[#8A5A00]",
  },
];

const JOURNEY = [
  {
    number: "01",
    promise: "Name It",
    stage: "Prepare",
    name: (
      <>
        Envision <ShIFt onDark />
      </>
    ),
    body: "An interview-led organizational 360 built on six interviews: three executives, and three people from mid-level through the frontline.",
    outcome: "Clarity on which change and direction your organization is realistically able to pursue, and what makes sense next.",
    deliverable: (
      <>
        Organizational appraisal findings and your P.A.T.H. Compass, informing your best next step toward Epic{" "}
        <ShIFt onDark />.
      </>
    ),
    to: "/envision-shift",
    cta: "Start here",
    bar: "border-prepare",
  },
  {
    number: "02",
    promise: "Shape It",
    stage: "Align",
    name: (
      <>
        Architect <ShIFt onDark />
      </>
    ),
    body: "A 3-day executive authorship intensive, a 90-day pillar-fortification sprint, and a 1.5-day retrospective and next-steps decision.",
    outcome: "An aligned organization with stronger structures and capability, and a clear decision on readiness for change.",
    deliverable:
      "An architecture blueprint, ongoing advisory, and a decision: fortify another pillar through a further sprint, or begin designing and delivering your change.",
    to: "/architect-shift",
    cta: "Read more",
    bar: "border-align",
  },
  {
    number: "03",
    promise: "Become It",
    stage: "Take Off and Habits",
    name: (
      <>
        Embody <ShIFt onDark />
      </>
    ),
    body: "Ongoing advisory as your organization designs and delivers the change it envisioned and authored, through Take Off and Habits.",
    outcome: "Your own change, innovation, and transformation become an ongoing, continuous practice.",
    deliverable:
      "Ongoing advisory during your change journey and beyond, reinforcing habits, judgment, decision authority, and the three Painted Porch Pillars.",
    to: "/embody-shift",
    cta: "Read more",
    bar: "border-habits",
  },
];

export default function ThePath() {
  const { open: openQuiz } = usePathFinderQuiz();

  useDocumentSeo({
    title: TITLE,
    description: DESCRIPTION,
    ogImage: colorfulPath,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "The P.A.T.H. Framework for Lasting Organizational Change",
      description: DESCRIPTION,
      url: `${getSiteUrl()}/the-path`,
      step: [
        { "@type": "HowToStep", position: 1, name: "Prepare", text: "Get a shared, honest read of the organization's capacity and architecture before committing." },
        { "@type": "HowToStep", position: 2, name: "Align", text: "Bring the senior team to one understanding: direction, trade-offs, and sequence genuinely shared." },
        { "@type": "HowToStep", position: 3, name: "Take Off", text: "Design and deliver the change, with the structures and capability to sustain it." },
        { "@type": "HowToStep", position: 4, name: "Habits", text: "Embed the rituals, rhythms, and accountability structures that keep the change in place." },
      ],
    },
  });

  return (
    <div className="pps-v3">
      <PageHero
        kicker="The Framework"
        title="The P.A.T.H.™"
        intro={
          <>
            Prepare. Align. Take Off. Habits. The four stages of change behind every engagement we run, and the reason
            our work holds after the deck is archived. It is how organizations learn to do epic{" "}
            <ShIFt lowercase onDark />: from the first honest question to the habits that make it second nature.
          </>
        }
        image={colorfulPath}
        imageAlt="A winding wooden path painted in bands of pink, raspberry, gold, green, teal and navy"
        ghost="P"
      />

      {/* The four stages */}
      <section aria-label="The four stages of change" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="max-w-4xl">
          <Kicker>The Thinking Behind It</Kicker>
          <Prose>
            <p>
              Most change methodologies start at Take Off: a plan, a launch, a communications cascade. The P.A.T.H.
              begins two stages earlier, while there is still room to shape the possibility: understanding what your
              organization is built to carry, and bringing the people who will carry it into genuine alignment.
            </p>
          </Prose>
        </div>

        <ol className="mt-14 space-y-16 md:mt-20 md:space-y-24">
          {STAGES.map((stage, i) => (
            <li key={stage.letter}>
              <article
                aria-labelledby={`stage-${stage.letter}`}
                className={`grid items-start gap-8 md:grid-cols-12 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="md:col-span-4">
                  <div
                    aria-hidden="true"
                    className={`flex h-36 w-36 items-center justify-center rounded-3xl font-display text-7xl font-bold md:h-44 md:w-44 ${stage.fill}`}
                  >
                    {stage.letter}
                  </div>
                  <p className="label-kicker mt-4 text-raspberry">Stage {i + 1} of 4</p>
                </div>
                <div className="md:col-span-8">
                  <h2 id={`stage-${stage.letter}`} className={V3_H2}>
                    {stage.name}
                  </h2>
                  <p className="mt-2 font-display text-lg italic text-foreground">{stage.question}</p>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground">{stage.body}</p>
                  <div className="mt-6 max-w-2xl border-l-4 border-gold bg-cream p-5">
                    <p className="text-sm leading-relaxed text-foreground">
                      <span className="font-semibold">For example: </span>
                      {stage.example}
                    </p>
                  </div>
                  <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-foreground">
                    <Check className="h-4 w-4 shrink-0 text-heading" aria-hidden="true" />
                    <span>Where we partner at this stage:</span>
                    <SmartLink to={stage.partner.to} className={LINK}>
                      <span>{stage.partner.label}</span>
                    </SmartLink>
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      {/* How the stages and the ShIFts fit together */}
      <section aria-labelledby="path-map" className="border-y border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Kicker>How It Fits Together</Kicker>
          <h2 id="path-map" className={`mt-5 max-w-3xl ${V3_H2}`}>
            Four Stages. Three <ShIFt plural />. One Map.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground">
            Prepare pairs with Envision. Align pairs with Architect: the intensive and sprint fortify your organization
            before execution. When you're ready, Embody is the invitation at Take Off, reinforcing your practice through
            Habits while your team designs and delivers the change.
          </p>

          {/* Desktop map */}
          <div className="mt-12 hidden md:block">
            <div className="grid grid-cols-4 gap-3" aria-hidden="true">
              {STAGES.map((s) => (
                <div key={s.letter} className={`label-kicker px-4 py-3 text-center ${s.fill}`}>
                  {s.name}
                </div>
              ))}
            </div>
            <div className="relative mt-3">
              <span aria-hidden="true" className="absolute -inset-y-2 left-1/2 w-px border-l-2 border-dashed border-gold" />
              <ul className="grid grid-cols-4 gap-3" aria-label="Which ShIFt partners at each stage">
              <li className="col-start-1 border border-prepare bg-white">
                <SmartLink to={ENVISION.to} className={`block px-4 py-3 ${LINK}`}>
                  <span>Envision <ShIFt /> · Prepare</span>
                </SmartLink>
              </li>
              <li className="col-start-2 border border-align bg-white">
                <SmartLink to={ARCHITECT.to} className={`block px-4 py-3 ${LINK}`}>
                  <span>Architect <ShIFt /> · Align</span>
                </SmartLink>
              </li>
              <li className="col-span-2 col-start-3 border border-habits bg-white">
                <SmartLink to={EMBODY.to} className={`block px-4 py-3 ${LINK}`}>
                  <span>Embody <ShIFt /> · Take Off and Habits</span>
                </SmartLink>
              </li>
              </ul>
            </div>
          </div>

          {/* Mobile map */}
          <ol className="mt-10 space-y-3 md:hidden" aria-label="Which ShIFt partners at each stage">
            {STAGES.map((s) => (
              <li key={s.letter} className="flex flex-col gap-3 border border-border bg-white p-4">
                <span className={`label-kicker self-start px-3 py-1 ${s.fill}`}>{s.name}</span>
                <SmartLink to={s.partner.to} className={`self-start ${LINK}`}>
                  <span>{s.partner.label}</span>
                </SmartLink>
              </li>
            ))}
          </ol>

          <p className="mt-6 flex max-w-3xl gap-3 text-sm leading-relaxed text-foreground">
            <span aria-hidden="true" className="mt-2.5 inline-block w-8 shrink-0 border-t-2 border-dashed border-gold" />
            <span>
              At the Architect retrospective, you decide whether another 90-day sprint should fortify a further pillar,
              or whether you're ready for Take Off and the invitation to Embody. Your team owns the design and delivery
              of its change; we don't write your implementation plan.
            </span>
          </p>
        </div>
      </section>

      {/* The Compass */}
      <section aria-labelledby="path-compass" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Kicker>The Compass</Kicker>
            <h2 id="path-compass" className={`mt-5 ${V3_H2}`}>
              Your P.A.T.H., in One Page
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground">
              The Epic <ShIFt /> Organizational Appraisal produces your P.A.T.H. Compass: which stage your organization
              is actually on, what's blocking the next one, and the sequence that makes each hold. It's the map the
              rest of the journey is drawn from.
            </p>
            <p className="mt-6 text-base">
              <SmartLink to={ENVISION.to} className={LINK}>
                <span>See how the appraisal works →</span>
              </SmartLink>
            </p>
          </div>
          <div className="lg:col-span-5">
            <img
              src={lightbulb}
              alt="A glowing lightbulb filled with swirls of color, standing in scattered paint and gold light"
              width={1920}
              height={1080}
              loading="lazy"
              className="h-72 w-full object-cover lg:h-96"
            />
          </div>
        </div>
      </section>

      {/* The Painted Porch Pillars */}
      <section id="pillars" aria-labelledby="path-pillars" className="border-t border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Kicker>The Painted Porch Pillars™</Kicker>
          <h2 id="path-pillars" className={`mt-5 max-w-3xl ${V3_H2}`}>
            Three Pillars, Read at Every Stage
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground">
            Every stage of the P.A.T.H. looks at your organization through three pillars at once.
          </p>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.name} className={`flex flex-col gap-3 border-t-8 bg-white p-7 ${p.bar}`}>
                <span className={`text-xs font-bold uppercase tracking-[0.14em] ${p.label}`}>{p.focus}</span>
                <h3 className="font-display text-2xl font-semibold leading-tight text-foreground">{p.name}</h3>
                <p className="text-base leading-relaxed text-foreground">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Start here: the three ShIFts, in order */}
      <section aria-labelledby="path-start" className="bg-teal-deep text-teal-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Kicker tone="onDark">Start Here</Kicker>
          <h2 id="path-start" className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">
            One Path. Three <ShIFt plural onDark />. In This Order.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-teal-foreground">
            You don't have to choose an offering. Everyone starts at the same door, and each step earns the next.
          </p>

          <ol className="mt-12 grid gap-6 lg:grid-cols-3">
            {JOURNEY.map((step) => (
              <li key={step.number} className={`flex flex-col border-t-4 bg-black/15 p-6 md:p-7 ${step.bar}`}>
                <span className="label-kicker text-[#F4C05E]">
                  {step.number} · {step.promise} · {step.stage}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">{step.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-teal-foreground">{step.body}</p>
                <dl className="mt-5 flex-1 space-y-3 border-t border-white/25 pt-4 text-sm">
                  <div>
                    <dt className="label-kicker text-[#F4C05E]">Outcome</dt>
                    <dd className="mt-1 leading-relaxed">{step.outcome}</dd>
                  </div>
                  <div>
                    <dt className="label-kicker text-[#F4C05E]">You Receive</dt>
                    <dd className="mt-1 leading-relaxed">{step.deliverable}</dd>
                  </div>
                </dl>
                <SmartLink to={step.to} className={`mt-6 self-start text-sm ${LINK_ON_DARK}`}>
                  <span>{step.cta} →</span>
                </SmartLink>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTABand
        title="Find Out Where You Are on the P.A.T.H."
        body="Every journey starts with a Clarity Call: 60 minutes with Amy to read where your organization is on the P.A.T.H. and what makes sense next."
        to={clarityCallHrefFor("where we are on the P.A.T.H.")}
        label="Start with a Clarity Call"
        image={colorBurst}
        imageAlt="A burst of teal, green, orange, raspberry, purple and gold color powder against black"
        imageWidth={1920}
        imageHeight={1080}
        secondary={
          <>
            Not sure yet?{" "}
            <button type="button" onClick={openQuiz} className="font-semibold underline underline-offset-4">
              Take the Ready for Epic <ShIFt onDark /> quiz
            </button>
          </>
        }
      />
    </div>
  );
}
