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
  "partner/ignite/igniteFaqs.ts",
  "partner/amplify/AmplifyLabs.tsx",
  "partner/amplify/StracticalLeaderWorkshop.tsx",
  "partner/amplify/stracticalFaqs.ts",
  "partner/amplify/StracticalLeaderCheckout.tsx",
  "resources/StracticalLeaderGuide.tsx",
];

const PAGES = [...NEW_DESIGN, ...BATCH_1];

const read = (path: string) =>
  readFileSync(join(process.cwd(), "src/pages/pps", path), "utf-8").replace(/\s+/g, " ");

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

describe("public copy invites rather than pushes", () => {
  it.each(PAGES)("%s casts Painted Porch as a partner, not a service provider", (path) => {
    expect(read(path)).not.toMatch(SERVICE_VERB);
    expect(read(path)).not.toMatch(SERVICE_PASSIVE);
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
    expect("follow-up workshops designed to help your team apply").toMatch(SERVICE_PASSIVE);
    expect("the art of presence to help professionals eliminate static").toMatch(SERVICE_PASSIVE);
  });
});
