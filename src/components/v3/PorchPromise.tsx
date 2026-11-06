import type { ReactNode } from "react";
import { Kicker, V3_H2 } from "./Bits";
import { ShIFt } from "./ShIFt";

/**
 * The Painted Porch Promise: "If yes / If not yet / If not us".
 *
 * It first appeared on the homepage. PPS Admin (2026-11-06) added it to the
 * Envision, Architect and Embody ShIFt pages, so the copy lives here once.
 *
 * Box colors read green, yellow, red: Lime, Gold, Raspberry (PPS Admin,
 * 2026-11-06). Gold takes dark text: white on Gold is 2.2:1, #1E2B30 is 7:1
 * (PPS-DEC-0022).
 */
const PORCH_PROMISE: { label: string; box: string; body: ReactNode }[] = [
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
    box: "bg-gold text-[#1E2B30]",
    body: "We tell you the truth, and we map a P.A.T.H.way to build the capacity you need first.",
  },
  {
    label: "If not us",
    box: "bg-raspberry text-white",
    body: "We tell you that, too, and connect you with the right partner for your stage.",
  },
];

const EYEBROW = "The Painted Porch Promise";
const HEADING = "We Aren't Here to Tell You Yes";
const INTRO =
  "We're here to tell you what will actually work, and what it will take to make it happen. The question we begin with is whether what you're considering is the right thing to do right now.";
const CLOSING = "We don't slow you down. We make sure you're moving on ground that holds.";

function PromiseBoxes({ testId }: { testId: string }) {
  return (
    <ul data-testid={testId} className="grid gap-6 md:grid-cols-3">
      {PORCH_PROMISE.map((p) => (
        <li key={p.label} data-testid={`${testId}-box`} className={`flex flex-col gap-2.5 p-8 ${p.box}`}>
          <span className="font-display text-[22px] font-bold leading-tight">{p.label}</span>
          <p className="text-[17px] leading-relaxed">{p.body}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * `home` keeps the homepage's larger type and cream band exactly as approved;
 * the homepage's visual baselines are taken from it. `page` matches the
 * section headings on the ShIFt pages, on a white band.
 */
export function PorchPromise({
  variant = "page",
  headingId = "porch-promise",
  testId = "porch-promise",
}: {
  variant?: "home" | "page";
  headingId?: string;
  testId?: string;
}) {
  if (variant === "home") {
    return (
      <section aria-labelledby={headingId} className="bg-cream">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-9 px-5 py-14 md:px-6 md:py-24">
          <div className="flex max-w-[860px] flex-col gap-5">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-raspberry">{EYEBROW}</p>
            <h2
              id={headingId}
              className="font-display text-[30px] font-bold leading-[1.12] text-primary [text-wrap:balance] md:text-[40px] lg:text-[48px]"
            >
              {HEADING}
            </h2>
            <p className="max-w-[40em] text-[17px] leading-relaxed">{INTRO}</p>
          </div>
          <PromiseBoxes testId={testId} />
          <p className="max-w-[30em] font-display text-[22px] font-semibold leading-snug text-primary md:text-[30px]">
            {CLOSING}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby={headingId} className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="max-w-3xl">
          <Kicker>{EYEBROW}</Kicker>
          <h2 id={headingId} className={`mt-5 ${V3_H2}`}>
            {HEADING}
          </h2>
          <p className="mt-5 max-w-[40em] text-base leading-relaxed text-foreground">{INTRO}</p>
        </div>
        <div className="mt-10">
          <PromiseBoxes testId={testId} />
        </div>
        <p className="mt-10 max-w-[30em] font-display text-xl font-semibold leading-snug text-heading md:text-2xl">
          {CLOSING}
        </p>
      </div>
    </section>
  );
}
