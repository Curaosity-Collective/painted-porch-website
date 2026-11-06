import { describe, expect, it } from "vitest";
import { isScheduledScan, WEEKLY_SCAN_SCHEDULE, SCANNED_VIDEO_STATUS, SCANNED_ARTICLE_STATUS } from "../../supabase/functions/_shared/scheduled-content-scan";

describe("weekly content sweep", () => {
  it("runs once a week", () => expect(WEEKLY_SCAN_SCHEDULE).toBe("0 14 * * 1"));
  it("holds new videos and appearances for approval", () => expect(SCANNED_VIDEO_STATUS).toBe("pending"));
  it("holds new newsletter articles for approval", () => expect(SCANNED_ARTICLE_STATUS).toBe("pending"));
  it("allows only the exact server credential for scheduled callbacks", () => {
    expect(isScheduledScan("Bearer private-server-key", "private-server-key")).toBe(true);
    expect(isScheduledScan("Bearer public-project-key", "private-server-key")).toBe(false);
    expect(isScheduledScan("Bearer private-server-kez", "private-server-key")).toBe(false);
    expect(isScheduledScan(null, "private-server-key")).toBe(false);
    expect(isScheduledScan("Bearer undefined", undefined)).toBe(false);
    expect(isScheduledScan("private-server-key", "private-server-key")).toBe(false);
  });
});