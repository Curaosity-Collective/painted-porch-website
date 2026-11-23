import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { ensureInviteProfile } from "./profile.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is authenticated and is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) throw new Error("Account setup is temporarily unavailable.");

    // Client with caller's JWT to check their role
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { email, fullName, role } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["admin", "editor", "contributor"];
    const assignedRole = validRoles.includes(role) ? role : "editor";

    const normalizedEmail = String(email).trim().toLowerCase();
    const profileStore = {
      async find(id: string) {
        const { data, error } = await adminClient.from("profiles").select("id").eq("id", id).maybeSingle();
        return { exists: Boolean(data), error: error?.message };
      },
      async create(values: { id: string; email: string; full_name: string }) {
        const { error } = await adminClient.from("profiles").insert(values);
        return { error: error?.message };
      },
    };

    // A previous create may have left an Auth account without its profile.
    let existingUser: { id: string; email?: string } | undefined;
    for (let page = 1; ; page++) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error("Unable to check existing accounts.");
      existingUser = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
      if (existingUser || data.users.length < 1000) break;
    }
    if (existingUser) {
      const profile = await profileStore.find(existingUser.id);
      if (profile.error) throw new Error("Unable to check the account's profile.");
      if (profile.exists || assignedRole !== "editor") {
        return new Response(JSON.stringify({ error: "A user with this email address has already been registered" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await ensureInviteProfile(profileStore, { id: existingUser.id, email: normalizedEmail }, fullName || "");
      const { error } = await callerClient.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: "https://onthepaintedporch.com/reset-password" });
      if (error) throw new Error("The user is now in the Users list, but the setup email could not be sent. Use Reset password to retry.");
      return new Response(JSON.stringify({ success: true, userId: existingUser.id, emailSent: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send the managed invitation instead of silently creating a random password.
    const { data: newUser, error: createError } = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
      data: { full_name: fullName || "" },
      redirectTo: "https://onthepaintedporch.com/reset-password",
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!newUser.user) throw new Error("The invitation did not create an account.");
    await ensureInviteProfile(profileStore, { id: newUser.user.id, email: normalizedEmail }, fullName || "");

    // Update role on profile (trigger creates it with default 'editor')
    if (assignedRole !== "editor" && newUser.user) {
      const { data: savedProfile, error: roleError } = await adminClient
        .from("profiles")
        .update({ role: assignedRole })
        .eq("id", newUser.user.id)
        .select("id")
        .single();
      if (roleError || !savedProfile) throw new Error("The invitation was sent, but the requested role could not be saved. Edit the user in the Users list.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUser.user.id,
        emailSent: true,
        user: {
          id: newUser.user?.id,
          email: newUser.user?.email,
          role: assignedRole,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Account setup failed. Please retry." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
