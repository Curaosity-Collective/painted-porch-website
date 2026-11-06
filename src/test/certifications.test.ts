import { describe, it, expect } from "vitest";
import { CERTIFICATIONS } from "@/data/certifications";

/**
 * Credential captions (PPS Admin, 2026-11-06): the EQ-i 2.0 badge had been captioned
 * "DiSC Facilitator", and the Minds at Work badge "MAW Facilitator".
 */
describe("credential captions", () => {
  const names = CERTIFICATIONS.map((c) => c.name);

  it("captions the EQ-i 2.0 and Immunity to Change badges correctly", () => {
    expect(names).toContain("EQ-i 2.0 Certified");
    expect(names).toContain("Immunity to Change Facilitator");
    expect(names).not.toContain("DiSC Facilitator");
    expect(names).not.toContain("MAW Facilitator");
  });

  it("pairs the EQ-i 2.0 caption with the EQ-i 2.0 badge file", () => {
    const eqi = CERTIFICATIONS.find((c) => c.name === "EQ-i 2.0 Certified")!;
    expect(eqi.badge).toMatch(/eq-i-2-certified/);
  });
});
