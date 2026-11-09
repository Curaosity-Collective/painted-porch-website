import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Launch statuses come from the database; none are live here, so every card shows.
vi.mock("@/hooks/useMasterclassLaunch", () => ({
  useMasterclassLaunchStatuses: () => new Map<string, string>(),
  anyMasterclassLive: () => false,
}));
vi.mock("@/components/pps/LaunchListCTA", () => ({ LaunchListCTA: () => null }));

import IgniteMasterclasses from "../IgniteMasterclasses";

const open = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <IgniteMasterclasses />
    </MemoryRouter>,
  );

// Rob's and Sierra's link-in-bio cards link to /masterclasses?category=… (PPS Admin, 2026-11-09).
describe("Masterclasses opens on the category a link names", () => {
  it("shows only that category's masterclasses", () => {
    open("/masterclasses?category=Communication%20%26%20Connection");
    expect(screen.getByText("Talking to Strangers")).toBeInTheDocument();
    expect(screen.queryByText("Radical Mindfulness Mini Course")).toBeNull();
    expect(screen.queryByText("The Elements of a Team")).toBeNull();
  });

  it("shows everything with no category, or one that isn't a category", () => {
    for (const url of ["/masterclasses", "/masterclasses?category=Nonsense"]) {
      const { unmount } = open(url);
      expect(screen.getByText("Talking to Strangers")).toBeInTheDocument();
      expect(screen.getByText("Radical Mindfulness Mini Course")).toBeInTheDocument();
      unmount();
    }
  });
});
