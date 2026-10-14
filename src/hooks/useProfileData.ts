import { useState } from "react";
import type { CyclePhaseKey } from "../types/cycle";

const PROFILE_KEY = "herbalance_profile";

export type ProfileDataResult = {
  userName: string;
  initials: string;
  lastPeriodDate: string;
  cycleDay: number;
  cycleLength: number;
  cycleLengthStr: string;
  phase: CyclePhaseKey;
  nextPhaseDays: number;
};

function compute(): ProfileDataResult {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const p: Record<string, unknown> = raw ? JSON.parse(raw) : {};

    const fullName = typeof p.full_name === "string" ? p.full_name.trim() : "";
    const userName  = fullName ? fullName.split(" ")[0] : "there";
    const initials  = fullName ? fullName.slice(0, 2).toUpperCase() : "HB";

    const lastPeriodDate  = typeof p.last_period_date === "string" ? p.last_period_date : "";
    const cycleLengthStr  = typeof p.cycle_length === "string" ? p.cycle_length : "28";
    const len = cycleLengthStr === "Irregular" ? 28 : (parseInt(cycleLengthStr, 10) || 28);

    // Cycle day (1-indexed)
    let cycleDay = 14;
    if (lastPeriodDate) {
      const daysSince = Math.floor((Date.now() - new Date(lastPeriodDate).getTime()) / 86_400_000);
      cycleDay = Math.max(1, ((daysSince % len) + len) % len + 1);
    }

    // Phase — proportional boundaries (same formula as Profile.tsx)
    let phase: CyclePhaseKey = "follicular";
    if (lastPeriodDate && cycleLengthStr !== "Irregular") {
      if (cycleDay <= 5) phase = "menstrual";
      else if (cycleDay <= Math.round(len * 0.35)) phase = "follicular";
      else if (cycleDay <= Math.round(len * 0.55)) phase = "ovulatory";
      else phase = "luteal";
    }

    // Days until next phase starts
    const boundaries: Record<CyclePhaseKey, number> = {
      menstrual:  5,
      follicular: Math.round(len * 0.35),
      ovulatory:  Math.round(len * 0.55),
      luteal:     len,
    };
    const nextPhaseDays = Math.max(1, boundaries[phase] - cycleDay + 1);

    return { userName, initials, lastPeriodDate, cycleDay, cycleLength: len, cycleLengthStr, phase, nextPhaseDays };
  } catch {
    return {
      userName:       "there",
      initials:       "HB",
      lastPeriodDate: "",
      cycleDay:       14,
      cycleLength:    28,
      cycleLengthStr: "28",
      phase:          "follicular",
      nextPhaseDays:  4,
    };
  }
}

// Reads from localStorage once on mount — navigation (remount) picks up latest saved values.
export function useProfileData(): ProfileDataResult {
  const [data] = useState(compute);
  return data;
}
