#!/usr/bin/env node
/**
 * The Lovable sync workflow's two steps (.github/workflows/lovable-sync.yml). The rules are in
 * scripts/lib/lovable-sync-rules.mjs, so they can be tested.
 *
 *   node scripts/lovable-sync.mjs decide       merge, hold, skip or ignore the pushed branch
 *   node scripts/lovable-sync.mjs wait-checks  wait for the checks on its commit to pass
 *
 * Reads BRANCH, SHA and PUSHER_ID (and GITHUB_REPOSITORY and GH_TOKEN for wait-checks; optionally
 * CHECKS_TIMEOUT_MINUTES, default 30, and POLL_MS, default 20000). Needs a full clone with
 * origin/main and origin/<BRANCH> fetched. Writes step outputs to GITHUB_OUTPUT and
 * Markdown for the pull request to RUNNER_TEMP/lovable-sync/.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { decideSync, evaluateChecks, REQUIRED_CHECKS } from "./lib/lovable-sync-rules.mjs";

const env = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
};
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const gitOk = (...args) => {
  try {
    execFileSync("git", args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
const outDir = join(process.env.RUNNER_TEMP || tmpdir(), "lovable-sync");
mkdirSync(outDir, { recursive: true });
const output = (name, value) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  console.log(`${name}=${value}`);
};
const summary = (markdown) => {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
};

function decide() {
  const branch = env("BRANCH");
  const sha = env("SHA");
  const main = "origin/main";
  const alreadyMerged = gitOk("merge-base", "--is-ancestor", sha, main);
  const commits = alreadyMerged
    ? []
    : git("log", "--format=%H%x09%ae%x09%ce%x09%s", `${main}..${sha}`)
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [commitSha, authorEmail, committerEmail, ...subject] = line.split("\t");
          return { sha: commitSha, authorEmail, committerEmail, subject: subject.join("\t") };
        });
  const base = git("merge-base", main, sha);
  // --no-renames lists both sides of a rename, so moving a file out of a held folder is held too.
  const changedFiles = git("diff", "--no-renames", "--name-only", base, sha).split("\n").filter(Boolean);
  let mergedTree = null;
  try {
    mergedTree = execFileSync("git", ["merge-tree", "--write-tree", main, sha], { encoding: "utf8" }).split("\n")[0];
  } catch {
    mergedTree = null; // exit status 1: conflicts
  }
  const branchTree = git("rev-parse", `${sha}^{tree}`);

  const result = decideSync({
    branch, pusherId: process.env.PUSHER_ID || "", alreadyMerged, commits, changedFiles, mergedTree, branchTree,
  });

  const latest = commits[0]?.subject || branch;
  output("action", result.action);
  output("title", `Lovable sync: ${latest}`.replace(/[\r\n]+/g, " ").slice(0, 200));
  const files = changedFiles.map((f) => `- \`${f}\``).join("\n");
  const commitList = commits.map((c) => `- ${c.sha.slice(0, 8)} ${c.subject}`).join("\n");
  writeFileSync(
    join(outDir, "body.md"),
    [
      `Changes made in the Lovable editor, on \`${branch}\` (${sha.slice(0, 8)}).`,
      "",
      "Opened by the Lovable sync workflow. It merges this pull request itself, with a merge commit, " +
        "once every check on Lovable's commit passes. When it can't, it says why in a comment and leaves the " +
        "pull request open for review. Rules: `scripts/lib/lovable-sync-rules.mjs`.",
      "",
      `**Commits (${commits.length})**`,
      commitList,
      "",
      `**Files (${changedFiles.length})**`,
      files,
    ].join("\n"),
  );
  writeFileSync(
    join(outDir, "hold.md"),
    [
      `**Held: not merged automatically** (${sha.slice(0, 8)})`,
      "",
      ...result.reasons.map((r) => `- ${r}`),
      "",
      "Lovable will show \"out of sync\" until this is merged. Ask a Claude session to review it, or merge it " +
        "yourself with a merge commit (not squash or rebase).",
      "",
      "_Posted by the Lovable sync workflow._",
    ].join("\n"),
  );
  summary(`### Lovable sync: ${result.action}\n\n${result.reasons.map((r) => `- ${r}`).join("\n")}`);
}

async function waitChecks() {
  const repo = env("GITHUB_REPOSITORY");
  const sha = env("SHA");
  const token = env("GH_TOKEN");
  const timeoutMs = Number(process.env.CHECKS_TIMEOUT_MINUTES || 30) * 60_000;
  const started = Date.now();
  let result;
  for (;;) {
    const runs = [];
    for (let page = 1; ; page++) {
      const api = process.env.GITHUB_API_URL || "https://api.github.com";
      const res = await fetch(`${api}/repos/${repo}/commits/${sha}/check-runs?per_page=100&page=${page}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
      const body = await res.json();
      runs.push(...body.check_runs);
      if (body.check_runs.length < 100) break;
    }
    result = evaluateChecks(runs);
    const waitingFor = [...result.pending, ...result.missing];
    console.log(`${new Date().toISOString()} ${result.state}${waitingFor.length ? `: waiting for ${waitingFor.join(", ")}` : ""}`);
    if (result.state !== "pending") break;
    if (Date.now() - started > timeoutMs) break;
    await new Promise((r) => setTimeout(r, Number(process.env.POLL_MS || 20_000)));
  }

  const passed = result.state === "pass";
  const lines = passed
    ? [`All ${REQUIRED_CHECKS.length} required checks passed.`]
    : [
        `**Held: not merged automatically** (${sha.slice(0, 8)})`,
        "",
        ...result.failed.map((f) => `- Failed: ${f}`),
        ...(result.state === "pending"
          ? [...result.pending, ...result.missing].map((n) => `- Didn't finish within the time limit: ${n}`)
          : []),
        "",
        "Lovable will show \"out of sync\" until this is merged. The failing check's log says what broke. Ask a " +
          "Claude session to fix it in a pull request that includes this branch, or re-run the checks if they " +
          "failed for a reason unrelated to the change.",
        "",
        "_Posted by the Lovable sync workflow._",
      ];
  writeFileSync(join(outDir, "hold.md"), lines.join("\n"));
  summary(`### Checks: ${result.state}\n\n${lines.join("\n")}`);
  output("result", result.state);
  if (!passed) process.exit(1);
}

const command = process.argv[2];
if (command === "decide") decide();
else if (command === "wait-checks") await waitChecks();
else {
  console.error("Usage: node scripts/lovable-sync.mjs decide|wait-checks");
  process.exit(2);
}
