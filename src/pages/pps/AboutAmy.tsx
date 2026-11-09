import { LinkInBioPage } from "@/components/pps/link-in-bio/LinkInBioPage";
import { ShIFt } from "@/components/v3/ShIFt";
import { clarityCallSectionHref } from "@/config/epicShiftAppraisal";

// The same photo the page loaded from the old Kajabi site, now from the site's own files (PPS Admin, 2026-11-09).
import amyPhoto from "@/assets/team/amy-yackowski.png";

/** Amy's link-in-bio page. Layout and order: LinkInBioPage (PPS Admin, 2026-11-09). */
export default function AboutAmy() {
  return (
    <LinkInBioPage
      accent="teal"
      seo={{
        title: "Amy Yackowski, Founder | Painted Porch Strategies",
        description:
          "Amy Yackowski is the Founder and Organizational Shift Strategist at Painted Porch Strategies. Explore Amy's keynotes, the Epic ShIFt Organizational Appraisal and her writing on change origination.",
        canonical: "/amy",
      }}
      photo={amyPhoto}
      photoAlt="Amy Yackowski"
      name="Amy Yackowski"
      title="Founder · Chief Evolution Officer"
      intro={
        <>
          I partner with leaders to architect their next <ShIFt onDark lowercase />, starting before the plan does.
        </>
      }
      links={[
        { text: "Start with a Clarity Call", label: "Start with a Clarity Call", href: clarityCallSectionHref() },
        { text: "Book Amy to Speak", label: "Book Amy to Speak", href: "/speaking/amy" },
        {
          text: "The Epic ShIFt Organizational Appraisal",
          label: <>The Epic <ShIFt onFill /> Organizational Appraisal</>,
          href: "/envision-shift",
        },
        {
          text: "Walk The P.A.T.H. to Epic ShIFt",
          label: <>Walk The P.A.T.H. to Epic <ShIFt onFill /></>,
          href: "/the-path",
        },
        { text: "Read the Latest from the Porch", label: "Read the Latest from the Porch", href: "/resources/insights" },
      ]}
      featured={[
        {
          kicker: "The First Step",
          text: "The Epic ShIFt Organizational Appraisal",
          title: <>The Epic <ShIFt /> Organizational Appraisal</>,
          description: (
            <>
              An interview-led organizational 360 that appraises where your organization stands, and what{" "}
              <ShIFt lowercase /> you're positioned to lead.
            </>
          ),
          href: "/envision-shift",
          cta: "Explore the Appraisal",
        },
        {
          // A free resource in place of the EQ Assessment (PPS Admin, 2026-11-09: "A swap for free resource").
          kicker: "Free Training",
          text: "Kick the Habit",
          title: "Kick the Habit",
          description: (
            <>
              Spot the thinking patterns that hold change back, and build the habits your next{" "}
              <ShIFt lowercase /> asks for.
            </>
          ),
          href: "/kick-the-habit",
          cta: "Watch the Free Replay",
        },
      ]}
      aboutHeading="Hi! I'm Amy"
      about={
        <>
          <p>
            You can call me Amy Yack; my friends do. I founded Painted Porch Strategies to start change where it
            starts: before the plan, while the questions are still open and the choices are still yours.
          </p>
          <p>
            I've cheered, documented and advised my way through more rollouts than I can count (a few of them on
            time, most of them on hope), which is why our work begins with what your organization is built to carry.
            With courage, curiosity and a little play, we co-architect what comes next, one small{" "}
            <ShIFt lowercase /> at a time.
          </p>
        </>
      }
      socials={[
        { label: "LinkedIn", href: "https://www.linkedin.com/in/ayackowski/" },
        { label: "Medium", href: "https://medium.com/@amyyack" },
        { label: "YouTube", href: "https://www.youtube.com/@onthepaintedporch" },
        { label: "Spotify Playlist", href: "https://open.spotify.com/playlist/1F6mkBYTllBzwawCXDEmry" },
      ]}
    />
  );
}
