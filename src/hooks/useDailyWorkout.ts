import { useState } from "react";

export type WorkoutIntensity = "restorative" | "moderate" | "high";
export type WorkoutLocation = "home" | "gym" | "class" | "outdoors";

export type DailyWorkoutEntry = {
  date: string;
  mood: WorkoutIntensity | null;
  workoutType: string | null;
  location: WorkoutLocation | null;
  muscleFocus: string[];
};

const KEY = "herbalance_daily_workout";
const today = () => new Date().toISOString().slice(0, 10);

function blank(): DailyWorkoutEntry {
  return { date: today(), mood: null, workoutType: null, location: null, muscleFocus: [] };
}
function load(): DailyWorkoutEntry {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed: DailyWorkoutEntry = JSON.parse(raw);
    return parsed.date === today() ? parsed : blank();
  } catch { return blank(); }
}

export function useDailyWorkout() {
  const [entry, setEntry] = useState<DailyWorkoutEntry>(load);
  const save = (patch: Partial<DailyWorkoutEntry>) => {
    setEntry(prev => {
      const next = { ...prev, ...patch, date: today() };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };
  const reset = () => {
    const fresh = blank();
    localStorage.setItem(KEY, JSON.stringify(fresh));
    setEntry(fresh);
  };
  return { entry, save, reset, needsSetup: !entry.workoutType, needsMood: !entry.mood };
}
