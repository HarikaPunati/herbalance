import type { CyclePhaseKey } from "../types/cycle";
import { toGoalId, type GoalId } from "./goals";

// Daily targets from goal × body × cycle phase. General wellness estimates for healthy
// adults — the UI always shows them with a "not medical advice" note.

export type TargetsInput = {
  goal?: unknown;
  age?: string;
  weight_kg?: string;
  height_cm?: string;
  activity_level?: string;
  fitness_level?: string;
  conditions?: string[];
};

export type Intensity = "gentle" | "moderate" | "high";

export type DailyTargets = {
  goal: GoalId;
  /** null when age/weight/height are missing */
  kcal: number | null;
  macros: { protein: number; carbs: number; fat: number } | null;
  waterL: number;
  steps: number;
  workout: {
    minutes: number;
    intensity: Intensity;
    focus: string;
    suggestedTypes: string[];
    sessionsPerWeek: number;
  };
  /** Short explanations shown under "Why these numbers?" */
  why: string[];
};

const ACTIVITY_FACTOR: Record<string, number> = {
  "Sedentary": 1.2,
  "Lightly active": 1.375,
  "Moderately active": 1.55,
  "Very active": 1.725,
};

type GoalRule = {
  kcalFactor: number;
  proteinPerKg: number;
  fatShare: number;
  steps: number;
  baseMinutes: number;
  sessionsPerWeek: number;
  kcalWhy: string;
};

const GOAL_RULES: Record<GoalId, GoalRule> = {
  lose_weight:      { kcalFactor: 0.82, proteinPerKg: 1.8, fatShare: 0.28, steps: 10000, baseMinutes: 45, sessionsPerWeek: 5, kcalWhy: "about 18% below your maintenance calories — a gentle deficit you can sustain" },
  gain_weight:      { kcalFactor: 1.12, proteinPerKg: 1.6, fatShare: 0.3,  steps: 7000,  baseMinutes: 40, sessionsPerWeek: 4, kcalWhy: "about 12% above maintenance so you gain steadily, mostly as muscle with strength work" },
  build_strength:   { kcalFactor: 1.07, proteinPerKg: 2.0, fatShare: 0.27, steps: 7500,  baseMinutes: 50, sessionsPerWeek: 4, kcalWhy: "a small surplus (~7%) to fuel muscle growth" },
  get_fit:          { kcalFactor: 0.92, proteinPerKg: 1.8, fatShare: 0.28, steps: 9000,  baseMinutes: 45, sessionsPerWeek: 5, kcalWhy: "a small deficit (~8%) to lean out while you build fitness" },
  manage_symptoms:  { kcalFactor: 1.0,  proteinPerKg: 1.5, fatShare: 0.3,  steps: 8000,  baseMinutes: 35, sessionsPerWeek: 4, kcalWhy: "your maintenance calories — steady energy supports hormone balance" },
  boost_energy:     { kcalFactor: 1.0,  proteinPerKg: 1.5, fatShare: 0.28, steps: 8000,  baseMinutes: 35, sessionsPerWeek: 4, kcalWhy: "your maintenance calories, so you're never running on empty" },
  cycle_regularity: { kcalFactor: 1.0,  proteinPerKg: 1.5, fatShare: 0.3,  steps: 8000,  baseMinutes: 30, sessionsPerWeek: 3, kcalWhy: "your maintenance calories — under-eating can disrupt your cycle" },
  fertility:        { kcalFactor: 1.0,  proteinPerKg: 1.5, fatShare: 0.3,  steps: 8000,  baseMinutes: 30, sessionsPerWeek: 3, kcalWhy: "your maintenance calories — consistent nourishment supports ovulation" },
};

const PHASE_INTENSITY: Record<CyclePhaseKey, Intensity> = {
  menstrual: "gentle",
  follicular: "moderate",
  ovulatory: "high",
  luteal: "moderate",
};
const PHASE_MINUTES: Record<CyclePhaseKey, number> = { menstrual: 0.65, follicular: 1.0, ovulatory: 1.1, luteal: 0.85 };
// Resting energy use rises slightly after ovulation.
const PHASE_KCAL_ADD: Record<CyclePhaseKey, number> = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 100 };

type FocusPlan = { focus: string; types: string[] };

// What to train today: goal decides the "what", cycle phase decides how hard.
function focusFor(goal: GoalId, phase: CyclePhaseKey, lateLuteal: boolean): FocusPlan {
  if (phase === "menstrual" || lateLuteal) {
    return { focus: "Gentle movement & mobility — walking, yoga or light Pilates", types: ["Yoga", "Pilates", "Cardio", "Resistance Bands"] };
  }
  const strengthFirst = goal === "build_strength" || goal === "gain_weight";
  const burnFirst = goal === "lose_weight" || goal === "get_fit";
  if (phase === "ovulatory") {
    if (strengthFirst) return { focus: "Heavy strength day — aim for personal bests", types: ["Gym", "Calisthenics", "Resistance Bands"] };
    if (burnFirst) return { focus: "High-intensity intervals or a strength + cardio circuit", types: ["HIIT", "Gym", "Boxing", "Zumba/Dance"] };
    return { focus: "Your peak-energy day — a fun, energetic session", types: ["Zumba/Dance", "HIIT", "Boxing", "Gym"] };
  }
  if (phase === "follicular") {
    if (strengthFirst) return { focus: "Progressive strength training — add weight or reps", types: ["Gym", "Calisthenics", "Resistance Bands"] };
    if (burnFirst) return { focus: "Strength training plus 20 min of cardio", types: ["Gym", "HIIT", "Cardio", "Barre"] };
    return { focus: "Try something new — strength, dance or a class", types: ["Barre", "Gym", "Cardio", "Pilates"] };
  }
  // early luteal
  if (strengthFirst) return { focus: "Moderate strength — keep the weights, fewer sets", types: ["Gym", "Resistance Bands", "Pilates"] };
  if (burnFirst) return { focus: "Steady cardio and light strength — no all-out efforts", types: ["Cardio", "Pilates", "Swimming", "Resistance Bands"] };
  return { focus: "Steady, low-stress movement", types: ["Pilates", "Swimming", "Yoga", "Cardio"] };
}

export function computeTargets(p: TargetsInput, phase: CyclePhaseKey, cycleDay = 14, cycleLength = 28): DailyTargets {
  const goal = toGoalId(p.goal);
  const rule = GOAL_RULES[goal];
  const age = parseFloat(p.age ?? "");
  const weight = parseFloat(p.weight_kg ?? "");
  const height = parseFloat(p.height_cm ?? "");
  const lateLuteal = phase === "luteal" && cycleDay > cycleLength - 5;
  const why: string[] = [];

  // Calories: Mifflin-St Jeor (female) × activity → goal adjustment → luteal top-up
  let kcal: number | null = null;
  let macros: DailyTargets["macros"] = null;
  if (age && weight && height) {
    const bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    const maintenance = bmr * (ACTIVITY_FACTOR[p.activity_level ?? ""] ?? 1.55);
    const raw = maintenance * rule.kcalFactor + PHASE_KCAL_ADD[phase];
    // Never below resting needs (or 1200) — very low intakes harm hormones and the cycle.
    kcal = Math.round(Math.max(raw, bmr, 1200) / 10) * 10;
    why.push(`Calories: ${rule.kcalWhy}.`);
    if (PHASE_KCAL_ADD[phase] > 0) why.push("+100 kcal in your luteal phase, when your body burns slightly more at rest.");

    const protein = Math.round(weight * rule.proteinPerKg);
    const fat = Math.round((kcal * rule.fatShare) / 9);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    macros = { protein, carbs, fat };
    why.push(`Protein: ${rule.proteinPerKg} g per kg of body weight for your goal.`);
  }

  // Workout minutes and intensity
  const fitnessAdj = p.fitness_level === "Beginner" ? -10 : p.fitness_level === "Advanced" ? 10 : 0;
  const minutes = Math.max(15, Math.round(((rule.baseMinutes + fitnessAdj) * (lateLuteal ? 0.7 : PHASE_MINUTES[phase])) / 5) * 5);
  const intensity: Intensity = lateLuteal ? "gentle" : PHASE_INTENSITY[phase];
  const plan = focusFor(goal, phase, lateLuteal);
  why.push(`Workout: ${intensity} intensity because of your ${lateLuteal ? "late luteal" : phase} phase.`);

  // Water: ~33 ml/kg, +0.35 L per 30 min of exercise, +0.25 L in luteal/menstrual phases
  const base = weight ? weight * 0.033 : 2.0;
  const waterL = Math.min(4, Math.round((base + (minutes / 30) * 0.35 + (phase === "luteal" || phase === "menstrual" ? 0.25 : 0)) * 10) / 10);
  why.push(`Water: ${weight ? "about 33 ml per kg of body weight" : "a 2 L baseline (add your weight for a personal number)"}, plus extra for today's workout.`);

  const steps = Math.max(5000, rule.steps - (phase === "menstrual" ? 2000 : lateLuteal ? 1000 : 0));

  return {
    goal,
    kcal,
    macros,
    waterL,
    steps,
    workout: { minutes, intensity, focus: plan.focus, suggestedTypes: plan.types, sessionsPerWeek: rule.sessionsPerWeek },
    why,
  };
}
