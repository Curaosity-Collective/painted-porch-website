import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// PPS-DEC-0017, amended 2026-11-09 (PPS Admin: "Blue door pages should be archived and redirect to
// envision/epic shift appriasal"): every Blue Door address redirects to the Epic ShIFt Organizational
// Appraisal, the purchase-success page included. PPS Admin, the same day: "No one ever bought blue door so its
// not needed to retain", then "You can remove it all": the pages, purchase flow, checkout and webhook are gone.
const app = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");

describe("Blue Door pages are archived", () => {
  it.each(["blue-door", "blue-door-archive", "blue-door/purchase", "blue-door/success"])(
    "/%s redirects to /envision-shift",
    (path) => {
      expect(app).toMatch(new RegExp(`<Route path="${path}" element={<Navigate to="/envision-shift" replace />} />`));
    },
  );

  it.each([
    "src/pages/pps/BlueDoorLanding.tsx",
    "src/pages/pps/BlueDoorPurchase.tsx",
    "src/pages/pps/BlueDoorSuccess.tsx",
    "supabase/functions/create-checkout/index.ts",
    "supabase/functions/stripe-blue-door-webhook/index.ts",
    "supabase/functions/_shared/transactional-email-templates/blue-door-purchase-confirmation.tsx",
  ])("%s is removed", (file) => {
    expect(existsSync(resolve(__dirname, "../..", file))).toBe(false);
  });

  it("no route renders a Blue Door page component", () => {
    expect(app).not.toMatch(/<BlueDoor[A-Za-z]*\s*\/>/);
    expect(app).not.toMatch(/import BlueDoor[A-Za-z]* from/);
  });
});
