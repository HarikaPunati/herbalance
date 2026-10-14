import type { DailyMood } from "../hooks/useDailyMood";

type Props = {
  onSelect: (mood: DailyMood) => void;
};

const OPTIONS: {
  k: DailyMood;
  emoji: string;
  title: string;
  desc: string;
  border: string;
  bg: string;
  ring: string;
  dot: string;
}[] = [
  {
    k: "tired",
    emoji: "😴",
    title: "Low energy — keep it gentle",
    desc: "Stretches, light yoga & restorative movement",
    border: "border-slate-200 hover:border-slate-400",
    bg: "hover:bg-slate-50",
    ring: "focus-visible:ring-slate-300",
    dot: "bg-slate-400",
  },
  {
    k: "okay",
    emoji: "😊",
    title: "Feeling okay — moderate is good",
    desc: "Your balanced plan, steady effort",
    border: "border-emerald-200 hover:border-emerald-400",
    bg: "hover:bg-emerald-50",
    ring: "focus-visible:ring-emerald-300",
    dot: "bg-emerald-400",
  },
  {
    k: "energised",
    emoji: "⚡",
    title: "Feeling strong — let's push it",
    desc: "Higher intensity, heavier sets & HIIT",
    border: "border-amber-200 hover:border-amber-400",
    bg: "hover:bg-amber-50",
    ring: "focus-visible:ring-amber-300",
    dot: "bg-amber-400",
  },
];

export function MoodCheckIn({ onSelect }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-sm rounded-onboard bg-white p-6 shadow-onboard animate-slide-up">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-3xl">
            🌸
          </div>
          <h2 className="font-display text-xl font-bold text-ink-dark">
            How's your body feeling today?
          </h2>
          <p className="mt-1.5 text-sm text-ink-mid">
            We'll tailor your workout to match your energy.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.k}
              type="button"
              onClick={() => onSelect(opt.k)}
              className={`flex items-center gap-4 rounded-card border-2 bg-white p-4 text-left transition-all duration-150 btn-press ${opt.border} ${opt.bg} ${opt.ring} focus-visible:outline-none focus-visible:ring-2`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow-sm ring-1 ring-border">
                {opt.emoji}
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-ink-dark leading-snug">
                  {opt.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-mid">{opt.desc}</p>
              </div>
              <span className={`ml-auto h-2.5 w-2.5 shrink-0 rounded-full ${opt.dot}`} />
            </button>
          ))}
        </div>

        <p className="mt-5 text-center text-[11px] text-ink-soft">
          You won't be asked again today.
        </p>
      </div>
    </div>
  );
}
