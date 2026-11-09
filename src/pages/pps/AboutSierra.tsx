import { LinkInBioPage, type BioLink } from "@/components/pps/link-in-bio/LinkInBioPage";
import { useMasterclassLaunchStatuses } from "@/hooks/useMasterclassLaunch";

import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";

/** Sierra's link-in-bio page. Layout and order: LinkInBioPage (PPS Admin, 2026-11-09). */
export default function AboutSierra() {
  // The mini course link shows only once it is live; launching it in the admin adds it with no code change
  // (PPS Admin, 2026-11-09: "Skip coming soons").
  const launch = useMasterclassLaunchStatuses();
  const miniCourse: BioLink[] =
    launch?.get("mc-radical-mindfulness-mini") === "live"
      ? [{ text: "Beat Burnout with Radical Mindfulness", label: "Beat Burnout with Radical Mindfulness", href: "/masterclasses#mc-radical-mindfulness-mini" }]
      : [];

  return (
    <LinkInBioPage
      accent="gold"
      seo={{
        title: "Sierra Ramm-Cantrell, Chief Joy Officer | Painted Porch Strategies",
        description:
          "Sierra Ramm-Cantrell is the Chief Joy Officer at Painted Porch Strategies. Explore Sierra's keynotes, 1:1 coaching, Radical Mindfulness and free resources on burnout.",
        canonical: "/sierra",
      }}
      photo={sierraPhoto}
      photoAlt="Sierra Ramm-Cantrell"
      name="Sierra Ramm-Cantrell"
      title="Chief Joy Officer · Mindfulness Sherpa"
      intro="I'm the one who makes animal noises, breaks into song, and brings you back to the present moment."
      links={[
        { text: "Book Sierra to Speak", label: "Book Sierra to Speak", href: "/speaking/sierra" },
        ...miniCourse,
        {
          text: "1:1 Mindset & Mindfulness Coaching",
          label: "1:1 Mindset & Mindfulness Coaching",
          href: "/contact?scope=Yourself&interest=1on1-advisory&message=I'm interested in 1:1 coaching with Sierra.",
        },
        { text: "Radical Mindfulness on YouTube", label: "Radical Mindfulness on YouTube", href: "https://youtube.com/playlist?list=PLhdPibIQvwhH4j94ohc0BsOJqUud4xzoL", external: true },
        { text: "Read the Latest from the Porch", label: "Read the Latest from the Porch", href: "/resources/insights" },
        { text: "Let's Connect", label: "Let's Connect", href: "/contact?interest=general&message=I'd like to connect with Sierra." },
      ]}
      featured={[
        {
          kicker: "Free Training",
          text: "From Passenger to Pilot",
          title: "From Passenger to Pilot",
          description: "Simple tools to shift from autopilot to taking the controls of your life and work.",
          href: "/pilot-training",
          cta: "Watch the Free Replay",
        },
        {
          kicker: "Free Resources",
          text: "Burnout Recovery Resources",
          title: "Burnout Recovery Resources",
          description: "Tools and guides to recognize, prevent and recover from burnout, built for real humans juggling real life.",
          href: "/burnout",
          cta: "Explore the Resources",
        },
      ]}
      aboutHeading="Hi! I'm Sierra"
      about={
        <>
          <p>
            I've taught yoga and meditation for over 12 years, traveled all 50 states, and only recently learned how
            to ride a bike.
          </p>
          <p>
            I'm a quadruple threat (dancer, actor, singer and director), a homeschool teacher, a mindfulness sherpa
            and a mom (of a very active child!). My true purpose is to invite everyone I cross paths with into a more
            joyful, authentic life.
          </p>
        </>
      }
      socials={[
        { label: "Instagram", href: "https://www.instagram.com/mindfulness.sherpa/reels/" },
        { label: "TikTok", href: "https://www.tiktok.com/@mindfulnesssherpa" },
        { label: "YouTube", href: "https://youtube.com/playlist?list=PLhdPibIQvwhH4j94ohc0BsOJqUud4xzoL" },
      ]}
    />
  );
}
