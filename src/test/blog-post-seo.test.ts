import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { blogPostTitle } from "@/lib/blog-post-seo.mjs";

/**
 * A blog post's page title carries the brand once. Stored SEO titles end in
 * "| Painted Porch Strategies", "| Painted Porch" or nothing; in November 2026,
 * 13 of 98 published posts ended in "| Painted Porch" and came out as
 * "… | Painted Porch | Painted Porch Strategies".
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");

describe("blogPostTitle", () => {
  it("adds the brand once to a title without it", () => {
    expect(blogPostTitle({ seo_title: "Curbing Regret with Stoic Principles" })).toBe(
      "Curbing Regret with Stoic Principles | Painted Porch Strategies",
    );
  });

  it("doesn't repeat the brand when the stored title ends in '| Painted Porch'", () => {
    expect(blogPostTitle({ seo_title: "Curbing Regret with Stoic Principles | Painted Porch" })).toBe(
      "Curbing Regret with Stoic Principles | Painted Porch Strategies",
    );
  });

  it("keeps a title that already ends in the full brand", () => {
    expect(blogPostTitle({ seo_title: "Accountability in Leadership | Painted Porch Strategies" })).toBe(
      "Accountability in Leadership | Painted Porch Strategies",
    );
  });

  it("leaves 'Painted Porch' alone when it's part of the title itself", () => {
    expect(blogPostTitle({ seo_title: "Welcome to the Painted Porch" })).toBe(
      "Welcome to the Painted Porch | Painted Porch Strategies",
    );
    expect(blogPostTitle({ seo_title: "What the Heck Is a Painted Porch? | Painted Porch" })).toBe(
      "What the Heck Is a Painted Porch? | Painted Porch Strategies",
    );
  });

  it("falls back to the post title, and gives nothing when there is no title", () => {
    expect(blogPostTitle({ seo_title: null, title: "We Were On a Break!" })).toBe(
      "We Were On a Break! | Painted Porch Strategies",
    );
    expect(blogPostTitle({ seo_title: "", title: "" })).toBeUndefined();
    expect(blogPostTitle(null)).toBeUndefined();
  });

  it("is what both the post page and the prerender use", () => {
    expect(read("src/pages/pps/PPSBlogPost.tsx")).toMatch(/blogPostTitle\(post\)/);
    expect(read("scripts/prerender.mjs")).toMatch(/blogPostTitle\(post\)/);
  });
});
