interface EmailClient {
  functions: { invoke: (name: string, options: { body: Record<string, unknown>; headers: Record<string, string> }) => Promise<{ data: any; error: any }> };
}

declare const Deno: { env: { get(name: string): string | undefined } };

/** Resource access must not silently report an email as delivered. */
export async function queueResourceEmail(client: EmailClient, body: Record<string, unknown>) {
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
  if (data?.success !== true || data?.queued !== true) {
    throw new Error("Resource email was not queued");
  }
  return { emailStatus: "queued" };
}