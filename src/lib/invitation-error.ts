/** Read the function's response body instead of discarding its actionable error. */
export async function accountActionError(error: unknown): Promise<Error> {
  let message = error instanceof Error ? error.message : "Unable to complete this account action. Please try again.";
  if (error && typeof error === "object" && "context" in error) {
    const context = error.context;
    if (context instanceof Response) {
      try {
        const body = await context.clone().json();
        if (typeof body?.error === "string") message = body.error;
      } catch {
        // Preserve the original error when the service returns no JSON body.
      }
    }
  }
  return new Error(message);
}

export async function invitationError(error: unknown, role = "editor"): Promise<Error> {
  const result = await accountActionError(error);
  if (/email.*already.*registered|user.*already.*exists/i.test(result.message)) {
    const roleLabel = role === "admin" ? "Admin" : role === "contributor" ? "Contributor" : "Editor";
    return new Error(`An account already exists for this email. Find the user in the Users list and edit their role to ${roleLabel} instead of adding them again. If they cannot sign in, use Reset password.`);
  }
  return result;
}