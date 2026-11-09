#!/usr/bin/env node
/**
 * Migration record check (PPS-DEC-0029 in the PPS Ops Hub decision register).
 *
 * Database changes for this site reach the database in two ways, and the repository
 * has to say which have run:
 *   - drizzle/migrations/ is Lovable's own folder. Lovable writes it; nothing else does.
 *   - supabase/migrations/ holds the changes a Claude session writes. They run when
 *     PPS Admin pastes a Lovable prompt, so each one from FIRST_STATUS_VERSION on starts
 *     with a status line:
 *         -- Status: Pending
 *         -- Status: Applied <...> via Lovable ...
 *     and the line changes to Applied once a read-only check shows the change is live.
 *
 * This script fails when:
 *   1. a supabase/migrations file name isn't <14-digit version>_<name>.sql, or two
 *      files share a version;
 *   2. a file from FIRST_STATUS_VERSION on has no status line on its first line;
 *   3. drizzle/migrations/*.sql and drizzle/migrations/meta/_journal.json disagree;
 *   4. (with BASE_REF set, as in CI on a pull request) a file marked Applied on the base
 *      branch has its SQL changed, or is deleted or renamed. Comment lines may change,
 *      the status line included. A correction to an applied change is a new file.
 *
 * Pending files are listed as a reminder; they don't fail the check.
 *
 * Usage: node scripts/check-migrations.mjs            (checks 1-3)
 *        BASE_REF=origin/main node scripts/check-migrations.mjs   (adds 4)
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const FIRST_STATUS_VERSION = "20261105000000";
export const STATUS_RE = /^-- Status: (Pending\b|Applied\b.*\bvia Lovable\b)/;
const NAME_RE = /^(\d{14})_[A-Za-z0-9_-]+\.sql$/;
const SUPABASE_DIR = "supabase/migrations";
const DRIZZLE_DIR = "drizzle/migrations";

/** The SQL a migration runs: every line that isn't blank or a whole-line comment. */
export function sqlBody(text) {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "" && !/^\s*--/.test(line))
    .map((line) => line.trimEnd())
    .join("\n");
}

export function statusOf(text) {
  const m = text.split("\n", 1)[0].match(STATUS_RE);
  if (!m) return null;
  return m[1].startsWith("Pending") ? "pending" : "applied";
}

/** Checks 1 and 2. `files` maps file name to contents. */
export function checkSupabaseFiles(files) {
  const errors = [];
  const pending = [];
  const seen = new Map();
  for (const [name, text] of Object.entries(files)) {
    const m = name.match(NAME_RE);
    if (!m) {
      errors.push(`${SUPABASE_DIR}/${name}: name must be <14-digit version>_<name>.sql`);
      continue;
    }
    const version = m[1];
    if (seen.has(version)) {
      errors.push(`${SUPABASE_DIR}/${name}: version ${version} is also used by ${seen.get(version)}`);
    }
    seen.set(version, name);
    if (version >= FIRST_STATUS_VERSION) {
      const status = statusOf(text);
      if (!status) {
        errors.push(
          `${SUPABASE_DIR}/${name}: first line must be "-- Status: Pending" or "-- Status: Applied ... via Lovable ..." (PPS-DEC-0029)`,
        );
      } else if (status === "pending") {
        pending.push(name);
      }
    }
  }
  return { errors, pending };
}

/** Check 3. */
export function checkDrizzleJournal(sqlNames, journal) {
  const errors = [];
  const tags = (journal?.entries ?? []).map((e) => e.tag);
  const files = new Set(sqlNames.map((n) => n.replace(/\.sql$/, "")));
  for (const tag of tags) {
    if (!files.has(tag)) errors.push(`${DRIZZLE_DIR}: journal entry ${tag} has no .sql file`);
  }
  for (const f of files) {
    if (!tags.includes(f)) errors.push(`${DRIZZLE_DIR}/${f}.sql: not in meta/_journal.json`);
  }
  if (new Set(tags).size !== tags.length) errors.push(`${DRIZZLE_DIR}: meta/_journal.json repeats a tag`);
  return errors;
}

/** Check 4. `base` and `head` map file name to contents (head lacks deleted files). */
export function checkAppliedUnchanged(base, head) {
  const errors = [];
  for (const [name, text] of Object.entries(base)) {
    if (statusOf(text) !== "applied") continue;
    if (!(name in head)) {
      errors.push(`${SUPABASE_DIR}/${name}: marked Applied on the base branch, so it can't be deleted or renamed`);
    } else if (sqlBody(head[name]) !== sqlBody(text)) {
      errors.push(
        `${SUPABASE_DIR}/${name}: marked Applied on the base branch; its SQL can't change. Write a new migration instead (PPS-DEC-0029)`,
      );
    }
  }
  return errors;
}

function readDir(root, dir) {
  const full = resolve(root, dir);
  if (!existsSync(full)) return {};
  return Object.fromEntries(
    readdirSync(full)
      .filter((n) => n.endsWith(".sql"))
      .map((n) => [n, readFileSync(resolve(full, n), "utf8")]),
  );
}

function readDirAtRef(root, ref, dir) {
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const names = git("ls-tree", "--name-only", `${ref}:${dir}`)
    .split("\n")
    .filter((n) => n.endsWith(".sql"));
  return Object.fromEntries(names.map((n) => [n, git("show", `${ref}:${dir}/${n}`)]));
}

export function runChecks(root, baseRef) {
  const head = readDir(root, SUPABASE_DIR);
  const { errors, pending } = checkSupabaseFiles(head);
  const journalPath = resolve(root, DRIZZLE_DIR, "meta/_journal.json");
  if (existsSync(journalPath)) {
    errors.push(
      ...checkDrizzleJournal(Object.keys(readDir(root, DRIZZLE_DIR)), JSON.parse(readFileSync(journalPath, "utf8"))),
    );
  }
  if (baseRef) errors.push(...checkAppliedUnchanged(readDirAtRef(root, baseRef, SUPABASE_DIR), head));
  return { errors, pending };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const { errors, pending } = runChecks(root, process.env.BASE_REF || "");
  for (const p of pending) console.log(`Pending (not yet run through Lovable): ${SUPABASE_DIR}/${p}`);
  if (errors.length) {
    console.error(errors.map((e) => `✗ ${e}`).join("\n"));
    process.exit(1);
  }
  console.log(`✓ Migration records consistent${process.env.BASE_REF ? ` (applied files compared with ${process.env.BASE_REF})` : ""}.`);
}
