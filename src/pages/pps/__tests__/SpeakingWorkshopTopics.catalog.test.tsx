import { describe, it, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * The topics catalogue (PPS Admin, 2026-11-05). Recreates the rows that put
 * topics under "More" and showed duplicates:
 *  - keynote rows with no theme sorted before their tagged sibling;
 *  - an old row with no topic_slug duplicated The Power of Story;
 *  - "Working Genius" duplicated "Genius at Work";
 *  - Architect Change (the workshop inside Architect ShIFt) slipped past the
 *    name-based exclude.
 * Also guards the approved names, and the rule that a topic offered as both a
 * keynote and a workshop shows once with both labels.
 */

type Row = Record<string, unknown>;

const { ROWS } = vi.hoisted(() => {
  const row = (r: Partial<Row> & { name: string; offering_key: string }): Row => ({
    blurb: null,
    description: "About this topic.",
    topic: null,
    facilitator: "Amy",
    current_url: "/speaking/topics",
    anchor_id: null,
    image_url: null,
    is_keynote: false,
    include_in_workshops: false,
    topic_slug: null,
    delivery_format: null,
    ...r,
  });

  const ROWS: Row[] = [
    row({ offering_key: "speakingAiEiOh", name: "AI, EI, Oh! Guiding Change in the AI Era", topic_slug: "ai-ei-oh", is_keynote: true, delivery_format: "keynote" }),
    row({ offering_key: "aiEiOh", name: "AI, EI, Oh! Guiding Change in the AI Era", topic_slug: "ai-ei-oh", topic: "Leadership & Culture", delivery_format: "workshop" }),
    row({ offering_key: "powerOfStory", name: "The Power of Story", topic_slug: "power-of-story", topic: "Comms", facilitator: "Rob", delivery_format: "workshop" }),
    row({ offering_key: "the-power-of-story-the-art-o", name: "The Power of Story / The Art of Storytelling", facilitator: null }),
    row({ offering_key: "geniusAtWork", name: "Genius at Work", topic_slug: "genius-at-work", topic: "Team Dynamics", delivery_format: "workshop" }),
    row({ offering_key: "working-genius", name: "Working Genius", topic_slug: "working-genius", facilitator: null, delivery_format: "workshop" }),
    row({ offering_key: "architectChange", name: "Architect Change (Strategic Design Intensive)", topic_slug: "architect-change", topic: "Change & Innovation", include_in_workshops: true }),
    row({ offering_key: "architect-change-phase-zero-", name: "Architect Change: Phase Zero Strategic Design", topic_slug: "architect-change", facilitator: null }),
    row({ offering_key: "pathToLastingChange", name: "The P.A.T.H. to Change", topic_slug: "path-to-lasting-change", topic: "Change & Innovation", include_in_workshops: true, current_url: "/workshops", delivery_format: "workshop" }),
    row({ offering_key: "drivingChange3Shifts", name: "Driving Change: The 3 Shifts for Lasting Innovation", topic_slug: "driving-change-3-shifts", topic: "Change & Innovation", is_keynote: true, delivery_format: "keynote" }),
    row({ offering_key: "the-p-a-t-h-to-navigating-ch", name: "The P.A.T.H. to Navigating Change", topic_slug: "path-to-lasting-change", facilitator: null }),
    row({ offering_key: "speakingCommStyle", name: "Speak with Style — 6 Communicator Styles (Keynote)", topic_slug: "communicator-styles", is_keynote: true, facilitator: "Rob" }),
    row({ offering_key: "communicateWithStyle", name: "Speak with Style: The 6 Communicator Styles for Influence & Impact", topic_slug: "communicator-styles", topic: "Comms", facilitator: "Rob" }),
    row({ offering_key: "stracticalLeader", name: "The Stractical Leader", topic_slug: "stractical-leader", topic: "Leadership & Culture", is_keynote: true, delivery_format: "keynote" }),
    row({ offering_key: "stracticalLeaderLab", name: "Stractical Leader Lab", topic_slug: "stractical-leader", topic: "Leadership & Culture", delivery_format: "lab" }),
    row({ offering_key: "kickTheHabit", name: "Kick the Habit", topic_slug: "kick-the-habit-b2b", topic: "Change & Innovation", is_keynote: true, delivery_format: "keynote" }),
  ];
  return { ROWS };
});

vi.mock("@/integrations/supabase/client", () => {
  const result = Promise.resolve({ data: ROWS, error: null });
  const chain = { select: () => chain, or: () => chain, order: () => result };
  return { supabase: { from: () => chain } };
});
vi.mock("@/hooks/useDocumentSeo", () => ({ useDocumentSeo: () => {} }));
vi.mock("@/hooks/useUserRole", () => ({ useUserRole: () => ({ isAdmin: false, role: null, loading: false }) }));
vi.mock("@/components/pps/TierHeroSection", () => ({ TierHeroSection: () => <div /> }));
vi.mock("@/components/pps/ParallaxCTA", () => ({ ParallaxCTA: () => <div /> }));

import SpeakingWorkshopTopics from "../SpeakingWorkshopTopics";

function cardOf(title: string): HTMLElement | null {
  return (screen.getAllByRole("heading").find((h) => h.textContent?.trim() === title)?.closest("article") as HTMLElement) ?? null;
}

function labelsOf(title: string): string[] {
  const card = cardOf(title);
  if (!card) return [];
  return Array.from(card.querySelectorAll("span"))
    .map((s) => s.textContent?.trim() ?? "")
    .filter((t) => t === "Keynote" || t === "Workshop")
    .sort();
}

function themeOf(title: string): string | null {
  const card = screen.getAllByRole("heading").find((h) => h.textContent?.trim() === title)?.closest("article");
  return card?.closest("div.mb-12")?.querySelector("h3")?.textContent?.trim() ?? null;
}

describe("Speaking & workshop topics catalogue", () => {
  it("puts every topic in a theme: no 'More' group", async () => {
    render(
      <MemoryRouter initialEntries={["/speaking/topics"]}>
        <SpeakingWorkshopTopics />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getAllByRole("article").length).toBeGreaterThan(0));
    const themes = Array.from(document.querySelectorAll("div.mb-12 > div > h3")).map((h) => h.textContent?.trim());
    expect(themes).not.toContain("More");
    expect(themeOf("AI, EI, Oh! Guiding Change in the AI Era")).toBe("Leadership & Culture");
    expect(themeOf("Speak with Style: The 6 Communicator Styles for Influence & Impact")).toBe("Communication");
  });

  it("shows each topic once, without Architect Change, under the approved names", async () => {
    render(
      <MemoryRouter initialEntries={["/speaking/topics"]}>
        <SpeakingWorkshopTopics />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getAllByRole("article").length).toBeGreaterThan(0));
    const titles = screen.getAllByRole("article").map((a) => within(a).getAllByRole("heading")[0].textContent?.trim());
    expect(titles.filter((t) => t?.startsWith("The Power of Story"))).toEqual(["The Power of Story"]);
    expect(titles).toContain("Genius at Work");
    expect(titles).not.toContain("Working Genius");
    expect(titles.some((t) => t?.startsWith("Architect Change"))).toBe(false);
    expect(titles).toContain("The P.A.T.H. to Lasting Change");
    expect(titles).not.toContain("The P.A.T.H. to Navigating Change");
    expect(titles).toContain("Kick the Habit");
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("labels a topic offered as both a keynote and a workshop with both, once", async () => {
    render(
      <MemoryRouter initialEntries={["/speaking/topics"]}>
        <SpeakingWorkshopTopics />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getAllByRole("article").length).toBeGreaterThan(0));
    // A keynote row plus a workshop row that is not featured on the Workshops page.
    expect(labelsOf("AI, EI, Oh! Guiding Change in the AI Era")).toEqual(["Keynote", "Workshop"]);
    expect(labelsOf("The Power of Story")).toEqual(["Keynote", "Workshop"]);
    // Designated "always both", keyed by slug, even with one row of one format.
    expect(labelsOf("The P.A.T.H. to Lasting Change")).toEqual(["Keynote", "Workshop"]);
    expect(labelsOf("Driving Change: The 3 Shifts for Lasting Innovation")).toEqual(["Keynote", "Workshop"]);
    expect(labelsOf("The Stractical Leader")).toEqual(["Keynote", "Workshop"]);
    // Keynote rows alone stay keynote-only.
    expect(labelsOf("Kick the Habit")).toEqual(["Keynote"]);
    // A workshop listed on the speaking topics page is not a keynote (PPS Admin).
    expect(labelsOf("Genius at Work")).toEqual(["Workshop"]);
  });
});
