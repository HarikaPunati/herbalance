import { useState } from "react";

export type DailyMood = "tired" | "okay" | "energised";

type Entry = { mood: DailyMood; date: string };

const STORAGE_KEY = "herbalance_daily_mood";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function readEntry(): Entry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: Entry = JSON.parse(raw);
    return parsed.date === todayStr() ? parsed : null;
  } catch {
    return null;
  }
}

export function useDailyMood() {
  const [entry, setEntry] = useState<Entry | null>(readEntry);

  const setMood = (mood: DailyMood) => {
    const next: Entry = { mood, date: todayStr() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEntry(next);
  };

  return {
    mood: entry?.mood ?? null,
    showCheckin: entry === null,
    setMood,
  };
}
