import { CycleBanner } from "../components/CycleBanner";
import { PhaseBadge } from "../components/PhaseBadge";
import { PHASE_META, PHASE_TIP, formatRange, phaseRanges } from "../types/cycle";
import type { CyclePhaseKey } from "../types/cycle";
import { Link } from "react-router-dom";
import { useProfileData } from "../hooks/useProfileData";

export function Cycle() {
  const { cycleDay, cycleLength, cycleLengthStr, phase, nextPhaseDays, nextPeriodDate, lastPeriodDate } = useProfileData();
  const meta = PHASE_META[phase];
  const ranges = phaseRanges(cycleLength);
  const irregular = cycleLengthStr === "Irregular";
  const order: CyclePhaseKey[] = ["menstrual", "follicular", "ovulatory", "luteal"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-dark">My Cycle</h1>
          <p className="text-sm text-ink-mid">Cycle syncing hub — plan meals & workouts with your hormones</p>
        </div>
        <Link to="/profile" className="text-sm font-semibold text-primary hover:underline">
          Edit cycle settings →
        </Link>
      </div>

      <CycleBanner
        phase={phase}
        day={cycleDay}
        cycleLength={cycleLength}
        nextPhaseDays={nextPhaseDays}
        tip={PHASE_TIP[phase]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <h2 className="font-display font-bold text-ink-dark">Phase snapshot</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PhaseBadge phase={phase} />
            <span className="text-sm text-ink-mid">
              {meta.emoji} {formatRange(ranges[phase])} of your {cycleLength}-day cycle
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-mid">{meta.description}</p>
        </div>
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <h2 className="font-display font-bold text-ink-dark">This cycle</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-mid">
            <li>
              <span className="font-semibold text-ink-dark">Cycle length:</span>{" "}
              {irregular ? "Irregular (estimates assume 28 days)" : `${cycleLength} days`}
            </li>
            <li>
              <span className="font-semibold text-ink-dark">Today:</span> day {cycleDay}
            </li>
            <li>
              <span className="font-semibold text-ink-dark">Next period expected:</span>{" "}
              {nextPeriodDate && lastPeriodDate ? `around ${nextPeriodDate}` : "add your last period date in Profile"}
            </li>
          </ul>
          <ol className="mt-4 space-y-1.5">
            {order.map((k) => (
              <li
                key={k}
                className={`flex items-center justify-between rounded-input px-3 py-1.5 text-xs ${
                  k === phase ? "bg-primary-pale font-semibold text-ink-dark" : "text-ink-mid"
                }`}
              >
                <span>{PHASE_META[k].emoji} {PHASE_META[k].label}</span>
                <span>{formatRange(ranges[k])}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-card border border-dashed border-primary/30 bg-primary-pale/40 p-5 text-sm text-ink-mid">
        <p className="font-semibold text-ink-dark">Education, not diagnosis</p>
        <p className="mt-2">
          HerBalance helps you notice patterns. If pain, bleeding, or mood changes feel unmanageable, reach out to a
          clinician you trust.
        </p>
      </div>
    </div>
  );
}
