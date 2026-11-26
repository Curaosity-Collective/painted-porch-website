import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  decideSync,
  evaluateChecks,
  isHeld,
  isLovableEmail,
  LOVABLE_APP_ID,
  REQUIRED_CHECKS,
} from "../../scripts/lib/lovable-sync-rules.mjs";

// PPS Admin, 2026-11-24: "This sync error keeps coming back up anytime I do anything in the lovable
// editor. These edits are best done there vs here since theyre visual" — then "Yes option 1": Lovable's
// sync branches merge through a pull request on their own once the checks pass.

const LOVABLE = "159125892+gpt-engineer-app[bot]@users.noreply.github.com";
const lovableCommit = (sha: string) => ({ sha, authorEmail: LOVABLE, committerEmail: LOVABLE });
const ok = {
  branch: "lovable-sync-1795539774",
  pusherId: LOVABLE_APP_ID,
  alreadyMerged: false,
  commits: [lovableCommit("a0cbb60c45f3"), lovableCommit("2c21a62b4dfa")],
  changedFiles: ["src/pages/pps/v3/ForIndividuals.tsx", "src/test/hero-media.test.ts", "roadmap.md"],
  mergedTree: "tree-a",
  branchTree: "tree-a",
};

describe("which Lovable branches merge on their own", () => {
  it("merges Lovable's own visual edit, its test updates included", () => {
    expect(decideSync(ok)).toEqual({ action: "merge", reasons: [] });
  });

  it("merges Lovable's database and server-function changes too, which Lovable has already applied", () => {
    const files = ["supabase/functions/send-email/index.ts", "drizzle/migrations/0042_x.sql", "src/integrations/supabase/types.ts"];
    expect(decideSync({ ...ok, changedFiles: files }).action).toBe("merge");
  });

  it("recognises Lovable by its app id under either login", () => {
    expect(isLovableEmail(LOVABLE)).toBe(true);
    expect(isLovableEmail("159125892+lovable-dev[bot]@users.noreply.github.com")).toBe(true);
    expect(isLovableEmail("noreply@anthropic.com")).toBe(false);
    expect(isLovableEmail("1159125892+someone@users.noreply.github.com")).toBe(false);
    expect(isLovableEmail("159125892+x@users.noreply.github.com.evil.com")).toBe(false);
  });

  it("only handles lovable-sync branches", () => {
    for (const branch of ["main", "ccr-b8f7b7f4-5w9c5j", "lovable-sync-x", "lovable-sync-1/evil", "my-lovable-sync-1"]) {
      expect(decideSync({ ...ok, branch }).action, branch).toBe("ignore");
    }
    expect(decideSync({ ...ok, branch: "lovable-sync" }).action).toBe("merge");
  });

  it("does nothing for a branch main already contains", () => {
    expect(decideSync({ ...ok, alreadyMerged: true }).action).toBe("skip");
  });

  it("holds a branch someone other than Lovable pushed", () => {
    const result = decideSync({ ...ok, pusherId: "252640262" });
    expect(result.action).toBe("hold");
    expect(result.reasons.join(" ")).toMatch(/other than Lovable/);
  });

  it("holds a branch with a commit Lovable didn't make", () => {
    const claude = { sha: "deadbeef1234", authorEmail: "noreply@anthropic.com", committerEmail: "noreply@anthropic.com" };
    const result = decideSync({ ...ok, commits: [...ok.commits, claude] });
    expect(result.action).toBe("hold");
    expect(result.reasons.join(" ")).toContain("deadbeef");
  });

  it("holds changes to CI, this automation, the rules files and the RLS record", () => {
    for (const file of [
      ".github/workflows/unit-tests.yml",
      "AGENTS.md",
      "CLAUDE.md",
      "scripts/lovable-sync.mjs",
      "scripts/lib/lovable-sync-rules.mjs",
      "scripts/rls-snapshot.expected.json",
    ]) {
      expect(isHeld(file), file).toBe(true);
      expect(decideSync({ ...ok, changedFiles: [...ok.changedFiles, file] }).action, file).toBe("hold");
    }
    expect(isHeld("src/AGENTS.md")).toBe(false);
    expect(isHeld("scripts/prerender.mjs")).toBe(false);
  });

  it("holds a branch that conflicts with main", () => {
    const result = decideSync({ ...ok, mergedTree: null });
    expect(result.action).toBe("hold");
    expect(result.reasons.join(" ")).toMatch(/conflicts with main/);
  });

  it("holds a branch whose merge would differ from what the checks tested", () => {
    const result = decideSync({ ...ok, mergedTree: "tree-with-newer-main" });
    expect(result.action).toBe("hold");
    expect(result.reasons.join(" ")).toMatch(/didn't test what main would become/);
  });
});

describe("the checks on Lovable's commit", () => {
  // The check runs on PR #64's head commit, as GitHub reported them (2026-11-24), plus this job.
  const run = (id: number, name: string, conclusion: string | null, status = "completed") => ({ id, name, status, conclusion });
  const pr64 = [
    run(1, "Verify main changes came through a PR", "skipped"),
    run(2, "check-large-files", "success"),
    run(3, "visual", "success"),
    run(4, "Block large or video files", "success"),
    run(5, "Migration records (PPS-DEC-0029)", "success"),
    run(6, "Run Vitest suite", "success"),
    run(7, "axe", "success"),
    run(8, "Block Markdown in public assets", "success"),
    run(9, "Contact, scroll, and a11y regression", "success"),
    run(10, "Merge Lovable sync", null, "in_progress"),
  ];

  it("passes when every required check succeeded, ignoring its own running job", () => {
    expect(evaluateChecks(pr64)).toEqual({ state: "pass", failed: [], pending: [], missing: [] });
  });

  it("waits for a check that hasn't started or finished", () => {
    const withoutAxe = pr64.filter((r) => r.name !== "axe");
    expect(evaluateChecks(withoutAxe)).toMatchObject({ state: "pending", missing: ["axe"] });
    const running = pr64.map((r) => (r.name === "visual" ? { ...r, status: "in_progress", conclusion: null } : r));
    expect(evaluateChecks(running)).toMatchObject({ state: "pending", pending: ["visual"] });
  });

  it("fails on a failed check, and on a required check that was skipped or cancelled", () => {
    const failed = pr64.map((r) => (r.name === "Run Vitest suite" ? { ...r, conclusion: "failure" } : r));
    expect(evaluateChecks(failed)).toMatchObject({ state: "fail", failed: ["Run Vitest suite (failure)"] });
    const skipped = pr64.map((r) => (r.name === "axe" ? { ...r, conclusion: "skipped" } : r));
    expect(evaluateChecks(skipped).state).toBe("fail");
    const cancelled = pr64.map((r) => (r.name === "visual" ? { ...r, conclusion: "cancelled" } : r));
    expect(evaluateChecks(cancelled).state).toBe("fail");
  });

  it("fails on any other check that fails, not only the required ones", () => {
    expect(evaluateChecks([...pr64, run(11, "b2c-quiz", "failure")]).state).toBe("fail");
  });

  it("counts the newest run when a check is re-run", () => {
    const rerun = [...pr64.map((r) => (r.name === "axe" ? { ...r, conclusion: "failure" } : r)), run(12, "axe", "success")];
    expect(evaluateChecks(rerun).state).toBe("pass");
  });

  it("requires only checks that run on every Lovable push", () => {
    // Each required check, the workflow that runs it, and how its job is named there.
    const where: Record<string, [string, string]> = {
      "Run Vitest suite": ["unit-tests.yml", "    name: Run Vitest suite\n"],
      "Contact, scroll, and a11y regression": ["unit-tests.yml", "    name: Contact, scroll, and a11y regression\n"],
      "Block large or video files": ["repo-guard.yml", "    name: Block large or video files\n"],
      "Block Markdown in public assets": ["repo-guard.yml", "    name: Block Markdown in public assets\n"],
      "Migration records (PPS-DEC-0029)": ["repo-guard.yml", "    name: Migration records (PPS-DEC-0029)\n"],
      "check-large-files": ["check-large-files.yml", "\n  check-large-files:\n    runs-on"],
      axe: ["site-a11y.yml", "\n  axe:\n"],
      visual: ["visual-regression.yml", "\n  visual:\n"],
    };
    expect(Object.keys(where).sort()).toEqual([...REQUIRED_CHECKS].sort());
    for (const [name, [file, job]] of Object.entries(where)) {
      const source = readFileSync(`.github/workflows/${file}`, "utf8");
      expect(source, name).toContain(job);
      // It runs on a push to a Lovable sync branch, with no path filter on that push.
      const push = source.slice(source.indexOf("\n  push:"), source.indexOf("\njobs:")).split("\n  pull_request:")[0];
      expect(push, name).toMatch(/branches: \[[^\]]*(?:"lovable-sync-\*"|'\*\*')/);
      expect(push, name).not.toMatch(/paths:/);
    }
  });

  it("keeps the direct-push audit on main only, and compares migrations with main on a sync push", () => {
    const guard = readFileSync(".github/workflows/repo-guard.yml", "utf8");
    expect(guard).toContain("if: github.event_name == 'push' && github.ref == 'refs/heads/main'");
    expect(guard).toContain("format('origin/{0}', github.base_ref || 'main')");
  });
});
