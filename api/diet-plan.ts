import Anthropic from "@anthropic-ai/sdk";
import type { DayPlan } from "../src/lib/dietPlanStore";
import { PLAN_SCHEMA, buildPrompt, parseRequest } from "./_lib/dietPrompt.js";

// POST /api/diet-plan — runs on Vercel (and through the Vite dev middleware locally).
// The Anthropic key lives only here, in ANTHROPIC_API_KEY; the browser never sees it.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "The diet generator isn't set up yet — ANTHROPIC_API_KEY is missing on the server." }, 500);
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
    return json({ days });
  } catch (error) {
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
