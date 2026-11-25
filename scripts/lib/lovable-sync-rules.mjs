/**
 * When a Lovable sync branch may merge into main on its own (PPS Admin, 2026-11-24: "Yes option 1").
 *
 * Lovable can't push to main (changes reach main only through a pull request), so each editor
 * change arrives on a `lovable-sync` or `lovable-sync-<number>` branch, and Lovable shows
 * "out of sync" until that branch is merged. `.github/workflows/lovable-sync.yml` opens the pull
 * request and merges it once the checks pass. It holds the branch (opens the pull request,
 * explains why, and doesn't merge) when any of these is true:
 *   - someone other than Lovable pushed the branch or made one of its commits;
 *   - it changes CI, this automation or the rules files that steer Claude and Manus sessions;
 *   - it conflicts with main, or main has moved on so the checks didn't test the merged result.
 *
 * Database and server-function changes are not held: Lovable applies them itself when they're
 * approved in the editor, so holding the GitHub copy wouldn't stop them; it would only bring
 * back the sync warning. Their checks (migration records, the Vitest suite) still gate the merge.
 */

/** Lovable's GitHub App. Its login has changed (gpt-engineer-app, then lovable-dev); its id hasn't. */
export const LOVABLE_APP_ID = "159125892";

export const SYNC_BRANCH = /^lovable-sync(?:-\d+)?$/;

/** Paths that are never merged without review. A trailing slash means the whole folder. */
export const HOLD_PATHS = [
  ".github/",
  "AGENTS.md",
  "CLAUDE.md",
  "scripts/lovable-sync.mjs",
  "scripts/lib/lovable-sync-rules.mjs",
  // Who can read which rows. Lovable changing the policies and this record together would pass the check.
  "scripts/rls-snapshot.expected.json",
];

/** Every check that must pass on the branch's commit. Job names from .github/workflows. */
export const REQUIRED_CHECKS = [
  "Run Vitest suite",
  "Contact, scroll, and a11y regression",
  "Block large or video files",
  "Block Markdown in public assets",
  "Migration records (PPS-DEC-0029)",
  "check-large-files",
  "axe",
  "visual",
];

/** The automation's own job, which is still running while it reads the checks. */
export const OWN_CHECK = "Merge Lovable sync";

/** Lovable commits as `159125892+<app login>@users.noreply.github.com`. */
export function isLovableEmail(email) {
  return new RegExp(`^${LOVABLE_APP_ID}\\+[^@\\s]+@users\\.noreply\\.github\\.com$`).test(email);
}

export function isHeld(file) {
  return HOLD_PATHS.some((p) => (p.endsWith("/") ? file.startsWith(p) : file === p));
}

/**
 * @param {object} input
 * @param {string} input.branch
 * @param {string|number} input.pusherId      the GitHub id of whoever pushed the branch
 * @param {boolean} input.alreadyMerged       the branch's commit is already in main
 * @param {{sha: string, authorEmail: string, committerEmail: string}[]} input.commits  commits not yet in main
 * @param {string[]} input.changedFiles       files the branch changes against its merge base with main
 * @param {string|null} input.mergedTree      the tree main would have after the merge, or null on conflict
 * @param {string} input.branchTree           the tree of the branch's commit, the one the checks tested
 * @returns {{action: "ignore"|"skip"|"hold"|"merge", reasons: string[]}}
 */
export function decideSync({ branch, pusherId, alreadyMerged, commits, changedFiles, mergedTree, branchTree }) {
  if (!SYNC_BRANCH.test(branch)) return { action: "ignore", reasons: [`${branch} isn't a Lovable sync branch.`] };
  if (alreadyMerged) return { action: "skip", reasons: ["Main already contains this branch."] };

  const reasons = [];
  if (String(pusherId) !== LOVABLE_APP_ID) {
    reasons.push(`Someone other than Lovable pushed this branch (GitHub id ${pusherId}).`);
  }
  const others = commits.filter((c) => !isLovableEmail(c.authorEmail) || !isLovableEmail(c.committerEmail));
  if (others.length) {
    reasons.push(`Commits not made by Lovable: ${others.map((c) => c.sha.slice(0, 8)).join(", ")}.`);
  }
  const held = changedFiles.filter(isHeld);
  if (held.length) reasons.push(`It changes files that need a review before they reach main: ${held.join(", ")}.`);
  if (mergedTree === null) {
    reasons.push("It conflicts with main.");
  } else if (mergedTree !== branchTree) {
    reasons.push(
      "Main has changed since Lovable made this branch, so the checks didn't test what main would become. " +
        "The next Lovable sync, or a Claude session, will bring them together.",
    );
  }
  return reasons.length ? { action: "hold", reasons } : { action: "merge", reasons };
}

const PASSING = new Set(["success", "skipped", "neutral"]);

/**
 * Reads the check runs on the branch's commit.
 * @param {{id: number, name: string, status: string, conclusion: string|null}[]} runs
 * @returns {{state: "pass"|"pending"|"fail", failed: string[], pending: string[], missing: string[]}}
 */
export function evaluateChecks(runs, { required = REQUIRED_CHECKS, ignore = [OWN_CHECK] } = {}) {
  // A re-run adds a new check run with the same name; the newest one counts.
  const latest = new Map();
  for (const run of runs) {
    if (ignore.includes(run.name)) continue;
    const seen = latest.get(run.name);
    if (!seen || run.id > seen.id) latest.set(run.name, run);
  }
  const missing = required.filter((name) => !latest.has(name));
  const pending = [...latest.values()].filter((r) => r.status !== "completed").map((r) => r.name);
  const failed = [...latest.values()]
    .filter((r) => r.status === "completed")
    .filter((r) => (required.includes(r.name) ? r.conclusion !== "success" : !PASSING.has(r.conclusion)))
    .map((r) => `${r.name} (${r.conclusion})`);
  const state = failed.length ? "fail" : missing.length || pending.length ? "pending" : "pass";
  return { state, failed, pending, missing };
}
