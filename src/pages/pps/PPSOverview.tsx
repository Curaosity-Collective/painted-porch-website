import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  DoorOpen,
  Download,
  Facebook,
  Instagram,
  Linkedin,
  Mic,
  Route as RouteIcon,
  Sparkles,
  User,
  Users,
  Youtube,
} from "lucide-react";
import ppsLogo from "@/assets/pps-logo.png";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";
import { ShIFt } from "@/components/v3/ShIFt";
import { PublicSiteContext } from "@/components/v3/publicSiteContext";
import { PathFinderQuizProvider, usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";

/**
 * /overview: Painted Porch's link-in-bio page, a short "top hits" list rather than a second homepage
 * (PPS Admin, 2026-11-09). It speaks as "we". It renders outside PPSLayout, like /amy, /rob and /sierra, so
 * it mounts the Find Your Next ShIFt guide itself and sets its own v3 colors.
 */

interface HighlightLink {
  label: ReactNode;
  /** Plain text for the key and accessible name. */
  name: string;
  line: ReactNode;
  href: string;
  icon: LucideIcon;
}

interface HighlightGroup {
  title: string;
  links: HighlightLink[];
}

const GROUPS: HighlightGroup[] = [
  {
    title: "For Organizations",
    links: [
      {
        name: "The P.A.T.H. to Epic ShIFt",
        label: (
          <>
            The P.A.T.H. to Epic <ShIFt />
          </>
        ),
        line: "How we co-architect change with you, from the first insight to lasting habits.",
        href: "/the-path",
        icon: RouteIcon,
      },
      {
        name: "The Epic ShIFt Organizational Appraisal",
        label: (
          <>
            The Epic <ShIFt /> Organizational Appraisal
          </>
        ),
        line: (
          <>
            The first step: where your organization stands, and the <ShIFt lowercase /> it's positioned to lead.
          </>
        ),
        href: "/envision-shift",
        icon: DoorOpen,
      },
      {
        name: "Workshops",
        label: "Workshops",
        line: "Focused sessions for building extraordinary teams.",
        href: "/workshops",
        icon: Users,
      },
      {
        name: "Leadership Labs",
        label: "Leadership Labs",
        line: "Live Labs where leaders turn strategy into action, together.",
        href: "/leadership-labs",
        icon: Compass,
      },
    ],
  },
  {
    title: "For Leaders & Individuals",
    links: [
      {
        name: "For Individuals",
        label: "For Individuals",
        line: (
          <>
            Assessments and Labs for your own next <ShIFt lowercase />.
          </>
        ),
        href: "/for-individuals",
        icon: User,
      },
      {
        name: "Elemental Style Assessment",
        label: "Elemental Style Assessment",
        line: "A free five-minute look at how you communicate and connect. No sign-up.",
        href: "/elemental-style-assessment",
        icon: Sparkles,
      },
    ],
  },
  {
    title: "Keynotes & Ideas",
    links: [
      {
        name: "Book a Keynote",
        label: "Book a Keynote",
        line: "Amy, Rob and Sierra on stage at your next event.",
        href: "/speaking",
        icon: Mic,
      },
      {
        name: "Free Downloads",
        label: "Free Downloads",
        line: "Tools and field guides to put to work with your team.",
        href: "/resources/free",
        icon: Download,
      },
      {
        name: "Insights",
        label: "Insights",
        line: "Our latest thinking on change origination and leadership.",
        href: "/resources/insights",
        icon: BookOpen,
      },
      {
        name: "YouTube",
        label: "YouTube",
        line: "Short videos from the Porch.",
        href: "/resources/youtube",
        icon: Youtube,
      },
    ],
  },
];

// Titles as they appear on each person's speaker page (PPS Admin, 2026-11-09).
const TEAM = [
  { name: "Amy Yackowski", title: "Founder | Chief Evolution Officer | Organizational Shift Strategist", href: "/amy" },
  { name: "Rob Hunter", title: "Chief Storytelling Officer | M.C., Master of Communication", href: "/rob" },
  {
    name: "Sierra Ramm Cantrell",
    title: "Chief Joy Officer | M.B.A., Mind-Body Architect | Mindfulness Sherpa",
    href: "/sierra",
  },
];

// The same accounts as the site footer.
const SOCIAL = [
  { label: "YouTube", href: "https://www.youtube.com/@onthepaintedporch", icon: Youtube },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/paintedporchstrategies/", icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/paintedporchstrategies/", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/paintedporchstrategies", icon: Facebook },
];

const COLUMN = "mx-auto w-full max-w-xl px-4 sm:px-6";
const H2 = "font-display text-[28px] font-bold leading-tight text-navy [text-wrap:balance] md:text-[34px]";
const SOLID_BUTTON =
  "cta-label inline-flex min-h-[48px] w-full whitespace-nowrap items-center justify-center gap-2 rounded bg-primary px-6 font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto";
const OUTLINE_BUTTON =
  "cta-label inline-flex min-h-[48px] w-full whitespace-nowrap items-center justify-center gap-2 rounded border-2 border-primary bg-background px-6 font-semibold text-primary transition hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto";

function FindYourNextShiftButton() {
  const { open } = usePathFinderQuiz();
  return (
    <button type="button" onClick={open} className={OUTLINE_BUTTON}>
      <Compass className="h-4 w-4" aria-hidden="true" />
      <span className="whitespace-nowrap">
        Find Your Next <ShIFt onFill />
      </span>
    </button>
  );
}

function OverviewContent() {
  useDocumentSeo({
    title: "Painted Porch Strategies | Highlights & Links",
    description:
      "Highlights from Painted Porch Strategies: the Epic ShIFt Organizational Appraisal, the P.A.T.H., workshops, Leadership Labs, keynotes, free downloads and the team.",
    canonical: "/overview",
  });

  return (
    <div className="v3-skin min-h-screen bg-background">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className={`${COLUMN} pt-14 pb-10 text-center md:pt-20`}>
          <img
            src={ppsLogo}
            alt="Painted Porch Strategies"
            className="mx-auto h-28 w-auto md:h-36"
            loading="eager"
          />
          <h1 className="mt-6 font-display text-[34px] font-bold leading-tight text-navy [text-wrap:balance] md:text-5xl">
            Welcome to the Painted Porch
          </h1>
          <p className="mx-auto mt-4 max-w-[34em] text-[17px] leading-relaxed text-foreground/80">
            Your organization is already becoming something. We partner with leaders and teams who choose to be the
            author of that change, not the audience.
          </p>
          <p className="mx-auto mt-3 max-w-[34em] text-[17px] leading-relaxed text-foreground/80">
            Here are the best places to start.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link to={clarityCallSectionHref()} className={SOLID_BUTTON}>
              Start with a Clarity Call
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <FindYourNextShiftButton />
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS ───────────────────────────────────────────────── */}
      <section aria-labelledby="overview-highlights" className="py-12 md:py-16">
        <div className={COLUMN}>
          <h2 id="overview-highlights" className={`${H2} text-center`}>
            Highlights from the Porch
          </h2>
          {GROUPS.map((group) => (
            <div key={group.title} className="mt-10">
              <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-raspberry">{group.title}</h3>
              <ul className="mt-3 flex flex-col gap-3">
                {group.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="group flex items-center gap-4 rounded border border-border bg-background px-4 py-4 shadow-sm transition hover:border-primary hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[17px] font-semibold leading-snug text-navy">
                            {link.label}
                          </span>
                          <span className="mt-0.5 block text-[15px] leading-snug text-foreground/70">{link.line}</span>
                        </span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── MEET THE TEAM ────────────────────────────────────────────── */}
      <section aria-labelledby="overview-team" className="bg-muted/50 py-12 md:py-16">
        <div className={COLUMN}>
          <h2 id="overview-team" className={`${H2} text-center`}>
            Meet the Team
          </h2>
          <p className="mt-2 text-center text-foreground/70">The people behind the Porch.</p>
          <ul className="mt-8 flex flex-col gap-3">
            {TEAM.map((member) => (
              <li key={member.name}>
                <Link
                  to={member.href}
                  className="group flex items-center gap-4 rounded border border-border bg-background px-4 py-4 shadow-sm transition hover:border-primary hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[17px] font-semibold text-navy">{member.name}</span>
                    <span className="mt-0.5 block text-[14px] leading-snug text-foreground/70">{member.title}</span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CLOSING ──────────────────────────────────────────────────── */}
      <section aria-labelledby="overview-close" className="py-12 md:py-16">
        <div className={`${COLUMN} text-center`}>
          <div className="rounded border-2 border-primary/20 bg-primary/5 px-6 py-10 md:px-10">
            <h2 id="overview-close" className={H2}>
              Ready for Your Next <ShIFt />?
            </h2>
            <p className="mx-auto mt-4 max-w-[30em] text-[17px] leading-relaxed text-foreground/80">
              A Clarity Call is 60 minutes with Amy on where your organization stands and the first decisive move to
              make. It's also where the Epic <ShIFt /> Organizational Appraisal begins.
            </p>
            <div className="mt-7">
              <Link to={clarityCallSectionHref()} className={SOLID_BUTTON}>
                Start with a Clarity Call
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-5 text-[15px] text-foreground/80">
              Something else in mind?{" "}
              <Link
                to="/contact?interest=general"
                className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Get in touch
              </Link>
            </p>
          </div>

          <ul className="mt-10 flex justify-center gap-3" aria-label="Painted Porch Strategies on social media">
            {SOCIAL.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary transition hover:border-primary hover:bg-primary/5"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] text-foreground/60">
            <Link to="/" className="underline underline-offset-4 hover:text-primary">
              onthepaintedporch.com
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default function PPSOverview() {
  return (
    <PublicSiteContext.Provider value={true}>
      <PathFinderQuizProvider>
        <OverviewContent />
      </PathFinderQuizProvider>
    </PublicSiteContext.Provider>
  );
}
