import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

export function ConditionChip({ children, selected, onClick, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
        selected
          ? "border-primary bg-primary text-white"
          : "border-primary bg-white text-primary hover:bg-primary/5"
      } ${onClick ? "cursor-pointer" : "cursor-default"} ${className}`}
    >
      {children}
    </button>
  );
}
