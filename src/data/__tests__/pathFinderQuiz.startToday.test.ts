/**
 * B2C "Start Here Today": while the program a result points to is still coming soon, the guide leads
 * with live picks and keeps the program right after them (PPS Admin, 2026-11-08: "I want to offer
 * something for B2C while these are waiting to go live").
 */
import { describe, it, expect } from "vitest";
import {
  buildResult,
  leadWithLiveStart,
  OFFERINGS,
  START_TODAY_BY_RT,
  START_TODAY_HEADING,
  type Answers,
  type B2CResultType,
  type QuizResult,
} from "../pathFinderQuiz";

const OPTS = ["A", "B", "C", "D"] as const;
const ALL_KEYS = new Set(Object.keys(OFFERINGS));

// The first answer set that lands on each B2C result type.
const sample = new Map<string, QuizResult>();
for (const q1 of OPTS)
  for (const q2 of OPTS)
    for (const q3 of OPTS)
      for (const q4 of OPTS)
        for (const q5 of OPTS)
          for (const q6 of OPTS) {
            const answers: Answers = { Q1: q1, Q2: q2, Q3: q3, Q4: q4, Q5: q5, Q6: q6 };
            const r = buildResult("b2c", answers);
            if (!sample.has(r.resultType)) sample.set(r.resultType, r);
          }

const primaryKeys = (r: QuizResult) => (r.primaryGroup?.offerings ?? []).map((o) => o.key);

describe("leadWithLiveStart", () => {
  it("only names offerings that exist", () => {
    for (const keys of Object.values(START_TODAY_BY_RT)) for (const k of keys) expect(ALL_KEYS.has(k), k).toBe(true);
  });

  it.each(["RT1", "RT2", "RT3", "RT4", "RT5"] as const)(
    "%s: leads with live picks when the whole starting point is coming soon",
    (rt) => {
      const r = sample.get(rt)!;
      expect(r, `no answers reach ${rt}`).toBeDefined();
      const soon = new Set(primaryKeys(r));
      const out = leadWithLiveStart(r, soon, ALL_KEYS);
      const expected = START_TODAY_BY_RT[rt as B2CResultType].filter((k) => !soon.has(k)).slice(0, 2);
      expect(out.primaryGroup?.heading).toBe(START_TODAY_HEADING);
      expect(primaryKeys(out)).toEqual(expected);
      // The program stays, right after, marked as launching soon.
      expect(out.groups[0].heading).toBe(`${r.primaryGroup!.heading} (Launching Soon)`);
      expect(out.groups[0].offerings.map((o) => o.key)).toEqual(primaryKeys(r));
      expect(out.groups.slice(1)).toEqual(r.groups);
      expect(out.whyThisFits).toContain("It opens soon");
    },
  );

  it("changes nothing once any starting-point pick is live", () => {
    const r = sample.get("RT3")!;
    const [first, ...rest] = primaryKeys(r);
    const out = leadWithLiveStart(r, new Set(rest), ALL_KEYS);
    expect(first).toBeDefined();
    expect(out).toBe(r);
  });

  it("changes nothing when nothing is coming soon", () => {
    const r = sample.get("RT1")!;
    expect(leadWithLiveStart(r, new Set(), ALL_KEYS)).toBe(r);
  });

  it("skips picks the admin hasn't made viewable, and coming-soon picks", () => {
    const r = sample.get("RT2")!;
    const viewable = new Set([...ALL_KEYS].filter((k) => k !== "communicatorStylesReplay"));
    const out = leadWithLiveStart(r, new Set(primaryKeys(r)), viewable);
    expect(primaryKeys(out)).toEqual(["workingGenius"]);
    const out2 = leadWithLiveStart(r, new Set([...primaryKeys(r), "workingGenius"]), ALL_KEYS);
    expect(primaryKeys(out2)).toEqual(["communicatorStylesReplay"]);
  });

  it("changes nothing when no live pick is available", () => {
    const r = sample.get("RT2")!;
    const out = leadWithLiveStart(r, new Set(primaryKeys(r)), new Set(primaryKeys(r)));
    expect(out).toBe(r);
  });

  it("never changes a B2B result", () => {
    const b2b = { ...sample.get("RT1")!, track: "b2b" as const };
    expect(leadWithLiveStart(b2b, new Set(primaryKeys(b2b)), ALL_KEYS)).toBe(b2b);
  });
});
