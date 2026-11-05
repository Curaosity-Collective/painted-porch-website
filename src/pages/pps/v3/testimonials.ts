/**
 * Business testimonials shared by the redesign pages ("v3"), so a quote is
 * edited in one place.
 *
 * - NAMED: from the approved homepage wireframe; also on /home-next.
 * - BY_ROLE: from the live Our Impact page (/about/impact), attributed by
 *   role and industry only.
 *
 * Individual (B2C) quotes from the draft site's Results page are not carried
 * over: the redesign is B2B first (plan §1).
 */
export interface Testimonial {
  quote: string;
  who: string;
}

export const NAMED_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Amy asks the right question at the right time, follows it to the source, and challenges the status quo without condescension.",
    who: "Dianne R. · Project Manager",
  },
  {
    quote:
      "Amy became the bridge between our technology team and the client, creating trust across business leaders, product, and technology.",
    who: "Brian S. · Chief Technology Officer",
  },
  {
    quote: "Amy aligned technical and organizational readiness while building trust with stakeholders at every level.",
    who: "Melanie W. · Senior IT Manager",
  },
];

export const BY_ROLE_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Painted Porch helped us transform not just our processes, but our entire approach to change. The results speak for themselves.",
    who: "VP of Operations · Healthcare Staffing Company",
  },
  {
    quote:
      "The combination of practical frameworks and Stoic principles gave our leadership team a foundation for making better decisions under pressure.",
    who: "CEO · Technology Services Firm",
  },
  {
    quote:
      "We've worked with many consultants, but Painted Porch truly partners with you. They care about outcomes, not just deliverables.",
    who: "Chief People Officer · Manufacturing Company",
  },
];
