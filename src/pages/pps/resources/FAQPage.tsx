import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import LazyHeroVideo from "@/components/pps/LazyHeroVideo";
import { useHeroLoaded } from "@/hooks/useHeroLoaded";
import faqHero from "@/assets/faq-hero.jpg";

/** An in-answer link, styled like the site's other inline links. */
function FaqLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-semibold text-primary underline underline-offset-2 hover:no-underline">
      {children}
    </Link>
  );
}

/**
 * Organized around the Clarity Call, the three ShIFts, team workshops and self-led resources
 * (PPS Admin approved the outline, 2026-11-06). IGNITE, AMPLIFY and EMBODY aren't used as names
 * (PPS-DEC-0025). No prices here: each answer links to the page that carries its price.
 */
const sitewideFaqCategories: FAQCategory[] = [
  {
    name: "General",
    faqs: [
      {
        question: "What does Painted Porch Strategies do?",
        answer: "We partner with leaders and organizations to architect the capacity for change before implementation begins. Grounded in Stoic philosophy and more than 20 years of change expertise, we co-design the three Painted Porch Pillars that human-centered change stands on: the Cultural Cornerstone, Operational Frame and Living Ecosystem.",
      },
      {
        question: "What does 'Phase Zero™' mean?",
        answer: (
          <>
            Phase Zero is the strategic preparation that happens before a project kicks off: building readiness, the right
            mindset and alignment. It spans Prepare and Align, the first two stages of
            our <FaqLink to="/the-path">P.A.T.H. framework</FaqLink>, and it's the foundation your organization (and
            everything at Painted Porch) is built on.
          </>
        ),
      },
      {
        question: "Why is it called 'Painted Porch'?",
        answer: "The name comes from the ancient stoa poikile, the 'painted porch' in Athens where Zeno taught Stoicism. It was an open-air gathering place for learning, dialogue and practical wisdom. We carry that spirit into modern organizational change.",
      },
      {
        question: "What industries do you work with?",
        answer: "Our frameworks are industry-agnostic. We've partnered with leaders in healthcare staffing, technology, professional services and more. The principles of Phase Zero and human-centered change apply wherever people drive results.",
      },
      {
        question: "How is Painted Porch different from traditional consulting?",
        answer: "We don't arrive with a packaged solution from somewhere else. We bring deep change expertise, insight from inside your organization and a clear point of view on what will hold. Then we advise you as you fortify your organizational architecture: the culture, structure and systems your next shIFt will stand on. You know your organization best, and we know how lasting change works. Together, we build strength that stays with you, not dependence on us.",
      },
    ],
  },
  {
    name: "Getting Started",
    faqs: [
      {
        question: "Where should we start?",
        answer: (
          <>
            Most organizations start with a <FaqLink to="/#clarity-call">Clarity Call</FaqLink>: 60 minutes with Amy to read
            where you are and the first decisive move to make. If you'd rather explore on your own first,{" "}
            try <FaqLink to="/start-here">Find Your Next ShIFt</FaqLink>, a three-minute directional guide that points you to a good
            starting point for you, your team or your organization.
          </>
        ),
      },
      {
        question: "What happens in a Clarity Call?",
        answer: (
          <>
            It's 60 minutes with Amy Yackowski. Bring the vision you haven't had the words for, or the roadblock everyone
            else has accepted as normal. Together you'll read whether your current architecture can carry the shIFt, where
            misalignment would tax your momentum, and the first decisive move to make. Every engagement, including the Epic
            ShIFt Organizational Appraisal, begins here. <FaqLink to="/#clarity-call">Book a Clarity Call</FaqLink>.
          </>
        ),
      },
      {
        question: "What is the P.A.T.H.?",
        answer: (
          <>
            The P.A.T.H.™ is our four-stage framework for lasting change: Prepare, Align, Take Off and Create Habits. It
            starts before the plan and the launch, while there's still room to shape what's possible.{" "}
            <FaqLink to="/the-path">See The P.A.T.H.</FaqLink>
          </>
        ),
      },
      {
        question: "Is there a commitment or contract required?",
        answer: "Self-led resources are one-time purchases, and many are free. Workshops are booked one at a time. Architect ShIFt is one integrated engagement: a 3-day executive intensive, a 90-day strategic sprint and a 1.5-day retrospective. Embody ShIFt is ongoing monthly advisory. Every engagement starts with a conversation to make sure it's the right fit for both sides.",
      },
      {
        question: "Can we mix offerings?",
        answer: "Absolutely. Many leaders take a masterclass or an assessment for their own growth while their team joins a workshop, and plenty start small and grow into deeper work as trust builds. The offerings are designed to complement each other, not restrict you.",
      },
    ],
  },
  {
    name: "The Three ShIFts",
    faqs: [
      {
        question: "What's the difference between Envision, Architect and Embody ShIFt?",
        answer: (
          <>
            They partner with you across the P.A.T.H. <FaqLink to="/envision-shift">Envision ShIFt</FaqLink> (Prepare) is
            the Epic ShIFt Organizational Appraisal: an honest read of what your organization is ready to carry.{" "}
            <FaqLink to="/architect-shift">Architect ShIFt</FaqLink> (Align) authors the direction with your leaders and
            fortifies the pillars that need to hold first. <FaqLink to="/embody-shift">Embody ShIFt</FaqLink> (Take Off and
            Create Habits) is ongoing advisory while your organization designs and leads the change.
          </>
        ),
      },
      {
        question: "What's the Epic ShIFt Organizational Appraisal, and what's the P.A.T.H. Compass?",
        answer: (
          <>
            The appraisal is an interview-led organizational 360: six interviews, three with executives and three with people
            from mid-level through the frontline, read across the three Painted Porch Pillars™. It produces your P.A.T.H.
            Compass, which shows where you can move now, what needs reinforcement first, and your recommended next step. It
            begins with a Clarity Call. <FaqLink to="/envision-shift">How the appraisal works</FaqLink>
          </>
        ),
      },
      {
        question: "Why does Architect ShIFt start with the appraisal?",
        answer: "The appraisal is how we see your three Painted Porch Pillars™ clearly: Cultural Cornerstone, Operational Frame and Living Ecosystem. It shows what your organization is built to carry right now and what needs reinforcing. Without that reading, any engagement is a guess. With it, Architect ShIFt's executive intensive starts from shared evidence about your actual architecture, not a template.",
      },
      {
        question: "What if the appraisal shows we're not ready?",
        answer: "That's one of the most valuable things the appraisal can surface. Your P.A.T.H. Compass shows what to reinforce first, and we'll be straightforward about it. The right next step might be strengthening a foundation, resequencing the initiative, a team workshop or self-led work. We'd rather point you to the right starting line than sell you an engagement your organization can't yet carry.",
      },
      {
        question: "How is this different from change management?",
        answer: "Change management starts after the direction is set. It manages resistance and drives adoption of decisions already made. We work earlier, at the moment of strategic authorship. That's change origination: we partner with you to architect the shIFt you intend to lead before a single tool gets launched. It's Phase Zero™ work, the work before the work, and it's where market leadership is actually decided.",
      },
      {
        question: "What does Embody ShIFt look like month to month?",
        answer: "Typically biweekly or monthly strategic sessions with senior leadership, plus office-hours access in between, while your organization moves through Take Off and Habits. The cadence is co-designed with you, and the depth of advisory flexes with your needs. Embody ShIFt isn't a fixed program. It's ongoing advisory shaped around the shIFt you're leading.",
      },
      {
        question: "What outcomes can we expect?",
        answer: "Three things: a clearly authored direction for the shIFt you intend to lead, an organizational architecture built to sustain it across the three Painted Porch Pillars™, and the internal capacity to originate the next shIFt without us. The goal isn't dependence on Painted Porch. It's a Fortified Porch: built to author change, not just absorb it.",
      },
      {
        question: "Can you partner alongside our internal change team?",
        answer: "Absolutely. We're complementary, not competitive. Internal teams often own execution and adoption beautifully. We work upstream of that, fortifying your organizational architecture and building your team's strength so the work continues long after our engagement ends.",
      },
      {
        question: "What happens if our leadership changes mid-engagement?",
        answer: "Leadership transitions are exactly when architecture matters most. We design the work to live in your organization's structure, not in a single relationship. When leadership shifts, we re-anchor the work, bring new leaders into the architecture, and keep the change grounded in what your organization is built to lead.",
      },
    ],
  },
  {
    name: "Team Workshops & Leadership Labs",
    faqs: [
      {
        question: "Do we need the Epic ShIFt Organizational Appraisal before a workshop?",
        answer: (
          <>
            Not for most. <FaqLink to="/workshops">Leadership and team development workshops</FaqLink> stand on their own, though some teams find
            the appraisal's insight valuable context. For Phase Zero Strategic Workshops and Architect ShIFt, the appraisal is the first step.
          </>
        ),
      },
      {
        question: "Can we start with a workshop and go deeper later?",
        answer: "Absolutely. Many teams start with a workshop to see how we work together, then go deeper with the Epic ShIFt Organizational Appraisal and Architect ShIFt when the work surfaces something more structural.",
      },
      {
        question: "What if our team is spread out geographically?",
        answer: "We lead virtual workshops well. In person is ideal when it's possible, but it isn't required.",
      },
      {
        question: "When is the next Leadership Lab cohort?",
        answer: (
          <>
            We run <FaqLink to="/leadership-labs">Leadership Labs</FaqLink> a few times a year. Join the waitlist and
            you'll be the first to know when new dates are announced.
          </>
        ),
      },
      {
        question: "What happens after I join the Leadership Lab waitlist?",
        answer: "You'll get a confirmation that you're on the list. When we schedule the next cohort, waitlist members get first access and priority enrollment before we open spots to the public.",
      },
      {
        question: "Is there any cost to join the waitlist?",
        answer: "No. Joining the waitlist is free, and there's no obligation. It just makes sure you hear first when enrollment opens.",
      },
      {
        question: "What's the format for Leadership Labs?",
        answer: "Leadership Labs are 6–12 week cohort programs with weekly or biweekly sessions and peer accountability. Each lab focuses on one theme (Stractical Leadership, Leading Change and others) and is capped at 25 leaders from different organizations.",
      },
      {
        question: "What if I'm not in an official leadership role?",
        answer: "We believe leadership isn't based on your title or role. It's based on your ambition, attitude and desire. We welcome everyone: official \"capital L\" Leaders, and those aspiring to lead themselves and others with courage, curiosity, clarity and the capacity to make shIFt happen.",
      },
    ],
  },
  {
    name: "Self-Led: Assessments & Masterclasses",
    faqs: [
      {
        question: "Self-led or with my team: which fits?",
        answer: (
          <>
            Self-led resources (assessments, masterclasses and mini courses) build your own capacity, at your own pace. Team
            workshops and Leadership Labs build it together, with your team or a cohort of peers. If you're not sure,{" "}
            <FaqLink to="/start-here">Find Your Next ShIFt</FaqLink> will point you to a good starting point.
          </>
        ),
      },
      {
        question: "Can I start on my own and bring my team in later?",
        answer: "Absolutely. Many leaders start with self-led work to build personal capacity, then join a Leadership Lab for deeper peer learning, or bring Phase Zero concepts to their teams through a team workshop.",
      },
      {
        question: "Do assessments expire?",
        answer: "No. Once you purchase an assessment, you can schedule any optional debrief whenever it suits you, within 12 months of purchase.",
      },
      {
        question: "Which assessment should I take first?",
        answer: (
          <>
            It depends on what you want to work on. EQ-i 2.0 gives you emotional intelligence insights, and Working Genius
            shows the work that energizes or drains you. Shift Architect <em>(coming soon)</em> is for leading change, and
            Performance DNA <em>(coming soon)</em> is your complete success blueprint.{" "}
            <FaqLink to="/assessments">Compare the assessments</FaqLink>
          </>
        ),
      },
      {
        question: "Can I take more than one assessment?",
        answer: "Yes. Many leaders take two or three to get a fuller view of their capacity, strengths and development priorities.",
      },
      {
        question: "Are debriefs included with all assessments?",
        answer: "Debriefs are optional and vary by assessment. Each assessment's details show what's offered.",
      },
      {
        question: "Can my team take assessments together?",
        answer: (
          <>
            Yes. Team pricing is available for Working Genius, EQ-i 2.0 and Performance DNA.{" "}
            <FaqLink to="/contact">Contact us</FaqLink> for team rates and group debrief options.
          </>
        ),
      },
      {
        question: "How long are masterclasses?",
        answer: (
          <>
            <FaqLink to="/masterclasses">Masterclasses</FaqLink> are focused 30–90 minute sessions that
            illuminate specific Phase Zero concepts without weeks of commitment.
          </>
        ),
      },
      {
        question: "Are masterclasses live or recorded?",
        answer: "Both. Attend live for interaction and Q&A, or watch the recording if the timing doesn't work for you.",
      },
    ],
  },
];

export default function FAQPage() {
  useDocumentSeo({
    title: "FAQ | Painted Porch Strategies",
    description: "Answers to the most common questions about Painted Porch Strategies, Phase Zero, the Clarity Call, the three ShIFts, team workshops and Leadership Labs, and self-led assessments and masterclasses.",
    ogImage: faqHero,
  });
  const isLoaded = useHeroLoaded();
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        <LazyHeroVideo
          slotKey="faq-hero"
          posterUrl={faqHero}
          className="absolute inset-0 w-full h-full"
        />
        
        <div className="container max-w-7xl mx-auto px-6 relative z-10 py-16 md:py-24">
          <div className="md:w-4/5">
            <div className="bg-black/65 backdrop-blur-sm p-8 md:p-12 rounded">
              <span className={`inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
                Resources
              </span>
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-700 ease-out delay-150 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                Frequently Asked Questions
              </h1>
              <p className={`text-lead md:text-lead text-white/90 leading-relaxed max-w-3xl transition-all duration-700 ease-out delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                Everything you need to know about Painted Porch Strategies, the P.A.T.H., and how we partner with leaders to architect extraordinary outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <FAQSection
        tierName="Painted Porch Strategies"
        categories={sitewideFaqCategories}
        subheadline="Browse by topic or search for your question below."
        showContactCTA={true}
      />
    </div>
  );
}
