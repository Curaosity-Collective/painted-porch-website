import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { approvedPressAppearances, type PressAppearance } from "@/lib/press-kit";
import { resolvePageStatus } from "@/config/pageStatus";

describe("press kit approval rules", () => {
  it("includes approved media and excludes pending media even for a reviewer", () => {
    const rows = [
      { id: "approved-entry", review_status: "published" },
      { id: "pending-entry", review_status: "pending" },
    ] as PressAppearance[];
    expect(approvedPressAppearances(rows).map((row) => row.id)).toEqual(["approved-entry"]);
  });
  it("keeps the new press kit draft until explicitly launched", () => {
    expect(resolvePageStatus("/press-kit", {})).toBe("draft");
  });
  it("opens the press kit publicly when its saved status is live", () => {
    expect(resolvePageStatus("/press-kit", { "/press-kit": { path: "/press-kit", status: "live", category: "public", note: null } })).toBe("live");
  });
});