import { useEffect, useState } from "react";

type Props = {
  value: number;
  className?: string;
  showLabel?: boolean;
};

export function ProgressBar({ value, className = "", showLabel = true }: Props) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(Math.min(100, Math.max(0, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-2 flex justify-between text-sm font-medium text-ink-mid">
          <span>Progress</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-sm transition-[width] duration-[600ms] ease-out"
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}
