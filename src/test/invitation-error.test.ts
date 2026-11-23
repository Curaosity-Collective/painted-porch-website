import { describe, expect, it } from "vitest";
import { invitationError } from "../lib/invitation-error";

function functionError(body: string) {
  return Object.assign(new Error("Edge Function returned a non-2xx status code"), {
    context: new Response(body, { status: 400 }),
  });
}

describe("invitation errors", () => {
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