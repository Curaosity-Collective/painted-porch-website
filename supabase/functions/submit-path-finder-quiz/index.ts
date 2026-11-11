// Emailed quiz results always save a contact and note; newsletter consent stays optional.
import { saveQuizContact } from "./contact.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const ghlHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  Version: GHL_VERSION,
});

interface RecItem { name: string; url: string; blurb: string; tier: string }
interface RecGroup { heading: string; items: RecItem[] }
interface ContentItem { kind: "blog" | "media"; title: string; url: string; excerpt?: string; thumbnail?: string; date?: string; source?: string }
interface Body {
  firstName: string;
  email: string;
  subscribe: boolean;
  track: "b2c" | "b2b";
  resultType: string;
  headline: string;
  subhead?: string;
  answers: Record<string, string | string[]>;
  recommendations: RecGroup[];
  strongestNextStep?: { name: string; url: string; label: string } | null;
  relatedContent?: ContentItem[];
}

async function ghlRequest(apiKey: string, path: string, method = "GET", body?: unknown) {
  const response = await fetch(`${GHL_BASE}${path}`, {
    method, headers: ghlHeaders(apiKey), ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`GHL request failed [${response.status}]: ${await response.text()}`);
  return response.status === 204 ? {} : response.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body.firstName || !body.email || !body.resultType) {
      return new Response(JSON.stringify({ error: "firstName, email, resultType required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let contactId: string | null = null;
    let crmStatus = "failed";
    const apiKey = Deno.env.get("GHL_API_KEY");
    const locationId = Deno.env.get("GHL_LOCATION_ID");
    if (apiKey && locationId) {
      try {
        contactId = await saveQuizContact((path, method, data) => ghlRequest(apiKey, path, method, data), locationId, body);
        crmStatus = "saved";
      } catch (error) {
        console.error("Quiz CRM save failed (continuing with email):", error);
      }
    } else {
      console.error("Quiz CRM credentials unavailable");
    }

    // Always email results to user
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Email credentials unavailable");
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: emailData, error: emailErr } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "path-finder-results",
        recipientEmail: body.email,
        idempotencyKey: `path-finder-${body.email}-${Date.now()}`,
        templateData: {
          firstName: body.firstName,
          headline: body.headline,
          subhead: body.subhead ?? "",
          resultType: body.resultType,
          track: body.track,
          strongestNextStep: body.strongestNextStep,
          recommendations: body.recommendations,
          relatedContent: body.relatedContent ?? [],
        },
      },
    });
    if (emailErr || emailData?.error || emailData?.success === false) throw new Error("Results email queue failed");

    return new Response(JSON.stringify({ ok: true, contactId, crmStatus, subscribed: body.subscribe }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("submit-path-finder-quiz error:", msg);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
