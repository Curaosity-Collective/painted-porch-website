import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import {
  checkAppliedUnchanged,
  checkDrizzleJournal,
  checkSupabaseFiles,
  runChecks,
  sqlBody,
  statusOf,
} from "../../scripts/check-migrations.mjs";

// PPS-DEC-0029 (PPS Ops Hub decision register): every session-written migration says
// whether it has run, and an applied migration's SQL never changes.

const APPLIED = "-- Status: Applied via Lovable; confirmed live 2026-11-09.\n--\nUPDATE t SET a = 1;\n";
const PENDING = "-- Status: Pending\n--\nUPDATE t SET a = 2;\n";

describe("check-migrations", () => {
  it("passes on the repository as it stands", () => {
    const { errors } = runChecks(resolve(__dirname, "../.."), "");
    expect(errors).toEqual([]);
  });

  it("reads the status line", () => {
    expect(statusOf(APPLIED)).toBe("applied");
    expect(statusOf(PENDING)).toBe("pending");
    expect(statusOf("-- Status: Applied 2026-11-09 06:15 UTC via Lovable; confirmed.\n")).toBe("applied");
    expect(statusOf("-- Status: Applied\n")).toBeNull();
    expect(statusOf("UPDATE t SET a = 1;\n-- Status: Pending\n")).toBeNull();
  });

  it("requires a status line from the first session-written version on", () => {
    const { errors, pending } = checkSupabaseFiles({
      "20260816014410_2e70f454-3c6f-47b2-bf2f-0ee54e9c1c96.sql": "UPDATE t SET a = 1;",
      "20261105210000_a.sql": "UPDATE t SET a = 1;",
      "20261105220000_b.sql": PENDING,
      "20261105230000_c.sql": APPLIED,
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("20261105210000_a.sql");
    expect(pending).toEqual(["20261105220000_b.sql"]);
  });

  it("rejects bad names and repeated versions", () => {
    const { errors } = checkSupabaseFiles({
      "20261105210000_a.sql": APPLIED,
      "20261105210000_b.sql": APPLIED,
      "2026110521_c.sql": APPLIED,
    });
    expect(errors.some((e) => e.includes("also used by"))).toBe(true);
    expect(errors.some((e) => e.includes("2026110521_c.sql"))).toBe(true);
  });

  it("matches drizzle files to the journal", () => {
    const journal = { entries: [{ tag: "0000_a" }, { tag: "0001_b" }] };
    expect(checkDrizzleJournal(["0000_a.sql", "0001_b.sql"], journal)).toEqual([]);
    expect(checkDrizzleJournal(["0000_a.sql"], journal)).toHaveLength(1);
    expect(checkDrizzleJournal(["0000_a.sql", "0001_b.sql", "0002_c.sql"], journal)).toHaveLength(1);
  });

  it("allows comment changes to an applied file but not SQL changes", () => {
    const base = { "20261105230000_c.sql": APPLIED };
    const reworded = APPLIED.replace("confirmed live 2026-11-09", "confirmed live 2026-11-10") + "-- a note\n";
    expect(checkAppliedUnchanged(base, { "20261105230000_c.sql": reworded })).toEqual([]);
    expect(checkAppliedUnchanged(base, { "20261105230000_c.sql": APPLIED.replace("a = 1", "a = 3") })).toHaveLength(1);
    expect(checkAppliedUnchanged(base, {})).toHaveLength(1);
  });

  it("lets a pending file change freely", () => {
    const base = { "20261105220000_b.sql": PENDING };
    expect(checkAppliedUnchanged(base, { "20261105220000_b.sql": PENDING.replace("a = 2", "a = 4") })).toEqual([]);
    expect(checkAppliedUnchanged(base, {})).toEqual([]);
  });

  it("ignores blank and whole-line comment lines in the SQL body", () => {
    expect(sqlBody("-- x\n\nUPDATE t SET a = 1;  \n  -- y\n")).toBe("UPDATE t SET a = 1;");
  });
});
