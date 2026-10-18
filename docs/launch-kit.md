# HerBalance launch kit

Drafts only — nothing here has been applied or posted. Copy, edit and use what you like.

## 1. GitHub "About" box

Repo page → gear icon next to **About**.

- **Description** (under 350 characters):
  > Cycle-synced wellness app: AI meal plans, goal-based calorie/water/workout targets and a smart grocery list for women managing PCOS/PMOS and hormonal health. React + TypeScript, Supabase, Vercel, Claude API.
- **Website:** `https://herbalance-five.vercel.app`
- **Topics:** `react` `typescript` `vite` `tailwindcss` `supabase` `vercel` `serverless` `claude-api` `anthropic` `ai` `womens-health` `pcos` `cycle-syncing` `nutrition` `health-tech` `full-stack`
- Tick **"Use your GitHub Pages website"** only if you ever set one up — leave it off for now.

## 2. Your clicks to go public (in this order)

1. **Settings → General → scroll to "Danger Zone" → Change visibility → Make public.** GitHub asks you to type the repo name to confirm.
2. **About gear** → paste the description, website and topics above → Save.
3. **Your profile → Customize your pins → tick herbalance → Save pins.**
4. Optional: add HerBalance to your profile README (`HarikaPunati/HarikaPunati`) as a featured project with the live link.

## 3. Before you share widely

- [ ] Set a monthly spending limit: Claude Console → Billing → Limits (each 7-day plan costs about $0.30–0.40).
- [ ] Decide the weekly plan limit for strangers: Vercel → Environment Variables → `DIET_PLANS_PER_WEEK` (default 3; 1 is safer for a public launch) → Redeploy.
- [ ] Open the app at least weekly, or Supabase's free plan pauses the database after about a week of no activity.
- [ ] Gmail sends about 500 emails a day — fine for a launch.
- [ ] Have 2–3 friends sign up on their phones first.

## 4. LinkedIn post

> I built and shipped a full-stack AI web app: **HerBalance** 🪷
>
> Most nutrition and fitness apps treat women's bodies as if nothing changes across the month. For anyone managing PCOS, a thyroid condition or just a real cycle, that's the wrong model.
>
> HerBalance plans meals, workouts, water and calorie targets around your cycle phase and your goal:
> • Pick a goal (lose weight, build strength, manage symptoms…) and get targets with the reasoning behind every number
> • AI meal plans for your phase, conditions, allergies and favourite cuisines (Claude API)
> • A grocery list built from the plan, merged and sorted by aisle, downloadable as a PDF
> • Secure accounts: row-level security, server-side API keys, self-serve data deletion
>
> Built with React, TypeScript, Supabase and Vercel serverless functions. The hardest (and most useful) part wasn't the UI — it was taking it from "works on my laptop" to a live, multi-user app: auth emails, API billing, security headers and debugging production-only failures from logs.
>
> 🔗 Try it: https://herbalance-five.vercel.app
> 💻 Code: https://github.com/HarikaPunati/herbalance
>
> I'd love feedback — especially from anyone who cycle-syncs or manages PCOS/PMOS. It's general wellness guidance, not medical advice.
>
> #WomenInTech #DataAnalytics #React #AI #HealthTech #PCOS

Post this only after the repo is public, or the code link shows a 404. Tip: attach the four screenshots from `docs/screenshots/` (Dashboard first) — posts with images get far more reach than links alone.

## 5. Resume bullets

Pick one; the first is the most complete.

- **HerBalance — cycle-synced wellness web app** (React, TypeScript, Supabase, Vercel, Claude API) · [herbalance-five.vercel.app](https://herbalance-five.vercel.app)
  Built and deployed a multi-user health app that generates AI meal plans and goal-based calorie, macro, water and workout targets from each user's menstrual phase; secured it with row-level security, server-side API keys and CSP headers.
- Designed a grocery-list engine that categorises and merges AI-generated ingredients, cutting a week's list from 141 to 95 items; added PDF export and native sharing.
- Shipped a production React/TypeScript app end to end — Supabase auth and Postgres with row-level security, Vercel serverless functions calling the Claude API, and automated deploys from GitHub.

## 6. Things worth knowing

- **Secrets scan (Oct 18, 2026):** all 16 commits and 131 file versions were scanned for API keys, secret keys, service-role tokens, private keys and passwords — nothing found, and `.env` was never committed. No keys of any kind are in the repo; they all live in Vercel's settings.
- **Commit author emails:** 13 commits use your private GitHub noreply address; the first 3 (Oct 14) show `harikapunati@Harikas-MacBook-Air.local`, which reveals your Mac's name but no real email. Harmless, but rewriting it would mean force-pushing history — not recommended for this.
- **No license yet.** Without one, the code is viewable but others aren't legally allowed to reuse it. That's a fine default for a portfolio project; add an MIT license later if you want people to reuse it.
