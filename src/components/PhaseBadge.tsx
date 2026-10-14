import type { CyclePhaseKey } from "../types/cycle";

type Props = {
  phase: CyclePhaseKey;
  className?: string;
};

const phaseClasses: Record<CyclePhaseKey, string> = {
  menstrual: "bg-phase-menstrual-bg text-phase-menstrual-text",
  follicular: "bg-phase-follicular-bg text-phase-follicular-text",
  ovulatory: "bg-phase-ovulatory-bg text-phase-ovulatory-text",
  luteal: "bg-phase-luteal-bg text-phase-luteal-text",
};

export function PhaseBadge({ phase, className = "" }: Props) {
  const label =
    phase === "menstrual"
      ? "Menstrual"
      : phase === "follicular"
        ? "Follicular"
        : phase === "ovulatory"
          ? "Ovulatory"
          : "Luteal";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${phaseClasses[phase]} ${className}`}
    >
      {label}
    </span>
  );
}
