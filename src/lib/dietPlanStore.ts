export type MealType = "Breakfast" | "Mid-morning snack" | "Lunch" | "Afternoon snack" | "Dinner";

export type MealItem = {
  type: MealType;
  name: string;
  description: string;
  ingredients: string[];
  calories: number;
  tags: string[];
  prep_note: string;
};

export type DayPlan = {
  day: number;
  date_label: string;
  cuisine_of_day: string;
  total_calories: number;
  macros: { protein: number; carbs: number; fat: number };
  meals: MealItem[];
};

export type StoredDietPlan = {
  plan: DayPlan[];
  duration: number;
  cuisines: string[];
  /** YYYY-MM-DD of plan day 1 */
  startDate: string;
};

const KEY = "herbalance_diet_plan";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadLocalPlan(): StoredDietPlan | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredDietPlan;
    return Array.isArray(p.plan) && p.plan.length > 0 ? p : null;
  } catch {
    return null;
  }
}

export function saveLocalPlan(plan: DayPlan[], duration: number, cuisines: string[], startDate = todayISO()): void {
  const stored: StoredDietPlan = { plan, duration, cuisines, startDate };
  localStorage.setItem(KEY, JSON.stringify(stored));
}

/** Index of today within the plan (0 = day 1), or null if today falls outside it. */
export function todayPlanIndex(p: StoredDietPlan): number | null {
  const [y, m, d] = p.startDate.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const idx = Math.round((now.getTime() - start.getTime()) / 86_400_000);
  return idx >= 0 && idx < p.plan.length ? idx : null;
}
