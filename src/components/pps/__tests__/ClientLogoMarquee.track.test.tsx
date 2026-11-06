/**
 * The scrolling logo strip. PPS Admin (2026-11-06) saw missing logos and big
 * empty gaps on phones: the logos were lazy-loaded, and browsers don't load
 * lazy images that slide into view sideways, so most slots stayed empty.
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/hooks/useScrollAnimation", () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
}));

import ClientLogoMarquee, { allClientLogos, type LogoItem } from "../ClientLogoMarquee";

const tracks = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>(".animate-marquee"));

describe("ClientLogoMarquee logo tracks", () => {
  it("loads every logo up front instead of lazily", () => {
    const { container } = render(<ClientLogoMarquee />);
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs.length).toBe(allClientLogos.length * 2);
    for (const img of imgs) expect(img.getAttribute("loading")).not.toBe("lazy");
  });

  it("gives screen readers and the keyboard each logo once", () => {
    const { container } = render(<ClientLogoMarquee />);
    const [first, copy] = tracks(container);
    expect(first.getAttribute("aria-hidden")).toBeNull();
    expect(copy.getAttribute("aria-hidden")).toBe("true");
    expect(Array.from(copy.querySelectorAll("a")).every((a) => a.getAttribute("tabindex") === "-1")).toBe(true);
    expect(Array.from(first.querySelectorAll("img")).map((i) => i.getAttribute("alt"))).toEqual(
      allClientLogos.map((l) => l.name),
    );
  });

  it("repeats a short list so the strip has no gap before it loops, at the same speed", () => {
    const five: LogoItem[] = allClientLogos.slice(0, 5);
    const { container } = render(<ClientLogoMarquee logos={five} />);
    const [first] = tracks(container);
    expect(first.querySelectorAll("img").length).toBe(10);
    expect(first.style.animationDuration).toBe("50s");
    // A long list isn't repeated.
    const { container: full } = render(<ClientLogoMarquee />);
    expect(tracks(full)[0].querySelectorAll("img").length).toBe(allClientLogos.length);
  });
});
