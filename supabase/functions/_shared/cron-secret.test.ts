// Run: deno test --allow-env supabase/functions/_shared/cron-secret.test.ts
// No network: fetch is replaced, so nothing reaches a database.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { getCronSecret } from "./cron-secret.ts";

Deno.test("cron token: falls back without caching, then keeps the Vault value", async () => {
  const realFetch = globalThis.fetch;
  let calls = 0;
  let vaultReady = false;
  globalThis.fetch = (async () => {
    calls++;
    return vaultReady
      ? new Response(JSON.stringify("from-vault"), { status: 200, headers: { "Content-Type": "application/json" } })
      : new Response(JSON.stringify({ message: "function not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  Deno.env.set("BACKUP_CRON_SECRET", "from-env");

  try {
    // Before the Vault entry exists: the fallback is used and nothing is kept.
    assertEquals(await getCronSecret("https://example.test", "service-key"), "from-env");
    assertEquals(calls, 1);

    // Once it exists, the next request picks it up without a restart.
    vaultReady = true;
    assertEquals(await getCronSecret("https://example.test", "service-key"), "from-vault");
    assertEquals(calls, 2);

    // After that the value is reused, with no further lookups.
    assertEquals(await getCronSecret("https://example.test", "service-key"), "from-vault");
    assertEquals(calls, 2);
  } finally {
    globalThis.fetch = realFetch;
    Deno.env.delete("BACKUP_CRON_SECRET");
  }
});
