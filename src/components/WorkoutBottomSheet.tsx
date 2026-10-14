import { useState } from "react";
import { createPortal } from "react-dom";
import { Heart, X } from "lucide-react";
import type { CyclePhaseKey } from "../types/cycle";
import type { WorkoutIntensity, WorkoutLocation } from "../hooks/useDailyWorkout";

const phaseWorkoutMap: Record<CyclePhaseKey, string[]> = {
  menstrual:  ["Cardio", "Yoga", "Pilates", "Resistance Bands"],
  follicular: ["Gym", "HIIT", "Cardio", "Boxing", "Barre"],
  ovulatory:  ["Gym", "HIIT", "Zumba/Dance", "Cardio", "Martial Arts", "Boxing"],
  luteal:     ["Pilates", "Yoga", "Cardio", "Resistance Bands", "Swimming"],
};

function getSuggested(phase: CyclePhaseKey, favs: string[]): string {
  const opts = phaseWorkoutMap[phase];
  return opts.find(o => favs.includes(o)) ?? opts[0];
}

const WORKOUT_TYPES = [
  { name: "Yoga",             emoji: "🧘", desc: "Flow, stretch, breathe" },
  { name: "Pilates",          emoji: "🩰", desc: "Core, control, alignment" },
  { name: "Gym",              emoji: "💪", desc: "Weights and machines" },
  { name: "Cardio",           emoji: "",   desc: "Walk, run, cycle & more" },
  { name: "Boxing",           emoji: "🥊", desc: "Punch, power, sweat" },
  { name: "Barre",            emoji: "💃", desc: "Ballet-inspired toning" },
  { name: "Zumba/Dance",      emoji: "🕺", desc: "Move to the music" },
  { name: "HIIT",             emoji: "🤸", desc: "High intensity intervals" },
  { name: "Calisthenics",     emoji: "🧗", desc: "Bodyweight strength" },
  { name: "Swimming",         emoji: "🏊", desc: "Full body, low impact" },
  { name: "Resistance Bands", emoji: "🎽", desc: "Home-friendly strength" },
  { name: "Martial Arts",     emoji: "🥋", desc: "Discipline and power" },
];

const LOCATIONS: { id: WorkoutLocation; emoji: string; label: string }[] = [
  { id: "home",     emoji: "🏠", label: "Home" },
  { id: "gym",      emoji: "💪", label: "Gym" },
  { id: "class",    emoji: "",   label: "Workout Class" },
  { id: "outdoors", emoji: "🌳", label: "Outdoors" },
];

const MUSCLE_GROUPS = ["Full Body","Upper Body","Lower Body","Core","Glutes","Back","Shoulders","Arms","Legs","Chest"];

const MOOD_OPTIONS: { k: WorkoutIntensity; emoji: string; title: string; subtitle: string; border: string; bg: string }[] = [
  { k: "restorative", emoji: "😴", title: "Low energy", subtitle: "Let's keep it gentle", border: "border-slate-200 hover:border-slate-400", bg: "hover:bg-slate-50" },
  { k: "moderate",    emoji: "😊", title: "Feeling okay", subtitle: "Moderate sounds good", border: "border-emerald-200 hover:border-emerald-400", bg: "hover:bg-emerald-50" },
  { k: "high",        emoji: "⚡", title: "Feeling strong", subtitle: "Let's push it today", border: "border-amber-200 hover:border-amber-400", bg: "hover:bg-amber-50" },
];

type Props = {
  phase: CyclePhaseKey;
  weeklyMode: "suggested" | "daily";
  favouriteWorkouts: string[];
  initialStep: 1 | 2;
  currentMood: WorkoutIntensity | null;
  onComplete: (r: { mood: WorkoutIntensity; workoutType: string; location: WorkoutLocation; muscleFocus: string[] }) => void;
  onClose: () => void;
};

export function WorkoutBottomSheet({ phase, weeklyMode, favouriteWorkouts, initialStep, currentMood, onComplete, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [mood, setMood] = useState<WorkoutIntensity | null>(currentMood);
  const [workoutType, setWorkoutType] = useState<string | null>(null);
  const [location, setLocation] = useState<WorkoutLocation | null>(null);
  const [muscles, setMuscles] = useState<string[]>([]);

  const suggested = getSuggested(phase, favouriteWorkouts);
  const phaseName = phase.charAt(0).toUpperCase() + phase.slice(1);

  const toggleMuscle = (m: string) =>
    setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const handleMoodSelect = (m: WorkoutIntensity) => {
    setMood(m);
    setStep(2);
  };

  const handleTypeSelect = (t: string) => {
    setWorkoutType(t);
    setStep(3);
  };

  const handleComplete = () => {
    if (mood && workoutType && location) {
      onComplete({ mood, workoutType, location, muscleFocus: muscles });
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 rounded-t-[24px] bg-white max-h-[88vh] overflow-y-auto animate-sheet-up">
        {/* Top bar */}
        <div className="sticky top-0 bg-white pt-3 pb-2 px-4 z-10">
          <div className="mx-auto h-1 w-10 rounded-full bg-border" />
          <div className="mt-3 flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {[1, 2, 3].map(n => (
                <div key={n} className={`h-2 w-2 rounded-full transition-colors ${step >= n ? "bg-primary" : "bg-border/60"}`} />
              ))}
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-1.5 text-ink-soft hover:bg-brand-surface">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-4 pb-8 pt-2">
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold text-ink-dark">How's your body feeling today?</h2>
              <p className="mt-1 text-sm text-ink-mid">We'll match your workout to your energy.</p>
              <div className="mt-5 flex flex-col gap-3">
                {MOOD_OPTIONS.map(opt => (
                  <button key={opt.k} type="button" onClick={() => handleMoodSelect(opt.k)}
                    className={`flex items-center gap-4 rounded-card border-2 bg-white p-4 text-left transition-all duration-150 btn-press ${opt.border} ${opt.bg}`}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow-sm ring-1 ring-border">{opt.emoji}</span>
                    <div>
                      <p className="font-display text-sm font-bold text-ink-dark">{opt.title}</p>
                      <p className="text-xs text-ink-mid">{opt.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-bold text-ink-dark">What do you want to do today?</h2>

              {weeklyMode === "suggested" && (
                <div className="mt-4 rounded-card border border-primary/25 bg-primary/5 p-3">
                  <p className="text-sm text-ink-dark">
                    Based on your <span className="font-semibold">{phaseName}</span> phase:{" "}
                    <span className="font-bold text-primary">{suggested}</span> is a great fit today 💙
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => handleTypeSelect(suggested)}
                      className="btn-press rounded-btn bg-primary px-4 py-1.5 text-sm font-semibold text-white">
                      Go with this
                    </button>
                    <button type="button" className="rounded-btn border border-border px-4 py-1.5 text-sm font-medium text-ink-mid">
                      Choose something else
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                {WORKOUT_TYPES.map(t => (
                  <button key={t.name} type="button" onClick={() => handleTypeSelect(t.name)}
                    className={`rounded-card border-2 p-3 text-left transition-all duration-150 btn-press ${
                      workoutType === t.name ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/40"
                    }`}>
                    {t.name === "Cardio"
                      ? <Heart className={`h-7 w-7 ${workoutType === t.name ? "text-primary" : "text-ink-mid"}`} />
                      : <p className="text-2xl">{t.emoji}</p>
                    }
                    <p className="mt-1 text-xs font-bold text-ink-dark leading-tight">{t.name}</p>
                    <p className="text-[11px] text-ink-soft">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-bold text-ink-dark">Where are you working out?</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {LOCATIONS.map(loc => (
                  <button key={loc.id} type="button" onClick={() => setLocation(loc.id)}
                    className={`rounded-card border-2 p-4 text-center transition-all duration-150 btn-press ${
                      location === loc.id ? "border-primary bg-primary text-white" : "border-border bg-white hover:border-primary/40"
                    }`}>
                    {loc.id === "class"
                      ? <p className="text-3xl">🏋️</p>
                      : <p className="text-3xl">{loc.emoji}</p>
                    }
                    <p className={`mt-1 text-sm font-bold ${location === loc.id ? "text-white" : "text-ink-dark"}`}>{loc.label}</p>
                  </button>
                ))}
              </div>

              {workoutType === "Gym" && location && (
                <div className="mt-5 animate-fade-in">
                  <p className="font-display text-sm font-bold text-ink-dark">What's your focus today?</p>
                  <p className="text-xs text-ink-mid">Optional — pick one or more</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {MUSCLE_GROUPS.map(m => (
                      <button key={m} type="button" onClick={() => toggleMuscle(m)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          muscles.includes(m) ? "border-primary bg-primary text-white" : "border-primary/40 bg-white text-ink-dark"
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {location && (
                <button type="button" onClick={handleComplete}
                  className="btn-press mt-6 flex h-14 w-full items-center justify-center rounded-btn bg-gradient-to-r from-primary to-accent font-display text-base font-bold text-white shadow-card animate-fade-in">
                  Let's go 💪
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
