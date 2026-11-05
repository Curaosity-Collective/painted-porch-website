import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * The logo strip's testimonial carousel. Its attribution line used to start
 * with a stray comma (", Name, Title, Organization") and printed an empty
 * organization as a trailing comma. Amy's speaker page now shows the carousel,
 * so the line must read "Name, Title, Organization" with blanks skipped.
 */

vi.mock("@/hooks/useScrollAnimation", () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
}));

import ClientLogoMarquee from "../ClientLogoMarquee";

describe("ClientLogoMarquee testimonials", () => {
  it("attributes a quote without a leading comma and skips a blank organization", () => {
    render(
      <ClientLogoMarquee
        logos={[]}
        showTestimonials
        testimonials={[
          { quote: "First quote.", name: "Tony Alanis", title: "Vice President of Operations", organization: "" },
        ]}
      />,
    );
    expect(screen.getByText("Tony Alanis, Vice President of Operations")).toBeInTheDocument();
  });

  it("shows no testimonials unless asked to", () => {
    render(<ClientLogoMarquee logos={[]} />);
    expect(screen.queryByRole("button", { name: "Next testimonial" })).toBeNull();
    expect(screen.queryByText(/\[Title\]/)).toBeNull();
  });
});
