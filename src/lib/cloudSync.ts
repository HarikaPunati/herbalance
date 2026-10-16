import { supabase } from "./supabase";
import { PROFILE_KEY, type StoredProfile } from "./profileStore";
import { saveLocalPlan, type DayPlan } from "./dietPlanStore";

// The app reads and writes localStorage everywhere (fast, works offline). When a user is
// signed in, this module mirrors that data to Supabase: pull on sign-in, push on save.
// Row-level security in supabase/schema.sql guarantees each user only touches their own rows.

const OWNER_KEY = "herbalance_owner";
const USER_ID_KEY = "herbalance_user_id"; // also namespaces workout-log keys

function writeProfileLocally(p: Partial<StoredProfile>) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  localStorage.setItem("herbalance_cuisine_prefs", JSON.stringify({ cuisines: p.cuisine_preferences ?? [] }));
  const wpRaw = localStorage.getItem("herbalance_workout_prefs");
  const wp = wpRaw ? JSON.parse(wpRaw) : { weeklyMode: "suggested" };
  localStorage.setItem("herbalance_workout_prefs", JSON.stringify({ ...wp, favouriteWorkouts: p.favourite_workouts ?? [] }));
}

/** Removes every HerBalance key from this browser (used on sign-out and when a different user signs in). */
export function clearLocalUserData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith("herbalance_"))
    .forEach((k) => localStorage.removeItem(k));
}

/**
 * Called right after sign-in. Makes localStorage reflect this user's cloud data.
 * Returns true if the user has a saved profile (otherwise they still need onboarding).
 */
export async function pullUserData(userId: string): Promise<boolean> {
  if (!supabase) return localStorage.getItem(PROFILE_KEY) !== null;

  const owner = localStorage.getItem(OWNER_KEY);
  if (owner && owner !== userId) clearLocalUserData(); // someone else used this browser
  // Data entered before this browser ever had an owner (pre-login) is adopted below.
  const anonymousLocalProfile = !owner ? localStorage.getItem(PROFILE_KEY) : null;
  localStorage.setItem(OWNER_KEY, userId);
  localStorage.setItem(USER_ID_KEY, userId);

  const { data: profileRow, error } = await supabase
    .from("profiles")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;

  let hasProfile = false;
  if (profileRow) {
    writeProfileLocally(profileRow.data as Partial<StoredProfile>);
    hasProfile = true;
  } else if (anonymousLocalProfile) {
    await pushProfile(JSON.parse(anonymousLocalProfile));
    hasProfile = true;
  } else {
    localStorage.removeItem(PROFILE_KEY);
  }

  const { data: plan } = await supabase
    .from("diet_plans")
    .select("plan, duration, cuisines, start_date")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (plan) {
    saveLocalPlan(plan.plan as DayPlan[], plan.duration as number, (plan.cuisines as string[]) ?? [], plan.start_date as string);
  }

  const since = new Date(Date.now() - 60 * 86_400_000).toISOString().slice(0, 10);
  const { data: logs } = await supabase
    .from("workout_logs")
    .select("log_date, entries")
    .eq("user_id", userId)
    .gte("log_date", since);
  for (const row of logs ?? []) {
    localStorage.setItem(`herbalance_workout_log_${userId}_${row.log_date}`, JSON.stringify(row.entries));
  }

  return hasProfile;
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Saves the profile to the cloud. Throws if signed in and the save fails. */
export async function pushProfile(p: Partial<StoredProfile>): Promise<void> {
  const userId = await currentUserId();
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, data: p, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function pushWorkoutLog(date: string, entries: unknown[]): Promise<void> {
  const userId = await currentUserId();
  if (!supabase || !userId) return;
  await supabase
    .from("workout_logs")
    .upsert({ user_id: userId, log_date: date, entries, updated_at: new Date().toISOString() }, { onConflict: "user_id,log_date" });
}

/** Bearer header for calls to our own /api functions. */
export async function authHeader(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  return data.session ? { authorization: `Bearer ${data.session.access_token}` } : {};
}
