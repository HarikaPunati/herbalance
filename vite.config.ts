import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { POST as dietPlan } from "./api/diet-plan";
import { POST as deleteAccount } from "./api/delete-account";
import vercelConfig from "./vercel.json";

// `vite preview` sends the same security headers as production, so they can be tested locally.
const PROD_HEADERS = Object.fromEntries(vercelConfig.headers[0].headers.map((h) => [h.key, h.value]));

const ROUTES: Record<string, (req: Request) => Promise<Response>> = {
  "/api/diet-plan": dietPlan,
  "/api/delete-account": deleteAccount,
};

// Serves the /api functions during `npm run dev` with the same handlers Vercel runs in production.
function localApi(): Plugin {
  return {
    name: "herbalance-local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handler = ROUTES[(req.url ?? "").split("?")[0]];
        if (!handler) return next();
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const response = await handler(
          new Request(`http://localhost${req.url}`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              ...(req.headers.authorization ? { authorization: req.headers.authorization } : {}),
            },
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
        res.statusCode = response.status;
        res.setHeader("content-type", response.headers.get("content-type") ?? "application/json");
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_-prefixed) so the local API sees ANTHROPIC_API_KEY
  const env = loadEnv(mode, process.cwd(), "");
  for (const k of ["ANTHROPIC_API_KEY", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "SUPABASE_SECRET_KEY", "DIET_PLANS_PER_WEEK"]) {
    if (env[k]) process.env[k] = env[k];
  }

  return {
    plugins: [react(), localApi()],
    preview: { headers: PROD_HEADERS },
  };
});
