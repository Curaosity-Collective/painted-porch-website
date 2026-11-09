import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// PPS-DEC-0017, amended 2026-11-09 (PPS Admin: "Blue door pages should be archived and redirect to
// envision/epic shift appriasal"): every Blue Door address redirects to the Epic ShIFt Organizational
// Appraisal, the purchase-success page included. BlueDoorSuccess.tsx is kept for reference only.
const app = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");

describe("Blue Door pages are archived", () => {
  it.each(["blue-door", "blue-door-archive", "blue-door/purchase", "blue-door/success"])(
    "/%s redirects to /envision-shift",
    (path) => {
      expect(app).toMatch(new RegExp(`<Route path="${path}" element={<Navigate to="/envision-shift" replace />} />`));
    },
  );

  it("no route renders a Blue Door page component", () => {
    expect(app).not.toMatch(/<BlueDoor[A-Za-z]*\s*\/>/);
    expect(app).not.toMatch(/import BlueDoor[A-Za-z]* from/);
  });
});
