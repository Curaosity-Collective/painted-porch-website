import { PARTNERSHIP_PROMISE } from "@/data/partnershipPromise";

/**
 * Our Partnership Promise on the ShIFt pages (PPS Admin, 2026-11-06), the
 * statement Our Approach closes with, in the redesign's style: a lime-tinted
 * box with 8px corners. The title is Lime Deep, not Lime: Lime text fails AA
 * on a light tint (PPS-DEC-0022).
 */
export function PartnershipPromiseNote({ showSeparator = true }: { showSeparator?: boolean }) {
  return (
    <section aria-labelledby="partnership-promise" className={showSeparator ? "border-t border-border bg-background" : "bg-background"}>
      <div className="mx-auto max-w-3xl px-6 py-14 md:py-16">
        <div data-testid="partnership-promise" className="rounded-[8px] border border-lime-deep/30 bg-lime-deep/5 p-6 md:p-8">
          <h2 id="partnership-promise" className="font-display text-xl font-semibold text-lime-deep md:text-2xl">
            {PARTNERSHIP_PROMISE.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-foreground md:text-[17px]">{PARTNERSHIP_PROMISE.body}</p>
        </div>
      </div>
    </section>
  );
}
