import { LinkInBioPage, type BioLink } from "@/components/pps/link-in-bio/LinkInBioPage";
import { useMasterclassLaunchStatuses } from "@/hooks/useMasterclassLaunch";

import robPhoto from "@/assets/team/rob-hunter.jpg";

/** Rob's link-in-bio page. Layout and order: LinkInBioPage (PPS Admin, 2026-11-09). */
export default function AboutRob() {
  // The mini course link shows only once it is live; launching it in the admin adds it with no code change
  // (PPS Admin, 2026-11-09: "Skip coming soons").
  const launch = useMasterclassLaunchStatuses();
  const miniCourse: BioLink[] =
    launch?.get("mc-master-your-message-mini") === "live"
      ? [{ text: "Master Your Message Mini Course", label: "Master Your Message Mini Course", href: "/masterclasses#mc-master-your-message-mini" }]
      : [];

  return (
    <LinkInBioPage
      accent="slate"
      seo={{
        title: "Rob Hunter, Chief Storytelling Officer | Painted Porch Strategies",
        description:
          "Rob Hunter is the Chief Storytelling Officer and Master of Communication at Painted Porch Strategies. Explore Rob's keynotes, coaching and the Equal Matters podcast.",
        canonical: "/rob",
      }}
      photo={robPhoto}
      photoAlt="Rob Hunter"
      name="Rob Hunter"
      title="Chief Storytelling Officer · Master of Communication"
      intro="You have 8 seconds to capture and keep someone's attention. It's time to get C.L.E.A.R."
      links={[
        { text: "Visit Rob's Website", label: "Visit Rob's Website", href: "https://robhunter.me", external: true },
        { text: "Book Rob to Speak", label: "Book Rob to Speak", href: "/speaking/rob" },
        ...miniCourse,
        { text: "The Whiteboard Treatment", label: "The Whiteboard Treatment", href: "https://robhunter.me/whiteboard", external: true },
        { text: "Read Equal Matters on Substack", label: "Read Equal Matters on Substack", href: "https://robhunter.substack.com/", external: true },
        { text: "Listen to the Equal Matters Podcast", label: "Listen to the Equal Matters Podcast", href: "https://open.spotify.com/show/5lYP2GwhZU71rVNEufvm3U", external: true },
        { text: "Let's Connect", label: "Let's Connect", href: "/contact?interest=general&message=I'd like to connect with Rob." },
      ]}
      featured={[
        {
          kicker: "Free Training",
          text: "6 Communicator Styles",
          title: "6 Communicator Styles",
          description: "Find your natural communication style and how to connect with every audience.",
          href: "/6-communicator-styles",
          cta: "Watch the Free Replay",
        },
        {
          kicker: "Storytelling Course",
          text: "The Cassette Tape Stories",
          title: "The Cassette Tape Stories",
          description:
            "An online storytelling course built from 27 years behind the mic. Turn your experiences into stories that capture attention and move people to act.",
          href: "https://robhunter.me/cassette-tape-stories",
          external: true,
          cta: "Visit the Course",
        },
      ]}
      aboutHeading="Hi, I'm Rob"
      about={
        <>
          <p>
            For 27 years, I sat behind a talk radio mic, finding ways to connect with listeners… and keep them tuning
            in every day. I retired with #1 ratings.
          </p>
          <p>
            Now I partner with emerging leaders and executives to master their message and broadcast it with
            clarity. Stand out. Be heard. Move people to act.
          </p>
        </>
      }
      socials={[
        { label: "YouTube", href: "https://www.youtube.com/@EqualMatters" },
        { label: "Substack", href: "https://robhunter.substack.com/" },
        { label: "Spotify", href: "https://open.spotify.com/show/5lYP2GwhZU71rVNEufvm3U" },
      ]}
    />
  );
}
