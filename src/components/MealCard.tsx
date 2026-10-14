import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type MealCardProps = {
  timeLabel: string;
  timeTone: "primary" | "accent" | "green" | "orange";
  title: string;
  ingredients: string[];
  calories: number;
  tags: string[];
  recipe?: string;
};

const toneMap = {
  primary: "bg-primary text-white",
  accent: "bg-accent text-white",
  green: "bg-emerald-500 text-white",
  orange: "bg-amber-500 text-white",
};

export function MealCard({
  timeLabel,
  timeTone,
  title,
  ingredients,
  calories,
  tags,
  recipe,
}: MealCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-card border border-border bg-white shadow-card transition-shadow duration-150 hover:shadow-card-hover">
      <div className="border-l-4 border-primary pl-4 pr-3 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneMap[timeTone]}`}
              >
                {timeLabel}
              </span>
              <h3 className="font-display text-base font-bold text-ink-dark">{title}</h3>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ingredients.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-brand-surface px-2 py-0.5 text-xs text-ink-mid"
                >
                  {i}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-primary">{calories} kcal</span>
              <div className="flex flex-wrap gap-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary-dark"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ChevronDown
            className={`mt-1 h-5 w-5 shrink-0 text-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && recipe && (
          <div className="mt-3 rounded-input border border-border bg-brand-surface p-3 text-sm text-ink-mid animate-fade-in">
            <p className="font-medium text-ink-dark">Recipe & instructions</p>
            <p className="mt-2 leading-relaxed">{recipe}</p>
          </div>
        )}
      </div>
    </div>
  );
}
