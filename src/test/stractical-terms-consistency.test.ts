import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf-8").replace(/\s+/g, " ");
const TERMS = read("src/pages/pps/TermsAndConditions.tsx");
const LAB = "src/pages/pps/partner/amplify/";
const STRACTICAL = ["StracticalLeaderCheckout.tsx", "StracticalLeaderWorkshop.tsx", "stracticalFaqs.ts", "stracticalConfig.ts"];

// The Terms say they win over marketing, so the Lab's guarantee and the Terms' refund window must agree
// (PPS Admin, 2026-11-09: "within 14 days of purchase of an on-demand/instant access or within 7 days of
// first session of a Leader Lab").
describe("the Stractical guarantee and the Terms agree", () => {
  it("the Terms give Leadership Labs 7 days from the first live session", () => {
    expect(TERMS).toContain("<strong>Leadership Labs:</strong> refund requests within 7 days of the first live session");
    expect(TERMS).toContain("<strong>On-demand and instant-access programs:</strong> refund requests within 14 days of purchase");
  });

  it.each(["StracticalLeaderCheckout.tsx", "stracticalFaqs.ts"])("%s offers the refund within 7 days of Session 1", (file) => {
    expect(read(LAB + file)).toContain("If, after Session 1, you don't feel this Lab will grow your strategic influence, let us know within 7 days");
  });
});

// Sessions run at 11 AM Pacific / 2 PM Eastern all year; "MST/PT" was right only during daylight saving
// (PPS Admin, 2026-11-09: "Update this to be 11a PT/2p ET").
describe("Stractical session times are Pacific and Eastern", () => {
  it.each(STRACTICAL)("%s doesn't give the time in MST", (file) => {
    expect(read(LAB + file)).not.toMatch(/\bMST\b/);
  });
});
