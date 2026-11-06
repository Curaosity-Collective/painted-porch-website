import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * Phase 3 restyle of the live speaking, topics, speaker, workshops and contact
 * pages (PPS Admin, 2026-11-05): same layout and content, the redesign's
 * colors, a few compact additions. Previewed with ?v3=1 by admins and editors;
 * on everywhere at go-live.
 */

let role: string | null = null;
let lovablePreview = false;
vi.mock("@/hooks/useUserRole", () => ({ useUserRole: () => ({ role, loading: false }) }));
vi.mock("@/lib/lovablePreview", () => ({ isLovableEditorPreview: () => lovablePreview }));
vi.mock("@/hooks/useDocumentSeo", () => ({ useDocumentSeo: () => {} }));
vi.mock("@/components/pps/TierHeroSection", () => ({ TierHeroSection: () => <div data-testid="hero" /> }));
vi.mock("@/components/pps/MoreTopicsCallout", () => ({ MoreTopicsCallout: () => <div data-testid="more-topics" /> }));
vi.mock("@/components/pps/ClientLogoMarquee", () => ({ __esModule: true, default: () => <div data-testid="logos" /> }));

import { usesV3Chrome, usesV3Skin, V3_SKIN_ROUTES } from "@/config/siteChrome";
import { useV3Preview } from "@/hooks/useV3Preview";
import { V3SkinContext } from "../v3SkinContext";
import { CredentialBadges } from "../SpeakingExtras";
import Speaking from "@/pages/pps/Speaking";

beforeEach(() => {
  role = null;
  lovablePreview = false;
  window.sessionStorage.clear();
});

describe("restyle switch", () => {
  it("restyles the speaking, topics, speaker, workshops and contact pages since the relaunch", () => {
    for (const route of V3_SKIN_ROUTES) {
      expect(usesV3Skin(route)).toBe(true);
      expect(usesV3Chrome(route)).toBe(true);
    }
    // No other page takes the restyle layer, with or without preview: the
    // redesign's own pages are built in its style, and the rest keep theirs.
    for (const route of ["/", "/about", "/the-path", "/partner/ignite", "/resources/insights"]) {
      expect(usesV3Skin(route)).toBe(false);
      expect(usesV3Skin(route, true)).toBe(false);
    }
  });
});

describe("useV3Preview", () => {
  it("ignores ?v3=1 for the public", () => {
    const { result } = renderHook(() => useV3Preview("?v3=1"));
    expect(result.current).toBe(false);
  });

  it("turns on for admins and editors, and stays on for the session", () => {
    role = "editor";
    const first = renderHook(() => useV3Preview("?v3=1"));
    expect(first.result.current).toBe(true);
    const later = renderHook(() => useV3Preview(""));
    expect(later.result.current).toBe(true);
    const off = renderHook(() => useV3Preview("?v3=0"));
    expect(off.result.current).toBe(false);
  });

  it("works in the Lovable editor preview", () => {
    lovablePreview = true;
    const { result } = renderHook(() => useV3Preview("?v3=1"));
    expect(result.current).toBe(true);
  });
});

function renderSpeaking(skin: boolean) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <V3SkinContext.Provider value={skin}>{children}</V3SkinContext.Provider>
    </MemoryRouter>
  );
  return render(<Speaking />, { wrapper });
}

describe("Speaking hub additions", () => {
  it("adds What Your Audience Leaves With and How Booking Works with the restyle", () => {
    renderSpeaking(true);
    expect(screen.getByRole("heading", { level: 2, name: "What Your Audience Leaves With" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "How Booking Works" })).toBeInTheDocument();
    // "Inquire", not "Check Availability": there's no calendar to check (PPS Admin, 2026-11-06).
    const booking = screen.getByRole("heading", { level: 2, name: "How Booking Works" }).closest("section") as HTMLElement;
    expect(within(booking).getByRole("link", { name: "Inquire About Speaking" }).getAttribute("href")).toMatch(/^\/contact\?interest=speaking/);
    expect(screen.queryByRole("link", { name: /Check Availability/ })).toBeNull();
    // The live sections stay.
    for (const name of ["Amy Yackowski", "Rob Hunter", "Sierra Ramm Cantrell", "Bring Our Porch to Your Next Event"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("leaves today's page unchanged without the restyle", () => {
    renderSpeaking(false);
    expect(screen.queryByRole("heading", { name: "What Your Audience Leaves With" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "How Booking Works" })).toBeNull();
  });
});

describe("CredentialBadges", () => {
  it("shows Amy's six credentials from the shared list and skips unknown names", () => {
    render(
      <CredentialBadges
        firstName="Amy"
        names={[
          "Prosci Change Practitioner",
          "ACMP Member",
          "Lean Change Agent",
          "Working Genius Certified",
          "EQ-360 Certified",
          "DiSC Facilitator",
          "Not a real credential",
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Amy's Credentials" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.queryByText("Not a real credential")).toBeNull();
  });
});
