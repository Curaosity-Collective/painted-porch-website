/** Read the function's response body instead of discarding its actionable error. */
export async function invitationError(error: unknown): Promise<Error> {
  let message = error instanceof Error ? error.message : "Unable to create this user. Please try again.";
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
  if (/email.*already.*registered|user.*already.*exists/i.test(message)) {
    message = "An account already exists for this email. Find the user in the Users list and edit their role to Editor instead of adding them again. If they cannot sign in, use Reset password.";
  }
  return new Error(message);
}