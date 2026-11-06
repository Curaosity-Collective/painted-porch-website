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
  it("keeps resource access available and logs a rejected handoff", async () => {
    credentials();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const invoke = vi.fn().mockResolvedValue({ data: null, error: { context: new Response(JSON.stringify({ error: "Template not permitted for this caller" }), { status: 403 }) } });
    const insert = vi.fn().mockResolvedValue({ error: null });
    await expect(queueResourceEmail({ functions: { invoke }, from: () => ({ insert }) }, { templateName: "kick-the-habit-replay", recipientEmail: "test@example.com" })).resolves.toEqual({ emailStatus: "failed" });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ template_name: "kick-the-habit-replay", status: "failed" }));
  });
  it("does not treat suppression or an unacknowledged send as queued", async () => {
    credentials();
    const invoke = vi.fn().mockResolvedValue({ data: { success: false, reason: "email_suppressed" }, error: null });
    await expect(queueResourceEmail({ functions: { invoke } }, {})).resolves.toEqual({ emailStatus: "suppressed" });
  });
  it("preserves access without invoking email when credentials are unavailable", async () => {
    vi.stubGlobal("Deno", { env: { get: () => undefined } });
    const invoke = vi.fn();
    await expect(queueResourceEmail({ functions: { invoke } }, {})).resolves.toEqual({ emailStatus: "failed" });
    expect(invoke).not.toHaveBeenCalled();
  });
  it("preserves access during a queue outage", async () => {
    credentials();
    const invoke = vi.fn().mockResolvedValue({ data: null, error: { context: new Response('{}', { status: 500 }) } });
    await expect(queueResourceEmail({ functions: { invoke } }, {})).resolves.toEqual({ emailStatus: "failed" });
  });
  it("preserves access if both email and failure logging throw", async () => {
    credentials();
    const invoke = vi.fn().mockRejectedValue(new Error("Network unavailable"));
    await expect(queueResourceEmail({ functions: { invoke }, from: () => { throw new Error("Log unavailable"); } }, {})).resolves.toEqual({ emailStatus: "failed" });
  });
  it("does not claim an unacknowledged handoff was queued", async () => {
    credentials();
    const invoke = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
    await expect(queueResourceEmail({ functions: { invoke } }, {})).resolves.toEqual({ emailStatus: "failed" });
  });
});