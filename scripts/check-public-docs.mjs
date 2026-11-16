#!/usr/bin/env node
/**
 * public/ is Vite's static-asset root. Everything placed there is copied to
 * dist/ and served without React route guards. Internal Markdown belongs in
 * docs/ or the appropriate repository, never in public/.
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = "public";
const offenders = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(path);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      offenders.push(relative(process.cwd(), path));
    }
  }
}

if (statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
  walk(root);
}

if (offenders.length > 0) {
  console.error("Markdown files are not allowed under public/:");
  for (const file of offenders.sort()) console.error(`  - ${file}`);
  console.error("Move internal documents to docs/ (or the owning repository).");
  process.exit(1);
}

console.log("Public asset check passed: no Markdown files under public/.");
