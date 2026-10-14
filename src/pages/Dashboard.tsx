import { useState, useMemo } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { AffirmationCard } from "../components/AffirmationCard";
import { CycleBanner } from "../components/CycleBanner";
import { StatCard } from "../components/StatCard";
import { PHASE_META } from "../types/cycle";
import type { CyclePhaseKey } from "../types/cycle";
import { useProfileData } from "../hooks/useProfileData";
import { loadWorkoutLog } from "../hooks/useWorkoutLog";
import { calorieTarget, loadStoredProfile, waterTargetL, workoutMinutesTarget } from "../lib/profileStore";
import { loadLocalPlan, todayPlanIndex } from "../lib/dietPlanStore";

const MEAL_TIME: Record<string, string> = {
  "Breakfast": "8:00",
  "Mid-morning snack": "10:30",
  "Lunch": "12:30",
  "Afternoon snack": "16:00",
  "Dinner": "19:00",
};

const phaseDot: Record<CyclePhaseKey, string> = {
  menstrual: "bg-phase-menstrual-bg ring-1 ring-phase-menstrual-text",
  follicular: "bg-phase-follicular-bg ring-1 ring-phase-follicular-text",
  ovulatory: "bg-phase-ovulatory-bg ring-1 ring-phase-ovulatory-text",
  luteal: "bg-phase-luteal-bg ring-1 ring-phase-luteal-text",
};

function phaseForCycleDay(day: number, len: number): CyclePhaseKey {
  if (day <= 5) return "menstrual";
  if (day <= Math.round(len * 0.35)) return "follicular";
  if (day <= Math.round(len * 0.55)) return "ovulatory";
  return "luteal";
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const { userName, initials, cycleDay, cycleLength, phase, nextPhaseDays } = useProfileData();
  const [tipDay, setTipDay] = useState<number | null>(null);
  const todayLog = loadWorkoutLog();
  const totalBurned = todayLog.reduce((sum, e) => sum + e.calories, 0);

  const profile = useMemo(loadStoredProfile, []);
  const dietPlan = useMemo(loadLocalPlan, []);
  const planIdx = dietPlan ? todayPlanIndex(dietPlan) : null;
  const todayPlan = dietPlan && planIdx !== null ? dietPlan.plan[planIdx] : null;
  const kcal = todayPlan?.total_calories ?? calorieTarget(profile);
  const water = waterTargetL(profile);

  const phaseTip: Record<CyclePhaseKey, string> = {
    menstrual:  "Rest and nourish — your body is doing important work",
    follicular: "Energy rising — great time for strength and new goals",
    ovulatory:  "Peak energy week — perfect for strength training",
    luteal:     "Wind down and restore — focus on gentle movement",
  };

  const weekDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const offset = Math.round((date.getTime() - today.getTime()) / 86_400_000);
      const dayCycleDay = ((cycleDay - 1 + offset) % cycleLength + cycleLength) % cycleLength + 1;
      const dayPhase = phaseForCycleDay(dayCycleDay, cycleLength);
      const isToday = offset === 0;
      const label = date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3);
      return { label, dayCycleDay, dayPhase, isToday, index: i };
    });
  }, [cycleDay, cycleLength]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-dark">
            {greeting()}, {userName} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-mid">
            {formatDate(new Date())} · Day {cycleDay} of your cycle
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-border bg-white p-2.5 text-ink-mid shadow-card hover:shadow-card-hover btn-press"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-white shadow-card">
            {initials.slice(0, 1)}
          </div>
        </div>
      </div>

      <AffirmationCard phase={phase} cycleDay={cycleDay} />

      <CycleBanner
        phase={phase}
        day={cycleDay}
        cycleLength={cycleLength}
        nextPhaseDays={nextPhaseDays}
        tip={phaseTip[phase]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<span>🔥</span>} value={kcal ? `${kcal.toLocaleString()} kcal` : "—"} label="Today's target" />
        <StatCard icon={<span>💧</span>} value={water ? `${water}L` : "—"} label="Water goal" />
        <StatCard icon={<span>⏱</span>} value={`${workoutMinutesTarget(profile)} min`} label="Workout today" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card-hover rounded-card border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-dark">Today&apos;s Meals</h2>
            <Link to="/diet" className="text-sm font-semibold text-primary hover:underline">
              See full plan →
            </Link>
          </div>
          {todayPlan ? (
            <ul className="mt-4 space-y-3">
              {todayPlan.meals.map((m) => (
                <li key={m.type} className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                    {MEAL_TIME[m.type] ?? m.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-dark">{m.name}</p>
                    <p className="text-xs text-ink-mid">{m.description}</p>
                  </div>
                  {m.tags[0] && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      {m.tags[0]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-input border border-dashed border-primary/30 bg-primary-pale/40 py-6 text-center">
              <p className="text-2xl">🥗</p>
              <p className="mt-2 text-sm font-semibold text-ink-dark">
                {dietPlan ? "Your meal plan has finished" : "No meal plan yet"}
              </p>
              <p className="mt-0.5 text-xs text-ink-mid">
                <Link to="/diet" className="font-semibold text-primary hover:underline">
                  Generate one in My Diet
                </Link>{" "}
                to see today&apos;s meals here
              </p>
            </div>
          )}
        </div>

        <div className="card-hover rounded-card border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-dark">Today&apos;s Workouts</h2>
            <Link to="/workout" className="text-sm font-semibold text-primary hover:underline">
              {todayLog.length > 0 ? "Add more →" : "Log workout →"}
            </Link>
          </div>

          {todayLog.length === 0 ? (
            <div className="mt-4 rounded-input border border-dashed border-primary/30 bg-primary-pale/40 py-6 text-center">
              <p className="text-2xl">🏋️</p>
              <p className="mt-2 text-sm font-semibold text-ink-dark">No workouts logged yet</p>
              <p className="mt-0.5 text-xs text-ink-mid">Head to My Workout to log your session</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {todayLog.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 rounded-input border border-border bg-brand-surface px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">🏃</span>
                    <span className="truncate text-sm font-semibold text-ink-dark">{e.workoutName}</span>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    🔥 {e.calories} kcal
                  </span>
                </div>
              ))}
              {totalBurned > 0 && (
                <div className="flex items-center justify-between rounded-input bg-emerald-50 px-3 py-2 mt-1">
                  <span className="text-xs font-semibold text-emerald-800">Total burned today</span>
                  <span className="text-sm font-bold text-emerald-700">🔥 {totalBurned} kcal</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-card border border-border bg-white p-4 shadow-card">
        <p className="text-sm font-semibold text-ink-dark">This week</p>
        <p className="text-xs text-ink-mid">Tap a day to see your cycle phase</p>
        <div className="relative mt-4 flex justify-between gap-1">
          {weekDays.map(({ label, dayCycleDay, dayPhase, isToday, index }) => (
            <div key={index} className="relative flex flex-1 flex-col items-center">
              <button
                type="button"
                onClick={() => setTipDay((cur) => (cur === index ? null : index))}
                className={`flex min-h-10 min-w-10 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-tight transition-all ${
                  isToday ? "bg-primary text-white shadow-card" : "border border-primary/30 bg-white text-ink-mid"
                }`}
              >
                {label}
              </button>
              <span className={`mt-1 h-2 w-2 rounded-full ${phaseDot[dayPhase]}`} />
              <span className="mt-0.5 text-[9px] text-ink-soft">Day {dayCycleDay}</span>

              {tipDay === index && (
                <div className={`absolute bottom-full z-10 mb-2 w-44 rounded-card border border-border bg-white p-3 text-left text-xs shadow-card-hover animate-fade-in ${
                  index <= 1 ? "left-0" : index >= 5 ? "right-0" : "left-1/2 -translate-x-1/2"
                }`}>
                  <p className="font-semibold text-ink-dark">{label} · Day {dayCycleDay}</p>
                  <p className="mt-1.5 flex items-center gap-1.5">
                    <span>{PHASE_META[dayPhase].emoji}</span>
                    <span className="font-semibold text-ink-dark">{PHASE_META[dayPhase].label}</span>
                  </p>
                  <p className="mt-1 text-ink-mid leading-relaxed">{PHASE_META[dayPhase].description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
