import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type WorkoutExercise = {
  id: string;
  name: string;
  detail: string;
  tip: string;
  description?: string;
  modification?: string;
  /** Explicit key into exerciseAlternatives when the name won't auto-match */
  altKey?: string;
};

type Props = {
  index: number;
  exercise: WorkoutExercise;
  done: boolean;
  onToggle: () => void;
  bandLevel?: "light" | "medium" | "heavy";
};

// ─── Alternative exercise map ─────────────────────────────────────────────────

const exerciseAlternatives: Record<string, { alt: string; targets: string }> = {
  "Barbell Squats":    { alt: "Leg Extensions",           targets: "Quads" },
  "Deadlifts":         { alt: "Romanian Deadlift",         targets: "Hamstrings & glutes" },
  "Push-ups":          { alt: "Chest Press (dumbbells)",   targets: "Chest & triceps" },
  "Pull-ups":          { alt: "Lat Pulldown",              targets: "Back & biceps" },
  "Lunges":            { alt: "Step-ups",                  targets: "Quads & glutes" },
  "Plank":             { alt: "Dead Bug",                  targets: "Core" },
  "Burpees":           { alt: "Squat to Overhead Press",   targets: "Full body" },
  "Hip Thrusts":       { alt: "Glute Bridges",             targets: "Glutes" },
  "Mountain Climbers": { alt: "Bicycle Crunches",          targets: "Core & cardio" },
  "Jump Squats":       { alt: "Slow Tempo Squats",         targets: "Quads & glutes, low impact" },
  "Bench Press":       { alt: "Dumbbell Chest Fly",        targets: "Chest" },
  "Overhead Press":    { alt: "Lateral Raises",            targets: "Shoulders" },
  "Bent Over Row":     { alt: "Seated Cable Row",          targets: "Back" },
  "Tricep Dips":       { alt: "Tricep Pushdowns",          targets: "Triceps" },
  "Bicycle Crunches":  { alt: "Leg Raises",                targets: "Core" },
  "Glute Bridges":     { alt: "Donkey Kicks",              targets: "Glutes" },
  "Dumbbell Curls":    { alt: "Resistance Band Curls",     targets: "Biceps" },
  "Calf Raises":       { alt: "Jump Rope",                 targets: "Calves & cardio" },
  "Side Plank":        { alt: "Lateral Band Walks",        targets: "Obliques & glutes" },
  "Box Jumps":         { alt: "Step-ups",                  targets: "Quads & glutes, low impact" },
};

function findAlternative(name: string, altKey?: string) {
  // Explicit override takes priority
  const lookupKey = altKey ?? name;
  const normalized = lookupKey.toLowerCase();

  for (const [key, value] of Object.entries(exerciseAlternatives)) {
    if (normalized.includes(key.toLowerCase())) {
      return value;
    }
  }
  return null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const BAND_BADGE = {
  light:  { label: "🟢 Light band",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  medium: { label: "🟡 Medium band", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  heavy:  { label: "🔴 Heavy band",  cls: "bg-red-50 text-red-700 border-red-200" },
};

export function WorkoutCard({ index, exercise, done, onToggle, bandLevel }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showAlt, setShowAlt] = useState(false);

  const alt = findAlternative(exercise.name, exercise.altKey);

  return (
    <div
      className={`rounded-card border bg-white p-4 shadow-card transition-all duration-200 ${
        done ? "border-emerald-300 bg-emerald-50/50" : "border-border"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {index}
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={done}
            className={`flex h-6 w-6 items-center justify-center rounded-md border-2 text-xs font-bold transition-colors duration-200 ${
              done
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-primary/40 bg-white text-transparent hover:border-primary"
            }`}
          >
            ✓
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className={`font-display text-sm font-bold text-ink-dark transition-all duration-200 ${
                  done ? "text-ink-soft line-through" : ""
                }`}
              >
                {exercise.name}
              </p>
              <p className="text-xs text-ink-mid">{exercise.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-lg p-1 text-ink-soft hover:bg-brand-surface"
            >
              <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>

          <p className="mt-1 text-xs italic text-accent">{exercise.tip}</p>

          {bandLevel && (
            <span className={`mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${BAND_BADGE[bandLevel].cls}`}>
              {BAND_BADGE[bandLevel].label}
            </span>
          )}

          {expanded && (exercise.description || exercise.modification) && (
            <div className="mt-3 space-y-2 text-sm text-ink-mid animate-fade-in">
              {exercise.description && <p>{exercise.description}</p>}
              {exercise.modification && (
                <p className="rounded-input bg-accent-pale/60 p-2 text-ink-dark">
                  <span className="font-semibold text-accent">Modification:</span> {exercise.modification}
                </p>
              )}
            </div>
          )}

          {/* Alternative swap */}
          {alt && !showAlt && (
            <button
              type="button"
              onClick={() => setShowAlt(true)}
              className="mt-2.5 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-primary/40 hover:text-primary"
            >
              Don't like this?
            </button>
          )}

          {alt && showAlt && (
            <div className="mt-2.5 rounded-input border border-primary/25 bg-primary-pale px-3 py-2.5 animate-fade-in">
              <p className="text-xs font-semibold text-primary-dark">
                Try instead: {alt.alt}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-mid">
                Targets the same muscle group &rarr; {alt.targets}
              </p>
              <button
                type="button"
                onClick={() => setShowAlt(false)}
                className="mt-2 text-[11px] text-ink-soft underline-offset-2 hover:text-ink-dark hover:underline"
              >
                ← Keep original
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
