import Anthropic from "@anthropic-ai/sdk";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DayPlan } from "../src/lib/dietPlanStore";
import { PLAN_SCHEMA, buildPrompt, parseRequest } from "./_lib/dietPrompt.js";

// POST /api/diet-plan — runs on Vercel (and through the Vite dev middleware locally).
// The Anthropic key lives only here, in ANTHROPIC_API_KEY; the browser never sees it.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// Plans each user may generate per rolling 7 days (protects your API credits).
const WEEKLY_LIMIT = Number(process.env.DIET_PLANS_PER_WEEK ?? 3);

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "The diet generator isn't set up yet — ANTHROPIC_API_KEY is missing on the server." }, 500);
  }

  // When Supabase is configured, only signed-in users can generate plans.
  const sbUrl = process.env.VITE_SUPABASE_URL;
  const sbKey = process.env.VITE_SUPABASE_ANON_KEY;
  let db: SupabaseClient | null = null;
  let userId: string | null = null;
  if (sbUrl && sbKey) {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Please sign in to generate a plan." }, 401);
    // Acting with the user's own token means row-level security applies to every query below.
    db = createClient(sbUrl, sbKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return json({ error: "Your session has expired — please sign in again." }, 401);
    userId = data.user.id;

    const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const { count } = await db
      .from("diet_plans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);
    if ((count ?? 0) >= WEEKLY_LIMIT) {
      return json({ error: `You've used all ${WEEKLY_LIMIT} plan generations for this week. Your current plan is still saved — try again in a few days.` }, 429);
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  const req = parseRequest(body);
  if (!req) return json({ error: "Invalid request." }, 400);

  const client = new Anthropic();

  try {
    // Streaming keeps the long (~10–20k token) generation from hitting HTTP timeouts;
    // finalMessage() hands back the complete response.
    const stream = client.beta.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: 64000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // if the model declines, Anthropic retries on its recommended fallback model
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: PLAN_SCHEMA },
      },
      messages: [{ role: "user", content: buildPrompt(req) }],
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      return json({ error: "Claude couldn't create this plan. Try adjusting your profile notes and generate again." }, 422);
    }
    if (message.stop_reason === "max_tokens") {
      return json({ error: "The plan came back incomplete. Please try again." }, 502);
    }

    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return json({ error: "Empty response from Claude. Please try again." }, 502);

    const parsed = JSON.parse(text.text) as { days: DayPlan[] };
    const days = parsed.days.slice(0, req.days);
    if (days.length === 0) return json({ error: "Empty plan. Please try again." }, 502);

    if (db && userId) {
      const { error: saveError } = await db.from("diet_plans").insert({
        user_id: userId,
        duration: req.days,
        cuisines: req.cuisines,
        start_date: req.startDate,
        plan: days,
      });
      if (saveError) console.error("diet-plan save failed:", saveError.message);
    }
    return json({ days });
  } catch (error) {
    // Shows up in Vercel → Logs. Error messages from the API never contain the key.
    console.error("diet-plan failed:", error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error);
    if (error instanceof Anthropic.AuthenticationError) {
      return json({ error: "The server's Anthropic API key is invalid." }, 500);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return json({ error: "Too many plans are being generated right now. Please wait a minute and retry." }, 429);
    }
    if (error instanceof Anthropic.APIError) {
      return json({ error: `Claude API error (${error.status ?? "network"}). Please try again.` }, 502);
    }
    return json({ error: "Something went wrong generating your plan. Please try again." }, 500);
  }
}
