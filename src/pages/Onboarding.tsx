import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { saveStoredProfile } from "../lib/profileStore";
import { GOALS, type GoalId } from "../lib/goals";
import type { CyclePhaseKey } from "../types/cycle";
import { PHASE_META } from "../types/cycle";

const CONDITIONS = [
  { id: "thyroid", emoji: "🦋", name: "Thyroid", desc: "Affects metabolism & energy" },
  { id: "pmos", emoji: "🌿", name: "PMOS", desc: "Hormonal & metabolic pattern (formerly PCOS)" },
  { id: "pcod", emoji: "🌀", name: "PCOD", desc: "Polycystic ovarian disease" },
  { id: "endo", emoji: "🔴", name: "Endometriosis", desc: "Chronic pelvic inflammation" },
  { id: "pmdd", emoji: "🌊", name: "PMDD / PMS", desc: "Severe premenstrual symptoms" },
  { id: "other", emoji: "💡", name: "Unsure / Other", desc: "Hormonal imbalance, undiagnosed" },
] as const;

const SYMPTOM_GROUPS = [
  {
    title: "Weight & Metabolism",
    tone: "bg-primary text-white",
    items: [
      "Weight gain",
      "Weight loss",
      "Insulin resistance",
      "Sugar cravings",
      "Slow metabolism",
      "Belly fat",
    ],
  },
  {
    title: "Hormones & Cycle",
    tone: "bg-accent text-white",
    items: [
      "Hormonal imbalance",
      "Irregular periods",
      "Painful periods",
      "Heavy bleeding",
      "No ovulation",
      "Excess hair growth",
    ],
  },
  {
    title: "Energy & Mood",
    tone: "bg-emerald-500 text-white",
    items: ["Chronic fatigue", "Brain fog", "Mood swings", "Anxiety", "Low mood", "Sleep issues"],
  },
  {
    title: "Skin & Hair",
    tone: "bg-rose-400 text-white",
    items: ["Acne", "Hair thinning", "Unwanted hair", "Dry skin", "Bloating", "Oily skin"],
  },
] as const;

const CUISINES = [
  { emoji: "🇮🇳", name: "South Indian" },
  { emoji: "🇮🇳", name: "North Indian" },
  { emoji: "🇲🇽", name: "Mexican" },
  { emoji: "🫒", name: "Mediterranean" },
  { emoji: "🇯🇵", name: "Japanese" },
  { emoji: "🇨🇳", name: "Chinese" },
  { emoji: "🇰🇷", name: "Korean" },
  { emoji: "🇹🇭", name: "Thai" },
  { emoji: "🇱🇧", name: "Middle Eastern" },
  { emoji: "🇮🇹", name: "Italian" },
  { emoji: "🇬🇷", name: "Greek" },
  { emoji: "🇺🇸", name: "American" },
  { emoji: "🇧🇷", name: "Brazilian" },
  { emoji: "🇪🇸", name: "Spanish" },
  { emoji: "🇫🇷", name: "French" },
  { emoji: "🇻🇳", name: "Vietnamese" },
  { emoji: "🇪🇹", name: "Ethiopian" },
  { emoji: "🇲🇦", name: "Moroccan" },
  { emoji: "🌍", name: "West African" },
  { emoji: "🇵🇰", name: "Pakistani" },
  { emoji: "🇸🇬", name: "Singaporean" },
  { emoji: "🔀", name: "Mix of everything" },
] as const;

const WORKOUT_TYPES = [
  "Weight Training",
  "Cardio",
  "Pilates",
  "Yoga",
  "HIIT",
  "Swimming",
  "Walking",
  "Dance",
  "Strength Training",
  "Cycling",
] as const;

const PHASE_KEYS: CyclePhaseKey[] = ["menstrual", "follicular", "ovulatory", "luteal"];

const phaseCardClass = (key: CyclePhaseKey, selected: boolean) => {
  const base = "relative rounded-card border-2 p-4 text-left transition-all duration-200 card-hover ";
  const map: Record<CyclePhaseKey, string> = {
    menstrual: selected
      ? "border-phase-menstrual-text bg-white ring-2 ring-phase-menstrual-text/30"
      : "border-transparent bg-phase-menstrual-bg/70",
    follicular: selected
      ? "border-phase-follicular-text bg-white ring-2 ring-phase-follicular-text/30"
      : "border-transparent bg-phase-follicular-bg/70",
    ovulatory: selected
      ? "border-phase-ovulatory-text bg-white ring-2 ring-phase-ovulatory-text/30"
      : "border-transparent bg-phase-ovulatory-bg/70",
    luteal: selected
      ? "border-phase-luteal-text bg-white ring-2 ring-phase-luteal-text/30"
      : "border-transparent bg-phase-luteal-bg/70",
  };
  return base + map[key];
};

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const total = 6;

  const [name, setName] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("Moderately active");
  const [diet, setDiet] = useState("Omnivore");
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [allergies, setAllergies] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [fitness, setFitness] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [workouts, setWorkouts] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<CyclePhaseKey>("ovulatory");
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLen, setCycleLen] = useState("28");
  const [locationPref, setLocationPref] = useState<"Home" | "Gym" | "Outdoors" | "Mixed">("Mixed");

  const navigate = useNavigate();

  // If no period date was entered, estimate one from the phase card picked (midpoint of that phase).
  const estimateLastPeriod = (): string => {
    const len = parseInt(cycleLen, 10) || 28;
    const midDay: Record<CyclePhaseKey, number> = {
      menstrual: 3,
      follicular: Math.round((6 + len * 0.35) / 2),
      ovulatory: Math.round((len * 0.35 + len * 0.55) / 2),
      luteal: Math.round((len * 0.55 + len) / 2),
    };
    const d = new Date();
    d.setDate(d.getDate() - (midDay[phase] - 1));
    return d.toISOString().slice(0, 10);
  };

  const finish = async () => {
    await saveStoredProfile({
      full_name: name.trim(),
      age,
      weight_kg: weight,
      height_cm: height,
      activity_level: activity,
      dietary_preference: diet,
      cuisine_preferences: cuisines,
      food_allergies: allergies,
      fitness_level: fitness,
      workout_location: locationPref,
      favourite_workouts: workouts,
      conditions,
      symptoms,
      last_period_date: lastPeriod || estimateLastPeriod(),
      cycle_length: cycleLen,
      primary_goal: goal ?? "manage_symptoms",
      notes,
    });
    navigate("/dashboard");
  };

  const go = (n: number) => {
    setDir(n > step ? "next" : "prev");
    setStep(n);
  };

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const slideClass =
    dir === "next" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-onboard">
        <div className="relative overflow-hidden rounded-onboard bg-white p-6 shadow-onboard md:p-8">
          <div className="mb-6 flex items-center gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => go(step - 1)}
                className="rounded-full p-2 text-ink-mid hover:bg-brand-surface btn-press"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <span className="w-9" />
            )}
            <div className="flex-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${(step / total) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs font-medium text-ink-soft">
              Step {step} of {total}
            </p>
          </div>

          <div key={step} className={`${slideClass}`}>
            {step === 1 && (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/30 text-4xl">
                  🪷
                </div>
                <h1 className="font-display text-[28px] font-bold text-ink-dark">Welcome to HerBalance</h1>
                <p className="mx-auto mt-3 max-w-md text-ink-mid">
                  Let&apos;s build your personalised wellness plan. This takes about 3 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => go(2)}
                  className="btn-press mt-8 w-full rounded-btn bg-primary py-3.5 font-display text-base font-semibold text-white shadow-card transition hover:bg-primary-dark md:max-w-xs"
                >
                  Let&apos;s begin →
                </button>
                <p className="mt-4 text-xs text-ink-soft">
                  By continuing you agree to our{" "}
                  <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link> and confirm you&apos;ve read the{" "}
                  <Link to="/disclaimer" className="underline hover:text-primary">Health Disclaimer</Link> — HerBalance is
                  general wellness guidance, not medical advice.
                </p>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-display text-xl font-bold text-ink-dark">What&apos;s your main goal?</h2>
                <p className="mt-2 text-sm text-ink-mid">
                  We&apos;ll set your calories, water, workouts and daily activity around it — and adjust them to your cycle.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {GOALS.map((g) => {
                    const sel = goal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        className={`relative flex items-start gap-3 rounded-card border p-4 text-left transition-all duration-150 ${
                          sel
                            ? "border-2 border-primary bg-primary-pale shadow-card"
                            : "border border-primary/30 bg-white hover:shadow-card"
                        }`}
                      >
                        <span className="text-2xl">{g.emoji}</span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-ink-dark">{g.label}</span>
                          <span className="mt-0.5 block text-xs text-ink-mid">{g.desc}</span>
                        </span>
                        {sel && (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled={!goal}
                  onClick={() => go(3)}
                  className="btn-press mt-8 w-full rounded-btn bg-primary py-3 font-semibold text-white shadow-card hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-display text-xl font-bold text-ink-dark">
                  What has your doctor diagnosed you with?
                </h2>
                <p className="mt-2 text-sm text-ink-mid">Select all that apply — you can update this anytime.</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {CONDITIONS.map((c) => {
                    const sel = conditions.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggle(conditions, c.id, setConditions)}
                        className={`relative rounded-card border p-4 text-left transition-all duration-150 ${
                          sel
                            ? "border-2 border-primary bg-primary-pale shadow-card"
                            : "border border-primary/30 bg-white hover:shadow-card"
                        }`}
                      >
                        <span className="text-3xl">{c.emoji}</span>
                        <p className="mt-2 text-sm font-bold text-ink-dark">{c.name}</p>
                        <p className="mt-1 text-xs text-ink-mid">{c.desc}</p>
                        {sel && (
                          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => go(4)}
                  className="btn-press mt-8 w-full rounded-btn bg-primary py-3 font-semibold text-white shadow-card hover:bg-primary-dark"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="font-display text-xl font-bold text-ink-dark">What do you experience day to day?</h2>
                <p className="mt-2 text-sm text-ink-mid">Select everything that affects your life.</p>
                <div className="mt-6 space-y-6">
                  {SYMPTOM_GROUPS.map((g) => (
                    <div key={g.title}>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${g.tone}`}>
                        {g.title}
                      </span>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {g.items.map((s) => {
                          const sel = symptoms.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggle(symptoms, s, setSymptoms)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                                sel
                                  ? "border-primary bg-primary text-white"
                                  : "border-primary/40 bg-white text-ink-dark hover:bg-primary/5"
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => go(5)}
                  className="btn-press mt-8 w-full rounded-btn bg-primary py-3 font-semibold text-white shadow-card hover:bg-primary-dark"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="font-display text-xl font-bold text-ink-dark">Tell us a little about you</h2>
                <p className="mt-2 text-sm text-ink-mid">
                  Helps us calculate the right calories and workout intensity.
                </p>

                <label className="mt-6 block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Your name
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should we call you?"
                    className="mt-1 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2"
                  />
                </label>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { label: "Age", value: age, set: setAge, unit: "yrs" },
                    { label: "Weight", value: weight, set: setWeight, unit: "kg" },
                    { label: "Height", value: height, set: setHeight, unit: "cm" },
                  ].map((f) => (
                    <label key={f.label} className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                        {f.label}
                      </span>
                      <div className="relative mt-1">
                        <input
                          inputMode="decimal"
                          value={f.value}
                          onChange={(e) => f.set(e.target.value)}
                          className="w-full rounded-input border border-border bg-white px-3 py-2.5 pr-12 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">
                          {f.unit}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Activity level
                    </span>
                    <select
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="mt-1 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    >
                      {["Sedentary", "Lightly active", "Moderately active", "Very active"].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Dietary preference
                    </span>
                    <select
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                      className="mt-1 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    >
                      {["Omnivore", "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Low carb"].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Food allergies
                    </span>
                    <input
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. nuts, dairy, soy, gluten"
                      className="mt-1 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-ink-dark">What cuisines do you enjoy?</p>
                  <p className="mt-0.5 text-xs text-ink-soft">We'll build your meal plan around your food culture.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CUISINES.map((c) => {
                      const sel = cuisines.includes(c.name);
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => toggle(cuisines, c.name, setCuisines)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 btn-press ${
                            sel
                              ? "border-primary bg-primary text-white"
                              : "border-primary/40 bg-white text-ink-dark hover:bg-primary/5"
                          }`}
                        >
                          {c.emoji} {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-6 text-sm font-semibold text-ink-dark">Fitness level</p>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {(
                    [
                      { k: "Beginner" as const, emoji: "🌱" },
                      { k: "Intermediate" as const, emoji: "🌿" },
                      { k: "Advanced" as const, emoji: "🌳" },
                    ] as const
                  ).map(({ k, emoji }) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setFitness(k)}
                      className={`rounded-btn border-2 py-3 font-semibold transition-all duration-150 btn-press ${
                        fitness === k
                          ? "border-primary bg-primary text-white shadow-card"
                          : "border-primary/30 bg-white text-ink-dark hover:bg-primary/5"
                      }`}
                    >
                      {emoji} {k}
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-sm font-semibold text-ink-dark">Favourite workout types</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WORKOUT_TYPES.map((w) => {
                    const sel = workouts.includes(w);
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => toggle(workouts, w, setWorkouts)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                          sel ? "border-primary bg-primary text-white" : "border-primary/40 bg-white text-ink-dark"
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-semibold text-ink-dark">Anything else we should know?</span>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. on medication, recent surgery, high stress levels, poor sleep..."
                    className="mt-2 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => go(6)}
                  className="btn-press mt-8 w-full rounded-btn bg-primary py-3 font-semibold text-white shadow-card hover:bg-primary-dark"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="font-display text-xl font-bold text-ink-dark">Where are you in your cycle?</h2>
                <p className="mt-2 text-sm text-ink-mid">
                  This is the heart of cycle syncing — we&apos;ll tailor everything to your hormonal state right now.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PHASE_KEYS.map((k) => {
                    const m = PHASE_META[k];
                    const sel = phase === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setPhase(k)}
                        className={phaseCardClass(k, sel)}
                      >
                        <span className="text-3xl">{m.emoji}</span>
                        <p className="mt-2 font-display text-base font-bold text-ink-dark">{m.label}</p>
                        <p className="text-xs text-ink-mid">{m.dayRange}</p>
                        <p className="mt-2 text-sm leading-snug text-ink-mid">{m.description}</p>
                        {sel && (
                          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow ring-2 ring-primary/30">
                            <Check className="h-4 w-4 text-primary" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Date of last period
                    </span>
                    <input
                      type="date"
                      value={lastPeriod}
                      onChange={(e) => setLastPeriod(e.target.value)}
                      className="mt-1 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Average cycle length
                    </span>
                    <select
                      value={cycleLen}
                      onChange={(e) => setCycleLen(e.target.value)}
                      className="mt-1 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    >
                      {["21", "24", "28", "30", "35", "Irregular"].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <p className="mt-6 text-sm font-semibold text-ink-dark">Workout location</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      { k: "Home" as const, e: "🏠" },
                      { k: "Gym" as const, e: "🏋️" },
                      { k: "Outdoors" as const, e: "🌳" },
                      { k: "Mixed" as const, e: "🔀" },
                    ] as const
                  ).map(({ k, e }) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setLocationPref(k)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150 btn-press ${
                        locationPref === k
                          ? "border-primary bg-primary text-white"
                          : "border-primary/40 bg-white text-ink-dark"
                      }`}
                    >
                      {e} {k}
                    </button>
                  ))}
                </div>

                {!lastPeriod && (
                  <p className="mt-6 text-xs text-ink-soft">
                    No date? We&apos;ll estimate your cycle day from the phase you picked above.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => void finish()}
                  className="btn-press mt-8 flex h-[52px] w-full items-center justify-center rounded-btn bg-gradient-to-br from-primary to-accent font-display text-base font-bold text-white shadow-card transition hover:brightness-105 hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  Generate My HerBalance Plan <Sparkles className="ml-2 h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-soft">
          Already set up?{" "}
          <Link to="/dashboard" className="font-semibold text-primary hover:underline">
            Go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
