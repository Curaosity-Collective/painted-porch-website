import type { FAQCategory } from "@/components/pps/FAQSection";

export const igniteFaqCategories: FAQCategory[] = [
  {
    name: "Assessments",
    faqs: [
      {
        question: "Do assessments expire?",
        answer: "No. Once you purchase an assessment, you schedule any optional debrief at your convenience (within 12 months of purchase).",
      },
      {
        question: "Which assessment should I take first?",
        answer: (
          <>
            It depends on what you want to work on. EQ-i 2.0 gives you emotional intelligence insights, and Working Genius
            shows the work that energizes or drains you. Shift Architect <em>(coming soon)</em> is for leading change, and
            Performance DNA <em>(coming soon)</em> is your complete success blueprint.
          </>
        ),
      },
      {
        question: "Can I take multiple assessments?",
        answer: "Yes. Many leaders take 2-3 assessments to get a comprehensive view of their capacity, strengths, and development priorities.",
      },
      {
        question: "Are debriefs included with all assessments?",
        answer: "Debriefs are optional and vary by assessment. Check individual assessment details for specific offerings.",
      },
      {
        question: "Can my team take assessments together?",
        answer: "Yes. Team pricing is available for Working Genius, EQ-i 2.0, and Performance DNA. Contact us for team rates and group debrief options.",
      },
    ],
  },
  {
    name: "Masterclasses",
    faqs: [
      {
        question: "How long are masterclasses?",
        answer: "Masterclasses are focused 30-90 minute sessions designed to illuminate specific Phase Zero concepts without requiring weeks of commitment.",
      },
      {
        question: "Are masterclasses live or recorded?",
        answer: "Both. Attend live for interaction and Q&A, or access the recording if the timing doesn't work for your schedule.",
      },
    ],
  },
  {
    name: "General",
    faqs: [
      {
        question: "Self-led or with my team: which fits?",
        answer: "Self-led resources (mini courses, assessments and masterclasses) build your own capacity, at your own pace. Team workshops and Leadership Labs build leadership, team and organizational capacity together, with your team or a cohort of peers.",
      },
      {
        question: "Can I start on my own and bring my team in later?",
        answer: "Absolutely. Many leaders start with self-led work to build personal capacity, then join a Leadership Lab for deeper peer learning, or bring Phase Zero concepts to their teams through a team workshop or Architect ShIFt.",
      },
    ],
  },
];
