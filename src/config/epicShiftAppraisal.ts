// Epic ShIFt Appraisal: single source of truth for public naming, price, and
// where its calls to action go.
//
// Governing decisions (pps-ops-hub docs/decisions):
// - PPS-DEC-0018: public name "Epic ShIFt Appraisal", $24,000, Clarity Call first.
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
  name: "Epic ShIFt Appraisal",
  /** Canonical page ("Envision Epic ShIFt"). */
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

/**
 * Where "start with a Clarity Call" goes until the GHL booking calendar is
 * connected (PPS-DEC-0019): the working contact form, prefilled. The
 * `blue-door` interest value is the existing GHL opportunity_type mapping.
 */
export const CLARITY_CALL_CONTACT_HREF =
  "/contact?scope=Company&interest=blue-door&message=" +
  encodeURIComponent("I'd like to start with a Clarity Call about the Epic ShIFt Appraisal.");
