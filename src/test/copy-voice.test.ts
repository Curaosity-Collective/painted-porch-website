import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The new-design pages. Their copy invites the reader in; it doesn't push, and it
// never casts Painted Porch as a service provider (see AGENTS.md, "Public copy").
const PAGES = [
  "HomeNext",
  "AboutNext",
  "PhaseZeroNext",
  "ThePath",
  "EnvisionShift",
  "ArchitectShift",
  "EmbodyShift",
  "ForIndividuals",
  "ResultsImpact",
];

const read = (name: string) =>
  readFileSync(join(process.cwd(), "src/pages/pps/v3", `${name}.tsx`), "utf-8").replace(/\s+/g, " ");

// "We help", "we've supported", "we provide"...: Brand Bible 4.4 servant language.
// Help and support may still describe what clients, cultures, systems or charities do.
const SERVICE_VERB =
  /\bwe(?:'ve| have)? (?:help|helped|support|supported|assist|assisted|provide|provided|deliver|delivered|serve|served|facilitate|facilitated|enable|enabled)\b/i;

// "Most change work starts at Take Off. Ours starts...": a comparison that makes
// someone else wrong. Say what the P.A.T.H. does on its own terms.
const MOST_OTHERS = /\bmost (?:change work|change methodologies|methodologies)\b|\bindustry default\b/i;

describe("public copy invites rather than pushes", () => {
  it.each(PAGES)("%s casts Painted Porch as a partner, not a service provider", (name) => {
    expect(read(name)).not.toMatch(SERVICE_VERB);
  });

  it.each(PAGES)("%s doesn't compare itself with how most others work", (name) => {
    expect(read(name)).not.toMatch(MOST_OTHERS);
  });

  it("the patterns catch the lines they were written for", () => {
    expect("Most change work starts at Take Off.").toMatch(MOST_OTHERS);
    expect("The industry default is to move straight into action.").toMatch(MOST_OTHERS);
    expect("For twenty years we've helped leaders").toMatch(SERVICE_VERB);
    expect("Will our culture support this change?").not.toMatch(SERVICE_VERB);
  });
});
