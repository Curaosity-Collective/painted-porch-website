/**
 * PPS Admin (2026-11-05): Architect Change is the workshop inside the
 * Architect ShIFt engagement, not a standalone workshop. For an architectural
 * signal the quiz recommends Architect ShIFt instead, beginning with a
 * Clarity Call, and never Architect Change.
 */
import { describe, it, expect } from "vitest";
import { buildResult, type Answers } from "../pathFinderQuiz";
import { clarityCallHrefFor } from "@/config/epicShiftAppraisal";

const ARCHITECTURAL: Answers[] = ["A", "B", "C", "D"].flatMap((q1) =>
  ["A", "B", "C"].map((pq3) => ({ OrgPQ2: "D", Q1Strategic: q1, OrgPQ3: pq3, Q4DM: "C" }) as Answers),
);

const allKeys = (answers: Answers, viewable?: Set<string>) => {
  const r = buildResult("b2b", answers, viewable ? { viewableKeys: viewable } : undefined);
  const fromGroups = [r.primaryGroup, ...r.groups].filter(Boolean).flatMap((g) => g!.offerings);
  return r.strongestNextStep ? [...fromGroups, r.strongestNextStep.offering] : fromGroups;
};

describe("Architect ShIFt replaces Architect Change in the quiz", () => {
  it("recommends Architect ShIFt for an architectural signal, beginning with a Clarity Call", () => {
    for (const answers of ARCHITECTURAL) {
      const r = buildResult("b2b", answers);
      const arch = r.primaryGroup?.offerings.find((o) => o.key === "architectShift");
      expect(arch, JSON.stringify(answers)).toBeDefined();
      expect(arch!.url).toBe(clarityCallHrefFor("Architect ShIFt"));
      expect(arch!.blurb).toMatch(/^Begins with a Clarity Call\./);
      expect(arch!.tier).toBe("Engagement");
    }
  });

  it("shows Architect ShIFt on the live site without a database row of its own", () => {
    // The offerings live in production on 2026-11-05. None of RT-D's picks or
    // B2B fallbacks is among them, so the quiz falls back to its own picks.
    const LIVE = new Set([
      "blueDoor", "burnoutResources", "communicatingChangeWorkbook", "createExtraordinaryTeams", "eq360", "eqi",
      "fiftyTwoStoicism", "journalingChallenge", "kickTheHabit", "kickTheHabitB2C", "leadingChangeMini",
      "masterYourMessage", "masterYourMessageMini", "radicalMindfulness", "radicalMindfulnessB2B",
      "radicalMindfulnessMini", "speaking88", "speakingAiEiOh", "speakingAlicePrinciples", "speakingBorderlessKeynote",
      "speakingCommStyle", "speakingDontPanic", "speakingFindingJoy", "speakingFiveMin", "speakingFromDysfunction",
      "speakingFromPassengerToPilot", "speakingGetClear", "speakingGoldilocks", "speakingHeroesAssemble",
      "speakingHighFidelity", "speakingLeadAtSpeed", "speakingMoveShakeInnovate", "speakingOnAir",
      "speakingPowerOfStory", "speakingRadicallyMindful", "speakingReignitingResilience", "speakingShIFtHappens",
      "speakingStoicism", "stoicLeaderFieldGuide", "stracticalLeader", "stracticalLeaderLab", "stracticalMini",
      "strategicChangeCanvas", "talkingToStrangers", "workFromHomePro", "workingGenius", "workshopCreateExtraordinaryTeams",
    ]);
    for (const answers of ARCHITECTURAL) {
      const r = buildResult("b2b", answers, { viewableKeys: LIVE });
      expect(r.primaryGroup?.offerings.map((o) => o.key), JSON.stringify(answers)).toEqual([
        "architectShift",
        "architectureOfOrganizationalShift",
        "pathToLastingChange",
      ]);
    }
  });

  it("never recommends Architect Change, even through the fallback", () => {
    for (const answers of ARCHITECTURAL) {
      expect(allKeys(answers).map((o) => o.key)).not.toContain("architectChange");
      // A viewable set that empties the primary picks forces the safe fallback.
      expect(allKeys(answers, new Set(["blueDoor", "leadershipOM", "architectChange"])).map((o) => o.key)).not.toContain(
        "architectChange",
      );
    }
  });
});
