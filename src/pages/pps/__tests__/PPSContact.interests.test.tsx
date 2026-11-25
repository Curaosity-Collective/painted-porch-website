import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CLARITY_CALL_CONTACT_HREF } from "@/config/epicShiftAppraisal";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));
vi.mock("@/hooks/useDocumentSeo", () => ({ useDocumentSeo: () => {} }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/components/v3/Bits", () => ({ PageHero: () => null }));

import PPSContact from "../PPSContact";

describe("Separate Clarity Call and Organizational Appraisal requests", () => {
  beforeEach(() => {
    sessionStorage.clear();
    invoke.mockReset().mockResolvedValue({ error: null });
  });

  async function submit(url: string) {
    const { container } = render(<MemoryRouter initialEntries={[url]}><PPSContact /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText("Marcus"), { target: { value: "Test" } });
    fireEvent.change(screen.getByPlaceholderText("Aurelius"), { target: { value: "Request" } });
    fireEvent.change(screen.getByPlaceholderText("marcus@romanempire.gov"), { target: { value: "request@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Initech"), { target: { value: "Test Organization" } });
    const authority = container.querySelector('select[name="budget-authority"]');
    const details = container.querySelector("textarea");
    const form = container.querySelector("form");
    if (!authority || !details || !form) throw new Error("Contact request fields missing");
    fireEvent.change(authority, { target: { value: "yes" } });
    fireEvent.change(details, { target: { value: "Please discuss this request." } });
    fireEvent.submit(form);
    await waitFor(() => expect(invoke).toHaveBeenCalledOnce());
  }

  it("a Clarity Call link submits only the Clarity Call interest", async () => {
    await submit(CLARITY_CALL_CONTACT_HREF);
    expect(invoke).toHaveBeenCalledWith("submit-ghl-lead", expect.objectContaining({
      body: expect.objectContaining({ interests: ["Clarity Call"] }),
    }));
  });

  it("an Organizational Appraisal request submits only the existing appraisal interest", async () => {
    await submit("/contact?scope=Company&interest=blue-door");
    expect(invoke).toHaveBeenCalledWith("submit-ghl-lead", expect.objectContaining({
      body: expect.objectContaining({ interests: ["blue-door"] }),
    }));
  });
});