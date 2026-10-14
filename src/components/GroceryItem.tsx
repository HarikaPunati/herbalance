type Props = {
  checked: boolean;
  name: string;
  note?: string;
  quantity?: string;
  onToggle: () => void;
};

export function GroceryItem({ checked, name, note, quantity, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-start gap-3 rounded-input border border-transparent px-1 py-2 text-left transition-colors hover:bg-brand-surface"
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
          checked
            ? "border-primary bg-primary text-white"
            : "border-primary/40 bg-white text-transparent"
        }`}
      >
        ✓
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-medium transition-all duration-200 ${
            checked ? "text-ink-soft line-through" : "text-ink-dark"
          }`}
        >
          {name}
        </span>
        {note && <span className="mt-0.5 block text-xs text-ink-soft">{note}</span>}
      </span>
      {quantity && (
        <span className={`shrink-0 text-sm font-medium ${checked ? "text-ink-soft" : "text-ink-mid"}`}>
          {quantity}
        </span>
      )}
    </button>
  );
}
