import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BLUE_DOOR_COPY,
  BLUE_DOOR_LAUNCH_DATE,
  BLUE_DOOR_PRICE_USD,
  blueDoorAvailability,
  blueDoorCheckoutSeoDescription,
  blueDoorCheckoutSeoTitle,
  blueDoorSeoDescription,
  blueDoorSeoTitle,
  blueDoorServiceJsonLd,
  isBlueDoorPreLaunch,
} from "@/config/blueDoor";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("Blue Door offer schema — runtime", () => {
  it("emits PreOrder while pre-launch, InStock after", () => {
    expect(blueDoorAvailability()).toBe(
      isBlueDoorPreLaunch() ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
    );
  });

  it("builds a valid Service + Offer payload", () => {
    const ld = blueDoorServiceJsonLd() as Record<string, any>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Service");
    expect(ld.offers["@type"]).toBe("Offer");
    expect(ld.offers.price).toBe(String(BLUE_DOOR_PRICE_USD));
    expect(ld.offers.priceCurrency).toBe("USD");
    expect(ld.offers.availability).toBe(blueDoorAvailability());
    expect(ld.offers.url).toMatch(/^https:\/\/.+\/blue-door$/);
    if (isBlueDoorPreLaunch()) {
      expect(ld.offers.availabilityStarts).toBe(BLUE_DOOR_LAUNCH_DATE.toISOString());
    }
  });

  it("pairs PreOrder availability with Coming Soon copy", () => {
    if (!isBlueDoorPreLaunch()) return;
    expect(BLUE_DOOR_COPY.label).toBe("Coming Soon");
    expect(blueDoorSeoTitle()).toContain("Coming Soon");
    expect(blueDoorCheckoutSeoTitle()).toContain("Coming Soon");
    expect(blueDoorSeoDescription()).toContain("Coming Soon");
    expect(blueDoorCheckoutSeoDescription()).toContain("Coming Soon");
  });
});

describe("Retired Blue Door — prerendered HTML (PPS-DEC-0017)", () => {
  const prerender = read("scripts/prerender.mjs");
  const content = read("scripts/prerender-content.mjs");

  it("no longer prerenders a /blue-door page or its $1,500 offer", () => {
    expect(content).not.toContain('path: "/blue-door"');
    expect(content).not.toContain("$1,500");
    expect(prerender).not.toContain('"/blue-door": {');
    expect(prerender).not.toContain('price: "1500"');
  });

  it("emits the Epic ShIFt Organizational Appraisal service at its canonical page (PPS-DEC-0018)", () => {
    expect(content).toContain('path: "/envision-shift"');
    const block = prerender.slice(
      prerender.indexOf('"/envision-shift": {'),
      prerender.indexOf('"/partner": {'),
    );
    expect(block).toContain('name: "The Epic ShIFt Organizational Appraisal"');
    expect(block).toContain('price: "24000"');
    // Not sold directly: it begins with a Clarity Call, so no purchase availability.
    expect(block).not.toContain("availability");
  });
});
