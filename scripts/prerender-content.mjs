/**
 * Per-route prerender content.
 *
 * Each entry becomes a static `dist/<path>/index.html` at build time so
 * crawlers (ChatGPT, Perplexity, Google, Bing) see real content instead
 * of the empty SPA shell. Real users still get the SPA — since main.tsx
 * uses `createRoot`, React replaces `#root` children on mount and there
 * is no hydration mismatch.
 *
 * Keep each body concise (150–400 words). It is search fodder, not the
 * live UI — the real UI takes over the instant JS loads.
 */

const SITE = "https://onthepaintedporch.com";

/** @typedef {{
 *   path: string;
 *   title: string;
 *   description: string;
 *   h1: string;
 *   intro: string;
 *   sections?: Array<{ h2: string; body: string; }>;
 *   links?: Array<{ href: string; label: string; }>;
 *   ogImage?: string;
 * }} RouteContent */

const commonLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Painted Porch Strategies" },
  { href: "/the-path", label: "The P.A.T.H." },
  { href: "/envision-shift", label: "Envision ShIFt: the Epic ShIFt Organizational Appraisal" },
  { href: "/architect-shift", label: "Architect ShIFt" },
  { href: "/embody-shift", label: "Embody ShIFt" },
  { href: "/for-individuals", label: "For individual leaders" },
  { href: "/assessments", label: "Assessments" },
  { href: "/masterclasses", label: "Masterclasses" },
  { href: "/workshops", label: "Team workshops and Leadership Labs" },
  { href: "/resources", label: "Resources hub" },
  { href: "/contact", label: "Contact us" },
];

/** @type {RouteContent[]} */
export const routes = [
  { path: "/press", title: "Press & Media Relations | Painted Porch Strategies", description: "Contact Painted Porch Strategies Media Relations for interviews, speaking engagements, speaker photos and press materials.", h1: "Painted Porch Strategies Media Relations", intro: "Media Relations at Painted Porch Strategies: speaking@onthepaintedporch.com. Contact our team for interviews, speaking opportunities, speaker photos or additional press materials.", links: [{ href: "/press-kit", label: "View Press Kit" }, { href: "/press#inquiry", label: "Send a Press Inquiry" }, { href: "/downloads/painted-porch-strategies-press-kit.pdf", label: "Download Press Kit PDF" }] },
  {
    path: "/press-kit",
    title: "Press Kit & Speaker Bios | Painted Porch Strategies",
    description: "Explore Painted Porch Strategies speaker bios, mission, media appearances and speaking engagements. Download the press kit or contact Media Relations.",
    ogImage: `${SITE}/images/press-kit-share.jpg`,
    h1: "Painted Porch Strategies Press Kit",
    intro: "Painted Porch Strategies is a change-origination practice. For more than twenty years, we've worked at the moment where leaders have the greatest leverage: before direction hardens into a plan, while there is still room to imagine, align, and architect what comes next.",
    sections: [
      { h2: "Our Mission", body: "Extraordinary Teams. Epic ShIFt. We build with your leaders rather than for them, expanding their capacity to author the future long after we leave." },
      { h2: "Our Speakers", body: "Amy Yackowski, Founder and Chief Evolution Officer; Rob Hunter, Chief Storytelling Officer; and Sierra Ramm Cantrell, Chief Joy Officer. Topics include change authorship, emotional intelligence, storytelling, communication, mindfulness and resilience." },
      { h2: "Selected Speaking Engagements", body: "ProjectWorld, Project Summit, PMBA Global, American Staffing Association, Toastmasters International and NextUp Phoenix." },
      { h2: "Press Contact", body: "Media Relations: speaking@onthepaintedporch.com. Contact the Painted Porch Strategies team for interviews, speaking opportunities, speaker photos and additional press materials." },
    ],
    links: [
      { href: "/contact?interest=speaking", label: "Contact Us" },
      { href: "/downloads/painted-porch-strategies-press-kit.pdf", label: "Download Press Kit PDF" },
      { href: "/speaking/media", label: "Media Appearances" },
    ],
  },
  {
    // Relaunch (plan Phase 5, PPS Admin 2026-11-05): the redesign's homepage.
    // No prices on the homepage (PPS-DEC-0022).
    path: "/",
    title: "Painted Porch Strategies | Build an Organization That Can Do Epic ShIFt",
    description:
      "You have a vision for who your organization can become next. Is that future being authored with intention, or inherited through assumption?",
    h1: "Build an Organization That Can Do Epic ShIFt",
    intro:
      "You have a vision for who your organization can become next. Is that future being authored with intention, or inherited through assumption? Painted Porch Strategies partners with leaders at Phase Zero™, before the next major decision hardens into execution.",
    sections: [
      {
        h2: "There's a lot of shIFt happening right now",
        body: "Leaders are carrying more change than their organizations were built to hold. The strategy makes sense in the boardroom, then shifts somewhere between the announcement and the people bringing it to life. The change moves forward, just not as far as you knew it could.",
      },
      {
        h2: "Every major shIFt changes three things at once",
        body: "A good idea still meets the organization you already have, so before anything is built we read all three Painted Porch Pillars™. Cultural Cornerstone: leadership, culture, values, and the relationships that shape how your organization leads, decides, and evolves. Operational Frame: systems, workflows, structures, and the decision paths that move strategy from intention into reality. Living Ecosystem: the individual and collective capacity, judgment, and communication that keep a meaningful shIFt going.",
      },
      {
        h2: "Who is your organization becoming?",
        body: "The P.A.T.H.™ is the four stages of change: Prepare, Align, Take Off, Create Habits. It begins at Phase Zero™, which spans Prepare and Align. Envision ShIFt partners at Prepare, Architect ShIFt at Align, and Embody ShIFt from Take Off through Habits.",
      },
      {
        h2: "Start with a Clarity Call",
        body: "In 60 minutes with Amy, you'll read whether your current architecture can carry the shIFt, where misalignment would tax your momentum, and the first decisive move to make. It's also where the Epic ShIFt Organizational Appraisal begins.",
      },
      {
        h2: "Other ways in",
        body: "Team workshops for leadership and cross-functional teams; keynotes from Amy Yackowski, Rob Hunter and Sierra Cantrell; and mini courses, masterclasses, labs and assessments for individuals.",
      },
    ],
    links: commonLinks,
  },
  {
    // Relaunch: the redesign's About page (plan Phase 5).
    path: "/about",
    title: "About | Painted Porch Strategies",
    description:
      "Named for the Stoa Poikile, the painted porch where philosophy went public. Twenty-plus years of organizational change, practiced at the decision, not the delivery.",
    h1: "Named for a Porch Where Philosophy Went Public",
    intro:
      "The Stoa Poikile, the Painted Porch, is where the Stoics taught in Athens: wisdom out in the open, for everyone. We took the name and brought it into the modern world of business.",
    sections: [
      {
        h2: "We design your next shIFt. You make it happen.",
        body: "Every change has a moment when it can still become exactly what you intend. Once it starts moving, it gathers momentum in whatever direction it's pointed. We work in that window: before the rollout, before the roadmap, before resources, credibility, and momentum are committed to a direction. We call it Phase Zero™. Painted Porch Strategies is a change-origination practice, and for more than twenty years we've partnered with leaders to use that time well, while there's still room to imagine, align, and architect what comes next. We look at three things at once: your leadership and culture, your systems and workflows, and the human capacity underneath both.",
      },
      {
        h2: "Different disciplines. Shared conviction.",
        body: "Amy Yackowski, Founder, Chief Evolution Officer and Organizational Shift Strategist. Rob Hunter, Chief Storytelling Officer and M.C., Master of Communication. Sierra Cantrell, Chief Joy Officer, M.B.A. (Mind-Body Architect) and Mindfulness Sherpa.",
      },
    ],
    links: [
      { href: "/speaking/amy", label: "Amy Yackowski" },
      { href: "/speaking/rob", label: "Rob Hunter" },
      { href: "/speaking/sierra", label: "Sierra Cantrell" },
      { href: "/phase-zero", label: "Phase Zero: our approach" },
      { href: "/about/impact", label: "Results & Impact" },
      { href: "/#clarity-call", label: "Start with a Clarity Call" },
    ],
  },
  {
    // Relaunch: Results & Impact (plan Phase 5). Figures kept by PPS Admin, 2026-11-05.
    path: "/about/impact",
    title: "Results & Impact | Painted Porch Strategies",
    description:
      "What our clients say, the organizations we've worked alongside, and where 5% of every fee has gone: $31,474 given to client-chosen charities to date.",
    h1: "Proof, Not Promises",
    intro:
      "We'd rather show you a running tally than tell you we care. Here's what clarity before commitment looks like in practice: in our clients' words, in the organizations we've worked alongside, and in where 5% of every fee has gone.",
    sections: [
      {
        h2: "The running tally",
        body: "28 organizations and counting, $31,474 given to client-chosen charities, and 5% of every fee.",
      },
      {
        h2: "5% of every fee goes to a charity of your choosing, in your name",
        body: "When an organization works with us, 5% of that investment goes straight to a cause the client chooses, donated in their name, not ours. Good work should compound beyond the room it happened in. Painted Porch Strategies was created to model the Stoic principles of Reason, Logic, Purpose, and Virtue.",
      },
    ],
    links: commonLinks,
  },
  {
    path: "/amy",
    title: "Amy Yackowski, Founder | Painted Porch Strategies",
    description:
      "Amy Yackowski is the Founder and Organizational Shift Strategist at Painted Porch Strategies. 20+ years architecting change across industries.",
    h1: "Amy Yackowski — Founder & Organizational Shift Strategist",
    intro:
      "Amy Yackowski is the Founder and Organizational Shift Strategist at Painted Porch Strategies. With 20+ years of experience architecting organizational change, she helps leaders design the capacity for market leadership through Phase Zero™ strategic positioning and The Painted Porch Pillars™ framework.",
    sections: [
      {
        h2: "How Amy partners",
        body: "Amy works with C-suite executives at the moment of strategic authorship — when leaders are determining what change to lead rather than reacting to change competitors have launched. She brings Stoic philosophy to modern transformation and refuses to accept 'change theater' or 'lift and shift' as substitutes for real architecture.",
      },
    ],
    links: [
      { href: "/about", label: "About Painted Porch Strategies" },
      { href: "/rob", label: "Meet Rob Hunter" },
      { href: "/envision-shift", label: "The Epic ShIFt Organizational Appraisal" },
      { href: "/contact", label: "Contact Amy" },
    ],
  },
  {
    path: "/rob",
    title: "Rob Hunter, Master of Communication | Painted Porch Strategies",
    description:
      "Rob Hunter is the Master of Communication at Painted Porch Strategies, designing change communication architecture that lands.",
    h1: "Rob Hunter — Master of Communication",
    intro:
      "Rob Hunter leads communication architecture at Painted Porch Strategies. He designs the messaging systems that make change legible, believable, and adoptable inside complex organizations.",
    links: commonLinks,
  },
  {
    path: "/sierra",
    title: "Sierra, Chief Joy Officer | Painted Porch Strategies",
    description:
      "Sierra is the Chief Joy Officer at Painted Porch Strategies — the team's reminder that joy is a strategic asset.",
    h1: "Sierra — Chief Joy Officer",
    intro:
      "Sierra is the Chief Joy Officer at Painted Porch Strategies. Every serious change initiative needs a joy anchor. Sierra is ours.",
    links: commonLinks,
  },
  {
    // Epic ShIFt Organizational Appraisal (PPS-DEC-0018). Retired /blue-door redirects here (PPS-DEC-0017).
    path: "/envision-shift",
    title: "The Epic ShIFt Organizational Appraisal | Painted Porch Strategies",
    description:
      "An interview-led organizational 360 built on six interviews, from executives to the frontline. Your P.A.T.H. Compass clarifies which change and direction make sense to pursue NOW and what in your organization needs reinforcement first, so you can lead with clarity and build with confidence. Investment: $24,000.",
    h1: "Envision ShIFt — The Epic ShIFt Organizational Appraisal",
    intro:
      "Every epic shIFt begins at a threshold: an honest appraisal of what your organization is realistically able to carry. The Epic ShIFt Organizational Appraisal is an interview-led organizational 360 that determines which change and direction make sense to pursue next. It begins with a Clarity Call.",
    sections: [
      {
        h2: "What it is",
        body: "Six interviews across your organization, three with executives and three with people from mid-level through the frontline, appraise its current architecture: the leadership and culture, the systems and workflows, and the human capacity underneath them.",
      },
      {
        h2: "What it produces",
        body: "Your P.A.T.H. Compass: an architecture read, a capacity signal, a Move Now Map, and Reinforce First priorities across the three Painted Porch Pillars™. Investment: $24,000.",
      },
    ],
    links: [
      { href: "/#clarity-call", label: "Start with a Clarity Call" },
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/architect-shift", label: "Architect ShIFt" },
      { href: "/embody-shift", label: "Embody ShIFt" },
    ],
  },
  {
    // Relaunch (plan Phase 5): The P.A.T.H. No prices here (PPS-DEC-0022).
    path: "/the-path",
    title: "The P.A.T.H.™ | Painted Porch Strategies",
    description:
      "Prepare, Align, Take Off, Create Habits: the four stages of change behind every Painted Porch engagement, and how Envision, Architect and Embody ShIFt partner on each.",
    h1: "The P.A.T.H.™",
    intro:
      "Prepare. Align. Take Off. Create Habits. The four stages of change behind every engagement we run, and the reason our work holds after the deck is archived. It's how organizations learn to do epic shIFt: from the first honest question to the habits that make it second nature.",
    sections: [
      {
        h2: "It starts before Take Off",
        body: "Stoicism is the GPS for how we think. The P.A.T.H. is the roadmap for how we work. The P.A.T.H. begins two stages before Take Off, while there's still room to shape the possibility: understanding what your organization is built to carry, and bringing the people who will carry it into genuine alignment.",
      },
      {
        h2: "Four stages. Three ShIFts. One map.",
        body: "Prepare pairs with Envision. Align pairs with Architect: the intensive and sprint fortify your organization before execution. When you're ready, Embody is the invitation at Take Off, reinforcing your practice through Habits while your team designs and delivers the change. Together, Prepare and Align are Phase Zero™.",
      },
      {
        h2: "Ten steps on the road",
        body: "Prepare: 1 Define Your Destination; 2 Pin Your Starting Point. Align: 3 Assemble Your Change Coalition; 4 Plan Your Route; 5 Plot Your Checkpoints, Milestones & Celebrations; 6 Identify Bumps, Roadblocks, and Detours. Take Off: 7 Take Your Change on the Road; 8 Map Your Future Journey; 9 Provide GPS & Roadside Assistance. Create Habits: 10 Reinforce Change & Continual ShIFt. Steps 1 to 6 are Phase Zero™.",
      },
      {
        h2: "Your P.A.T.H., in one page",
        body: "The Epic ShIFt Organizational Appraisal produces your P.A.T.H. Compass: which stage your organization is actually on, what's blocking the next one, and the sequence that makes each hold. Every stage reads your organization through the three Painted Porch Pillars™: Cultural Cornerstone, Operational Frame, and Living Ecosystem.",
      },
    ],
    links: [
      { href: "/envision-shift", label: "Envision ShIFt" },
      { href: "/architect-shift", label: "Architect ShIFt" },
      { href: "/embody-shift", label: "Embody ShIFt" },
      { href: "/phase-zero", label: "What's Phase Zero?" },
      { href: "/#clarity-call", label: "Start with a Clarity Call" },
    ],
  },
  {
    // For Individuals: the IGNITE page, repurposed (PPS Admin, 2026-11-07). No prices here.
    path: "/for-individuals",
    title: "For Individual Leaders | Painted Porch Strategies",
    description:
      "Assessments, masterclasses and mini courses, and Leadership Labs for leaders investing in their own growth: on your own schedule, or alongside peers.",
    h1: "Spark Your Next ShIFt, at Your Own Pace",
    intro:
      "Assessments, masterclasses and mini courses, and Leadership Labs for leaders investing in their own growth: on your own schedule, or alongside peers.",
    sections: [
      {
        h2: "Designed for…",
        body: "The Curious Explorer, testing the frameworks at their own pace. The Individual Innovator, investing in their own leadership development. The Strategic Seeker, testing the ideas with a small group first. The Foundation Fortifier, who has seen quick fixes or wins fade and wants something that lasts.",
      },
      {
        h2: "Start Where You Are",
        body: "Assessments reveal your emotional intelligence, your strengths and the talents that make you extraordinary. Masterclasses and mini courses give strategic insight in under 90 minutes. Leadership Labs are 6–12 week cohorts of up to 25 leaders from different organizations, with peer accountability and individual coaching touchpoints.",
      },
      {
        h2: "From Spark to Momentum",
        body: "When you're ready, bring it to your team through Team Workshops, or lead change across your organization starting with the Epic ShIFt Organizational Appraisal.",
      },
    ],
    links: [
      { href: "/assessments", label: "Assessments" },
      { href: "/masterclasses", label: "Masterclasses and mini courses" },
      { href: "/leadership-labs", label: "Leadership Labs" },
      { href: "/workshops", label: "Team Workshops" },
      { href: "/envision-shift", label: "Envision ShIFt" },
    ],
  },
  {
    // Relaunch (plan Phase 5): Architect ShIFt, prices per PPS-DEC-0020.
    path: "/architect-shift",
    title: "Architect ShIFt | Painted Porch Strategies",
    description:
      "An executive strategy & authorship intensive, a 90-day pillar-fortification sprint and a retrospective that decides your organization's next step. Starting at $90,000, in a weekly or a biweekly version.",
    h1: "Architect ShIFt",
    intro:
      "Author the direction together. Fortify the pillars that need to hold first. Then decide whether your organization is ready to design and lead its next epic shIFt.",
    sections: [
      {
        h2: "Author. Fortify. Decide.",
        body: "Grounded in your Epic ShIFt Organizational Appraisal, your senior team spends three days authoring shared direction and identifying which pillar or pillars need reinforcement first. A focused 90-day sprint with your leadership team then reinforces the prioritized pillars and the capability your organization needs before it designs and leads its change. A retrospective decides the next step.",
      },
      {
        h2: "One integrated engagement",
        body: "Starting at $90,000, offered in a weekly and a biweekly version. Architect ShIFt follows the Epic ShIFt Organizational Appraisal, and the appraisal begins with a Clarity Call.",
      },
    ],
    links: [
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/envision-shift", label: "Envision ShIFt" },
      { href: "/embody-shift", label: "Embody ShIFt" },
      { href: "/#clarity-call", label: "Start with a Clarity Call" },
    ],
  },
  {
    // Relaunch (plan Phase 5): Embody ShIFt, price per PPS-DEC-0020.
    path: "/embody-shift",
    title: "Embody ShIFt | Painted Porch Strategies",
    description:
      "Ongoing advisory while your organization designs and leads the change it envisioned and authored, reinforcing it as a continuous practice. $9,000–$18,000 per month, depending on advisory depth and need.",
    h1: "Embody ShIFt",
    intro:
      "Your organization is ready to design and lead the change it envisioned and authored. Ongoing advisory reinforces the habits, judgment, decision authority, and structures that make change, innovation, and transformation a continuous practice.",
    sections: [
      {
        h2: "Where the shIFt becomes who you are",
        body: "Embody ShIFt begins when your organization is ready to design and lead the change it envisioned and authored for itself. You own that change. Our ongoing advisory partnership begins at Take Off and continues through Habits on the P.A.T.H.™, during your change journey and beyond.",
      },
      {
        h2: "Investment",
        body: "$9,000–$18,000 per month, depending on advisory depth and need. Every journey starts with a Clarity Call; if you're finishing Architect ShIFt, the invitation to Embody opens at your retrospective.",
      },
    ],
    links: [
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/architect-shift", label: "Architect ShIFt" },
      { href: "/#clarity-call", label: "Start with a Clarity Call" },
    ],
  },
  {
    path: "/resources",
    title: "Resources | Painted Porch Strategies",
    description:
      "Free tools, guides, insights, FAQs, and a full media library from Painted Porch Strategies. Practical wisdom for change origination.",
    h1: "Resources",
    intro:
      "A growing library of free tools, insights, and guides on change origination, Phase Zero™ strategic positioning, leadership development, and Stoic practical wisdom applied to modern transformation.",
    links: [
      { href: "/resources/free", label: "Free tools and guides" },
      { href: "/resources/insights", label: "Insights and thought leadership" },
      { href: "/resources/faq", label: "Frequently asked questions" },
      { href: "/resources/youtube", label: "YouTube channel" },
      { href: "/resources/stractical-mini", label: "Stractical Leader mini guide" },
      { href: "/envision-shift", label: "The Epic ShIFt Organizational Appraisal" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/resources/free",
    title: "Free Tools & Guides | Painted Porch Strategies",
    description:
      "Downloadable guides, calculators, and worksheets from Painted Porch Strategies. Practical Phase Zero™ tools you can use today.",
    h1: "Free Tools & Guides",
    intro:
      "Downloadable guides, calculators, and worksheets — practical Phase Zero™ tools you can use today. Includes the Stractical Leader mini guide, the Cost of Skipping calculator, burnout resources, and more.",
    links: [
      { href: "/resources/stractical-mini", label: "Stractical Leader mini guide" },
      { href: "/resources/insights", label: "Insights and thought leadership" },
      { href: "/envision-shift", label: "The Epic ShIFt Organizational Appraisal" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/resources/faq",
    title: "FAQ | Painted Porch Strategies",
    description:
      "Frequently asked questions about Painted Porch Strategies: the Clarity Call, the three ShIFts, the Epic ShIFt Organizational Appraisal, team workshops and Leadership Labs, and self-led assessments and masterclasses.",
    h1: "Frequently Asked Questions",
    intro:
      "Answers to the questions we hear most often: where to start, what happens in a Clarity Call, how Envision, Architect and Embody ShIFt work, the Epic ShIFt Organizational Appraisal and P.A.T.H. Compass, team workshops and Leadership Labs, and self-led assessments and masterclasses.",
    links: commonLinks,
  },
  {
    path: "/resources/insights",
    title: "Insights | Painted Porch Strategies",
    description:
      "Thought leadership from Painted Porch Strategies on change origination, Phase Zero™ strategy, Stoic leadership, and organizational architecture.",
    h1: "Insights & Thought Leadership",
    intro:
      "Long-form thought leadership on change origination, Phase Zero™ strategic positioning, Stoic leadership, communication architecture, and the mechanics of building organizations that lead their markets.",
    links: commonLinks,
  },
  {
    path: "/workshops",
    title: "Team Workshops | Painted Porch Strategies",
    description:
      "Team workshops on leadership and change: the P.A.T.H. to Lasting Change, communication architecture, change readiness, and more.",
    h1: "Team Workshops",
    intro:
      "Team workshops that open a larger engagement or run as targeted capability builds. Every workshop is anchored in Phase Zero™ and The Painted Porch Pillars™ so the work sticks after the room clears.",
    links: [
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/architect-shift", label: "Architect ShIFt" },
      { href: "/leadership-labs", label: "Leadership Labs" },
      { href: "/leadership-labs/stractical-leader", label: "Stractical Leader Intensive" },
      { href: "/envision-shift", label: "The Epic ShIFt Organizational Appraisal" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/leadership-labs",
    title: "Leadership Labs | Painted Porch Strategies",
    description:
      "Leadership Labs deepen specific capabilities — team dynamics, change readiness, communication systems — through hands-on practice.",
    h1: "Leadership Labs",
    intro:
      "Leadership Labs are hands-on, capability-specific cohort programs. They pair with workshops to deepen the muscles a specific transformation needs.",
    links: [
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/workshops", label: "Team workshops" },
      { href: "/architect-shift", label: "Architect ShIFt" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/leadership-labs/stractical-leader",
    title: "The Stractical Leader 6-Week Intensive | Painted Porch Strategies",
    description:
      "A 6-week intensive that turns tactical managers into stractical leaders combining strategic thinking with practical execution.",
    h1: "The Stractical Leader — 6-Week Intensive",
    intro:
      "The Stractical Leader Intensive is a 6-week Leadership Lab that builds strategic-plus-tactical (stractical) leadership capacity. Live cohort sessions, applied assignments, and direct coaching from Amy Yackowski.",
    links: [
      { href: "/resources/stractical-mini", label: "Stractical mini guide (free)" },
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/envision-shift", label: "The Epic ShIFt Organizational Appraisal" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/assessments",
    title: "Assessments | Painted Porch Strategies",
    description:
      "Individual and team assessments: Working Genius, EQ-i, change readiness, and elemental style.",
    h1: "Assessments",
    intro:
      "A library of individual and team assessments that surface how you and your people are wired for change: Working Genius, EQ-i 2.0, change readiness, elemental style, and team health.",
    links: [
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/eq", label: "EQ-i 2.0 assessment" },
      { href: "/assessments/working-genius", label: "Working Genius" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/masterclasses",
    title: "Masterclasses | Painted Porch Strategies",
    description:
      "Live and on-demand masterclasses on change origination, leadership, communication, and Stoic wisdom.",
    h1: "Masterclasses",
    intro:
      "Live and on-demand masterclasses on the topics leaders wrestle with most: originating change, leading through uncertainty, designing communication that lands, and applying Stoic practical wisdom.",
    links: [
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/speaking",
    title: "Speaking & Workshops | Painted Porch Strategies",
    description:
      "Book Amy Yackowski, Rob Hunter, or the Painted Porch team for keynotes, workshops, and executive sessions on change origination.",
    h1: "Speaking & Workshops",
    intro:
      "Amy Yackowski and the Painted Porch team deliver keynotes, workshops, and executive sessions on change origination, Phase Zero™ strategy, Stoic leadership, and communication architecture.",
    links: [
      { href: "/speaking/topics", label: "Talk topics" },
      { href: "/speaking/amy", label: "Amy Yackowski (speaker)" },
      { href: "/speaking/rob", label: "Rob Hunter (speaker)" },
      { href: "/speaking/media", label: "As seen on" },
      { href: "/contact", label: "Book a session" },
    ],
  },
  {
    path: "/speaking/topics",
    title: "Speaking Topics | Painted Porch Strategies",
    description:
      "Signature talk and workshop topics from Painted Porch Strategies: Phase Zero, Stractical Leadership, Stoic leadership, and change origination.",
    h1: "Speaking Topics",
    intro:
      "Signature keynote and workshop topics from the Painted Porch team, ranging from Phase Zero™ strategic authorship to Stoic practical wisdom for modern leaders.",
    links: [
      { href: "/speaking", label: "Speaking overview" },
      { href: "/contact", label: "Book a session" },
    ],
  },
  {
    path: "/speaking/amy",
    title: "Amy Yackowski, Speaker | Painted Porch Strategies",
    description:
      "Book Amy Yackowski, Founder of Painted Porch Strategies, for keynotes and workshops on change origination and Stoic leadership.",
    h1: "Amy Yackowski — Keynote Speaker",
    intro:
      "Amy Yackowski delivers keynotes and workshops on change origination, Phase Zero™ strategy, and Stoic practical wisdom for modern executives. 20+ years inside real transformations, no theater.",
    links: [
      { href: "/speaking", label: "All speakers" },
      { href: "/speaking/topics", label: "Talk topics" },
      { href: "/contact", label: "Book Amy" },
    ],
  },
  {
    path: "/speaking/rob",
    title: "Rob Hunter, Speaker | Painted Porch Strategies",
    description:
      "Book Rob Hunter, Master of Communication at Painted Porch Strategies, for keynotes on change communication architecture.",
    h1: "Rob Hunter — Keynote Speaker",
    intro:
      "Rob Hunter speaks on communication architecture, the six communicator styles, and how to make change legible inside complex organizations.",
    links: [
      { href: "/speaking", label: "All speakers" },
      { href: "/6-communicator-styles", label: "Six Communicator Styles" },
      { href: "/contact", label: "Book Rob" },
    ],
  },
  {
    path: "/speaking/media",
    title: "As Seen On | Painted Porch Strategies",
    description:
      "Media appearances, podcasts, and press coverage featuring Painted Porch Strategies.",
    h1: "As Seen On",
    intro:
      "Podcasts, press, and media appearances featuring Amy Yackowski and the Painted Porch team on change origination, leadership, and Stoic practical wisdom.",
    links: commonLinks,
  },
  {
    path: "/contact",
    title: "Contact Painted Porch Strategies",
    description:
      "Get in touch with Painted Porch Strategies to discuss partnership, the Epic ShIFt Organizational Appraisal, speaking, or workshops.",
    h1: "Contact Painted Porch Strategies",
    intro:
      "Ready to talk? Send us a message and we will respond within one business day. For engagement inquiries, we recommend starting with a Clarity Call and the Epic ShIFt Organizational Appraisal, our interview-led appraisal.",
    links: [
      { href: "/envision-shift", label: "Envision ShIFt" },
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/speaking", label: "Speaking & workshops" },
    ],
  },
  {
    // Phase Zero™: Our Approach, one page combining Phase Zero and Our Approach (PPS Admin,
    // 2026-11-06). Phase Zero spans Prepare and Align (PPS-DEC-0027).
    path: "/phase-zero",
    title: "Phase Zero™: Our Approach | Painted Porch Strategies",
    description:
      "Phase Zero is the work before the work: the Prepare and Align stages of the P.A.T.H., where leaders get clear about people, systems, and culture, and decide what to author before the next big shIFt.",
    h1: "Phase Zero™",
    intro:
      "Before the kickoff. Before the rollout. Before the next big shIFt. Sustainable change is designed, not declared.",
    sections: [
      {
        h2: "Every opportunity asks something of the organization pursuing it",
        body: "More effort moves you further in whatever direction you're already pointed. Phase Zero is where you choose that direction on purpose. Every initiative is built on assumptions about leadership, communication, priorities, and culture; Phase Zero surfaces them before they become expensive realities.",
      },
      {
        h2: "Where the real choices get made",
        body: "Phase Zero is where you decide what's worth committing your time, energy, resources, and credibility to: not what to copy, catch up to, or react to, but what to author.",
      },
      {
        h2: "Prepare and Align",
        body: "Phase Zero spans the first two stages of the P.A.T.H.: Prepare, where Envision ShIFt partners, and Align, where Architect ShIFt partners. It's the groundwork that has to happen before you Take Off and Create Habits that last.",
      },
      {
        h2: "The foundations beneath every shIFt",
        body: "Phase Zero examines and fortifies the three Painted Porch Pillars™: Cultural Cornerstone (leadership and culture), Operational Frame (workflows and systems), and Living Ecosystem (capacity and judgment).",
      },
    ],
    links: [
      { href: "/the-path", label: "The P.A.T.H." },
      { href: "/envision-shift", label: "Envision ShIFt" },
      { href: "/architect-shift", label: "Architect ShIFt" },
      { href: "/#clarity-call", label: "Start with a Clarity Call" },
    ],
  },
  {
    path: "/eq",
    title: "EQ-i 2.0 Assessment | Painted Porch Strategies",
    description:
      "Take the EQ-i 2.0 emotional intelligence assessment with debrief and coaching from a certified Painted Porch practitioner.",
    h1: "EQ-i 2.0 Emotional Intelligence Assessment",
    intro:
      "The EQ-i 2.0 is the world's most established emotional intelligence assessment. Painted Porch offers certified administration, debrief, and coaching, individually or for teams.",
    links: [
      { href: "/assessments", label: "All assessments" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/resources/youtube",
    title: "YouTube | Painted Porch Strategies",
    description:
      "Watch Painted Porch Strategies videos: change origination, Phase Zero, Stoic leadership, and practical wisdom for modern executives.",
    h1: "Painted Porch on YouTube",
    intro:
      "Short-form and long-form video on change origination, Phase Zero™, Stoic leadership, and the mechanics of building organizations that lead their markets.",
    links: commonLinks,
  },
  {
    path: "/resources/stractical-mini",
    title: "The Stractical Leader Mini Guide (Free) | Painted Porch Strategies",
    description:
      "Free mini guide: how strategic-plus-tactical (stractical) leaders think, decide, and execute. From the Stractical Leader Intensive.",
    h1: "The Stractical Leader Mini Guide",
    intro:
      "A free mini guide adapted from the Stractical Leader 6-Week Intensive. How strategic-plus-tactical leaders think about direction, decisions, and execution, without collapsing into either extreme.",
    links: [
      { href: "/leadership-labs/stractical-leader", label: "Full 6-week Intensive" },
      { href: "/resources", label: "All resources" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/kick-the-habit",
    title: "Kick the Habit | Painted Porch Strategies",
    description:
      "A free session on breaking the habits that keep leaders stuck in reactive change management.",
    h1: "Kick the Habit",
    intro:
      "A free session on the specific habits that keep smart leaders stuck in reactive change management, and how to break them.",
    links: commonLinks,
  },
  {
    path: "/stoic-field-guide",
    title: "The Stoic Field Guide | Painted Porch Strategies",
    description:
      "A practical Stoic field guide for modern leaders: apply Marcus Aurelius, Epictetus, and Seneca to your actual calendar.",
    h1: "The Stoic Field Guide",
    intro:
      "A practical Stoic field guide built for modern leaders. Marcus Aurelius, Epictetus, and Seneca translated into decisions you can make on Monday morning.",
    links: commonLinks,
  },
  {
    path: "/6-communicator-styles",
    title: "The Six Communicator Styles | Painted Porch Strategies",
    description:
      "The Six Communicator Styles, Rob Hunter's framework for making change communication land inside complex organizations.",
    h1: "The Six Communicator Styles",
    intro:
      "Rob Hunter's framework for change communication. Six distinct styles that shape how people receive, interpret, and act on organizational messages.",
    links: commonLinks,
  },
  {
    path: "/burnout",
    title: "Burnout Resources | Painted Porch Strategies",
    description:
      "Free resources for leaders and teams recovering from burnout: practical tools and reframes from Painted Porch Strategies.",
    h1: "Burnout Resources",
    intro:
      "A free resource pack for leaders and teams working through burnout. Practical tools, honest reframes, and a path back to sustainable capacity.",
    links: commonLinks,
  },
  {
    path: "/terms",
    title: "Terms & Conditions | Painted Porch Strategies",
    description:
      "Terms and conditions, privacy policy, and cookie policy for Painted Porch Strategies.",
    h1: "Terms & Conditions",
    intro:
      "The legal terms governing use of Painted Porch Strategies programs, products, and this website, plus our privacy and cookie policies.",
    links: commonLinks,
  },
  {
    path: "/sitemap",
    title: "Sitemap | Painted Porch Strategies",
    description:
      "Full sitemap of Painted Porch Strategies: every public page, organized by section.",
    h1: "Sitemap",
    intro:
      "Every public page on the Painted Porch Strategies site, organized by section: About, Partnership tiers, Resources, Speaking, and lead-magnet landing pages.",
    links: commonLinks,
  },
];

export { SITE };

/**
 * Pages that moved to top-level addresses (PPS-DEC-0025 amendment, PPS Admin 2026-11-06).
 * prerender.mjs writes a forwarding page at each old address, with the new page's SEO.
 */
export const movedPages = [
  { from: "/partner/ignite", to: "/for-individuals" },
  { from: "/partner/ignite/assessments", to: "/assessments" },
  { from: "/partner/ignite/masterclasses", to: "/masterclasses" },
  { from: "/partner/amplify/workshops", to: "/workshops" },
  { from: "/partner/amplify/labs", to: "/leadership-labs" },
  { from: "/partner/amplify/stractical-leader", to: "/leadership-labs/stractical-leader" },
];
