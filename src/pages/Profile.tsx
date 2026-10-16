import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Pencil, Check } from "lucide-react";
import { PhaseBadge } from "../components/PhaseBadge";
import { useWorkoutPrefs } from "../hooks/useWorkoutPrefs";
import { pushProfile } from "../lib/cloudSync";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { GOALS, toGoalId, type GoalId } from "../lib/goals";
import type { CyclePhaseKey } from "../types/cycle";
import type { ReactNode } from "react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const ALL_CONDITIONS = [
  { id: "thyroid", emoji: "🦋", name: "Thyroid",        desc: "Affects metabolism & energy" },
  { id: "pmos",    emoji: "🌿", name: "PMOS",           desc: "Hormonal & metabolic pattern (formerly PCOS)" },
  { id: "pcod",    emoji: "🌀", name: "PCOD",           desc: "Polycystic ovarian disease" },
  { id: "endo",    emoji: "🔴", name: "Endometriosis",  desc: "Chronic pelvic inflammation" },
  { id: "pmdd",    emoji: "🌊", name: "PMDD / PMS",     desc: "Severe premenstrual symptoms" },
  { id: "other",   emoji: "💡", name: "Unsure / Other", desc: "Hormonal imbalance, undiagnosed" },
];

const SYMPTOM_GROUPS = [
  { title: "Weight & Metabolism", tone: "bg-primary text-white",      items: ["Weight gain","Weight loss","Insulin resistance","Sugar cravings","Slow metabolism","Belly fat"] },
  { title: "Hormones & Cycle",    tone: "bg-accent text-white",       items: ["Hormonal imbalance","Irregular periods","Painful periods","Heavy bleeding","No ovulation","Excess hair growth"] },
  { title: "Energy & Mood",       tone: "bg-emerald-500 text-white",  items: ["Chronic fatigue","Brain fog","Mood swings","Anxiety","Low mood","Sleep issues"] },
  { title: "Skin & Hair",         tone: "bg-rose-400 text-white",     items: ["Acne","Hair thinning","Unwanted hair","Dry skin","Bloating","Oily skin"] },
];

const CUISINES = [
  { emoji: "🇮🇳", name: "South Indian" }, { emoji: "🇮🇳", name: "North Indian" },
  { emoji: "🇲🇽", name: "Mexican" },      { emoji: "🫒",  name: "Mediterranean" },
  { emoji: "🇯🇵", name: "Japanese" },     { emoji: "🇨🇳", name: "Chinese" },
  { emoji: "🇰🇷", name: "Korean" },       { emoji: "🇹🇭", name: "Thai" },
  { emoji: "🇱🇧", name: "Middle Eastern" },{ emoji: "🇮🇹", name: "Italian" },
  { emoji: "🇬🇷", name: "Greek" },        { emoji: "🇺🇸", name: "American" },
  { emoji: "🇧🇷", name: "Brazilian" },    { emoji: "🇪🇸", name: "Spanish" },
  { emoji: "🇫🇷", name: "French" },       { emoji: "🇻🇳", name: "Vietnamese" },
  { emoji: "🇪🇹", name: "Ethiopian" },    { emoji: "🇲🇦", name: "Moroccan" },
  { emoji: "🌍",  name: "West African" }, { emoji: "🇵🇰", name: "Pakistani" },
  { emoji: "🇸🇬", name: "Singaporean" },  { emoji: "🔀",  name: "Mix of everything" },
];

const FAV_WORKOUT_TYPES = [
  "Weight Training","Cardio","Pilates","Yoga","HIIT",
  "Swimming","Zumba","Barre","Resistance Bands",
  "Strength Training","Dance","Walking","Cycling",
];

const DIETARY_OPTIONS  = ["Omnivore","Vegetarian","Vegan","Gluten-free","Dairy-free","Low carb"];
const ACTIVITY_OPTIONS = ["Sedentary","Lightly active","Moderately active","Very active"];
const CYCLE_LEN_OPTS   = ["21","24","28","30","35","Irregular"];

// ─── Types ─────────────────────────────────────────────────────────────────────

type FitnessLevel    = "Beginner" | "Intermediate" | "Advanced";
type WorkoutLocation = "Home" | "Gym" | "Outdoors" | "Mixed";

type ProfileData = {
  full_name:            string;
  age:                  string;
  weight_kg:            string;
  height_cm:            string;
  activity_level:       string;
  dietary_preference:   string;
  cuisine_preferences:  string[];
  food_allergies:       string;
  fitness_level:        FitnessLevel;
  workout_location:     WorkoutLocation;
  favourite_workouts:   string[];
  conditions:           string[];
  symptoms:             string[];
  last_period_date:     string;
  cycle_length:         string;
  primary_goal:         GoalId;
};

const PROFILE_KEY = "herbalance_profile";
const WP_KEY      = "herbalance_workout_prefs";

const DEFAULT_PROFILE: ProfileData = {
  full_name:           "",
  age:                 "",
  weight_kg:           "",
  height_cm:           "",
  activity_level:      "Moderately active",
  dietary_preference:  "Omnivore",
  cuisine_preferences: [],
  food_allergies:      "",
  fitness_level:       "Intermediate",
  workout_location:    "Mixed",
  favourite_workouts:  [],
  conditions:          [],
  symptoms:            [],
  last_period_date:    "",
  cycle_length:        "28",
  primary_goal:        "manage_symptoms",
};

function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const saved: Partial<ProfileData> = raw ? JSON.parse(raw) : {};
    if (!saved.favourite_workouts) {
      const wpRaw = localStorage.getItem(WP_KEY);
      const wp = wpRaw ? JSON.parse(wpRaw) : {};
      saved.favourite_workouts = wp.favouriteWorkouts ?? [];
    }
    return { ...DEFAULT_PROFILE, ...saved, primary_goal: toGoalId(saved.primary_goal) };
  } catch { return DEFAULT_PROFILE; }
}

function persistProfile(p: ProfileData) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  const wpRaw = localStorage.getItem(WP_KEY);
  const wp = wpRaw ? JSON.parse(wpRaw) : { weeklyMode: "suggested" };
  localStorage.setItem(WP_KEY, JSON.stringify({ ...wp, favouriteWorkouts: p.favourite_workouts }));
  localStorage.setItem("herbalance_cuisine_prefs", JSON.stringify({ cuisines: p.cuisine_preferences }));
}

// ─── Phase auto-calculation ────────────────────────────────────────────────────

function calcPhase(lastPeriod: string, cycleLen: string): CyclePhaseKey {
  if (!lastPeriod || cycleLen === "Irregular") return "follicular";
  const daysSince = Math.floor((Date.now() - new Date(lastPeriod).getTime()) / 86_400_000);
  const len = parseInt(cycleLen, 10) || 28;
  const day = ((daysSince % len) + len) % len + 1;
  if (day <= 5) return "menstrual";
  if (day <= Math.round(len * 0.35)) return "follicular";
  if (day <= Math.round(len * 0.55)) return "ovulatory";
  return "luteal";
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title, open, editing, onToggle, onEdit, children,
}: {
  title: string;
  open: boolean;
  editing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
      <div className="flex items-center px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between gap-2 text-left font-display font-semibold text-ink-dark hover:text-primary"
        >
          <span>{title}</span>
          <ChevronDown className={`h-5 w-5 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && !editing && (
          <button
            type="button"
            onClick={onEdit}
            className="ml-3 flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-ink-mid transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        )}
      </div>
      {open && (
        <div className="border-t border-border px-4 py-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

function EditActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="mt-5 flex gap-2.5">
      <button
        type="button"
        onClick={onSave}
        className="rounded-btn bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm btn-press hover:bg-primary-dark"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-btn border border-border px-5 py-2 text-sm font-medium text-ink-mid hover:bg-brand-surface btn-press"
      >
        Cancel
      </button>
    </div>
  );
}

function Pill({ children, selected, onClick }: { children: ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 btn-press ${
        selected
          ? "border-primary bg-primary text-white"
          : "border-primary/40 bg-white text-ink-dark hover:bg-primary/5"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Profile ───────────────────────────────────────────────────────────────────

export function Profile() {
  const { session, localMode, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function sendPasswordReset() {
    if (!supabase || !session?.user.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setNotice(error ? `Couldn't send the email: ${error.message}` : `We sent a password reset link to ${session.user.email}.`);
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      navigate(localMode ? "/onboarding" : "/login", { replace: true, state: { deleted: true } });
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setDeleting(false);
    }
  }
  const [profile, setProfile] = useState<ProfileData>(loadProfile);
  const [draft,   setDraft]   = useState<ProfileData>(profile);
  const [open,    setOpen]    = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [toast,   setToast]   = useState<"success" | "error" | null>(null);

  const [affirm,  setAffirm]  = useState(true);
  const [meal,    setMeal]    = useState(true);
  const [workout, setWorkout] = useState(false);
  const [metric,  setMetric]  = useState<"metric" | "imperial">("metric");
  const [theme,   setTheme]   = useState(false);

  const personalRef = useRef<HTMLDivElement>(null);
  const { prefs: wpPrefs, update: updateWp } = useWorkoutPrefs();

  const phase       = calcPhase(profile.last_period_date, profile.cycle_length);
  const initials    = profile.full_name ? profile.full_name.trim().slice(0, 2).toUpperCase() : "HB";
  const displayName = profile.full_name.trim() || "Your Profile";
  const isIncomplete = !profile.full_name.trim() || !profile.weight_kg.trim();

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function showToast(t: "success" | "error") {
    setToast(t);
    setTimeout(() => setToast(null), 2000);
  }

  function toggle(arr: string[], v: string): string[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function patchDraft<K extends keyof ProfileData>(key: K, val: ProfileData[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  function startEdit(section: string) {
    setDraft({ ...profile });
    setOpen(section);
    setEditing(section);
  }

  function cancelEdit() {
    setEditing(null);
  }

  function toggleSection(s: string) {
    if (open === s) {
      setOpen(null);
      setEditing(null);
    } else {
      setOpen(s);
      setEditing(null);
    }
  }

  function jumpToPersonal() {
    setOpen("personal");
    setEditing("personal");
    setDraft({ ...profile });
    setTimeout(() => personalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  async function saveSection() {
    const prev = profile;
    setProfile(draft);
    persistProfile(draft);
    setEditing(null);
    showToast("success");

    try {
      await pushProfile(draft);
    } catch {
      setProfile(prev);
      persistProfile(prev);
      showToast("error");
    }
  }

  const isEditing = (s: string) => editing === s;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-dark">Profile</h1>

      {!localMode && session && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-white px-4 py-3 shadow-card">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Signed in as</p>
            <p className="truncate text-sm font-semibold text-ink-dark">{session.user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-btn border border-border px-4 py-2 text-sm font-semibold text-ink-mid hover:bg-brand-surface"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Incomplete profile banner */}
      {isIncomplete && (
        <div className="flex items-center justify-between gap-3 rounded-card border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-800">
            Complete your profile for better recommendations →
          </p>
          <button
            type="button"
            onClick={jumpToPersonal}
            className="shrink-0 rounded-btn bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white btn-press hover:bg-blue-700"
          >
            Add details
          </button>
        </div>
      )}

      {/* Profile header */}
      <div className="flex flex-col items-start gap-4 rounded-card border border-border bg-white p-5 shadow-card sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-bold text-ink-dark">{displayName}</p>
          <p className="text-sm text-ink-mid">Member since May 2026</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-card border border-border bg-white p-4 text-center shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Current phase</p>
          <div className="mt-2 flex justify-center">
            <PhaseBadge phase={phase} />
          </div>
        </div>
        <div className="rounded-card border border-border bg-white p-4 text-center shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Cycle length</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-dark">
            {profile.cycle_length === "Irregular" ? "Irregular" : `${profile.cycle_length}d`}
          </p>
        </div>
        <div className="rounded-card border border-border bg-white p-4 text-center shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Days tracked</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-dark">28</p>
        </div>
      </div>

      {/* ── Accordion sections ──────────────────────────────────────────────── */}
      <div className="space-y-3">

        {/* MY GOAL */}
        <SectionCard
          title="My Goal"
          open={open === "goal"}
          editing={isEditing("goal")}
          onToggle={() => toggleSection("goal")}
          onEdit={() => startEdit("goal")}
        >
          {!isEditing("goal") ? (
            (() => {
              const g = GOALS.find((x) => x.id === profile.primary_goal)!;
              return (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <p className="font-semibold text-ink-dark">{g.label}</p>
                    <p className="text-xs text-ink-mid">{g.desc}</p>
                  </div>
                </div>
              );
            })()
          ) : (
            <>
              <p className="mb-3 text-xs text-ink-mid">
                Changing your goal updates your calories, water, workouts and step target straight away.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {GOALS.map((g) => {
                  const sel = draft.primary_goal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => patchDraft("primary_goal", g.id)}
                      className={`flex items-start gap-3 rounded-card border p-3 text-left transition-all duration-150 ${
                        sel ? "border-2 border-primary bg-primary-pale shadow-card" : "border border-primary/30 bg-white hover:shadow-card"
                      }`}
                    >
                      <span className="text-xl">{g.emoji}</span>
                      <span>
                        <span className="block text-sm font-bold text-ink-dark">{g.label}</span>
                        <span className="block text-xs text-ink-mid">{g.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <EditActions onSave={saveSection} onCancel={cancelEdit} />
            </>
          )}
        </SectionCard>

        {/* MY CONDITIONS */}
        <SectionCard
          title="My Conditions"
          open={open === "conditions"}
          editing={isEditing("conditions")}
          onToggle={() => toggleSection("conditions")}
          onEdit={() => startEdit("conditions")}
        >
          {!isEditing("conditions") ? (
            <div className="flex flex-wrap gap-2">
              {profile.conditions.length === 0 ? (
                <p className="text-sm italic text-ink-soft">No conditions added</p>
              ) : profile.conditions.map((id) => {
                const c = ALL_CONDITIONS.find((x) => x.id === id);
                return c ? (
                  <span key={id} className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                    {c.emoji} {c.name}
                  </span>
                ) : null;
              })}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {ALL_CONDITIONS.map((c) => {
                  const sel = draft.conditions.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => patchDraft("conditions", toggle(draft.conditions, c.id))}
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
              <EditActions onSave={saveSection} onCancel={cancelEdit} />
            </>
          )}
        </SectionCard>

        {/* MY SYMPTOMS */}
        <SectionCard
          title="My Symptoms"
          open={open === "symptoms"}
          editing={isEditing("symptoms")}
          onToggle={() => toggleSection("symptoms")}
          onEdit={() => startEdit("symptoms")}
        >
          {!isEditing("symptoms") ? (
            <div className="flex flex-wrap gap-2">
              {profile.symptoms.length === 0 ? (
                <p className="text-sm italic text-ink-soft">No symptoms added</p>
              ) : profile.symptoms.map((s) => (
                <span key={s} className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {SYMPTOM_GROUPS.map((g) => (
                  <div key={g.title}>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${g.tone}`}>
                      {g.title}
                    </span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {g.items.map((s) => (
                        <Pill
                          key={s}
                          selected={draft.symptoms.includes(s)}
                          onClick={() => patchDraft("symptoms", toggle(draft.symptoms, s))}
                        >
                          {s}
                        </Pill>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <EditActions onSave={saveSection} onCancel={cancelEdit} />
            </>
          )}
        </SectionCard>

        {/* PERSONAL DETAILS */}
        <div ref={personalRef}>
          <SectionCard
            title="Personal Details"
            open={open === "personal"}
            editing={isEditing("personal")}
            onToggle={() => toggleSection("personal")}
            onEdit={() => startEdit("personal")}
          >
            {!isEditing("personal") ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Name",     value: profile.full_name    || "—" },
                  { label: "Age",      value: profile.age          ? `${profile.age} yrs` : "—" },
                  { label: "Weight",   value: profile.weight_kg    ? `${profile.weight_kg} kg`  : "—" },
                  { label: "Height",   value: profile.height_cm    ? `${profile.height_cm} cm`  : "—" },
                  { label: "Activity", value: profile.activity_level },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-input border border-border bg-brand-surface p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">{label}</p>
                    <p className="mt-0.5 font-semibold text-ink-dark">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Full Name</span>
                  <input
                    value={draft.full_name}
                    onChange={(e) => patchDraft("full_name", e.target.value)}
                    placeholder="Your full name"
                    className="mt-1 w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { label: "Age",    key: "age"      as const, unit: "yrs" },
                    { label: "Weight", key: "weight_kg" as const, unit: "kg"  },
                    { label: "Height", key: "height_cm" as const, unit: "cm"  },
                  ]).map((f) => (
                    <label key={f.key} className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{f.label}</span>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          value={draft[f.key]}
                          onChange={(e) => patchDraft(f.key, e.target.value)}
                          className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">
                          {f.unit}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Activity Level</span>
                  <select
                    value={draft.activity_level}
                    onChange={(e) => patchDraft("activity_level", e.target.value)}
                    className="mt-1 w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    {ACTIVITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
                <EditActions onSave={saveSection} onCancel={cancelEdit} />
              </div>
            )}
          </SectionCard>
        </div>

        {/* DIET PREFERENCES */}
        <SectionCard
          title="Diet Preferences"
          open={open === "diet"}
          editing={isEditing("diet")}
          onToggle={() => toggleSection("diet")}
          onEdit={() => startEdit("diet")}
        >
          {!isEditing("diet") ? (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Dietary preference</p>
                <p className="mt-0.5 font-semibold text-ink-dark">{profile.dietary_preference}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Cuisines</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.cuisine_preferences.length === 0 ? (
                    <p className="text-sm italic text-ink-soft">None selected</p>
                  ) : profile.cuisine_preferences.map((c) => {
                    const cu = CUISINES.find((x) => x.name === c);
                    return (
                      <span key={c} className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {cu?.emoji} {c}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Food allergies</p>
                <p className="mt-0.5 font-semibold text-ink-dark">{profile.food_allergies || "None logged"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Dietary preference</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((o) => (
                    <Pill
                      key={o}
                      selected={draft.dietary_preference === o}
                      onClick={() => patchDraft("dietary_preference", o)}
                    >
                      {o}
                    </Pill>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Cuisine preferences</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CUISINES.map((c) => (
                    <Pill
                      key={c.name}
                      selected={draft.cuisine_preferences.includes(c.name)}
                      onClick={() => patchDraft("cuisine_preferences", toggle(draft.cuisine_preferences, c.name))}
                    >
                      {c.emoji} {c.name}
                    </Pill>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Food allergies</span>
                <input
                  value={draft.food_allergies}
                  onChange={(e) => patchDraft("food_allergies", e.target.value)}
                  placeholder="e.g. nuts, dairy, soy, gluten"
                  className="mt-1 w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <EditActions onSave={saveSection} onCancel={cancelEdit} />
            </div>
          )}
        </SectionCard>

        {/* WORKOUT PREFERENCES */}
        <SectionCard
          title="Workout Preferences"
          open={open === "workout"}
          editing={isEditing("workout")}
          onToggle={() => toggleSection("workout")}
          onEdit={() => startEdit("workout")}
        >
          {!isEditing("workout") ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-input border border-border bg-brand-surface p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Fitness level</p>
                  <p className="mt-0.5 font-semibold text-ink-dark">{profile.fitness_level}</p>
                </div>
                <div className="rounded-input border border-border bg-brand-surface p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Location</p>
                  <p className="mt-0.5 font-semibold text-ink-dark">{profile.workout_location}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Favourite types</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.favourite_workouts.length === 0 ? (
                    <p className="text-sm italic text-ink-soft">None selected</p>
                  ) : profile.favourite_workouts.map((w) => (
                    <span key={w} className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
              {/* Planning preference — always visible, uses live wpPrefs */}
              <div className="border-t border-border pt-3">
                <p className="text-sm font-semibold text-ink-dark">Workout planning</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([
                    { k: "suggested" as const, label: "📅 Suggest my week" },
                    { k: "daily"     as const, label: "🎯 Choose day by day" },
                  ]).map((opt) => (
                    <Pill
                      key={opt.k}
                      selected={wpPrefs.weeklyMode === opt.k}
                      onClick={() => updateWp({ weeklyMode: opt.k })}
                    >
                      {opt.label}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Fitness level</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["Beginner","Intermediate","Advanced"] as FitnessLevel[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => patchDraft("fitness_level", l)}
                      className={`rounded-btn border-2 py-2.5 text-sm font-semibold transition-all btn-press ${
                        draft.fitness_level === l
                          ? "border-primary bg-primary text-white"
                          : "border-primary/30 bg-white text-ink-dark hover:bg-primary/5"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Workout location</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([
                    { k: "Home"     as WorkoutLocation, e: "🏠" },
                    { k: "Gym"      as WorkoutLocation, e: "🏋️" },
                    { k: "Outdoors" as WorkoutLocation, e: "🌳" },
                    { k: "Mixed"    as WorkoutLocation, e: "🔀" },
                  ]).map(({ k, e }) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => patchDraft("workout_location", k)}
                      className={`rounded-btn border-2 py-2.5 text-sm font-semibold transition-all btn-press ${
                        draft.workout_location === k
                          ? "border-primary bg-primary text-white"
                          : "border-primary/30 bg-white text-ink-dark hover:bg-primary/5"
                      }`}
                    >
                      {e} {k}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Favourite workout types</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FAV_WORKOUT_TYPES.map((w) => (
                    <Pill
                      key={w}
                      selected={draft.favourite_workouts.includes(w)}
                      onClick={() => patchDraft("favourite_workouts", toggle(draft.favourite_workouts, w))}
                    >
                      {w}
                    </Pill>
                  ))}
                </div>
              </div>
              <EditActions onSave={saveSection} onCancel={cancelEdit} />
            </div>
          )}
        </SectionCard>

        {/* CYCLE SETTINGS */}
        <SectionCard
          title="Cycle Settings"
          open={open === "cycle"}
          editing={isEditing("cycle")}
          onToggle={() => toggleSection("cycle")}
          onEdit={() => startEdit("cycle")}
        >
          {!isEditing("cycle") ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-input border border-border bg-brand-surface p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Last period</p>
                  <p className="mt-0.5 font-semibold text-ink-dark">
                    {profile.last_period_date
                      ? new Date(profile.last_period_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </p>
                </div>
                <div className="rounded-input border border-border bg-brand-surface p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Cycle length</p>
                  <p className="mt-0.5 font-semibold text-ink-dark">
                    {profile.cycle_length === "Irregular" ? "Irregular" : `${profile.cycle_length} days`}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Current phase</p>
                <div className="mt-1.5">
                  <PhaseBadge phase={phase} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Date of last period</span>
                <input
                  type="date"
                  value={draft.last_period_date}
                  onChange={(e) => patchDraft("last_period_date", e.target.value)}
                  className="mt-1 w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-sm accent-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Average cycle length</span>
                <select
                  value={draft.cycle_length}
                  onChange={(e) => patchDraft("cycle_length", e.target.value)}
                  className="mt-1 w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  {CYCLE_LEN_OPTS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  Current phase (auto-calculated)
                </p>
                <div className="mt-1.5">
                  <PhaseBadge phase={calcPhase(draft.last_period_date, draft.cycle_length)} />
                </div>
              </div>
              <EditActions onSave={saveSection} onCancel={cancelEdit} />
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Settings ───────────────────────────────────────────────────────── */}
      <div className="rounded-card border border-border bg-white p-5 shadow-card">
        <h2 className="font-display text-lg font-bold text-ink-dark">Settings</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-ink-dark">
            Daily affirmation
            <input type="checkbox" checked={affirm} onChange={() => setAffirm((v) => !v)} className="h-5 w-5 rounded border-primary text-primary focus:ring-primary" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-ink-dark">
            Meal reminders
            <input type="checkbox" checked={meal} onChange={() => setMeal((v) => !v)} className="h-5 w-5 rounded border-primary text-primary focus:ring-primary" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-ink-dark">
            Workout reminders
            <input type="checkbox" checked={workout} onChange={() => setWorkout((v) => !v)} className="h-5 w-5 rounded border-primary text-primary focus:ring-primary" />
          </label>
          <div className="flex items-center justify-between gap-3 text-sm font-medium text-ink-dark">
            Units
            <div className="inline-flex rounded-full border border-border p-1">
              <button type="button" onClick={() => setMetric("metric")} className={`rounded-full px-3 py-1 text-xs font-semibold ${metric === "metric" ? "bg-primary text-white" : "text-ink-mid"}`}>
                kg / cm
              </button>
              <button type="button" onClick={() => setMetric("imperial")} className={`rounded-full px-3 py-1 text-xs font-semibold ${metric === "imperial" ? "bg-primary text-white" : "text-ink-mid"}`}>
                lbs / ft
              </button>
            </div>
          </div>
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-ink-soft">
            Theme (coming soon)
            <input type="checkbox" checked={theme} onChange={() => setTheme((v) => !v)} disabled className="h-5 w-5 rounded border-border text-primary" />
          </label>
        </div>
        {!localMode && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => void sendPasswordReset()} className="rounded-btn border border-border px-4 py-2 text-sm font-semibold text-ink-dark hover:bg-brand-surface btn-press">
              Change password
            </button>
            <button type="button" onClick={() => void signOut()} className="rounded-btn border border-border px-4 py-2 text-sm font-semibold text-ink-dark hover:bg-brand-surface btn-press">
              Log out
            </button>
          </div>
        )}
        {notice && <p className="mt-3 text-sm text-ink-mid">{notice}</p>}
      </div>

      {/* ── Privacy & data ─────────────────────────────────────────────────── */}
      <div className="rounded-card border border-rose-200 bg-white p-5 shadow-card">
        <h2 className="font-display text-base font-bold text-ink-dark">Privacy &amp; your data</h2>
        <p className="mt-1 text-sm text-ink-mid">
          Read how we handle your information in our{" "}
          <Link to="/privacy" className="font-semibold text-primary hover:underline">Privacy Policy</Link> and{" "}
          <Link to="/disclaimer" className="font-semibold text-primary hover:underline">Health Disclaimer</Link>.
        </p>
        <button
          type="button"
          onClick={() => { setDeleteOpen(true); setDeleteText(""); setDeleteError(null); }}
          className="mt-4 rounded-btn border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 btn-press"
        >
          {localMode ? "Delete my data from this device" : "Delete my account"}
        </button>
      </div>

      {deleteOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setDeleteOpen(false)} />
          <div className="relative w-full max-w-[400px] rounded-[20px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.2)]">
            <h2 className="font-display text-lg font-bold text-ink-dark">Delete your account?</h2>
            <p className="mt-2 text-sm text-ink-mid">
              This permanently deletes your account, profile, meal plans and workout history.{" "}
              <strong className="text-ink-dark">It can&apos;t be undone.</strong>
            </p>
            <label className="mt-4 block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Type DELETE to confirm</span>
              <input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                autoFocus
                className="mt-1 w-full rounded-[10px] border border-border px-3 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              />
            </label>
            {deleteError && <p className="mt-3 rounded-card bg-rose-50 px-3 py-2 text-sm text-rose-700">{deleteError}</p>}
            <div className="mt-5 flex gap-3">
              <button type="button" disabled={deleting} onClick={() => setDeleteOpen(false)}
                className="flex-1 rounded-btn border border-border py-2.5 text-sm font-semibold text-ink-mid hover:bg-brand-surface">
                Cancel
              </button>
              <button type="button" disabled={deleteText !== "DELETE" || deleting} onClick={() => void confirmDelete()}
                className="flex-1 rounded-btn bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40">
                {deleting ? "Deleting…" : "Delete forever"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && createPortal(
        <div className={`fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg animate-fade-in ${
          toast === "success" ? "bg-emerald-500" : "bg-rose-500"
        }`}>
          {toast === "success" ? "Saved ✓" : "Couldn't save changes. Please try again."}
        </div>,
        document.body
      )}
    </div>
  );
}
