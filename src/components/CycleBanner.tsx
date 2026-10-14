import type { CyclePhaseKey } from "../types/cycle";
import { PHASE_META } from "../types/cycle";

type Props = {
  phase: CyclePhaseKey;
  day: number;
  cycleLength: number;
  nextPhaseDays: number;
  tip: string;
  compact?: boolean;
  intensity?: string;
};

const phaseBg: Record<CyclePhaseKey, string> = {
  menstrual: "bg-phase-menstrual-bg/80",
  follicular: "bg-phase-follicular-bg/80",
  ovulatory: "bg-phase-ovulatory-bg/80",
  luteal: "bg-phase-luteal-bg/80",
};

const phaseText: Record<CyclePhaseKey, string> = {
  menstrual: "text-phase-menstrual-text",
  follicular: "text-phase-follicular-text",
  ovulatory: "text-phase-ovulatory-text",
  luteal: "text-phase-luteal-text",
};

function Ring({ day, total }: { day: number; total: number }) {
  const size = 88;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, day / total);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(30,58,95,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-display text-ink-dark">
        <span className="text-xl font-bold leading-none">{day}</span>
        <span className="text-[10px] font-medium text-ink-mid">of {total}</span>
      </div>
    </div>
  );
}

export function CycleBanner({
  phase,
  day,
  cycleLength,
  nextPhaseDays,
  tip,
  compact,
  intensity,
}: Props) {
  const meta = PHASE_META[phase];
  return (
    <div
      className={`relative overflow-hidden rounded-card border border-white/40 shadow-card ${phaseBg[phase]} ${compact ? "p-4" : "p-6"}`}
    >
      <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${phaseText[phase]}`}>
        <div className="flex items-start gap-4">
          <span className={compact ? "text-4xl" : "text-5xl"}>{meta.emoji}</span>
          <div>
            <p className={`font-display font-bold ${compact ? "text-lg" : "text-[22px]"}`}>{meta.label}</p>
            <p className="mt-1 text-sm font-medium opacity-90">
              You&apos;re in your {meta.label} phase
            </p>
            {intensity && (
              <p className="mt-2 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-ink-dark">
                {intensity}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <Ring day={day} total={cycleLength} />
            <p className={`mt-2 text-xs font-medium ${phaseText[phase]} opacity-90`}>
              Next phase in {nextPhaseDays} days
            </p>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-ink-dark shadow-sm">
          <span>💡</span>
          <span>{tip}</span>
        </div>
      )}
    </div>
  );
}
