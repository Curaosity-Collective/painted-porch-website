import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NOT_FOUND_GIFS, pickNotFoundGif } from "../notFoundGifs";

describe("Page not found GIFs", () => {
  it("picks one GIF from the set, whatever the random number", () => {
    for (const r of [0, 0.25, 0.5, 0.999999]) expect(NOT_FOUND_GIFS).toContain(pickNotFoundGif(() => r));
  });

  it("gives every GIF alt text that says what happens in it", () => {
    for (const gif of NOT_FOUND_GIFS) expect(gif.alt.trim().length).toBeGreaterThan(10);
  });
});

// The old Kajabi site may close; nothing the site shows should load from it (PPS Admin, 2026-11-09).
describe("nothing loads from the old Kajabi site", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        if (name !== "__tests__") walk(path);
      } else if (/\.(tsx?|css)$/.test(name)) files.push(path);
    }
  };
  walk(join(process.cwd(), "src"));

  it("has no kajabi-cdn address in the site's source", () => {
    const offenders = files.filter((f) => readFileSync(f, "utf-8").includes("kajabi-cdn"));
    expect(offenders).toEqual([]);
  });
});
