import { CONDITION_NAMES } from "../../src/lib/conditions.js";

export type PhaseKey = "menstrual" | "follicular" | "ovulatory" | "luteal";

const PHASE_LABEL: Record<PhaseKey, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

/** What the browser sends. Everything is re-validated here — the server never trusts it as-is. */
export type DietPlanRequest = {
  days: 7 | 14;
  phase: PhaseKey;
  cuisines: string[];
  kcalTarget: number | null;
  profile: {
    age?: string;
    dietary_preference?: string;
    food_allergies?: string;
    primary_goal?: string;
    conditions?: string[];
    symptoms?: string[];
  };
};

const clip = (v: unknown, max = 120): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const clipList = (v: unknown, maxItems = 12): string[] =>
  Array.isArray(v) ? v.map((x) => clip(x, 60)).filter(Boolean).slice(0, maxItems) : [];

export function parseRequest(body: unknown): DietPlanRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.days !== 7 && b.days !== 14) return null;
  if (typeof b.phase !== "string" || !(b.phase in PHASE_LABEL)) return null;
  const p = (b.profile && typeof b.profile === "object" ? b.profile : {}) as Record<string, unknown>;
  const kcal = typeof b.kcalTarget === "number" && Number.isFinite(b.kcalTarget) ? b.kcalTarget : null;
  return {
    days: b.days,
    phase: b.phase as PhaseKey,
    cuisines: clipList(b.cuisines),
    kcalTarget: kcal === null ? null : Math.min(3500, Math.max(1200, Math.round(kcal))),
    profile: {
      age: clip(p.age, 3),
      dietary_preference: clip(p.dietary_preference, 30),
      food_allergies: clip(p.food_allergies, 200),
      primary_goal: clip(p.primary_goal, 60),
      conditions: clipList(p.conditions).filter((c) => c in CONDITION_NAMES),
      symptoms: clipList(p.symptoms, 24),
    },
  };
}

export function buildPrompt(req: DietPlanRequest): string {
  const { days, profile } = req;
  const phaseLabel = PHASE_LABEL[req.phase];
  const kcal = req.kcalTarget ?? 1650;
  // Macro split ~30% protein / 45% carbs / 25% fat
  const protein = Math.round((kcal * 0.3) / 4);
  const carbs = Math.round((kcal * 0.45) / 4);
  const fat = Math.round((kcal * 0.25) / 9);

  const conditions = (profile.conditions ?? []).map((c) => CONDITION_NAMES[c]);
  const who = [
    conditions.length > 0 ? `who has ${conditions.join(" and ")}` : "focused on hormonal balance",
    profile.age ? `aged ${profile.age}` : "",
  ].filter(Boolean).join(", ");

  const cuisineBlock = req.cuisines.length > 0
    ? `She enjoys these cuisines: ${req.cuisines.join(", ")}.\nRotate through them across the ${days} days — one cuisine per day, never the same cuisine two days in a row. Let the day's cuisine shape all 5 meals (flavour, ingredients, cooking methods).`
    : `Use a rotating variety of world cuisines — one cuisine theme per day.`;

  const rules: string[] = [];
  if (profile.dietary_preference && profile.dietary_preference !== "Omnivore") {
    rules.push(`- Diet: strictly ${profile.dietary_preference} — every meal must comply`);
  }
  if (profile.food_allergies) rules.push(`- ALLERGIES — never include: ${profile.food_allergies}`);
  if (profile.primary_goal) rules.push(`- Primary goal: ${profile.primary_goal}`);
  if (profile.symptoms && profile.symptoms.length > 0) {
    rules.push(`- Help ease these symptoms where food can: ${profile.symptoms.join(", ")}`);
  }

  return `You are a nutritionist building a hormone-friendly ${days}-day meal plan for a woman ${who}, currently in the ${phaseLabel} phase of her menstrual cycle.

${cuisineBlock}

Plan exactly ${days} days, numbered 1 to ${days}, each with five meals in this order: Breakfast, Mid-morning snack, Lunch, Afternoon snack, Dinner.

Rules:
- Every dish name is unique across all ${days} days
- Vary protein sources, cooking methods, and flavour profiles day to day
- All meals are anti-inflammatory and support the ${phaseLabel} phase
- Daily calorie total: ${kcal - 100}–${kcal + 100} kcal
- Macro targets: protein ~${protein} g, carbs ~${carbs} g, fat ~${fat} g
${rules.length > 0 ? rules.join("\n") + "\n" : ""}- Prioritise leafy greens, oily fish or plant omega-3s, legumes, whole grains, seeds, healthy fats, antioxidants
- Avoid refined sugar, ultra-processed foods, trans fats, excess caffeine
- List ingredients as plain grocery items (e.g. "spinach", "red lentils"), without quantities, so they can be merged into a shopping list
- prep_note is one or two sentences on how to make the dish
- date_label is "Day N"`;
}

const MEAL = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["Breakfast", "Mid-morning snack", "Lunch", "Afternoon snack", "Dinner"] },
    name: { type: "string" },
    description: { type: "string" },
    ingredients: { type: "array", items: { type: "string" } },
    calories: { type: "integer" },
    tags: { type: "array", items: { type: "string" } },
    prep_note: { type: "string" },
  },
  required: ["type", "name", "description", "ingredients", "calories", "tags", "prep_note"],
  additionalProperties: false,
} as const;

/** Structured-outputs schema — the response is guaranteed to parse into DayPlan[]. */
export const PLAN_SCHEMA = {
  type: "object",
  properties: {
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "integer" },
          date_label: { type: "string" },
          cuisine_of_day: { type: "string" },
          total_calories: { type: "integer" },
          macros: {
            type: "object",
            properties: {
              protein: { type: "integer" },
              carbs: { type: "integer" },
              fat: { type: "integer" },
            },
            required: ["protein", "carbs", "fat"],
            additionalProperties: false,
          },
          meals: { type: "array", items: MEAL },
        },
        required: ["day", "date_label", "cuisine_of_day", "total_calories", "macros", "meals"],
        additionalProperties: false,
      },
    },
  },
  required: ["days"],
  additionalProperties: false,
};
