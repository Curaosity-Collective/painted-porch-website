import { afterEach, describe, expect, it, vi } from "vitest";
import { queueResourceEmail } from "../../supabase/functions/_shared/resource-email";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("resource email handoff", () => {
  const credentials = () => vi.stubGlobal("Deno", { env: { get: () => "test-server-credential" } });
  it("explicitly uses server authorization for resource templates", async () => {
    credentials();
    const invoke = vi.fn().mockResolvedValue({ data: { success: true, queued: true }, error: null });
    await expect(queueResourceEmail({ functions: { invoke } }, { templateName: "stoic-field-guide" })).resolves.toEqual({ emailStatus: "queued" });
    expect(invoke).toHaveBeenCalledWith("send-transactional-email", {
      body: { templateName: "stoic-field-guide" }, headers: { Authorization: "Bearer test-server-credential" },
    });
  });
  it("rejects a failed handoff rather than claiming successful delivery", async () => {
    credentials();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const invoke = vi.fn().mockResolvedValue({ data: null, error: { context: new Response(JSON.stringify({ error: "Template not permitted for this caller" }), { status: 403 }) } });
    await expect(queueResourceEmail({ functions: { invoke } }, {})).rejects.toThrow("Resource email handoff failed");
  });
  it("does not treat suppression or an unacknowledged send as queued", async () => {
    credentials();
    const invoke = vi.fn().mockResolvedValue({ data: { success: false, reason: "email_suppressed" }, error: null });
    await expect(queueResourceEmail({ functions: { invoke } }, {})).rejects.toThrow("Resource email was not queued");
  });
  it("fails before invocation when server credentials are unavailable", async () => {
    vi.stubGlobal("Deno", { env: { get: () => undefined } });
    const invoke = vi.fn();
    await expect(queueResourceEmail({ functions: { invoke } }, {})).rejects.toThrow("Missing resource email credentials");
    expect(invoke).not.toHaveBeenCalled();
  });
});