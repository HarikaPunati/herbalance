export type CyclePhaseKey = "menstrual" | "follicular" | "ovulatory" | "luteal";

export const PHASE_META: Record<
  CyclePhaseKey,
  { label: string; emoji: string; dayRange: string; description: string }
> = {
  menstrual: {
    label: "Menstrual",
    emoji: "🔴",
    dayRange: "Days 1–5",
    description: "Low energy. Time to rest and nourish.",
  },
  follicular: {
    label: "Follicular",
    emoji: "🌱",
    dayRange: "Days 6–13",
    description: "Energy rising. Great time to try new things.",
  },
  ovulatory: {
    label: "Ovulatory",
    emoji: "✨",
    dayRange: "Days 14–17",
    description: "Peak power. You're unstoppable right now.",
  },
  luteal: {
    label: "Luteal",
    emoji: "🌙",
    dayRange: "Days 18–28",
    description: "Winding down. Cravings up, slow and steady.",
  },
};

export function getPhaseForDay(day: number, length = 28): CyclePhaseKey {
  if (day <= 5) return "menstrual";
  if (day <= 13) return "follicular";
  if (day <= 17) return "ovulatory";
  if (day <= length) return "luteal";
  return "luteal";
}
