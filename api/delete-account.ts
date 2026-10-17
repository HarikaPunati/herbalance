import { createClient } from "@supabase/supabase-js";

// POST /api/delete-account — permanently deletes the signed-in user's account.
// The caller proves who they are with their session token; only then does the server use
// the Supabase secret key (never sent to the browser) to delete that one user. Their
// profile, diet plans and workout logs go with it via "on delete cascade".

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export async function POST(request: Request): Promise<Response> {
  const url = process.env.VITE_SUPABASE_URL?.trim().replace(/\/(rest|auth)\/v1\/?$/, "").replace(/\/+$/, "");
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !publicKey || !secretKey) {
    return json({ error: "Account deletion isn't set up on the server yet. Please try again later." }, 500);
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Please sign in first." }, 401);

  const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
  const { data, error } = await createClient(url, publicKey, noSession).auth.getUser(token);
  if (error || !data.user) return json({ error: "Your session has expired — please sign in again." }, 401);

  const admin = createClient(url, secretKey, noSession);
  const { error: delError } = await admin.auth.admin.deleteUser(data.user.id);
  if (delError) {
    console.error("delete-account failed:", delError.message);
    return json({ error: "We couldn't delete your account. Please try again." }, 500);
  }
  return json({ deleted: true });
}
