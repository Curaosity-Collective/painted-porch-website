interface EmailClient {
  functions: { invoke: (name: string, options: { body: Record<string, unknown> }) => Promise<{ data: any; error: any }> };
}

/** Resource access must not silently report an email as delivered. */
export async function queueResourceEmail(client: EmailClient, body: Record<string, unknown>) {
  const { data, error } = await client.functions.invoke("send-transactional-email", { body });
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