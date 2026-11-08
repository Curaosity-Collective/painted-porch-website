import { Flame } from "lucide-react";
import amyPhoto from "@/assets/team/amy-speaking-portrait.jpg";
import heroesAssemble from "@/assets/speaking/amy-heroes-assemble.png";
import alicePrinciples from "@/assets/speaking/alice-principles.png.asset.json";
import dontPanic from "@/assets/speaking/dont-panic-hitchhiker.png.asset.json";
import dysfunctionToDynamic from "@/assets/speaking/dysfunction-to-dynamic.png.asset.json";
import stoicismWorkplace from "@/assets/speaking/keynote-cover-stoicism.png.asset.json";
import keynoteAiEiOh from "@/assets/speaking/keynote-ai-ei-oh.png.asset.json";
import keynoteLeadSpeedOfChange from "@/assets/speaking/keynote-cover-speed-of-change.png.asset.json";
import shiftHappens from "@/assets/speaking/shift-happens.png.asset.json";
import goldilocksLeadership from "@/assets/speaking/amy-goldilocks-leadership.png";
import SpeakerDetailPage, { type SpeakerData } from "./SpeakerDetailPage";

const amy: SpeakerData = {
  facilitatorKey: "Amy",
  name: "Amy Yackowski",
  firstName: "Amy",
  title: "Founder | Chief Evolution Officer | Organizational Shift Strategist",
  seriesName: "The Evolution of Change Leadership Series",
  heroBadgeLabel: "It's Time to Do Epic ShIFt",
  seriesIntro:
    "Change doesn't have to suck. In this speaker series, Amy Yackowski equips modern leaders with Stoic tools, real-world frameworks, and emotional intelligence practices that keep teams grounded and united through transformation.",
  bio: [
    "Most people know me as a shift strategist, operational advisor, and founder of Painted Porch Strategies. But really? I'm just someone who believes that change doesn't have to suck.",
    "For over 20 years, I've partnered with teams and leaders in fast-paced industries like staffing, energy, and healthcare, turning burnout into boldness and uncertainty into aligned action.",
    "I blend Stoic philosophy with practical tools to navigate chaos with clarity, lead with emotional intelligence, and build identity-shifting, innovative cultures that don't fall apart when things get hard.",
    "If you're ready to stop managing change and start authoring and leading it, I'm your person.",
  ],
  closingLine: "Let's do this together!",
  photo: amyPhoto,
  topics: [
    {
      slug: "heroes-assemble",
      title: "Heroes Assemble!",
      image: heroesAssemble,
      description:
        "Unite your team through shared purpose, candor, and trust. Learn how to build stronger dynamics by understanding one another's superpowers (and stressors), fostering healthy conflict and innovative thinking.",
    },
    {
      slug: "lead-at-the-speed-of-change",
      title: "Lead at the Speed of Change",
      image: keynoteLeadSpeedOfChange.url,
      description:
        "Change is inevitable, chaos isn't. Learn how to lead adaptively, align around what matters most, and keep moving forward when the ground shifts beneath you.",
    },
    {
      slug: "shift-happens-be-ready",
      title: "ShIFt Happens. Be Ready.",
      image: shiftHappens.url,
      description:
        "Using our P.A.T.H.™ method, discover a proven roadmap to navigate change that's on time, on budget, and on purpose.",
    },
    {
      slug: "goldilocks-leadership",
      title: "Goldilocks Leadership",
      image: goldilocksLeadership,
      description:
        "Is your leadership style \"too hot\" or \"too cold\"? Find the emotional intelligence sweet spot that turns you into a \"just-right\" transformational leader.",
    },
    {
      slug: "stoicism-in-the-workplace",
      title: "Stoicism in the Workplace",
      image: stoicismWorkplace.url,
      description:
        "Discover how ancient Stoic principles can transform modern leadership. Learn to focus on what you can control, build resilience, and lead with clarity and purpose, even when everything around you is shifting.",
    },
    {
      slug: "from-dysfunction-to-dynamic-teams",
      title: "From Dysfunction to Dynamic Teams",
      image: dysfunctionToDynamic.url,
      description:
        "Turn struggling teams into high-performing powerhouses. Learn how to break through silos, rebuild trust, and create the kind of collaboration that drives extraordinary results.",
    },
    {
      slug: "ai-ei-oh",
      aliases: ["ai-ei-oh-guiding-change-in-the-ai-era"],
      title: "AI, EI, Oh! Guiding Change in the AI Era",
      image: keynoteAiEiOh.url,
      description:
        "AI is here, but your people aren't equipped for the shift. Discover how emotional intelligence is the missing link to successful AI adoption, and learn to lead your team through tech-driven change without leaving anyone behind.",
    },
    {
      slug: "alice-principles",
      aliases: ["the-alice-principles-down-the-rabbit-hole-of-transformation"],
      title: "The Alice Principles: Down the Rabbit Hole of Transformation",
      image: alicePrinciples.url,
      description:
        "What can Alice's adventures teach us about navigating organizational change? Explore how curiosity, adaptability, and questioning the status quo, inspired by Lewis Carroll's timeless tale, can transform the way your team approaches uncertainty and growth.",
    },
    {
      slug: "dont-panic",
      aliases: ["dont-panic-navigating-a-changing-world"],
      title: "Don't Panic! Navigating a Changing World",
      image: dontPanic.url,
      description:
        "Grab your towel and don't panic, because change, much like the galaxy, is vast, unpredictable, and mostly harmless. Using Douglas Adams' Hitchhiker's Guide as a lens, discover how humor, perspective, and a good guide can turn overwhelming transformation into an adventure worth taking.",
    },
  ],
  outcomesHeading: "Lead Through Uncertainty With Clarity & Courage",
  outcomesIntro:
    "Leaders leave Amy's keynotes with Stoic tools for staying grounded, frameworks for turning uncertainty into decisions, and emotional intelligence practices that keep their teams united through the change.",
  outcomes: [
    "Lead through change with purpose and presence",
    "Build trust and candor across your team",
    "Turn chaos into clarity and action",
  ],
  outcomesClosing: "Change is coming either way. Let's lead it with intention.",
  workshopHeading: "Continue the Work: Team Workshops & Strategy Sessions",
  workshopIntro:
    "Bring the keynote to life with immersive follow-up workshops where your team applies Amy's change authorship frameworks in real-time. These sessions go beyond inspiration—they're where strategy meets execution.",
  workshopDetails: [
    "Pre-session alignment survey",
    "Custom journaling prompts to deepen reflection",
    "Live, hands-on sessions that blend Stoic insight with business practicality",
    "Space for authentic dialogue, problem-solving, and action planning",
  ],
  workshopClosing: "Let's turn the message into momentum.",
  themeColor: "border-primary",
  badgeColor: "bg-primary text-white",
  icon: Flame,
  trustSignals: {
    heading: <>Where Amy Has Spoken</>,
    logos: [
      { name: "ProjectWorld", src: "/logos/projectworld.png", href: "https://www.pmbaconferences.com/" },
      { name: "Project Summit", src: "/logos/project-summit.png", href: "https://www.pmbaconferences.com/" },
      { name: "PMBA Global", src: "/logos/pmba-global.png", href: "https://www.pmbaconferences.com/" },
      { name: "Petra Coach", src: "/logos/petra.png", href: "https://petracoach.com/" },
      { name: "AtWork", src: "/logos/atwork.jpg", href: "https://www.atwork.com/" },
      { name: "Newbury Partners", src: "/logos/newbury-partners.jpg", href: "https://newburypartners.com/" },
      { name: "American Staffing Association", src: "/logos/asa.png", href: "https://americanstaffing.net/" },
      { name: "WIIN", src: "/logos/wiin.jpg", href: "https://www.linkedin.com/feed/update/urn:li:activity:6785998694400565248/" },
      { name: "NextUp Phoenix", src: "/logos/nextup-phoenix.png", href: "https://www.nextupisnow.org/regions/phoenix/" },
      { name: "Junior League of Phoenix", src: "/logos/junior-league-phoenix.png", href: "https://www.jlp.org/" },
      { name: "ASA Thrive Live", src: "/logos/asa-thrive-live.png", href: "https://learn.americanstaffing.net/products/thrivex" },
      { name: "Toastmasters International", src: "/logos/toastmasters.png", href: "https://www.toastmasters.org/" },
      { name: "Apex Systems", src: "/logos/apex-systems.png", href: "https://www.apexsystems.com/" },
      { name: "Staffing Industry Analysts", src: "/logos/sia.png", href: "https://www.staffingindustry.com/" },
      { name: "City of Chandler", src: "/logos/city-of-chandler.png", href: "https://www.chandleraz.gov" },
      { name: "AZ Tech Week", src: "/logos/az-tech-week.jpg", href: "https://www.azcommerce.com/az-tech-week/" },
      { name: "Co+Hoots", src: "/logos/co-hoots.png", href: "https://cohoots.com/" },
      { name: "APC Canada", src: "/logos/apc-canada.jpg", href: "https://www.apccanada.com/" },
    ],
    // Verbatim from the Speaking section of "Amy Yackowski's LinkedIn
    // Recommendations" (Google Drive, read 2026-11-05); omissions marked "…".
    // PPS Admin approved adding these to Amy's page only (2026-11-05).
    showTestimonials: true,
    testimonials: [
      {
        quote:
          "Amy’s presentations are always outstanding — thoughtfully researched, curated, and crafted specifically for the audiences in each region she speaks in. Her attention to detail and commitment to providing real, tangible value to attendees shines through in every session.",
        name: "Amy Ruddell",
        title: "Vice President",
        organization: "Project Times & Business Analyst Times",
      },
      {
        quote:
          "I have been in the staffing industry for over 30 years and have had the opportunity to sit in on quite a few keynote speakers. However, I’ve gotta say Amy by far had me the most engaged of all of them.",
        name: "Tony Alanis",
        title: "Vice President of Operations and Client Relations",
        organization: "",
      },
      {
        quote:
          "Amy, your keynote session was so engaging and fun but also so relevant. So accessible. I will be thinking about it for a long time and am excited to share the concepts and exercise around discovering elemental (superhero!) strengths with my team.",
        name: "Katie McLennan",
        title: "Business Process Consultant",
        organization: "Marco Technologies",
      },
      {
        quote:
          "One of the things that immediately caught my attention was Amy's clear comfort on stage. She brought just the right energy to the room. … Amy spoke to the audience and brought relevant content, clearly taking a personalized approach in her delivery.",
        name: "Ashley Andersen",
        title: "Change Leadership",
        organization: "",
      },
    ],
  },
  // From the draft site's Amy page (pps-simplified src/routes/about_.amy.tsx).
  credentials: [
    "Prosci Change Practitioner",
    "ACMP Member",
    "Lean Change Agent",
    "Working Genius Certified",
    "EQ-360 Certified",
    "EQ-i 2.0 Certified",
  ],
};

export default function AmySpeaker() {
  return <SpeakerDetailPage speaker={amy} />;
}
