interface EmailClient {
  functions: { invoke: (name: string, options: { body: Record<string, unknown>; headers: Record<string, string> }) => Promise<{ data: any; error: any }> };
  from?: (table: string) => { insert: (row: Record<string, unknown>) => PromiseLike<{ error: unknown }> };
}

declare const Deno: { env: { get(name: string): string | undefined } };

/** Email delivery is independent of access; never claim an unqueued copy was sent. */
export async function queueResourceEmail(client: EmailClient, body: Record<string, unknown>) {
  try {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) throw new Error("Missing resource email credentials");
  const { data, error } = await client.functions.invoke("send-transactional-email", {
    body, headers: { Authorization: `Bearer ${serviceKey}` },
  });
  if (error) {
    const response = error.context;
    const detail = response instanceof Response ? await response.clone().json().catch(() => ({})) : {};
    console.error("Resource email handoff rejected", { status: response?.status, reason: detail.error });
    throw new Error("Resource email handoff failed");
  }
  if (data?.reason === "email_suppressed") return { emailStatus: "suppressed" };
  if (data?.success !== true || data?.queued !== true) {
    throw new Error("Resource email was not queued");
  }
  return { emailStatus: "queued" };
  } catch {
    console.error("Resource email copy failed; immediate access remains available", { templateName: body.templateName });
    // Record rejected handoffs as well as failures inside the sending function.
    // Logging itself must not turn an optional email into an access failure.
    try {
      if (client.from) {
        const { error } = await client.from("email_send_log").insert({
          message_id: crypto.randomUUID(),
          template_name: body.templateName,
          recipient_email: body.recipientEmail,
          status: "failed",
          error_message: "Resource email handoff failed; immediate access granted",
        });
        if (error) console.error("Resource email failure could not be recorded");
      }
    } catch {
      console.error("Resource email failure could not be recorded");
    }
    return { emailStatus: "failed" };
  }
}