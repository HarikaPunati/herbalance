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
    dayRange: "Days 6–12",
    description: "Energy rising. Great time to try new things.",
  },
  ovulatory: {
    label: "Ovulatory",
    emoji: "✨",
    dayRange: "Days 13–16",
    description: "Peak power. You're unstoppable right now.",
  },
  luteal: {
    label: "Luteal",
    emoji: "🌙",
    dayRange: "Days 17–28",
    description: "Winding down. Cravings up, slow and steady.",
  },
};

export type PhaseRange = { start: number; end: number };

/**
 * Phase day ranges for a cycle of `length` days — the single model used across the app.
 * Ovulation falls ~14 days before the next period (the luteal phase is the stable one), so
 * the ovulatory window is the day before through two days after it. A 28-day cycle gives
 * menstrual 1–5, follicular 6–12, ovulatory 13–16, luteal 17–28.
 */
export function phaseRanges(length = 28): Record<CyclePhaseKey, PhaseRange> {
  const len = Math.min(45, Math.max(21, Math.round(length) || 28));
  const ovulationDay = len - 14;
  const ovStart = Math.max(7, ovulationDay - 1);
  const ovEnd = Math.min(len - 10, ovulationDay + 2);
  return {
    menstrual: { start: 1, end: 5 },
    follicular: { start: 6, end: ovStart - 1 },
    ovulatory: { start: ovStart, end: ovEnd },
    luteal: { start: ovEnd + 1, end: len },
  };
}

export function getPhaseForDay(day: number, length = 28): CyclePhaseKey {
  const r = phaseRanges(length);
  if (day <= r.menstrual.end) return "menstrual";
  if (day <= r.follicular.end) return "follicular";
  if (day <= r.ovulatory.end) return "ovulatory";
  return "luteal";
}

export const formatRange = (r: PhaseRange) => (r.start === r.end ? `Day ${r.start}` : `Days ${r.start}–${r.end}`);

/** One-line tip per phase, shown on the Dashboard and Cycle banners. */
export const PHASE_TIP: Record<CyclePhaseKey, string> = {
  menstrual: "Rest and nourish — your body is doing important work",
  follicular: "Energy rising — great time for strength and new goals",
  ovulatory: "Peak energy week — perfect for your hardest workouts",
  luteal: "Wind down and restore — steady movement, regular meals",
};
