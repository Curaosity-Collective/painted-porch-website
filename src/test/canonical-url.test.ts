import { describe, expect, it } from "vitest";
import { canonicalPageUrl, canonicalPath } from "@/lib/canonical-url";

describe("public route canonical URLs", () => {
  it.each(["/", "/the-path", "/envision-shift", "/architect-shift", "/embody-shift", "/workshops", "/leadership-labs", "/assessments", "/masterclasses", "/for-individuals"])("self-references %s at the primary domain", (path) => {
    expect(canonicalPageUrl(path)).toBe(`https://onthepaintedporch.com${path}`);
    expect(canonicalPageUrl(`https://www.onthepaintedporch.com${path}?utm_source=test#intro`)).toBe(`https://onthepaintedporch.com${path}`);
  });
  it("normalizes case and trailing slashes without retaining the preview origin", () => {
    expect(canonicalPageUrl("http://localhost:8080/THE-PATH/")).toBe("https://onthepaintedporch.com/the-path");
  });
  it.each([
    ["/ABOUT", "/about"],
    ["/about/", "/about"],
    ["/About//", "/about"],
    ["/", "/"],
    ["/about", "/about"],
  ])("gives the real form of %s as %s", (input, expected) => {
    expect(canonicalPath(input)).toBe(expected);
  });
});