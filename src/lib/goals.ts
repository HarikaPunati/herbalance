// Dependency-free so the browser app and the /api server function can both import it.

export type GoalId =
  | "lose_weight"
  | "gain_weight"
  | "build_strength"
  | "get_fit"
  | "manage_symptoms"
  | "boost_energy"
  | "cycle_regularity"
  | "fertility";

export const GOALS: { id: GoalId; emoji: string; label: string; desc: string }[] = [
  { id: "lose_weight",      emoji: "🔥", label: "Lose weight",              desc: "Gentle calorie deficit, more daily movement" },
  { id: "gain_weight",      emoji: "🍽️", label: "Gain healthy weight",      desc: "Calorie surplus with strength work" },
  { id: "build_strength",   emoji: "💪", label: "Build strength & muscle",  desc: "High protein, progressive strength training" },
  { id: "get_fit",          emoji: "✨", label: "Get fit & toned",          desc: "Small deficit, mix of strength and cardio" },
  { id: "manage_symptoms",  emoji: "🌿", label: "Manage hormonal symptoms", desc: "Balanced eating, steady low-stress movement" },
  { id: "boost_energy",     emoji: "⚡", label: "Boost energy",             desc: "Maintenance calories, energising movement" },
  { id: "cycle_regularity", emoji: "🌙", label: "Improve cycle regularity", desc: "Nourishing maintenance, avoid over-training" },
  { id: "fertility",        emoji: "🌱", label: "Support fertility",        desc: "Nutrient-dense maintenance, moderate exercise" },
];

// Profiles saved before goal IDs existed stored the label text.
const LEGACY_LABELS: Record<string, GoalId> = {
  "Lose weight": "lose_weight",
  "Manage hormonal symptoms": "manage_symptoms",
  "Build strength": "build_strength",
  "Improve cycle regularity": "cycle_regularity",
  "Boost energy": "boost_energy",
  "Support fertility": "fertility",
};

export function toGoalId(v: unknown): GoalId {
  if (typeof v !== "string") return "manage_symptoms";
  if (GOALS.some((g) => g.id === v)) return v as GoalId;
  return LEGACY_LABELS[v] ?? "manage_symptoms";
}

export const goalLabel = (v: unknown): string => GOALS.find((g) => g.id === toGoalId(v))!.label;
