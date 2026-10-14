import { useState } from "react";

const KEY = "herbalance_cuisine_prefs";

type CuisinePrefs = { cuisines: string[] };

const DEFAULT: CuisinePrefs = { cuisines: [] };

function load(): CuisinePrefs {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null") ?? DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function useCuisinePrefs() {
  const [prefs, setPrefs] = useState<CuisinePrefs>(load);

  function update(cuisines: string[]) {
    const next = { cuisines };
    setPrefs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  return { prefs, update };
}
