import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Pages whose copy invites the reader in; it doesn't push, and it never casts
// Painted Porch as a service provider (see AGENTS.md, "Public copy").
// The new-design pages, by name under src/pages/pps/v3:
const NEW_DESIGN = [
  "HomeNext",
  "AboutNext",
  "PhaseZeroNext",
  "ThePath",
  "EnvisionShift",
  "ArchitectShift",
  "EmbodyShift",
  "ForIndividuals",
  "ResultsImpact",
].map((name) => `v3/${name}.tsx`);

// The older pages reviewed in batch 1 (speaking and offers), under src/pages/pps:
const BATCH_1 = [
  "Speaking.tsx",
  "SpeakingWorkshopTopics.tsx",
  "speaking/AmySpeaker.tsx",
  "speaking/RobSpeaker.tsx",
  "speaking/SierraSpeaker.tsx",
  "resources/AsSeenOn.tsx",
  "partner/amplify/AmplifyWorkshops.tsx",
  "partner/ignite/IgniteMasterclasses.tsx",
  "partner/ignite/igniteFaqs.tsx",
  "partner/amplify/AmplifyLabs.tsx",
  "partner/amplify/StracticalLeaderWorkshop.tsx",
  "partner/amplify/stracticalFaqs.ts",
  "partner/amplify/StracticalLeaderCheckout.tsx",
  "resources/StracticalLeaderGuide.tsx",
];

// The older pages reviewed in batch 2 (resources and assessments), under src/pages/pps:
const BATCH_2 = [
  "resources/ResourcesHub.tsx",
  "resources/FreeDownloads.tsx",
  "resources/YouTubePage.tsx",
  "resources/FAQPage.tsx",
  "partner/ignite/IgniteAssessments.tsx",
  "partner/ignite/WorkingGeniusAssessment.tsx",
  "partner/ignite/EQAssessment.tsx",
];

const PAGES = [...NEW_DESIGN, ...BATCH_1, ...BATCH_2];

// The page's text without its code comments, whitespace collapsed.
const read = (path: string) =>
  readFileSync(join(process.cwd(), "src/pages/pps", path), "utf-8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
    .replace(/\s+/g, " ");

// "We help", "we've supported", "we provide"...: Brand Bible 4.4 servant language.
// Help and support may still describe what clients, cultures, systems or charities do.
const SERVICE_VERB =
  /\bwe(?:'ve| have)? (?:help|helped|support|supported|assist|assisted|provide|provided|deliver|delivered|serve|served|facilitate|facilitated|enable|enabled)\b/i;

// The same servant language with Painted Porch, or its offers, left as the unnamed doer:
// "can be delivered as a keynote", "workshops designed to help your team".
const SERVICE_PASSIVE = /\bcan be delivered\b|\bdesigned to help\b|\bto help (?:you|your|teams|professionals|leaders|organizations)\b/i;

// "Most change work starts at Take Off. Ours starts...": a comparison that makes
// someone else wrong. Say what the P.A.T.H. does on its own terms.
const MOST_OTHERS =
  /\bmost (?:change work|change methodologies|methodologies|team-building)\b|\bmost (?:organizations|programs) (?:skip|teach|miss|ignore)\b|\bindustry default\b/i;

// The Epic ShIFt Organizational Appraisal is the first step, or the basis, for the work that builds on it.
// It is never "required" or "required beforehand"; "prerequisite" and "following the appraisal" are fine now and then.
const APPRAISAL_REQUIRED =
  /\b(?:is|it's|are) required (?:before|for)\b|\brequired beforehand\b|appraisal required\b|\bnot required for leadership labs\b|require the epic shift/i;
// Painted Porch is never "a guide" (Brand Bible: not "guru, guide, or fixer"). "Guide" as a verb,
// and a guide that is a document or tool ("the Field Guide", "a three-minute directional guide"), are fine.
const GUIDE_ROLE = /\b(?:meet|with|as) (?:a|your) guide\b|\bguided partnership\b/i;

// "What your organization needs" tells the reader what they need. Share ideas, insights and perspective,
// and let them decide what they want.
const TELLS_NEEDS =
  /\bwhat (?:your|the) (?:organization|team|company)(?:'s)? (?:actually |really )?needs\b|\bwhat you (?:actually |really )?need\b/i;

const APPRAISAL_PAGES = [...PAGES, "BrandLibrary.tsx", "../../components/pps/quiz/PathFinderQuizDialog.tsx"];

describe("public copy invites rather than pushes", () => {
  it.each(APPRAISAL_PAGES)("%s presents the appraisal as the first step, not a requirement", (path) => {
    expect(read(path)).not.toMatch(APPRAISAL_REQUIRED);
  });

  it.each(PAGES)("%s casts Painted Porch as a partner, not a service provider", (path) => {
    expect(read(path)).not.toMatch(SERVICE_VERB);
    expect(read(path)).not.toMatch(SERVICE_PASSIVE);
  });

  it.each(PAGES)("%s doesn't cast Painted Porch as a guide", (path) => {
    expect(read(path)).not.toMatch(GUIDE_ROLE);
  });

  it.each(PAGES)("%s doesn't tell the reader what they need", (path) => {
    expect(read(path)).not.toMatch(TELLS_NEEDS);
  });

  it.each(PAGES)("%s doesn't compare itself with how most others work", (path) => {
    expect(read(path)).not.toMatch(MOST_OTHERS);
  });

  it("the patterns catch the lines they were written for", () => {
    expect("Most change work starts at Take Off.").toMatch(MOST_OTHERS);
    expect("The industry default is to move straight into action.").toMatch(MOST_OTHERS);
    expect("Why most team-building fails").toMatch(MOST_OTHERS);
    expect("the critical preparation that most organizations skip").toMatch(MOST_OTHERS);
    expect("Most programs teach you to be a better manager").toMatch(MOST_OTHERS);
    expect("Most organizations we partner with are living one of these moments").not.toMatch(MOST_OTHERS);
    expect("For twenty years we've helped leaders").toMatch(SERVICE_VERB);
    expect("Will our culture support this change?").not.toMatch(SERVICE_VERB);
    expect("Every topic can be delivered as a keynote").toMatch(SERVICE_PASSIVE);
    expect("The appraisal is required before Architect ShIFt.").toMatch(APPRAISAL_REQUIRED);
    expect("Epic ShIFt Organizational Appraisal required beforehand").toMatch(APPRAISAL_REQUIRED);
    expect("Prerequisite: the Epic ShIFt Organizational Appraisal").not.toMatch(APPRAISAL_REQUIRED);
    expect("Following the appraisal, your senior team spends three days authoring").not.toMatch(APPRAISAL_REQUIRED);
    expect("Epic ShIFt Organizational Appraisal Required").toMatch(APPRAISAL_REQUIRED);
    expect("These require the Epic ShIFt Organizational Appraisal first").toMatch(APPRAISAL_REQUIRED);
    expect("In-person is ideal when possible, but not required.").not.toMatch(APPRAISAL_REQUIRED);
    expect("Prerequisites for each potential shift").not.toMatch(APPRAISAL_REQUIRED);
    expect("follow-up workshops designed to help your team apply").toMatch(SERVICE_PASSIVE);
    expect("the art of presence to help professionals eliminate static").toMatch(SERVICE_PASSIVE);
    expect("Meet Your Guide").toMatch(GUIDE_ROLE);
    expect("Make the report real with a guide.").toMatch(GUIDE_ROLE);
    expect("APPLY WITH A GUIDE").toMatch(GUIDE_ROLE);
    expect("real transformation requires guided partnership").toMatch(GUIDE_ROLE);
    expect("try Find Your Next ShIFt, a three-minute directional guide").not.toMatch(GUIDE_ROLE);
    expect("Get the Field Guide").not.toMatch(GUIDE_ROLE);
    expect("Sierra guides teams through the hard moments").not.toMatch(GUIDE_ROLE);
    expect("We partner with you to design what your organization needs").toMatch(TELLS_NEEDS);
    expect("co-design what your organization actually needs").toMatch(TELLS_NEEDS);
    expect("you decide what you want to build").not.toMatch(TELLS_NEEDS);
    expect("Everything you need to know about the Lab").not.toMatch(TELLS_NEEDS);
  });
});
