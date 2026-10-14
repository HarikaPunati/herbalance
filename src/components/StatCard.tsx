import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  value: string;
  label: string;
};

export function StatCard({ icon, value, label }: Props) {
  return (
    <div className="card-hover rounded-card border border-border bg-white p-4 shadow-card">
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 font-display text-xl font-bold text-ink-dark">{value}</p>
      <p className="text-sm text-ink-mid">{label}</p>
    </div>
  );
}
