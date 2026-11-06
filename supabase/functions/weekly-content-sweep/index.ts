import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isScheduledScan } from "../_shared/scheduled-content-scan.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  if (!isScheduledScan(req.headers.get("authorization"), serviceKey)) return json({ error: "Unauthorized" }, 401);
  if (!url || !serviceKey) return json({ error: "Scanner configuration unavailable" }, 500);

  // Independent scans: a provider outage must not prevent the other sweep.
  const results = await Promise.all(["scan-youtube-channel", "scan-linkedin-articles"].map(async (name) => {
    try {
      const response = await fetch(`${url}/functions/v1/${name}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await response.json();
      return { name, status: response.status, data, success: response.ok && data.success === true && !data.errors };
    } catch (error) {
      return { name, success: false, error: error instanceof Error ? error.message : "Scan failed" };
    }
  }));
  const success = results.every((result) => result.success);
  console.log("weekly-content-sweep", JSON.stringify({ success, results }));
  return json({ success, results }, success ? 200 : 502);
});