import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Play, Plus, X as XIcon } from "lucide-react";
import { WorkoutCard } from "../components/WorkoutCard";
import { WorkoutBottomSheet } from "../components/WorkoutBottomSheet";
import { useDailyWorkout, type WorkoutIntensity, type WorkoutLocation } from "../hooks/useDailyWorkout";
import { useWorkoutPrefs } from "../hooks/useWorkoutPrefs";
import { getExercises } from "../data/workoutExercises";
import { PHASE_META } from "../types/cycle";
import type { CyclePhaseKey } from "../types/cycle";
import { useProfileData } from "../hooks/useProfileData";
import { useTargets } from "../hooks/useTargets";
import { goalLabel } from "../lib/goals";
import { CycleBanner } from "../components/CycleBanner";
import { type WorkoutLogEntry, loadWorkoutLog, saveWorkoutLog } from "../hooks/useWorkoutLog";

// ─── Equipment ────────────────────────────────────────────────────────────────

type EquipmentEntry = { home: string[]; gym: string[] };

const EQUIPMENT: Record<string, EquipmentEntry> = {
  "Yoga": {
    home: ["Yoga mat", "Yoga blocks (optional)", "Yoga strap (optional)"],
    gym:  ["Yoga mat (often provided)", "Yoga blocks (available at studio)"],
  },
  "Pilates": {
    home: ["Pilates / yoga mat", "Small Pilates ball (optional)", "Light resistance band (optional)"],
    gym:  ["Reformer machine (provided)", "Mat", "Pilates ring / magic circle (optional)"],
  },
  "Gym": {
    home: ["Dumbbells or adjustable dumbbell set", "Resistance bands", "Exercise bench (optional)", "Kettlebell (optional)"],
    gym:  ["Barbells and plates", "Dumbbells", "Cable machines", "Squat rack / bench press", "Weight machines"],
  },
  "Cardio": {
    home: ["Comfortable shoes", "Open space or treadmill", "Water bottle"],
    gym:  ["Treadmill or elliptical", "Stationary bike", "Stair climber or rowing machine"],
  },
  "Boxing": {
    home: ["Boxing gloves", "Hand wraps", "Freestanding punching bag (optional)", "Jump rope"],
    gym:  ["Boxing gloves", "Hand wraps", "Heavy bag and speed bag (provided)", "Jump rope"],
  },
  "Barre": {
    home: ["A sturdy chair or wall (acts as your barre)", "Yoga mat", "Non-slip socks or bare feet", "Light dumbbells (optional, 1–2kg)", "Water bottle"],
    gym:  ["Barre rail (provided)", "Yoga mat", "Light dumbbells (optional)"],
  },
  "Zumba/Dance": {
    home: ["Comfortable non-slip athletic shoes", "Enough open floor space (roughly 2m × 2m)", "Water bottle", "Upbeat music or a YouTube video (see below)", "Optional: light resistance bands for arms"],
    gym:  ["Supportive athletic shoes", "Studio space (provided)"],
  },
  "HIIT": {
    home: ["Exercise mat", "Jump rope (optional)", "Dumbbells or kettlebell (optional)", "Interval timer app"],
    gym:  ["Exercise mat", "Dumbbells and kettlebells", "Jump rope", "Plyo box (optional)"],
  },
  "Calisthenics": {
    home: ["Exercise mat", "Doorframe pull-up bar", "Sturdy chairs for dips (optional)"],
    gym:  ["Pull-up bars (provided)", "Parallel bars / dip station", "Gymnastic rings (if available)"],
  },
  "Swimming": {
    home: ["Swimsuit", "Goggles", "Access to a pool or open water", "Swim cap (optional)"],
    gym:  ["Swimsuit", "Goggles", "Swim cap (optional)", "Towel"],
  },
  "Resistance Bands": {
    home: ["Light, medium, and heavy resistance bands", "Door anchor attachment (optional)", "Exercise mat"],
    gym:  ["Resistance bands set (or use cable machine)", "Exercise mat"],
  },
  "Martial Arts": {
    home: ["Comfortable, flexible clothing", "Exercise mat", "Hand wraps (optional)", "Open floor space"],
    gym:  ["Hand wraps", "Training gloves", "Mouth guard (for sparring)", "Shin guards (for sparring)"],
  },
};

// ─── YouTube configs ──────────────────────────────────────────────────────────

type YouTubeConfig = { text: string; sub: string; url: string };

const YOUTUBE_CONFIG: Partial<Record<string, YouTubeConfig>> = {
  "Yoga": {
    text: "Find a Yoga class on YouTube",
    sub:  "A guided Yoga session tailored to your phase & energy.",
    url:  "https://www.youtube.com/results?search_query=yoga+beginner+cycle+phase+home",
  },
  "Pilates": {
    text: "Find a Pilates class on YouTube",
    sub:  "A guided Pilates session tailored to your phase & energy.",
    url:  "https://www.youtube.com/results?search_query=pilates+home+workout+beginners+cycle+phase",
  },
  "Zumba/Dance": {
    text: "Find a Zumba class on YouTube",
    sub:  "Follow along with a guided Zumba session at home.",
    url:  "https://www.youtube.com/results?search_query=zumba+home+workout+beginners",
  },
  "Barre": {
    text: "Find a Barre class on YouTube",
    sub:  "A guided Barre session for your phase and energy level.",
    url:  "https://www.youtube.com/results?search_query=barre+workout+home+beginners",
  },
};

// ─── Cardio picker ────────────────────────────────────────────────────────────

const CARDIO_OPTIONS = [
  { emoji: "🚶", name: "Walking" },
  { emoji: "🚴", name: "Cycling" },
  { emoji: "🪜", name: "Stair Master" },
  { emoji: "⚡", name: "Elliptical" },
  { emoji: "🚣", name: "Rowing" },
  { emoji: "🏃", name: "Treadmill Run" },
  { emoji: "🤸", name: "Jump Rope" },
  { emoji: "🏊", name: "Swimming" },
];

const CARDIO_PHASE_TIP: Record<CyclePhaseKey, string> = {
  menstrual:  "💡 Today we suggest a gentle 20–30 min walk or light swimming — your body needs rest and gentle movement right now.",
  follicular: "💡 Your energy is rising! Try a 30–40 min cycling session or treadmill run — your body is building towards peak performance.",
  ovulatory:  "💡 Peak energy! Go for a 40–45 min rowing, jump rope, or treadmill run — your body is primed for intensity.",
  luteal:     "💡 Today we suggest a gentle 30-min walk or elliptical — progesterone is high and your body prefers steady-state cardio.",
};

const CARDIO_DURATION: Record<CyclePhaseKey, string> = {
  menstrual:  "20–30 min",
  follicular: "30–40 min",
  ovulatory:  "40–45 min",
  luteal:     "25–35 min",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLocation(loc: WorkoutLocation): string {
  return loc === "class" ? "Workout Class" : loc.charAt(0).toUpperCase() + loc.slice(1);
}

function isClassWorkout(_type: string, location: WorkoutLocation): boolean {
  return location === "class";
}

function getClassTips(phase: CyclePhaseKey): string[] {
  const tips: Record<CyclePhaseKey, string[]> = {
    menstrual:  [
      "Let yourself modify every move — this is a lower-energy phase and that's valid",
      "Focus on breath and form over pace or intensity today",
      "Speak to the instructor if you need to skip high-impact sections",
    ],
    follicular: [
      "Great week to try something new or push a little harder — your energy is rising",
      "Your coordination and motivation are climbing — use it",
      "Challenge yourself on technique today, not just effort level",
    ],
    ovulatory:  [
      "Your strength and coordination peak here — make the most of it",
      "Push the intensity if it feels good; your body is genuinely ready",
      "Great time to set a new personal best or try an advanced variation",
    ],
    luteal:     [
      "Focus on form over speed — quality over quantity today",
      "Listen to your body; modifying is a sign of intelligence, not weakness",
      "Steady effort is better than all-out intensity in the luteal phase",
    ],
  };
  return tips[phase];
}

function getWhyText(workoutType: string, phase: CyclePhaseKey, mood: WorkoutIntensity): string {
  if (mood === "restorative") {
    return `Your body is asking for rest and gentle movement — honouring that supports hormonal balance and adrenal health. Moving gently on low-energy days reduces cortisol rather than spiking it.`;
  }
  const phaseText: Record<CyclePhaseKey, string> = {
    menstrual:  `During your menstrual phase, gentle to moderate movement nourishes rather than depletes. ${workoutType} keeps circulation and mood supported without taxing your energy reserves.`,
    follicular: `Rising oestrogen in the follicular phase means your body is primed for building and adapting. ${workoutType} in this window creates strong training adaptations — this is the time to push.`,
    ovulatory:  `Ovulatory phase is your peak strength and energy window — oestrogen and testosterone are both elevated. ${workoutType} now gives you the best adaptation returns of your entire cycle.`,
    luteal:     `The luteal phase calls for steady, mindful movement rather than all-out effort. ${workoutType} supports recovery and keeps cortisol in check as progesterone rises and your cycle winds down.`,
  };
  return phaseText[phase];
}

const PHASE_BADGE_CLS: Record<CyclePhaseKey, string> = {
  menstrual:  "bg-phase-menstrual-bg text-phase-menstrual-text",
  follicular: "bg-phase-follicular-bg text-phase-follicular-text",
  ovulatory:  "bg-phase-ovulatory-bg text-phase-ovulatory-text",
  luteal:     "bg-phase-luteal-bg text-phase-luteal-text",
};

const MOOD_BADGE: Record<WorkoutIntensity, string> = {
  restorative: "bg-slate-100 text-slate-700",
  moderate:    "bg-emerald-50 text-emerald-700",
  high:        "bg-amber-100 text-amber-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Workout() {
  const { entry, save, reset, needsSetup, needsMood } = useDailyWorkout();
  const { prefs } = useWorkoutPrefs();
  const { phase, cycleDay, cycleLength } = useProfileData();
  const targets = useTargets();
  const [showSheet, setShowSheet] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

  // Workout log (multiple entries per day)
  const [workoutLog, setWorkoutLog] = useState<WorkoutLogEntry[]>(loadWorkoutLog);
  const [calorieModalOpen, setCalorieModalOpen] = useState(false);
  const [logNameInput, setLogNameInput] = useState("");
  const [logCalInput, setLogCalInput] = useState("");

  // Cardio sub-picker
  const [selectedCardio, setSelectedCardio] = useState<string | null>(null);

  useEffect(() => {
    if (needsSetup) setShowSheet(true);
  }, [needsSetup]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const isZumbaOrBarre = entry.workoutType === "Zumba/Dance" || entry.workoutType === "Barre";
  const isCardio       = entry.workoutType === "Cardio";

  const exercises = entry.workoutType && entry.mood && entry.location && !isCardio
    ? getExercises(entry.workoutType, entry.mood, entry.muscleFocus)
    : [];

  const isClass = entry.workoutType && entry.location
    ? isClassWorkout(entry.workoutType, entry.location)
    : false;

  // Band level: derived from session intensity for Resistance Bands workouts
  const bandLevel: "light" | "medium" | "heavy" | undefined =
    entry.workoutType === "Resistance Bands"
      ? (entry.mood === "restorative" ? "light" : entry.mood === "moderate" ? "medium" : "heavy")
      : undefined;

  // Equipment: outdoors maps to "home" equipment for Zumba/Barre only
  const equipmentLocation: "home" | "gym" | null =
    entry.location === "home" ? "home" :
    entry.location === "gym"  ? "gym"  :
    (isZumbaOrBarre && entry.location === "outdoors") ? "home" : null;
  const showEquipment = !!equipmentLocation && !!entry.workoutType && !!EQUIPMENT[entry.workoutType];

  // YouTube: Pilates at any location; Yoga/Zumba/Barre at home or outdoors
  const showYouTube = !!entry.workoutType && (
    entry.workoutType === "Pilates" ||
    (
      ["Yoga", "Zumba/Dance", "Barre"].includes(entry.workoutType) &&
      (entry.location === "home" || entry.location === "outdoors")
    )
  );
  const youtubeConfig = entry.workoutType ? YOUTUBE_CONFIG[entry.workoutType] : undefined;

  const completed = Object.values(done).filter(Boolean).length;
  const total = exercises.length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleComplete = (result: { mood: WorkoutIntensity; workoutType: string; location: WorkoutLocation; muscleFocus: string[] }) => {
    save(result);
    setDone({});
    setShowSheet(false);
    setSelectedCardio(null);
  };

  function openLogModal() {
    const prefill = selectedCardio ?? entry.workoutType ?? "";
    setLogNameInput(prefill);
    setLogCalInput("");
    setCalorieModalOpen(true);
  }

  function handleSaveCalories() {
    const cal  = parseInt(logCalInput) || 0;
    const name = logNameInput.trim() || entry.workoutType || "Workout";
    const entry2: WorkoutLogEntry = { id: crypto.randomUUID(), workoutName: name, calories: cal };
    const updated = [...workoutLog, entry2];
    setWorkoutLog(updated);
    saveWorkoutLog(updated);
    setCalorieModalOpen(false);
    setLogNameInput("");
    setLogCalInput("");
  }

  function deleteLogEntry(id: string) {
    const updated = workoutLog.filter(e => e.id !== id);
    setWorkoutLog(updated);
    saveWorkoutLog(updated);
  }

  const totalCaloriesBurned = workoutLog.reduce((sum, e) => sum + e.calories, 0);

  const bannerTip = entry.mood === "restorative"
    ? "Rest is training — honour your energy today."
    : entry.mood === "high"
      ? `${PHASE_META[phase].label} phase — push it today`
      : `${PHASE_META[phase].label} phase — steady effort`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {showSheet && (
        <WorkoutBottomSheet
          phase={phase}
          weeklyMode={prefs.weeklyMode}
          favouriteWorkouts={prefs.favouriteWorkouts}
          suggestedTypes={targets.workout.suggestedTypes}
          initialStep={(needsMood ? 1 : 2) as 1 | 2}
          currentMood={entry.mood}
          onComplete={handleComplete}
          onClose={() => setShowSheet(false)}
        />
      )}

      {/* Log Workout Modal */}
      {calorieModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCalorieModalOpen(false)} />
          <div className="relative w-full max-w-[360px] rounded-[20px] bg-white p-6 shadow-[0_8px_40px_rgba(59,130,246,0.2)]">
            <h2 className="font-display text-[18px] font-bold text-ink-dark">Log Workout</h2>
            <p className="mt-1 text-sm text-ink-mid">Add a workout and how many calories you burned</p>

            <label className="mt-5 block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Workout</span>
              <input
                type="text"
                value={logNameInput}
                onChange={e => setLogNameInput(e.target.value)}
                placeholder="e.g. Walking, Lower Body"
                className="mt-1 w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Calories burned</span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  value={logCalInput}
                  onChange={e => setLogCalInput(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="h-11 flex-1 rounded-[10px] border border-border bg-white px-3 text-center text-xl font-bold text-ink-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm font-medium text-ink-soft">kcal</span>
              </div>
            </label>

            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setCalorieModalOpen(false)}
                className="flex-1 rounded-btn border border-border py-2.5 text-sm font-semibold text-ink-mid hover:bg-brand-surface">
                Cancel
              </button>
              <button type="button" onClick={handleSaveCalories}
                className="btn-press flex-1 rounded-btn bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
                Add
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-dark">My Workout</h1>
        {!needsSetup && (
          <button type="button" onClick={() => { reset(); setShowSheet(true); }}
            className="text-sm font-semibold text-primary hover:underline">
            Change →
          </button>
        )}
      </div>

      {!needsSetup && entry.mood && (
        <CycleBanner
          phase={phase}
          day={cycleDay}
          cycleLength={cycleLength}
          nextPhaseDays={3}
          tip={bannerTip}
          compact
          intensity={entry.mood === "restorative" ? "Gentle, breath-led movement" : entry.mood === "high" ? "High intensity" : "Moderate effort"}
        />
      )}

      {/* Placeholder — not set up yet */}
      {needsSetup && !showSheet && (
        <div className="rounded-card border border-dashed border-primary/30 bg-primary-pale/40 p-8 text-center">
          <p className="text-3xl">🏋️</p>
          <p className="mt-3 font-display text-lg font-bold text-ink-dark">Set up today's workout</p>
          <p className="mt-1 text-sm text-ink-mid">We'll match it to your energy and cycle phase.</p>
          <button type="button" onClick={() => setShowSheet(true)}
            className="btn-press mt-4 rounded-btn bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark">
            Get started
          </button>
        </div>
      )}

      {/* ── Goal + phase recommendation ──────────────────────────────────────── */}
      <div className="rounded-card border border-primary/20 bg-gradient-to-r from-primary-pale to-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-ink-dark">Today&apos;s recommendation</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PHASE_BADGE_CLS[phase]}`}>
            {PHASE_META[phase].emoji} {PHASE_META[phase].label} · {goalLabel(targets.goal)}
          </span>
        </div>
        <p className="mt-2 font-semibold text-ink-dark">{targets.workout.focus}</p>
        <p className="mt-1 text-sm text-ink-mid">
          {targets.workout.minutes} min · <span className="capitalize">{targets.workout.intensity}</span> intensity ·{" "}
          {targets.steps.toLocaleString()} steps · {targets.workout.sessionsPerWeek} workouts/week
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {targets.workout.suggestedTypes.map((t) => (
            <span key={t} className="rounded-full border border-primary/30 bg-white px-2.5 py-0.5 text-xs font-medium text-primary">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Always-visible activity log ──────────────────────────────────────── */}
      <div className="rounded-card border border-border bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink-dark">Today's Activity</h2>
          <button
            type="button"
            onClick={openLogModal}
            className="flex items-center gap-1.5 rounded-btn border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors btn-press"
          >
            <Plus className="h-3.5 w-3.5" />
            Log workout
          </button>
        </div>

        {workoutLog.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No workouts logged yet — tap "Log workout" to add one.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {workoutLog.map(e => (
              <div key={e.id} className="flex items-center justify-between gap-2 rounded-input bg-brand-surface px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">🏃</span>
                  <span className="truncate text-sm font-semibold text-ink-dark">{e.workoutName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    🔥 {e.calories} kcal
                  </span>
                  <button type="button" onClick={() => deleteLogEntry(e.id)}
                    className="rounded-full p-1 text-ink-soft hover:bg-rose-50 hover:text-rose-500 transition-colors">
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {totalCaloriesBurned > 0 && (
              <div className="flex justify-end pt-1">
                <span className="text-sm font-bold text-emerald-700">
                  Total: 🔥 {totalCaloriesBurned} kcal burned
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Main workout content ─────────────────────────────────────────────── */}
      {!needsSetup && entry.workoutType && entry.location && entry.mood && (
        <>
          {/* Header card */}
          <div className="rounded-card border border-border bg-white p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-ink-dark">{entry.workoutType}</h2>
              <span className="text-ink-soft">·</span>
              <span className="text-sm text-ink-mid">{formatLocation(entry.location)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PHASE_BADGE_CLS[phase]}`}>
                {PHASE_META[phase].label} phase
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${MOOD_BADGE[entry.mood]}`}>
                {entry.mood} intensity
              </span>
              {entry.muscleFocus.map(m => (
                <span key={m} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-dark">{m}</span>
              ))}
            </div>
          </div>

          {/* Equipment — yellow box for Zumba/Barre, blue for others */}
          {showEquipment && equipmentLocation && EQUIPMENT[entry.workoutType!] && (
            isZumbaOrBarre ? (
              <div className="rounded-card border border-amber-200 bg-amber-50 p-4">
                <p className="font-display font-bold text-amber-800">What you'll need</p>
                <ul className="mt-2 space-y-1.5">
                  {EQUIPMENT[entry.workoutType!][equipmentLocation].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-amber-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-card border border-border border-l-4 border-l-primary bg-white p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <p className="font-display font-bold text-ink-dark">
                    {equipmentLocation === "home" ? "What you'll need at home" : "What to bring / use at the gym"}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold capitalize text-primary-dark">
                    {equipmentLocation}
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {EQUIPMENT[entry.workoutType!][equipmentLocation].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-ink-mid">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          {/* YouTube card — red left border, Play icon */}
          {showYouTube && youtubeConfig && (
            <a
              href={youtubeConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-[12px] border border-border bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
              style={{ borderLeftWidth: 4, borderLeftColor: "#FF0000" }}
            >
              <Play className="h-8 w-8 shrink-0 text-[#FF0000]" />
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-ink-dark">{youtubeConfig.text}</p>
                <p className="text-xs text-ink-mid">{youtubeConfig.sub}</p>
              </div>
              <span className="shrink-0 text-sm text-ink-soft">→</span>
            </a>
          )}

          {/* Cardio sub-picker (Change 6) */}
          {isCardio && (
            <div className="rounded-card border border-border bg-white p-4 shadow-card space-y-4">
              <div>
                <p className="font-display font-bold text-ink-dark">Choose your cardio for today</p>
                <p className="text-xs text-ink-mid">Pick whichever feels right for your energy today</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {CARDIO_OPTIONS.map(opt => {
                  const sel = selectedCardio === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedCardio(opt.name)}
                      className={`rounded-card border p-2 text-center transition-all duration-150 btn-press ${
                        sel ? "border-primary bg-primary text-white" : "border-border bg-white hover:border-primary/40"
                      }`}
                    >
                      <p className={`text-[11px] font-semibold leading-tight ${sel ? "text-white" : "text-ink-dark"}`}>{opt.name}</p>
                    </button>
                  );
                })}
              </div>
              {/* Duration + phase tip */}
              <div className="rounded-input border border-primary/20 bg-primary-pale/50 px-3 py-2.5 text-sm text-ink-mid">
                <span className="font-semibold text-primary-dark">Suggested duration: </span>
                {CARDIO_DURATION[phase]}
                <br />
                <span className="mt-1 block text-xs leading-relaxed">{CARDIO_PHASE_TIP[phase]}</span>
              </div>
            </div>
          )}

          {/* Class tips OR exercise list */}
          {isClass ? (
            <div className="rounded-card border border-border bg-white p-5 shadow-card space-y-3">
              <p className="font-display font-bold text-ink-dark">What to focus on in class today</p>
              {getClassTips(phase).map((tip, i) => (
                <div key={i} className="flex gap-3 text-sm text-ink-mid">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          ) : exercises.length > 0 ? (
            <>
              <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <WorkoutCard
                    key={ex.id}
                    index={idx + 1}
                    exercise={ex}
                    done={!!done[ex.id]}
                    onToggle={() => setDone(d => ({ ...d, [ex.id]: !d[ex.id] }))}
                    bandLevel={bandLevel}
                  />
                ))}
              </div>
              <div className="rounded-card border border-border bg-white p-3">
                <div className="mb-1 flex justify-between text-xs font-medium text-ink-mid">
                  <span>Session progress</span>
                  <span>{completed} of {total} done</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                  <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
                </div>
              </div>
            </>
          ) : null}

          {/* Why this workout */}
          <div className="rounded-card border border-accent-light/60 bg-accent-pale p-4">
            <p className="font-display font-bold text-ink-dark">Why this workout?</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-mid">
              {getWhyText(entry.workoutType, phase, entry.mood)}
            </p>

          </div>
        </>
      )}
    </div>
  );
}
