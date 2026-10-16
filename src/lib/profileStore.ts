import { supabase, getOrCreateUserId } from "./supabase";

export const PROFILE_KEY = "herbalance_profile";
const WORKOUT_PREFS_KEY = "herbalance_workout_prefs";
const CUISINE_PREFS_KEY = "herbalance_cuisine_prefs";

// Shape stored under PROFILE_KEY — shared by Onboarding, Profile and every page that personalises.
export type StoredProfile = {
  full_name: string;
  age: string;
  weight_kg: string;
  height_cm: string;
  activity_level: string;
  dietary_preference: string;
  cuisine_preferences: string[];
  food_allergies: string;
  fitness_level: "Beginner" | "Intermediate" | "Advanced";
  workout_location: "Home" | "Gym" | "Outdoors" | "Mixed";
  favourite_workouts: string[];
  conditions: string[];
  symptoms: string[];
  last_period_date: string;
  cycle_length: string;
  primary_goal?: string;
  notes?: string;
};

export { CONDITION_NAMES } from "./conditions";

export function hasProfile(): boolean {
  try {
    return localStorage.getItem(PROFILE_KEY) !== null;
  } catch {
    return false;
  }
}

export function loadStoredProfile(): Partial<StoredProfile> {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Saves the full profile locally, mirrors cuisines/workouts into their prefs keys, and syncs to Supabase if configured. */
export async function saveStoredProfile(p: StoredProfile): Promise<void> {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  localStorage.setItem(CUISINE_PREFS_KEY, JSON.stringify({ cuisines: p.cuisine_preferences }));
  const wpRaw = localStorage.getItem(WORKOUT_PREFS_KEY);
  const wp = wpRaw ? JSON.parse(wpRaw) : { weeklyMode: "suggested" };
  localStorage.setItem(WORKOUT_PREFS_KEY, JSON.stringify({ ...wp, favouriteWorkouts: p.favourite_workouts }));

  if (!supabase) return;
  try {
    await supabase.from("profiles").upsert(
      {
        user_id: getOrCreateUserId(),
        full_name: p.full_name || null,
        age: p.age ? parseInt(p.age, 10) : null,
        weight_kg: p.weight_kg ? parseFloat(p.weight_kg) : null,
        height_cm: p.height_cm ? parseFloat(p.height_cm) : null,
        activity_level: p.activity_level,
        dietary_preference: p.dietary_preference,
        cuisine_preferences: p.cuisine_preferences,
        food_allergies: p.food_allergies || null,
        fitness_level: p.fitness_level,
        workout_location: p.workout_location,
        favourite_workouts: p.favourite_workouts,
        conditions: p.conditions,
        symptoms: p.symptoms,
        last_period_date: p.last_period_date || null,
        cycle_length: p.cycle_length,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch {
    // Persistence is best-effort — localStorage already has the profile
  }
}
