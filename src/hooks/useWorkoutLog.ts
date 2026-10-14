export type WorkoutLogEntry = {
  id: string;
  workoutName: string;
  calories: number;
};

function logKey(): string {
  const uid  = localStorage.getItem("herbalance_user_id") ?? "default";
  const date = new Date().toISOString().slice(0, 10);
  return `herbalance_workout_log_${uid}_${date}`;
}

export function loadWorkoutLog(): WorkoutLogEntry[] {
  try {
    const raw = localStorage.getItem(logKey());
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveWorkoutLog(log: WorkoutLogEntry[]): void {
  localStorage.setItem(logKey(), JSON.stringify(log));
}
