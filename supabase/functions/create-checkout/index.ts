import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Blue Door checkout — retired.
//
// The self-guided Blue Door appraisal is no longer sold (PPS-DEC-0017 in
// pps-ops-hub docs/decisions). This function used to create a $1,500 Stripe
// Checkout session; it now refuses every request on the server, so an old
// bookmarked purchase page or a direct call cannot create a purchase.
//
// Existing purchasers are unaffected: `stripe-blue-door-webhook`, the
// purchase-confirmation email, `/blue-door/success` and the refund route are
// kept. The previous implementation is in git history.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      error: "The Blue Door appraisal is no longer available for purchase.",
      next: "https://onthepaintedporch.com/envision-shift",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 410 },
  );
});
