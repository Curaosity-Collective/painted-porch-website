import { describe, expect, it } from "vitest";
import { accountActionError, invitationError } from "../lib/invitation-error";

function functionError(body: string) {
  return Object.assign(new Error("Edge Function returned a non-2xx status code"), {
    context: new Response(body, { status: 400 }),
  });
}

describe("invitation errors", () => {
  it.each(["admin", "contributor"])("names the requested %s role for duplicate invitations", async (role) => {
    const result = await invitationError(functionError('{"error":"A user with this email address has already been registered"}'), role);
    expect(result.message).toContain(`edit their role to ${role[0].toUpperCase() + role.slice(1)}`);
    expect(result.message).not.toContain("to Editor");
  });

  it("does not give invitation advice for an email-change conflict", async () => {
    const message = "A user with this email address has already been registered";
    expect((await accountActionError(functionError(JSON.stringify({ error: message })))).message).toBe(message);
  });

  it("extracts deletion and restore errors", async () => {
    for (const message of ["Cannot delete your own account", "Forbidden", "create failed"]) {
      expect((await accountActionError(functionError(JSON.stringify({ error: message })))).message).toBe(message);
    }
  });
  it("extracts an existing-account conflict without hiding the response", async () => {
    const error = functionError(JSON.stringify({ error: "A user with this email address has already been registered" }));
    const result = await invitationError(error);
    expect(result.message).toContain("An account already exists");
    expect(result.message).toContain("edit their role to Editor");
    expect(await error.context.json()).toEqual({ error: "A user with this email address has already been registered" });
  });

  it("preserves the actual server validation failure", async () => {
    expect((await invitationError(functionError('{"error":"Email is required"}'))).message).toBe("Email is required");
  });

  it("retains transport failures when the response is not JSON", async () => {
    expect((await invitationError(functionError("unavailable"))).message).toBe("Edge Function returned a non-2xx status code");
    expect((await invitationError(new Error("Failed to fetch"))).message).toBe("Failed to fetch");
  });
});