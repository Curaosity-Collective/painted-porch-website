import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

import CostCalculatorDialog from "../CostCalculatorDialog";

function openCalculator() {
  render(
    <MemoryRouter>
      <TooltipProvider>
        <CostCalculatorDialog triggerLabel="See what clarity could save" />
      </TooltipProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "See what clarity could save" }));
  return screen.getByRole("dialog");
}

const OFF = '[data-money-highlight="off"]';

describe("CostCalculatorDialog", () => {
  it("says what clarity is worth, not what skipping costs", () => {
    const dialog = openCalculator();
    expect(within(dialog).getByRole("heading", { name: "What Clarity Is Worth" })).toBeInTheDocument();
    expect(dialog.textContent).not.toMatch(/Cost of Skipping|blast radius|can provide/i);
  });

  // PPS Admin, 2026-11-08: "let's make an exception for the numbers in green rule.
  // The dollar values should match their context/boxes".
  it("keeps each result figure in its box's color, outside the site's green for money", () => {
    const dialog = openCalculator();
    for (const label of ["Planned investment", "Likely overrun", "Failure write-off"]) {
      const box = within(dialog)
        .getAllByText(label)
        .map((el) => el.closest(".rounded-lg"))
        .find(Boolean)!;
      expect(box.closest(OFF), label).not.toBeNull();
    }
    const overrun = within(dialog)
      .getAllByText("Likely overrun")
      .map((el) => el.closest(".rounded-lg"))
      .find(Boolean)!;
    // Gold text uses the AA-passing shade from PPS-DEC-0022, not the fill Gold.
    expect(overrun.querySelector(".text-xl")?.className).toContain("text-[#8A5A00]");
    expect(within(dialog).getByText(/could reduce that exposure by/).closest(OFF)).not.toBeNull();
    // The method notes are ordinary text and keep the site-wide rule.
    expect(within(dialog).getByText(/effective overrun rate/).closest(OFF)).toBeNull();
  });

  it("leaves out the change-type clause until a type is selected", () => {
    const dialog = openCalculator();
    const note = within(dialog).getByText(/effective overrun rate/);
    expect(note.textContent).not.toContain("()");
    expect(note.textContent).not.toContain("selected change types");
    fireEvent.click(within(dialog).getByRole("button", { name: /^Technology/ }));
    expect(within(dialog).getByText(/effective overrun rate/).textContent).toMatch(
      /selected change types \(Operational, Technology\)\./,
    );
  });
});
