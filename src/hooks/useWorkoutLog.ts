import { pushWorkoutLog } from "../lib/cloudSync";

export type WorkoutLogEntry = {
  id: string;
  workoutName: string;
  calories: number;
};

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function logKey(): string {
  const uid = localStorage.getItem("herbalance_user_id") ?? "default";
  return `herbalance_workout_log_${uid}_${today()}`;
}

export function loadWorkoutLog(): WorkoutLogEntry[] {
  try {
    const raw = localStorage.getItem(logKey());
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveWorkoutLog(log: WorkoutLogEntry[]): void {
  localStorage.setItem(logKey(), JSON.stringify(log));
  void pushWorkoutLog(today(), log).catch(() => {});
}
