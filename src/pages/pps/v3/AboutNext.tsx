import porchTemple from "@/assets/about/painted-porch-temple.jpg";
import porchSunset from "@/assets/heroes/about-hero.jpg";
import blueDoor from "@/assets/v3/blue-door.jpg";
import amyPhoto from "@/assets/team/amy-yackowski.png";
import robPhoto from "@/assets/team/rob-hunter-desk.jpg";
import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";
import { Check, X } from "lucide-react";
import { CTABand, Kicker, PageHero, Prose, V3_H2 } from "@/components/v3/Bits";
import { ShIFt } from "@/components/v3/ShIFt";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import { SmartLink } from "@/components/pps/SmartLink";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";
import { CERTIFICATIONS } from "@/data/certifications";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";

/**
 * About: ported from pps-simplified src/routes/about.tsx (Oct 2026), the
 * newer of the two About pages. It became /about at the relaunch (plan
 * Phase 5); the About page before it is archived at /about-archive.
 *
 * Team titles match the live speaker pages each card links to; the draft's
 * /about/amy-style bio pages don't exist here (plan §4 merges those bios into
 * /speaking/*). Certifications are the shared list the live Our Approach page
 * uses. Images (PPS-DEC-0023): the live About page's painted temple and
 * porch-at-sunset images, which move with the page; team photos are each
 * person's own speaker-page image. Styling and the IF in shIFt: PPS-DEC-0022.
 */

const TITLE = "About | Painted Porch Strategies";
const DESCRIPTION =
  "Named for the Stoa Poikile, the painted porch where philosophy went public. Twenty-plus years of organizational change, practiced at the decision, not the delivery.";

const LINK = "font-semibold text-heading underline decoration-heading/40 underline-offset-4 hover:decoration-heading";

const TEAM = [
  {
    name: "Amy Yackowski",
    title: "Founder | Chief Evolution Officer | Organizational Shift Strategist",
    to: "/speaking/amy",
    photo: amyPhoto,
    position: "object-center",
  },
  {
    name: "Rob Hunter",
    title: "Chief Storytelling Officer | M.C., Master of Communication",
    to: "/speaking/rob",
    // Rob at his desk (a second photo PPS Admin supplied, 2026-11-07), cropped square and centred on
    // him at the same scale as Amy's and Sierra's. His speaker photo is portrait with him right of
    // centre, so a circle couldn't centre him without zooming in.
    photo: robPhoto,
    position: "object-center",
  },
  {
    name: "Sierra Ramm Cantrell",
    title: "Chief Joy Officer | M.B.A., Mind-Body Architect | Mindfulness Sherpa",
    to: "/speaking/sierra",
    photo: sierraPhoto,
    position: "object-center",
  },
];

const THRIVES = [
  "You can feel that conventional change management isn't enough for what you're being called to build, even if you haven't had the words for it.",
  "You value an honest view of your organization's capacity, because clarity expands what becomes possible.",
  "You believe rigor and play belong in the same room, and you want a partner who brings both.",
];

/**
 * Core values and manifesto: moved here from Our Approach (PPS Admin, 2026-11-06).
 * Wording unchanged apart from contractions (PPS Admin, 2026-11-06).
 */
const CORE_VALUES = [
  {
    number: "01",
    title: "Purpose",
    body: "We exist to change how people design, define, and connect with their work, so they can lead with more clarity, more strength, and more meaning.",
    detail: "That shows up as mindful leaders, resilient teams, and communication that actually lands.",
    bar: "border-strategic",
  },
  {
    number: "02",
    title: "Partnership",
    body: "You're the expert of you (and your teams and organization). We bring frameworks, genuine curiosity, and outside perspective. You bring the context only you can see.",
    detail: "We partner as co-architects and advisors, not vendors. The win is when you can carry the work without us.",
    bar: "border-primary",
  },
  {
    number: "03",
    title: "Stewardship",
    body: "Real results come from shared commitment, trust, and clear accountability from both seats on the porch.",
    detail: "We're here to do good work that makes financial sense and carries personal meaning, where talent, purpose, and contribution align.",
    bar: "border-lime-deep",
  },
];

const BELIEFS = [
  "People are the most critical infrastructure of every transformation.",
  "Clarity comes before strategy, not after it.",
  "Curious questions are more useful than confident answers.",
  "Frameworks are tools, not religions.",
  "Change that doesn't respect culture won't hold.",
];

const REJECTS = [
  "Change theater that looks busy but moves nothing.",
  "One-size playbooks dropped on a unique organization.",
  "Treating people like obstacles to manage or “convince.”",
  "Tech rollouts that skip the human work.",
  "Speed for its own sake.",
];

const HOW_WE_WORK = [
  {
    title: "Curious, on purpose",
    body: "We ask the question nobody put on the agenda. Usually it's the one that unlocks the room.",
  },
  {
    title: "Playful, not precious",
    body: "Serious about the work, not the way. Expect borrowed philosophy, honest laughter, and the occasional Alice reference.",
  },
  {
    title: "Direct, with care",
    body: "We complete your thinking rather than correct it, and we say the true thing, kindly, early.",
  },
];

export default function AboutNext() {
  const { open: openQuiz } = usePathFinderQuiz();

  useDocumentSeo({ title: TITLE, description: DESCRIPTION, ogImage: porchSunset });

  return (
    <div className="pps-v3">
      <PageHero
        kicker="Who We Are"
        title="Named for a Porch Where Philosophy Went Public"
        intro="The Stoa Poikile, the Painted Porch, is where the Stoics taught in Athens: wisdom out in the open, for everyone. We took the name and brought it into the modern world of business."
        image={porchTemple}
        imageAlt="A colonnade painted teal, lime, orange, gold and purple above the sea, with bright chairs on its stone porch"
        ghost="S"
      />

      {/* Our approach */}
      <section aria-labelledby="about-approach" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Kicker>Upstream of the Rollout</Kicker>
            <h2 id="about-approach" className={`mt-5 ${V3_H2}`}>
              We Design Your Next <ShIFt />. You Make It Happen.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <Prose>
              <p>
                Every change has a moment when it can still become exactly what you intend. Once it starts moving, it
                gathers momentum in whatever direction it's pointed.
              </p>
              <p>
                We work in that window: before the rollout, before the roadmap, before resources, credibility, and
                momentum are committed to a direction. We call it{" "}
                <SmartLink to="/phase-zero" className={LINK}>
                  Phase Zero™
                </SmartLink>
                .
              </p>
              <p>
                Painted Porch Strategies is a change-origination practice, and for more than twenty years we've partnered
                with leaders to use that time well, while there's still room to imagine, align, and architect what comes
                next.
              </p>
              <p>
                We look at three things at once: your leadership and culture, your systems and workflows, and the human
                capacity underneath both. When those dimensions move together, organizations can pursue greater
                innovation, growth, and opportunity without asking their people to carry the <ShIFt lowercase /> through
                effort alone.
              </p>
              <p>
                And we build with your leaders rather than for them, expanding their capacity to author the future long
                after we leave.
              </p>
              <p>
                Everything we do serves one purpose: developing extraordinary teams who can do epic <ShIFt lowercase />{" "}
                and carry the mission further than any single leader could.
              </p>
            </Prose>
            <p className="mt-6 text-base">
              <SmartLink to="/the-path" className={LINK}>
                <span>See how the work unfolds on the P.A.T.H. →</span>
              </SmartLink>
            </p>
          </div>
        </div>
      </section>

      {/* Core values (from Our Approach, PPS Admin 2026-11-06) */}
      <section aria-labelledby="about-values" className="border-t border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Kicker>What Guides Us</Kicker>
          <h2 id="about-values" className={`mt-5 ${V3_H2}`}>
            Our Core Values
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground">
            Three values that decide how we show up in every partnership.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {CORE_VALUES.map((v) => (
              <li key={v.title} className={`rounded flex flex-col gap-3 border-t-8 bg-white p-7 ${v.bar}`}>
                <span aria-hidden="true" className="font-display text-4xl font-bold text-heading/20">
                  {v.number}
                </span>
                <h3 className="font-display text-2xl font-semibold leading-tight text-foreground">{v.title}</h3>
                <p className="text-base leading-relaxed text-foreground">{v.body}</p>
                <p className="text-base leading-relaxed text-foreground/80">{v.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Manifesto (from Our Approach, PPS Admin 2026-11-06) */}
      <section aria-labelledby="about-manifesto" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Kicker>Our Manifesto</Kicker>
        <h2 id="about-manifesto" className={`mt-5 ${V3_H2}`}>
          What We Stand For, and What We Won't Do
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded border border-border border-t-4 border-t-lime-deep bg-white p-7">
            <h3 className="font-display text-2xl font-semibold text-foreground">What we believe</h3>
            <ul className="mt-5 space-y-3">
              {BELIEFS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-base leading-relaxed text-foreground">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-lime-deep" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-border border-t-4 border-t-raspberry bg-white p-7">
            <h3 className="font-display text-2xl font-semibold text-foreground">What we reject</h3>
            <ul className="mt-5 space-y-3">
              {REJECTS.map((r) => (
                <li key={r} className="flex items-start gap-3 text-base leading-relaxed text-foreground">
                  <X className="mt-1 h-5 w-5 shrink-0 text-raspberry" aria-hidden="true" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Who thrives here */}
      <section aria-labelledby="about-thrives" className="bg-teal-deep text-teal-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Kicker tone="onDark">Who Thrives Here</Kicker>
          <h2 id="about-thrives" className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-4xl">
            You'll Like Us If…
          </h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {THRIVES.map((line) => (
              <li key={line} className="border-l-2 border-gold pl-5 text-base leading-relaxed text-teal-foreground">
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-base italic text-teal-foreground">
            If "good enough" has stopped feeling good enough, you'll feel at home on the porch.
          </p>
        </div>
      </section>

      {/* The practitioners */}
      <section aria-labelledby="about-team" className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Kicker>The Practitioners</Kicker>
          <h2 id="about-team" className={`mt-5 ${V3_H2}`}>
            Different Disciplines. Shared Conviction.
          </h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {TEAM.map((p) => (
              <li key={p.name} className="rounded flex flex-col border-t-4 border-heading bg-white p-6">
                {/* Round crops: Amy's speaker photo is already a circular cut-out. */}
                <img
                  src={p.photo}
                  alt={p.name}
                  width={160}
                  height={160}
                  loading="lazy"
                  className={`h-40 w-40 rounded-full object-cover ${p.position}`}
                />
                <div className="mt-5 flex flex-1 flex-col gap-2">
                  <h3 className="font-display text-xl font-semibold text-foreground">{p.name}</h3>
                  <p className="text-sm leading-relaxed text-foreground">{p.title}</p>
                  <SmartLink to={p.to} className={`mt-auto self-start pt-3 text-sm ${LINK}`}>
                    <span>
                      Meet {p.name.split(" ")[0]} →
                    </span>
                  </SmartLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Credentials */}
      <section aria-labelledby="about-credentials" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <h2 id="about-credentials" className={V3_H2}>
          Credentials &amp; Certifications
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground">
          Frameworks are only useful in practiced hands. Ours are certified in most of the ones you've heard of, and
          opinionated about when to use none of them.
        </p>
        <ul className="mt-10 grid grid-cols-3 gap-6 sm:grid-cols-5 lg:grid-cols-7">
          {CERTIFICATIONS.map((c) => (
            <li key={c.name} className="flex flex-col items-center gap-2 text-center">
              <img src={c.badge} alt="" loading="lazy" className="h-14 w-auto max-w-full object-contain" />
              <span className="text-xs leading-snug text-foreground">{c.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How we work */}
      <section aria-labelledby="about-how" className="border-t border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <h2 id="about-how" className={V3_H2}>
            How We Work
          </h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-3">
            {HOW_WE_WORK.map((item) => (
              <li key={item.title}>
                <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ClientLogoMarquee
        heading={
          <span className="block text-[13px] font-bold uppercase tracking-[0.14em] text-[#5F6B70]">
            Organizations we've worked alongside
          </span>
        }
      />

      <CTABand
        title="Author What Comes Next"
        body="If your organization is being called toward something greater, start with a Clarity Call: 60 minutes with Amy to see what's possible."
        to={clarityCallSectionHref()}
        label="Start with a Clarity Call"
        // The blue door: what comes next, and where the Clarity Call leads (PPS Admin, 2026-11-07). The
        // charcoal wash sets the band apart from the teal footer, as on the other main pages.
        image={blueDoor}
        imageAlt="A cobalt-blue door set into a pale stone wall"
        imageWidth={1408}
        imageHeight={1008}
        photoProfile="cta-photo-charcoal"
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
