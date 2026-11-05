/**
 * Client testimonials shared by the redesign pages ("v3") and the live Our
 * Impact page, so a quote is edited in one place.
 *
 * Source: "Amy Yackowski's LinkedIn Recommendations" (Google Drive, shared
 * drive file 14CCKRbW1UyZlAYDk2GXWAZ1RonLQwi14, read 2026-11-05), the
 * Consultant/Advisory section. Every quote is the recommender's own words.
 * Omitted text is marked with "…"; nothing is paraphrased or reworded.
 *
 * - featured: the three quotes PPS Admin chose to keep (Dianne, Brian,
 *   Melanie). Shown on the homepage and the archived Our Impact page.
 * - All six show on Results & Impact (/about/impact).
 *
 * Not used: the three role-only quotes ("VP of Operations, Healthcare
 * Staffing Company" and so on), which were placeholders (PPS Admin,
 * 2026-11-05); individual (B2C) quotes from the draft site, since the
 * redesign is B2B first (plan §1); and the document's Speaking
 * recommendations, which suit the Speaking pages.
 */
export interface Testimonial {
  quote: string;
  who: string;
  featured?: boolean;
}

export const CLIENT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Her attention to detail is unique … and stems from her ability to ask the right questions, at the right time, to follow the lead to the source, and then to listen for real comprehension. And she is unafraid to challenge the status quo … without any of the condescension that permeates our field.",
    who: "Dianne R. · Project Manager",
    featured: true,
  },
  {
    quote:
      "She was stellar at being the bridge between the technology team and our clients. … She was also an effective negotiator when it came to making trade offs between business leaders, the product team, and technologists — this was no small feat!",
    who: "Brian S. · Chief Technology Officer",
    featured: true,
  },
  {
    quote:
      "She was instrumental in ensuring a strong alliance between technical change readiness and organizational change readiness, delivering an all-inclusive view into managing change throughout our transformation.",
    who: "Melanie W. · Senior IT Manager of Business & Technology Enablement",
    featured: true,
  },
  {
    quote:
      "Amy's passion for putting people first, coupled with her deep understanding of business needs, ensures that the solutions she delivers are always the best fit for people, processes, and technology.",
    who: "Amy R. · Vice President, Operational Strategy",
  },
  {
    quote:
      "She has a way of putting people at ease, and is great at creating a “safe space” to talk openly about ideas or concerns. … She is smart, engaging, committed to success, and loves to dig deep into issues to ensure the root cause of the problem is identified and rectified.",
    who: "Amanda W. · Project Manager",
  },
  {
    quote:
      "Amy is prepared, responsive, and communicates effectively with clients, peers and management. … her professionalism and attention to detail has served our clients well throughout the years.",
    who: "Mike W. · Vice President of Sales",
  },
];

/** The three quotes PPS Admin chose to keep: homepage and live Our Impact. */
export const FEATURED_TESTIMONIALS = CLIENT_TESTIMONIALS.filter((t) => t.featured);
