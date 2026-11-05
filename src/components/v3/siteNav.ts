/**
 * Menu data for the redesign's header and footer (PPS Admin, 2026-11-05).
 *
 * Header: The P.A.T.H. (with Phase Zero in its dropdown), Speaking,
 * Insights & Resources and About, then search and the "Ready for Epic
 * ShIFt?" quiz button. The P.A.T.H.way partnership pages are not in the
 * header (B2B first, plan §1); the footer keeps them.
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

export const PATH_LINKS: NavLink[] = [
  { label: "The P.A.T.H.", href: "/the-path", note: "The four stages of change" },
  { label: "What is Phase Zero?", href: "/phase-zero", note: "The work before the work" },
  { label: "Envision ShIFt", href: "/envision-shift", note: "Prepare" },
  { label: "Architect ShIFt", href: "/architect-shift", note: "Align" },
  { label: "Embody ShIFt", href: "/embody-shift", note: "Take Off and Habits" },
];

export const HEADER_MENU: NavGroup[] = [
  { label: "The P.A.T.H.", href: "/the-path", children: PATH_LINKS },
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
      { label: "Our Approach", href: "/about/approach" },
      { label: "Results & Impact", href: "/about/impact" },
    ],
  },
];

/** The P.A.T.H.way offerings: out of the header, kept in the footer (plan §1). */
export const PATHWAY_LINKS: NavLink[] = [
  { label: "Assessments", href: "/partner/ignite/assessments" },
  { label: "Masterclasses", href: "/partner/ignite/masterclasses" },
  { label: "Leadership Labs", href: "/partner/amplify/labs" },
  { label: "Team Workshops", href: "/partner/amplify/workshops" },
];

export const COMPANY_LINKS: NavLink[] = [
  { label: "About Us", href: "/about" },
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
