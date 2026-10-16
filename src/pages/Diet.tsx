import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, RefreshCw, Sparkles } from "lucide-react";
import { CalorieRing } from "../components/CalorieRing";
import { MealCard } from "../components/MealCard";
import type { MealCardProps } from "../components/MealCard";
import { PHASE_META } from "../types/cycle";
import type { CyclePhaseKey } from "../types/cycle";
import { useCuisinePrefs } from "../hooks/useCuisinePrefs";
import { useProfileData } from "../hooks/useProfileData";
import { authHeader } from "../lib/cloudSync";
import { CONDITION_NAMES, loadStoredProfile } from "../lib/profileStore";
import { useTargets } from "../hooks/useTargets";
import { goalLabel } from "../lib/goals";
import type { DailyTargets } from "../lib/targets";
import { loadLocalPlan, saveLocalPlan, todayPlanIndex } from "../lib/dietPlanStore";
import type { DayPlan, MealItem, StoredDietPlan } from "../lib/dietPlanStore";

// ─── Constants ────────────────────────────────────────────────────────────────

const CUISINE_EMOJI: Record<string, string> = {
  "South Indian": "🇮🇳", "North Indian": "🇮🇳", "Mexican": "🇲🇽",
  "Mediterranean": "🫒", "Japanese": "🇯🇵", "Chinese": "🇨🇳",
  "Korean": "🇰🇷", "Thai": "🇹🇭", "Middle Eastern": "🇱🇧",
  "Italian": "🇮🇹", "Greek": "🇬🇷", "American": "🇺🇸",
  "Brazilian": "🇧🇷", "Spanish": "🇪🇸", "French": "🇫🇷",
  "Vietnamese": "🇻🇳", "Ethiopian": "🇪🇹", "Moroccan": "🇲🇦",
  "West African": "🌍", "Pakistani": "🇵🇰", "Singaporean": "🇸🇬",
  "Mix of everything": "🔀",
};

const MEAL_TONE: Record<string, MealCardProps["timeTone"]> = {
  "Breakfast": "primary",
  "Mid-morning snack": "orange",
  "Lunch": "accent",
  "Afternoon snack": "orange",
  "Dinner": "green",
};

const PHASE_FOODS: Record<string, { prioritise: string[]; limit: string[] }> = {
  menstrual:  { prioritise: ["Iron-rich foods", "Leafy greens", "Dark chocolate", "Ginger", "Turmeric", "Legumes"], limit: ["Excess salt", "Alcohol", "Caffeine", "Refined sugar"] },
  follicular: { prioritise: ["Leafy greens", "Fermented foods", "Flaxseeds", "Broccoli", "Eggs", "Legumes"], limit: ["Refined carbs", "Fried foods", "Excess alcohol"] },
  ovulatory:  { prioritise: ["Leafy greens", "Oily fish", "Legumes", "Berries", "Seeds", "Olive oil"], limit: ["Ultra-processed snacks", "Sweetened drinks", "Excess caffeine", "Fried foods"] },
  luteal:     { prioritise: ["Magnesium-rich foods", "Complex carbs", "Dark chocolate", "Nuts & seeds", "Pumpkin seeds", "Bananas"], limit: ["Salt", "Caffeine", "Alcohol", "Refined sugar"] },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayLabels(count: number, startDate?: string): string[] {
  const [y, m, day] = (startDate ?? "").split("-").map(Number);
  const start = startDate ? new Date(y, m - 1, day) : new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
  });
}

function mealToCardProps(meal: MealItem): MealCardProps {
  return {
    timeLabel: meal.type,
    timeTone: MEAL_TONE[meal.type] ?? "primary",
    title: meal.name,
    ingredients: meal.ingredients,
    calories: meal.calories,
    tags: meal.tags,
    recipe: meal.prep_note,
  };
}

// ─── Persistence ──────────────────────────────────────────────────────────────
// The latest plan is pulled from the cloud at sign-in (lib/cloudSync) and the server
// saves each new plan to the database, so this page only reads/writes the local copy.

async function loadSavedPlan(): Promise<StoredDietPlan | null> {
  return loadLocalPlan();
}

async function persistPlan(plan: DayPlan[], duration: number, cuisines: string[]): Promise<void> {
  saveLocalPlan(plan, duration, cuisines);
}

// ─── AI call ─────────────────────────────────────────────────────────────────
// The prompt is built server-side in api/diet-plan.ts, which also holds the API key.

function localISODate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchDietPlan(days: 7 | 14, phase: CyclePhaseKey, cuisines: string[], targets: DailyTargets): Promise<DayPlan[]> {
  const profile = loadStoredProfile();
  const res = await fetch("/api/diet-plan", {
    method: "POST",
    headers: { "content-type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({
      days,
      startDate: localISODate(),
      phase,
      cuisines,
      kcalTarget: targets.kcal,
      macros: targets.macros,
      goal: targets.goal,
      profile: {
        age: profile.age,
        dietary_preference: profile.dietary_preference,
        food_allergies: profile.food_allergies,
        conditions: profile.conditions,
        symptoms: profile.symptoms,
      },
    }),
  });

  const data = (await res.json().catch(() => null)) as { days?: DayPlan[]; error?: string } | null;
  if (!res.ok || !data?.days) {
    throw new Error(data?.error ?? `Generation failed (${res.status}). Please try again.`);
  }
  return data.days;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Diet() {
  const { phase } = useProfileData();
  const profile = useMemo(loadStoredProfile, []);
  const targets = useTargets();
  const kcalTarget = targets.kcal;
  const conditionLabel = (profile.conditions ?? []).map((c) => CONDITION_NAMES[c]?.replace(/^an? /, "")).filter(Boolean).join(" & ");
  const phaseLabel = PHASE_META[phase].label;
  const phaseFoods = PHASE_FOODS[phase];

  const { prefs: cuisinePrefs } = useCuisinePrefs();
  const cuisines = cuisinePrefs.cuisines;

  const [duration, setDuration] = useState<"7" | "14" | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<DayPlan[] | null>(null);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [fadeKey, setFadeKey] = useState(0);

  const prevDayIdxRef = useRef(dayIdx);

  // Load saved plan from Supabase on first mount
  useEffect(() => {
    loadSavedPlan()
      .then((saved) => {
        if (saved) {
          setGeneratedPlan(saved.plan);
          setStartDate(saved.startDate);
          setDuration(saved.duration === 14 ? "14" : "7");
          setDayIdx(todayPlanIndex(saved) ?? 0);
        }
      })
      .finally(() => setLoadingPlan(false));
  }, []);

  // Trigger fade animation when day changes
  useEffect(() => {
    if (prevDayIdxRef.current !== dayIdx) {
      setFadeKey((k) => k + 1);
      prevDayIdxRef.current = dayIdx;
    }
  }, [dayIdx]);

  const currentDay = generatedPlan?.[dayIdx];
  const meals = currentDay?.meals ?? [];
  const totalCalories = currentDay?.total_calories ?? 0;
  const macros = currentDay?.macros ?? { protein: 0, carbs: 0, fat: 0 };
  const cuisineEmoji = currentDay ? (CUISINE_EMOJI[currentDay.cuisine_of_day] ?? "🍽️") : "";

  const dayLabels = useMemo(
    () => getDayLabels(generatedPlan?.length ?? (duration === "14" ? 14 : 7), startDate),
    [generatedPlan, duration, startDate],
  );

  async function handleGenerate() {
    if (!duration) return;
    setGenerating(true);
    setError(null);
    try {
      const days = duration === "14" ? 14 : 7;
      const plan = await fetchDietPlan(days, phase, cuisines, targets);
      setGeneratedPlan(plan);
      setStartDate(undefined);
      setDayIdx(0);
      setFadeKey((k) => k + 1);
      await persistPlan(plan, days, cuisines);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate() {
    if (!duration || regenerating) return;
    setRegenerating(true);
    setError(null);
    try {
      const days = duration === "14" ? 14 : 7;
      const plan = await fetchDietPlan(days, phase, cuisines, targets);
      setGeneratedPlan(plan);
      setStartDate(undefined);
      setDayIdx(0);
      setFadeKey((k) => k + 1);
      await persistPlan(plan, days, cuisines);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regeneration failed. Please try again.");
    } finally {
      setRegenerating(false);
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loadingPlan) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-card bg-border/60" />
        <div className="h-48 animate-pulse rounded-card bg-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-dark">My Diet</h1>
          <p className="text-sm text-ink-mid">Personalised for your {phaseLabel} phase energy</p>
        </div>
        {generatedPlan && (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 rounded-btn border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
          >
            {regenerating
              ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border border-primary/40 border-t-primary" /> Regenerating…</>
              : <><RefreshCw className="h-3.5 w-3.5" /> Regenerate plan</>
            }
          </button>
        )}
      </div>

      {/* ── No plan yet ──────────────────────────────────────────────────────── */}
      {!generatedPlan && (
        <div className="space-y-5">

          {/* Cuisine hint */}
          {cuisines.length > 0 && (
            <div className="rounded-card border border-accent-light/50 bg-accent-pale px-4 py-3 text-sm text-ink-mid">
              <span className="font-semibold text-ink-dark">Your cuisines: </span>
              {cuisines.map(c => `${CUISINE_EMOJI[c] ?? ""} ${c}`).join(" · ")}
            </div>
          )}

          {/* Duration cards */}
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                { k: "7" as const, label: "1 Week Plan", sub: "7 days of varied meals" },
                { k: "14" as const, label: "2 Week Plan", sub: "14 days, maximum variety" },
              ] as const
            ).map((opt) => {
              const sel = duration === opt.k;
              return (
                <button
                  key={opt.k}
                  type="button"
                  onClick={() => setDuration(opt.k)}
                  className={`relative rounded-card border-2 p-5 text-left transition-all duration-200 btn-press ${
                    sel
                      ? "border-primary bg-primary text-white shadow-card"
                      : "border-primary/40 bg-white text-ink-dark hover:border-primary hover:shadow-card"
                  }`}
                >
                  {sel && (
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
                      <Check className="h-4 w-4 text-white" />
                    </span>
                  )}
                  <p className={`font-display text-lg font-bold leading-tight ${sel ? "text-white" : "text-ink-dark"}`}>
                    {opt.label}
                  </p>
                  <p className={`mt-1 text-sm ${sel ? "text-white/80" : "text-ink-mid"}`}>{opt.sub}</p>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="rounded-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!duration || generating}
            className="btn-press flex h-14 w-full items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-primary to-accent font-display text-base font-bold text-white shadow-card transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:shadow-card-hover"
          >
            {generating ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Building your {duration}-day plan…
              </>
            ) : (
              <>
                Generate My Diet Plan <Sparkles className="h-5 w-5" />
              </>
            )}
          </button>

          {generating && (
            <p className="animate-pulse text-center text-xs text-ink-soft">
              Claude is crafting {duration === "14" ? "14" : "7"} days of unique, hormone-friendly meals — this takes about 1–2 minutes.
            </p>
          )}
        </div>
      )}

      {/* ── Plan exists ───────────────────────────────────────────────────────── */}
      {generatedPlan && (
        <>
          {/* Regenerate error */}
          {error && (
            <div className="rounded-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Calorie ring + macros */}
          <div className="rounded-card border border-primary/15 bg-gradient-to-r from-primary-pale to-white p-5 shadow-card transition-all duration-300">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
              <CalorieRing value={totalCalories} max={Math.max(totalCalories, (kcalTarget ?? 1650) + 300)} />
              <div className="grid w-full max-w-md grid-cols-3 gap-3">
                <div className="rounded-card bg-white/80 p-3 text-center shadow-sm">
                  <p className="text-xs font-semibold text-primary">Protein</p>
                  <p className="font-display text-xl font-bold text-ink-dark">{macros.protein}g</p>
                </div>
                <div className="rounded-card bg-white/80 p-3 text-center shadow-sm">
                  <p className="text-xs font-semibold text-accent">Carbs</p>
                  <p className="font-display text-xl font-bold text-ink-dark">{macros.carbs}g</p>
                </div>
                <div className="rounded-card bg-white/80 p-3 text-center shadow-sm">
                  <p className="text-xs font-semibold text-emerald-600">Fat</p>
                  <p className="font-display text-xl font-bold text-ink-dark">{macros.fat}g</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-ink-mid">
              {kcalTarget
                ? `Target ${kcalTarget.toLocaleString()} kcal/day for your goal: ${goalLabel(targets.goal)}`
                : "Add your age, weight & height in Profile for a personal calorie target"}
              {conditionLabel && ` · tuned for ${conditionLabel}`}
            </p>
          </div>

          {/* Day tabs */}
          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2 px-1">
              {dayLabels.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDayIdx(i)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 btn-press ${
                    dayIdx === i
                      ? "bg-primary text-white shadow-card"
                      : "border border-primary/30 bg-white text-ink-mid hover:border-primary/60"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine badge + meal cards — keyed so they fade in on day switch */}
          <div key={fadeKey} className="space-y-4 animate-fade-in">
            {currentDay && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent-pale px-3 py-1.5 text-sm font-semibold text-accent">
                  {cuisineEmoji} {currentDay.cuisine_of_day} day
                </span>
              </div>
            )}
            {meals.map((m) => (
              <MealCard key={`${fadeKey}-${m.name}`} {...mealToCardProps(m)} />
            ))}
          </div>

          {/* Phase foods */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <h3 className="font-display font-bold text-ink-dark">Foods to Prioritise this Phase</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {phaseFoods.prioritise.map((x) => (
                  <span key={x} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <h3 className="font-display font-bold text-ink-dark">Foods to Limit this Phase</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {phaseFoods.limit.map((x) => (
                  <span key={x} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Grocery CTA */}
          <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-white/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
            <Link
              to="/grocery"
              className="btn-press flex w-full items-center justify-center rounded-btn bg-gradient-to-r from-primary to-accent py-3.5 font-display font-bold text-white shadow-card hover:shadow-card-hover md:max-w-xl"
            >
              Add this week&apos;s ingredients to Grocery List 🛒
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
