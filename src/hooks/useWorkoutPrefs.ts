import { useState } from "react";

export type WorkoutMode = "suggested" | "daily";

export type WorkoutPrefs = {
  weeklyMode: WorkoutMode;
  favouriteWorkouts: string[];
};

const KEY = "herbalance_workout_prefs";
const DEFAULTS: WorkoutPrefs = { weeklyMode: "suggested", favouriteWorkouts: ["Yoga", "Gym", "Pilates"] };

function load(): WorkoutPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

export function useWorkoutPrefs() {
  const [prefs, setPrefs] = useState<WorkoutPrefs>(load);
  const update = (patch: Partial<WorkoutPrefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };
  const toggleFavourite = (type: string) => {
    const favs = prefs.favouriteWorkouts;
    update({ favouriteWorkouts: favs.includes(type) ? favs.filter(f => f !== type) : [...favs, type] });
  };
  return { prefs, update, toggleFavourite };
}
