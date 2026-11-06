import { Check } from "lucide-react";
import porchInColor from "@/assets/embody-hero-option1.jpg";
import stoa from "@/assets/embody-concept-stoa.jpg";
import pergola from "@/assets/embody-hero-option10.jpg";
import { CTABand, Kicker, PageHero, Prose, V3_H2 } from "@/components/v3/Bits";
import { StickyMedia } from "@/components/v3/Motion";
import { ShIFt } from "@/components/v3/ShIFt";
import { PartnershipPromiseNote } from "@/components/v3/PartnershipPromiseNote";
import { SmartLink } from "@/components/pps/SmartLink";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Embody ShIFt: the offer that partners from the Take Off stage of the P.A.T.H.
 * through Habits. Ported from pps-simplified src/routes/embody-shift.tsx. Draft
 * at /embody-shift (PageGate in PPSLayout) until release.
 *
 * Price: $9,000–$18,000 per month (PPS-DEC-0020). Naming: PPS-DEC-0018.
 * Styling and the IF in shIFt: PPS-DEC-0022.
 */

const TITLE = "Embody ShIFt | Painted Porch Strategies";
const DESCRIPTION =
  "Ongoing advisory while your organization designs and leads the change it envisioned and authored, reinforcing it as a continuous practice. $9,000–$18,000 per month, depending on advisory depth and need.";

const LINK = "font-semibold text-heading underline decoration-heading/40 underline-offset-4 hover:decoration-heading";

const practices = [
  "Ongoing advisory during your change journey and beyond",
  "Habits, rhythms, and rituals that reinforce your new way of working",
  "Judgment and decision authority that keep your organization leading its own change",
  "Reinforcement of the three Painted Porch Pillars: leaders, teams, and operations",
  "Change, innovation, and transformation as an ongoing, continuous practice",
];

export default function EmbodyShift() {
  const { open: openQuiz } = usePathFinderQuiz();

  useDocumentSeo({
    title: TITLE,
    description: DESCRIPTION,
    ogImage: porchInColor,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Embody ShIFt",
      serviceType: "Retained organizational advisory",
      description: DESCRIPTION,
      url: `${getSiteUrl()}/embody-shift`,
      provider: { "@type": "Organization", name: "Painted Porch Strategies" },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          minPrice: 9000,
          maxPrice: 18000,
          priceCurrency: "USD",
          unitText: "MONTH",
        },
      },
    },
  });

  return (
    <div className="pps-v3">
      <PageHero
        kicker="TAKE OFF AND CREATE HABITS · BECOME IT"
        title={
          <>
            Embody <ShIFt onDark />
          </>
        }
        intro="Your organization is ready to design and lead the change it envisioned and authored. Ongoing advisory reinforces the habits, judgment, decision authority, and structures that make change, innovation, and transformation a continuous practice."
        image={porchInColor}
        imageAlt="A wooden porch filled with bursts of teal, purple, lime, gold and raspberry color"
        tone="habits"
        ghost="E"
      />

      {/* The practice */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <StickyMedia
          src={stoa}
          alt="A long stone colonnade in warm afternoon light"
          width={1920}
          height={1080}
        >
          <div>
            <Kicker>The Practice</Kicker>
            <h2 className={`mt-5 ${V3_H2}`}>
              Where the <ShIFt /> Becomes Who You Are
            </h2>
            <Prose>
              <p>
                Embody <ShIFt /> begins when your organization is ready to design and lead the change it envisioned and
                authored for itself. You own that change. Our ongoing advisory partnership begins at Take Off and
                continues through Habits on{" "}
                <SmartLink to="/the-path" className={LINK}>
                  <span>the P.A.T.H.™</span>
                </SmartLink>
                , during your change journey and beyond.
              </p>
              <p>
                At the Architect <ShIFt /> retrospective, you decide whether another pillar needs fortifying through a
                further sprint or your organization is ready to take off. Embody reinforces your habits, judgment,
                decision authority, and the three Painted Porch Pillars, so change becomes more than a project, and
                change, innovation, and transformation become an ongoing, continuous practice.
              </p>
            </Prose>
            <p className="mt-6 text-base leading-relaxed text-foreground">
              Not there yet?{" "}
              <SmartLink to="/architect-shift" className={LINK}>
                <span>
                  See how Architect <ShIFt /> prepares the ground →
                </span>
              </SmartLink>
            </p>
          </div>
        </StickyMedia>
      </section>

      {/* What we co-create */}
      <section className="surface-painted">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
          <Kicker>What We Co-create</Kicker>
          <h2 className={`mt-5 ${V3_H2}`}>A Continuous Practice, Not a Finish Line</h2>
          <ul className="mt-10 space-y-4">
            {practices.map((p) => (
              <li key={p} className="flex gap-3 text-base leading-relaxed text-foreground">
                <Check className="mt-1 h-5 w-5 shrink-0 text-habits-deep" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The investment */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <Kicker>The Investment</Kicker>
          <h2 className={`mt-5 ${V3_H2}`}>
            $9,000–$18,000 <span className="block text-xl font-semibold text-foreground">per month</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-foreground">Depending on advisory depth and need.</p>
          <p className="mt-8 border-l-4 border-habits pl-5 text-base leading-relaxed text-foreground">
            After Embody: change, innovation, and transformation stay an ongoing practice, held by your people, not
            managed as a project.
          </p>
        </div>
      </section>

      {/* Our Partnership Promise, from Our Approach (PPS Admin, 2026-11-06) */}
      <PartnershipPromiseNote />

      <CTABand
        tone="habits"
        title={
          <>
            Ready to Make <ShIFt onDark /> a Practice?
          </>
        }
        body={
          <>
            Every journey starts with a Clarity Call. If you're finishing Architect <ShIFt onDark />, the invitation to
            Embody opens at your retrospective.
          </>
        }
        to={clarityCallSectionHref("embody")}
        label="Start with a Clarity Call"
        image={pergola}
        imageAlt="A finished pergola with teal, purple, lime, gold and raspberry beams standing on its blueprint"
        imageWidth={1344}
        imageHeight={768}
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
