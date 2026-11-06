// Epic ShIFt Organizational Appraisal: single source of truth for public naming, price, and
// where its calls to action go.
//
// Governing decisions (pps-ops-hub docs/decisions):
// - PPS-DEC-0018: public name "Epic ShIFt Organizational Appraisal", $24,000, Clarity Call first.
// - PPS-DEC-0017: the retired Blue Door's public sale is closed; every Blue Door
//   link goes to this appraisal's page.
// - PPS-DEC-0010: six interviews, three executives and three people from
//   mid-level through the frontline.
//
// Internal identifiers deliberately keep their legacy names (quiz key
// `blueDoor`, contact interest value `blue-door`, GHL "Blue Door" option):
// only client-facing words change.

export const EPIC_SHIFT_APPRAISAL = {
  /** Public offering name. */
  name: "Epic ShIFt Organizational Appraisal",
  /** Canonical page ("Envision ShIFt"; "Epic" is dropped in titles and menus, PPS-DEC-0018). */
  path: "/envision-shift",
  /** Label for buttons that open the appraisal page. */
  ctaLabel: "Envision Epic ShIFt",
  priceUsd: 24000,
  priceDisplay: "$24,000",
  /** Short scope line used on cards and summaries. */
  scope: "Six interviews, executives to the frontline",
  /** One-sentence description used on cards, quiz results and emails. */
  summary:
    "An interview-led organizational 360: six interviews, from executives to the frontline, read out as your P.A.T.H. Compass.",
  /** The sequence rule from PPS-DEC-0018. */
  beginsWith: "Begins with a Clarity Call",
} as const;

/** What a Clarity Call request is about, by the page it started from. */
export const CLARITY_CALL_TOPICS = {
  appraisal: "the Epic ShIFt Organizational Appraisal",
  architect: "Architect ShIFt",
  embody: "Embody ShIFt",
  path: "where we are on the P.A.T.H.",
} as const;
export type ClarityCallTopic = keyof typeof CLARITY_CALL_TOPICS;

/** The homepage's Clarity Call section (price, what happens in the call, Amy's photo). */
export const CLARITY_CALL_SECTION_ID = "clarity-call";

/**
 * Where every "Start with a Clarity Call" outside the homepage goes: the homepage's
 * Clarity Call section, not straight to the form (PPS Admin, 2026-11-06). The topic
 * rides along, so the section's "Book a Clarity Call" button can prefill the form with it.
 */
export function clarityCallSectionHref(topic?: ClarityCallTopic): string {
  return `/${topic ? `?clarity=${topic}` : ""}#${CLARITY_CALL_SECTION_ID}`;
}

/** Reads the topic a Clarity Call link carried, ignoring anything that isn't a known topic. */
export function clarityCallTopicFrom(value: string | null): ClarityCallTopic | undefined {
  return value && Object.prototype.hasOwnProperty.call(CLARITY_CALL_TOPICS, value)
    ? (value as ClarityCallTopic)
    : undefined;
}

/** The contact form's section; the form opens scrolled to it (PPS Admin, 2026-11-06). */
export const CONTACT_FORM_SECTION_ID = "contact-form";

/**
 * The homepage section's "Book a Clarity Call" button, until the GHL booking calendar is
 * connected (PPS-DEC-0019): the working contact form, prefilled, opened at the form. The
 * `blue-door` interest value is the existing GHL opportunity_type mapping.
 */
export function clarityCallHrefFor(topic: string): string {
  return (
    "/contact?scope=Company&interest=blue-door&message=" +
    encodeURIComponent(`I'd like to start with a Clarity Call about ${topic}.`) +
    `#${CONTACT_FORM_SECTION_ID}`
  );
}

export const CLARITY_CALL_CONTACT_HREF = clarityCallHrefFor(CLARITY_CALL_TOPICS.appraisal);
