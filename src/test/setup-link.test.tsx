import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../pages/pps/admin/ResetPassword";

const auth = vi.hoisted(() => ({ callback: undefined as undefined | ((event: string) => void) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {
  onAuthStateChange: (callback: (event: string) => void) => {
    auth.callback = callback;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  },
} } }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
afterEach(() => { cleanup(); window.location.hash = ""; });

describe("password setup links", () => {
  it.each(["invite", "recovery"])("opens password setup for a %s link even when Auth clears its hash", (type) => {
    window.location.hash = `type=${type}`;
    render(<MemoryRouter><ResetPassword /></MemoryRouter>);
    window.location.hash = "";
    act(() => auth.callback?.("SIGNED_IN"));
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
  });
  it("does not treat a regular signed-in session as an invitation", () => {
    render(<MemoryRouter><ResetPassword /></MemoryRouter>);
    act(() => auth.callback?.("SIGNED_IN"));
    expect(screen.queryByLabelText("New Password")).toBeNull();
    expect(screen.getByText("Invalid or Expired Link")).toBeInTheDocument();
  });
});