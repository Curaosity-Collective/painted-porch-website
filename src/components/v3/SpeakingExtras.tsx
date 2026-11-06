import { Link } from "react-router-dom";
import { CERTIFICATIONS } from "@/data/certifications";

/**
 * Compact additions to the live speaking pages, approved by PPS Admin on
 * 2026-11-05 (plan Phase 3, §8). The live pages keep their layout; these
 * render only when the restyle is on (useV3Skin). Copy is from the draft
 * site's speaking page, kept short: no long text blocks.
 */

const OUTCOMES = [
  {
    title: "Language they keep using",
    body: "A shared vocabulary for what's happening to them, still in use in meetings months later.",
  },
  {
    title: "One thing to do next week",
    body: "Every session ends with a concrete move, not a glow that fades on the drive home.",
  },
  {
    title: "A room that talks to each other",
    body: "Conversation is built in, so the value doesn't end when the microphone goes down.",
  },
];

const FORMATS = [
  { label: "Keynote", body: "45–60 minutes, opening or closing" },
  { label: "Breakout or half-day", body: "Deeper practice on one topic" },
  { label: "Full-day workshop", body: "For teams that came to build something" },
  { label: "Panel & moderation", body: "Interviews, firesides and panels" },
];

const STEPS = [
  "Tell us the event, the audience, and the outcome you need.",
  "We propose the right speaker, topic, and format, usually within two business days.",
  "A short prep call tailors the session to your people.",
  "We show up early, stay late, and leave your audience with something to use.",
];

const H2 = "text-3xl md:text-4xl font-bold text-navy";

export function AudienceOutcomes() {
  return (
    <section aria-labelledby="speaking-outcomes" className="py-16 md:py-20 bg-muted/40">
      <div className="container max-w-7xl mx-auto px-6">
        <h2 id="speaking-outcomes" className={`${H2} text-center mb-10`}>
          What Your Audience Leaves With
        </h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {OUTCOMES.map((o) => (
            <li key={o.title} className="rounded-xl border-t-4 border-primary bg-white p-6 shadow-sm">
              <h3 className="font-poppins text-lg font-semibold text-foreground">{o.title}</h3>
              <p className="mt-2 text-body text-foreground">{o.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HowBookingWorks({ contactHref }: { contactHref: string }) {
  return (
    <section aria-labelledby="speaking-booking" className="py-16 md:py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <h2 id="speaking-booking" className={`${H2} text-center mb-10`}>
          How Booking Works
        </h2>
        <ul aria-label="Formats" className="flex flex-wrap justify-center gap-3">
          {FORMATS.map((f) => (
            <li key={f.label} className="rounded-lg bg-muted px-4 py-2.5 text-center">
              <span className="block font-poppins text-sm font-semibold text-foreground">{f.label}</span>
              <span className="block text-xs text-muted-foreground">{f.body}</span>
            </li>
          ))}
        </ul>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-poppins font-bold text-white"
              >
                {i + 1}
              </span>
              <p className="text-body text-foreground">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link
            to={contactHref}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-gold px-6 font-poppins font-semibold text-[#1E2B30] transition-colors hover:bg-gold/85"
          >
            Inquire About Speaking
          </Link>
        </div>
      </div>
    </section>
  );
}

/** A compact row of credential badges, from the shared certification list. */
export function CredentialBadges({ names, firstName }: { names: string[]; firstName: string }) {
  const badges = CERTIFICATIONS.filter((c) => names.includes(c.name));
  if (badges.length === 0) return null;
  return (
    <div className="mt-8 border-t border-border pt-6">
      <h3 className="font-poppins text-base font-semibold text-foreground">{firstName}'s Credentials</h3>
      <ul className="mt-4 flex flex-wrap items-start gap-x-6 gap-y-4">
        {badges.map((c) => (
          <li key={c.name} className="flex w-20 flex-col items-center gap-1.5 text-center">
            <img src={c.badge} alt="" loading="lazy" className="h-12 w-auto max-w-full object-contain" />
            <span className="text-xs leading-snug text-foreground">{c.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
