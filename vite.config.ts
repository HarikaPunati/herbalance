import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { POST as dietPlan } from "./api/diet-plan";

// Serves /api/diet-plan during `npm run dev` with the same handler Vercel runs in production.
function localApi(): Plugin {
  return {
    name: "herbalance-local-api",
    configureServer(server) {
      server.middlewares.use("/api/diet-plan", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const response = await dietPlan(
          new Request("http://localhost/api/diet-plan", {
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
  for (const k of ["ANTHROPIC_API_KEY", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "DIET_PLANS_PER_WEEK"]) {
    if (env[k]) process.env[k] = env[k];
  }

  return {
    plugins: [react(), localApi()],
  };
});
