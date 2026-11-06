import { describe, expect, it } from "vitest";
import { findMoneyMentions } from "@/lib/money-mentions";

const mentions = (text: string) => findMoneyMentions(text).map(({ start, end }) => text.slice(start, end));

describe("monetary mention detection", () => {
  it("recognizes the selected Architect investment", () => {
    expect(mentions("Starting at $90,000")).toEqual(["$90,000"]);
  });
  it("recognizes monthly fee ranges as one amount", () => {
    expect(mentions("$9,000–$18,000 per month")).toEqual(["$9,000–$18,000 per month"]);
  });
  it("does not highlight money words without a dollar amount", () => {
    expect(mentions("Investment: every fee includes money for good.")).toEqual([]);
  });
  it("recognizes monetary statistics and decimals", () => {
    expect(mentions("$1T and $31,474 and 25.50 USD")).toEqual(["$1T", "$31,474", "25.50 USD"]);
  });
  it("does not treat ordinary numbers or free resources as money", () => {
    expect(mentions("90 days, six interviews, free resources, 24–48 hours")).toEqual([]);
  });
});