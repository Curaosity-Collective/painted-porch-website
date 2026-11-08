import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import lanternPath from "@/assets/heroes/approach-hero.jpg";
import architecturalModel from "@/assets/embody-concept-model.jpg";
import sunlitColumns from "@/assets/embody-concept-pillars.jpg";
import { CTABand, Kicker, PageHero, Prose, V3_H2 } from "@/components/v3/Bits";
import { GhostLayer, StickyMedia } from "@/components/v3/Motion";
import { ShIFt } from "@/components/v3/ShIFt";
import { PartnershipPromiseNote } from "@/components/v3/PartnershipPromiseNote";
import { SmartLink } from "@/components/pps/SmartLink";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Architect ShIFt: the offer that partners on the Align stage of the P.A.T.H.
 * Ported from pps-simplified src/routes/architect-shift.tsx. Draft at
 * /architect-shift (PageGate in PPSLayout) until release.
 *
 * Price: "Starting at $90,000", weekly and biweekly versions, not itemized
 * (PPS-DEC-0020); the draft's $136,000 is superseded. Naming: PPS-DEC-0018.
 * Styling and the IF in shIFt: PPS-DEC-0022.
 */

const TITLE = "Architect ShIFt | Painted Porch Strategies";
const DESCRIPTION =
  "An executive strategy & authorship intensive, a 90-day pillar-fortification sprint and a retrospective that decides your organization's next step. Starting at $90,000, in a weekly or a biweekly version.";

const LINK = "font-semibold text-heading underline decoration-heading/40 underline-offset-4 hover:decoration-heading";

/**
 * The six trigger moments (ICP Intelligence Document v1.0, Section 3), as the common catalysts for
 * architecting shIFt. Each card gives the leader's own words, then what Architect ShIFt does first.
 * Approved by PPS Admin, 2026-11-06. Three of the quotes are shortened from the ICP wording:
 * Technology / AI, Merger, and Change That Hasn't Stuck.
 */
const catalysts = [
  {
    lead: "Technology or AI Initiative",
    question: "Who do we become when AI is part of how we think, decide, and operate?",
    detail: "Answer that before you pick the tools or plan the rollout.",
  },
  {
    lead: "Growth Inflection",
    question: "We're growing, but are we becoming anything, or just getting bigger?",
    detail: "Rebuild the decision-making and coordination that worked at your last size, before growth outruns them.",
  },
  {
    lead: "Leadership Transition",
    question: "The leadership changed. Did the organization?",
    detail: "Prepare the organization to carry the new direction, before or soon after the new leaders arrive.",
  },
  {
    // After the deal: the appraisal treats an active merger as a reason to hold back.
    lead: "Merger or Restructure",
    question: "We merged the operations. We never merged the identities.",
    detail: "Once the deal closes, fortify a shared foundation before your team designs the integration or the new structure.",
  },
  {
    lead: "Change That Hasn't Stuck",
    question: "The programs end. The problems don't.",
    detail: "Reinforce the cultural foundation the last programs never reached, before your team launches the next one.",
  },
  {
    lead: "Board or Market Mandate",
    question: "The mandate arrived. The architecture to fulfill it didn't.",
    detail: "Whether it's a board directive, market shift, new regulation or 3–5 year plan, build the capacity to deliver it before the deadline arrives.",
  },
];

const differenceRows = [
  {
    traditional: "Begins with a selected tool, vendor, or solution.",
    sprint: "Begins with the shift you're called to lead and what it could make possible.",
  },
  {
    traditional: "Applies a proven playbook to reach resolution.",
    sprint: "Builds your organization's capacity for lasting evolution.",
  },
  {
    traditional: "Optimizes for a successful go-live.",
    sprint: "Fortifies the organization so your team can design and carry its next change.",
  },
  {
    traditional: "Hands the plan to your team.",
    sprint: "Builds the architecture with your leaders so they own what comes next.",
  },
];

const included = [
  "3-day executive strategy & authorship intensive with your senior team",
  "Shared direction and identification of the pillar or pillars needing reinforcement first",
  "90-day strategic sprint fortifying the prioritized pillars before your change execution",
  "An organizational architecture blueprint, not your change implementation plan",
  "A dedicated day (weekly or bi-weekly) exclusively for you for ongoing advisory equipping leaders, teams, and operations across the three Painted Porch Pillars",
  "1.5-day sprint retrospective and next-steps decision",
];

const steps = [
  { n: "01", t: "Author", d: "3-day executive strategy & authorship intensive: shared direction and the pillars to reinforce first." },
  { n: "02", t: "Fortify", d: "90-day strategic sprint: strengthen the prioritized pillars, structures, and capability before your change execution." },
  { n: "03", t: "Decide", d: "1.5-day retrospective: another fortification sprint, or readiness to design and lead your envisioned change." },
];

const faqs: { q: ReactNode; a: ReactNode; key: string }[] = [
  {
    key: "appraisal-first",
    q: (
      <>
        Do we need the Epic <ShIFt /> Organizational Appraisal first?
      </>
    ),
    a: (
      <>
        Yes. The appraisal is required before Architect <ShIFt />, and it begins with a Clarity Call. Your P.A.T.H.
        Compass grounds the intensive in shared evidence about your organization's architecture and capability.
      </>
    ),
  },
  {
    key: "includes",
    q: (
      <>
        What does Architect <ShIFt /> include?
      </>
    ),
    a: "One engagement, starting at $90,000 and offered in a weekly and a biweekly version: a 3-day executive strategy & authorship intensive, a 90-day strategic sprint, and a 1.5-day sprint retrospective and next-steps decision. The intensive identifies which pillar or pillars need reinforcement first; the sprint fortifies them before you execute your change.",
  },
  {
    key: "implementation-plan",
    q: "Are you creating our implementation plan?",
    a: "No. We co-architect the organizational foundation, not your future or your change implementation plan. The blueprint and advisory fortify the structures and capability your leaders, teams, and operations need to design and carry the change themselves.",
  },
  {
    key: "distributed",
    q: "What if our team is geographically distributed?",
    a: "The executive strategy & authorship intensive is in person. The sprint runs primarily virtually, with in-person checkpoint sessions when they add real value.",
  },
  {
    key: "retrospective",
    q: "What happens at the retrospective?",
    a: (
      <>
        Over 1.5 days, your team reflects on the sprint and makes the next-steps decision together. There are three
        routes forward: deepen the same pillar or pillars with another 90-day sprint; fortify a different pillar or
        area of the organization before your change begins; or declare your organization ready to design and lead what
        it envisioned and authored, the moment the invitation to Embody <ShIFt /> opens. The first two routes both
        lead into another 90-day sprint, agreed separately. The third ends Architect <ShIFt /> with your organization,
        not us, holding the design of the change, and Embody <ShIFt /> advisory reinforces capability, habits, and
        rhythms while you lead it.
      </>
    ),
  },
];

export default function ArchitectShift() {
  const { open: openQuiz } = usePathFinderQuiz();

  useDocumentSeo({
    title: TITLE,
    description: DESCRIPTION,
    ogImage: lanternPath,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Architect ShIFt",
      serviceType: "Organizational architecture engagement",
      description: DESCRIPTION,
      url: `${getSiteUrl()}/architect-shift`,
      provider: { "@type": "Organization", name: "Painted Porch Strategies" },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 90000, priceCurrency: "USD" },
      },
    },
  });

  return (
    <div className="pps-v3">
      <PageHero
        kicker="Align · Shape It"
        title={
          <>
            Architect <ShIFt onDark />
          </>
        }
        intro={
          <>
            Author the direction together. Fortify the pillars that need to hold first. Then decide whether your
            organization is ready to design and lead its next epic <ShIFt lowercase onDark />.
          </>
        }
        video={{ slotKey: "approach-hero", poster: lanternPath, alt: "Glowing lanterns along a winding road of golden light drawn across a dark blueprint" }}
        tone="align"
        ghost="A"
      />

      {/* The shape */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <StickyMedia
          src={architecturalModel}
          alt="A translucent architectural model lit by a single spotlight on a dark stage"
          width={1920}
          height={1080}
        >
          <div>
            <Kicker>The Shape</Kicker>
            <h2 className={`mt-5 ${V3_H2}`}>Turn Ambition Into Living Architecture</h2>
            <Prose>
              <p>
                Great organizations don't reach their next level by chance. They pair bold strategic vision with the
                living architecture (decisions, structures, rhythms, and capacity) that allows people to carry it
                forward.
              </p>
              <p>
                Architect <ShIFt /> combines the executive strategy & authorship intensive and strategic sprint in one engagement.
                Grounded in your Epic <ShIFt /> Organizational Appraisal, your senior team spends three days authoring
                shared direction and identifying which pillar or pillars need reinforcement first.
              </p>
              <p>
                The 90-day strategic sprint that follows fortifies those priorities before your change execution. An
                organizational architecture blueprint and ongoing advisory equip and fortify your leaders, your teams,
                and your operations across the three Painted Porch Pillars. We're not designing your future or writing
                your implementation plan. Your organization gains the structures and capability to design and lead the
                change it envisioned and authored.
              </p>
            </Prose>
            <div className="rounded mt-8 border-l-4 border-align bg-linen p-6">
              <p className="label-kicker text-muted-foreground">Format</p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
                <li>Run primarily virtually, with in-person checkpoint sessions when they add real value</li>
                <li>3-day in-person executive strategy & authorship intensive</li>
                <li>90-day strategic sprint focused on the pillars identified in the intensive</li>
                <li>1.5-day sprint retrospective and next-steps decision</li>
                <li>
                  Epic <ShIFt /> Organizational Appraisal required beforehand
                </li>
              </ul>
              <p className="label-kicker mt-5 text-muted-foreground">Investment</p>
              <p className="mt-2 font-display text-3xl font-bold text-heading">Starting at $90,000</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                Offered in a weekly and a biweekly version. The intensive, strategic sprint, and retrospective are one
                engagement.
              </p>
            </div>
          </div>
        </StickyMedia>
      </section>

      {/* What to expect */}
      <section className="relative bg-linen">
        <GhostLayer>A</GhostLayer>
        <div className="relative mx-auto max-w-4xl px-6 py-20 md:py-28">
          <Kicker>What to Expect</Kicker>
          <h2 className={`mt-5 ${V3_H2}`}>Author. Fortify. Decide.</h2>
          <Prose>
            <p>
              The executive strategy & authorship intensive brings the appraisal findings into the room with the leaders who will
              carry the change. Together, you author the direction, name the trade-offs, and identify which pillars or
              organizational areas need fortifying before execution.
            </p>
            <p>
              A sprint is shaped entirely by what comes out of your intensive, so no two look the same. What stays
              constant is the structure: a focused 90-day partnership with your leadership team, reinforcing the
              prioritized pillars and the capability your organization needs before it designs and leads its change.
              The sprint follows{" "}
              <SmartLink to="/the-path" className={LINK}>
                <span>the P.A.T.H.™</span>
              </SmartLink>
              : Prepare grounded in Envision, Align carried through Architect, and Take Off opening the invitation to
              Embody.
            </p>
          </Prose>
          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.t} className="rounded h-full border border-align/40 bg-white p-6">
                <span aria-hidden="true" className="font-display text-3xl font-bold text-align-deep">
                  {s.n}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm italic leading-relaxed text-muted-foreground">
            Your retrospective is a decision point, not an automatic launch. Fortify another pillar or area through a
            further 90-day sprint, or begin designing and leading your change with the invitation to Embody{" "}
            <ShIFt /> advisory.
          </p>
        </div>
      </section>

      {/* Where it fits */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Kicker>Where It Fits</Kicker>
        <h2 className={`mt-5 max-w-2xl ${V3_H2}`}>
          The Common Catalysts for Architecting <ShIFt />
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground">
          Most organizations we partner with are living one of these six moments, often two or three at once. Each asks
          more of the organization than its current architecture can carry. Authoring and architecting <ShIFt lowercase />{" "}
          fortifies it first, before your team designs and leads the change. Whether or not yours is listed, the{" "}
          <Link to="/envision-shift" className={LINK}>
            Epic <ShIFt /> Organizational Appraisal
          </Link>{" "}
          comes first. It tells us whether architecting <ShIFt lowercase /> is the right next step.
        </p>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {catalysts.map((app, i) => (
            <li key={app.lead} className="rounded flex h-full items-start gap-4 border border-align/40 bg-linen p-5">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-align/20 text-xs font-bold text-[#5A1420]"
              >
                {i + 1}
              </span>
              <div className="text-sm leading-relaxed text-foreground">
                <h3 className="font-display text-base font-semibold leading-snug text-foreground">{app.lead}</h3>
                {/* Raspberry marks the question, the conflict, the what IF (PPS Admin, 2026-11-06): 4.76:1 on linen. */}
                <p className="mt-2 font-display text-base italic leading-snug text-raspberry">&ldquo;{app.question}&rdquo;</p>
                <p className="mt-2">{app.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Different by design */}
      <section className="story-dark bg-align-ink text-teal-foreground">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Kicker tone="onDark">Different by Design</Kicker>
          <h2 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight text-white [text-wrap:balance] md:text-4xl">
            Built for Evolution, Not Only Implementation
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-teal-foreground/85">
            Traditional implementation work often begins with a chosen solution and optimizes for go-live. Architect{" "}
            <ShIFt onDark /> begins with your aligned ambition and builds the architecture your organization needs to
            carry it, while strengthening how your leaders author every <ShIFt lowercase onDark /> that follows.
          </p>
          <div className="rounded mt-12 grid gap-px overflow-hidden border border-teal-foreground/15 bg-teal-foreground/15 md:grid-cols-2">
            <div className="bg-align-ink p-6 md:p-8">
              <p className="label-kicker text-teal-foreground/75">Traditional implementation consulting</p>
              <ul className="mt-5 space-y-4">
                {differenceRows.map((row) => (
                  <li key={row.traditional} className="text-sm leading-relaxed text-teal-foreground/85">
                    {row.traditional}
                  </li>
                ))}
              </ul>
            </div>
            {/* White, not the pink Align fill (PPS Admin, 2026-11-06). */}
            <div className="bg-white p-6 md:p-8">
              <p className="label-kicker text-raspberry">
                Architect <ShIFt /> with Painted Porch
              </p>
              <ul className="mt-5 space-y-4">
                {differenceRows.map((row) => (
                  <li key={row.sprint} className="text-sm font-medium leading-relaxed text-foreground">
                    {row.sprint}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The investment */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <Kicker>The Investment</Kicker>
            <h2 className={`mt-5 ${V3_H2}`}>One Integrated Engagement</h2>
            <p className="mt-3 font-display text-2xl font-bold text-foreground">Starting at $90,000</p>
            <p className="mt-1 text-base text-foreground">Offered in a weekly and a biweekly version.</p>
            <p className="mt-6 text-lg leading-relaxed text-foreground">
              From shared authorship to organizational readiness, Architect <ShIFt /> includes:
            </p>
            <ul className="mt-6 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 leading-relaxed text-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-align-deep" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-prepare/40 bg-prepare/5 p-6 md:p-8">
            <p className="label-kicker text-prepare-deep">
              Prerequisite: the Epic <ShIFt /> Organizational Appraisal
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">
              Every Architect engagement begins with an honest read.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              The Epic <ShIFt /> Organizational Appraisal reveals where you really stand on the path to your next
              stage of becoming — and what's blocking progress.
              This interview-led organizational 360 includes six interviews (three executives, and three people from
              mid-level through the frontline) and your P.A.T.H. Compass. It's required before Architect <ShIFt /> and
              begins with a Clarity Call.
            </p>
            <Link
              to="/envision-shift"
              className="cta-label mt-6 inline-flex items-center gap-2 rounded border-2 border-prepare-deep px-5 py-3 font-display text-sm font-semibold text-prepare-deep transition-colors hover:bg-prepare-deep hover:text-white"
            >
              Explore Envision <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Common questions */}
      <section className="surface-painted">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
          <Kicker>Common Questions</Kicker>
          <h2 className={`mt-5 ${V3_H2}`}>Asked Before Most Sprints Begin</h2>
          <div className="mt-10 divide-y divide-heading/15 border-y border-heading/15">
            {faqs.map((faq) => (
              <details key={faq.key} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <span aria-hidden="true" className="text-raspberry transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-base leading-relaxed text-foreground">
            After your retrospective: another sprint, or the invitation to Embody <ShIFt />.{" "}
            <SmartLink to="/embody-shift" className={LINK}>
              <span>
                Explore Embody <ShIFt /> →
              </span>
            </SmartLink>
          </p>
        </div>
      </section>

      {/* Our Partnership Promise, from Our Approach (PPS Admin, 2026-11-06) */}
      <PartnershipPromiseNote />

      <CTABand
        tone="align"
        title="Every Journey Starts With a Clarity Call"
        body={
          <>
            Architect <ShIFt onDark /> follows the Epic <ShIFt onDark /> Organizational Appraisal, and the appraisal
            begins with a Clarity Call.
          </>
        }
        to={clarityCallSectionHref("architect")}
        label="Start with a Clarity Call"
        image={sunlitColumns}
        photoProfile="cta-photo-charcoal cta-photo-bright"
        imageAlt="Sunlight streaming between the columns of an enduring stone colonnade"
        imageWidth={1920}
        imageHeight={1080}
        secondary={
          <>
            Not sure where to begin?{" "}
            <button type="button" onClick={openQuiz} className="font-semibold underline underline-offset-4">
              Find Your Next <ShIFt onDark />
            </button>
          </>
        }
      />
    </div>
  );
}
