import { describe, expect, it, vi } from "vitest";
import { ensureInviteProfile } from "../../supabase/functions/invite-user/profile";

describe("invitation profile provisioning", () => {
  it("creates and reads back a missing Users-list record without assigning privileges", async () => {
    const find = vi.fn().mockResolvedValueOnce({ exists: false }).mockResolvedValueOnce({ exists: true });
    const create = vi.fn().mockResolvedValue({});
    await ensureInviteProfile({ find, create }, { id: "user-id", email: "editor@example.test" }, "Editor");
    expect(create).toHaveBeenCalledWith({ id: "user-id", email: "editor@example.test", full_name: "Editor" });
    expect(find).toHaveBeenCalledTimes(2);
  });
  it("never overwrites an existing user's profile or permissions", async () => {
    const create = vi.fn();
    await ensureInviteProfile({ find: vi.fn().mockResolvedValue({ exists: true }), create }, { id: "existing", email: "editor@example.test" }, "Changed name");
    expect(create).not.toHaveBeenCalled();
  });
  it("fails instead of claiming success when no profile was stored", async () => {
    await expect(ensureInviteProfile({ find: vi.fn().mockResolvedValue({ exists: false }), create: vi.fn().mockResolvedValue({}) }, { id: "missing", email: "editor@example.test" }, "Editor")).rejects.toThrow("could not be verified");
  });
});