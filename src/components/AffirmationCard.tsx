import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { CyclePhaseKey } from "../types/cycle";
import { getAffirmation } from "../utils/affirmations";

type Props = {
  phase: CyclePhaseKey;
  cycleDay: number;
  onRefresh?: () => void;
};

export function AffirmationCard({ phase, cycleDay, onRefresh }: Props) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setRotation(0);
  }, [cycleDay]);

  const quote = useMemo(
    () => getAffirmation(phase, cycleDay, rotation),
    [phase, cycleDay, rotation]
  );

  const handleRefresh = () => {
    setRotation((r) => r + 1);
    onRefresh?.();
  };

  return (
    <div className="relative overflow-hidden rounded-card border border-accent-light/60 bg-gradient-to-r from-accent-pale to-[#EDE9FE] pl-5 pr-12 py-5 shadow-sm animate-fade-in-slow">
      <div className="absolute left-0 top-0 h-full w-1 bg-accent" />
      <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
        Today&apos;s affirmation
      </p>
      <p className="mt-2 font-display text-lg italic leading-relaxed text-[#5B21B6]">{quote}</p>
      <button
        type="button"
        onClick={handleRefresh}
        className="absolute right-4 top-4 rounded-full p-2 text-accent hover:bg-white/60 btn-press"
        aria-label="Show another affirmation"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  );
}
