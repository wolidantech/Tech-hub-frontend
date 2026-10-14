// Invite/create a lecturer account. Runs ONLY as a Supabase Edge Function:
// SUPABASE_SERVICE_ROLE_KEY is provided by the platform at runtime and is
// never present in browser code. Deploy:
//   supabase functions deploy invite-lecturer
// The caller must present an admin user's JWT; role is verified against
// public.profiles (never user_metadata, which users can edit themselves).
import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return json({ error: "Invitation service is not configured on the server." }, 503);

  const authHeader = req.headers.get("Authorization") || "";
  const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await caller.auth.getUser();
  if (userErr || !userData.user) return json({ error: "Sign in as an administrator first." }, 401);

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: profile } = await admin.from("profiles").select("role").eq("id", userData.user.id).single();
  if (profile?.role !== "admin") return json({ error: "Admin only." }, 403);

  const { email, fullName, redirectTo } = await req.json().catch(() => ({}));
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(fullName || "").trim();
  if (!cleanEmail.includes("@") || cleanName.length < 2) return json({ error: "A lecturer name and valid email are required." }, 400);

  // Record the invitation first so an email failure is visible/auditable.
  const { data: invite, error: invErr } = await admin.from("lecturer_invitations")
    .insert({ email: cleanEmail, full_name: cleanName, invited_by: userData.user.id })
    .select().single();
  if (invErr) return json({ error: invErr.message }, 400);

  const { data: invited, error: mailErr } = await admin.auth.admin.inviteUserByEmail(cleanEmail, {
    data: { full_name: cleanName, invited_role: "lecturer" },
    redirectTo: redirectTo || undefined,
  });
  if (mailErr) return json({ error: `Invitation email failed: ${mailErr.message}`, invitationId: invite.id }, 502);

  if (invited.user) {
    // handle_new_user created the profile as a student; promote it server-side.
    await admin.from("profiles").update({ role: "lecturer", lecturer_enabled: true, full_name: cleanName })
      .eq("id", invited.user.id);
    await admin.from("lecturer_invitations").update({ status: "accepted", accepted_user_id: invited.user.id }).eq("id", invite.id);
  }
  return json({ ok: true, invitationId: invite.id, userId: invited.user?.id || null });
});
