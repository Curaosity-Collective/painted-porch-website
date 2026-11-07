/**
 * Menu data for the redesign's header and footer (PPS Admin, 2026-11-05).
 *
 * Header: The P.A.T.H. to ShIFt (the P.A.T.H. page and the three
 * ShIFts), Speaking, Insights & Resources and About (with Phase Zero; PPS
 * Admin, 2026-11-06), then search and the "Find Your Next ShIFt" button that
 * opens the guide (PPS-DEC-0026). The offers for
 * leaders and teams are not in the header (B2B first, plan §1); the footer
 * keeps them under "Leaders & Teams". The one exception is For Individuals,
 * last under The P.A.T.H. to ShIFt (PPS Admin, 2026-11-07).
 *
 * Links point at each page's go-live address. Labels containing "ShIFt"
 * render with the IF styled (NavLabel).
 */
export interface NavLink {
  label: string;
  href: string;
  /** Short context shown under the label in a dropdown. */
  note?: string;
}

export interface NavGroup {
  label: string;
  href: string;
  children: NavLink[];
}

/** The P.A.T.H. menu's heading in the header and the footer (PPS Admin, 2026-11-06). */
export const PATH_MENU_LABEL = "The P.A.T.H. to ShIFt";

/** Phase Zero sits under About in the header and Company in the footer (PPS Admin, 2026-11-06). */
const PHASE_ZERO_LINK: NavLink = { label: "What's Phase Zero?", href: "/phase-zero" };

export const PATH_LINKS: NavLink[] = [
  { label: "The P.A.T.H.", href: "/the-path", note: "The four stages of change" },
  { label: "Envision ShIFt", href: "/envision-shift", note: "Prepare" },
  { label: "Architect ShIFt", href: "/architect-shift", note: "Align" },
  { label: "Embody ShIFt", href: "/embody-shift", note: "Take Off and Habits" },
];

/**
 * Each header heading is itself a link to its page, so its menu lists only the pages under it. The
 * P.A.T.H. menu once also listed "The P.A.T.H." (/the-path), the same page as its heading (reported
 * by PPS Admin, 2026-11-07). The footer keeps "The P.A.T.H.": its column heading is not a link.
 */
export const HEADER_MENU: NavGroup[] = [
  // For Individuals is the one offer page in the header (PPS Admin, 2026-11-07); the footer keeps the rest.
  {
    label: PATH_MENU_LABEL,
    href: "/the-path",
    children: [
      ...PATH_LINKS.filter((l) => l.href !== "/the-path"),
      { label: "For Individuals", href: "/for-individuals", note: "Assessments, masterclasses and Labs" },
    ],
  },
  {
    label: "Speaking",
    href: "/speaking",
    children: [
      { label: "Amy Yackowski", href: "/speaking/amy" },
      { label: "Rob Hunter", href: "/speaking/rob" },
      { label: "Sierra Cantrell", href: "/speaking/sierra" },
      { label: "Speaking Topics", href: "/speaking/topics" },
      { label: "As Seen On", href: "/speaking/media" },
    ],
  },
  {
    label: "Insights & Resources",
    href: "/resources",
    children: [
      { label: "Insights", href: "/resources/insights" },
      { label: "YouTube", href: "/resources/youtube" },
      { label: "Media Appearances", href: "/speaking/media" },
      { label: "Free Resources", href: "/resources/free" },
      { label: "FAQ", href: "/resources/faq" },
    ],
  },
  {
    label: "About",
    href: "/about",
    children: [
      // Our Approach is part of the Phase Zero page now (PPS Admin, 2026-11-06).
      PHASE_ZERO_LINK,
      { label: "Results & Impact", href: "/about/impact" },
    ],
  },
];

/**
 * The offers for leaders and teams: out of the header, kept in the footer's
 * "Leaders & Teams" column (plan §1; PPS Admin, 2026-11-06). The name says who
 * they serve, not where to start: an organization starts with the Clarity Call.
 */
export const PATHWAY_LINKS: NavLink[] = [
  // For Individuals gathers the three offers for individual leaders (PPS Admin, 2026-11-07).
  { label: "For Individuals", href: "/for-individuals" },
  { label: "Assessments", href: "/assessments" },
  { label: "Masterclasses", href: "/masterclasses" },
  { label: "Leadership Labs", href: "/leadership-labs" },
  { label: "Team Workshops", href: "/workshops" },
];

export const COMPANY_LINKS: NavLink[] = [
  { label: "About Us", href: "/about" },
  PHASE_ZERO_LINK,
  { label: "Results & Impact", href: "/about/impact" },
  { label: "Speaking", href: "/speaking" },
  { label: "Insights & Resources", href: "/resources" },
  { label: "FAQ", href: "/resources/faq" },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Terms", href: "/terms?tab=terms" },
  { label: "Privacy", href: "/terms?tab=privacy" },
  { label: "Cookies", href: "/terms?tab=cookies" },
];
