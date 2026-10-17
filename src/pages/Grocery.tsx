import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GroceryItem } from "../components/GroceryItem";
import { ProgressBar } from "../components/ProgressBar";
import { loadLocalPlan, todayPlanIndex } from "../lib/dietPlanStore";
import { buildGroceryList } from "../lib/groceryList";
import { copyText, downloadGroceryPdf, groceryListText, shareText } from "../lib/groceryExport";
import type { GroceryCategory } from "../lib/groceryList";

const CHECKED_KEY = "herbalance_grocery_checked";

function loadChecked(scope: string): Record<string, boolean> {
  try {
    const all = JSON.parse(localStorage.getItem(CHECKED_KEY) ?? "{}");
    return all.scope === scope ? all.checked ?? {} : {};
  } catch {
    return {};
  }
}

export function Grocery() {
  const dietPlan = useMemo(loadLocalPlan, []);
  const [week, setWeek] = useState<"this" | "next">("this");

  const { data, rangeLabel } = useMemo(() => {
    if (!dietPlan) return { data: [] as GroceryCategory[], rangeLabel: "" };
    const from = (todayPlanIndex(dietPlan) ?? 0) + (week === "next" ? 7 : 0);
    const days = dietPlan.plan.slice(from, from + 7);
    const label = days.length > 0 ? `Days ${from + 1}–${from + days.length} of your ${dietPlan.plan.length}-day meal plan` : "";
    return { data: buildGroceryList(days), rangeLabel: label };
  }, [dietPlan, week]);

  const scope = `${dietPlan?.startDate ?? ""}:${week}`;
  const [checkedState, setCheckedState] = useState<{ scope: string; checked: Record<string, boolean> }>(() => ({
    scope,
    checked: loadChecked(scope),
  }));
  const checked = checkedState.scope === scope ? checkedState.checked : loadChecked(scope);

  const keys = useMemo(() => data.flatMap((c) => c.items.map((i) => i.name.toLowerCase())), [data]);
  const total = keys.length;
  const done = keys.filter((k) => checked[k]).length;
  const pct = total ? (done / total) * 100 : 0;

  const toggle = (k: string) => {
    const next = { scope, checked: { ...checked, [k]: !checked[k] } };
    setCheckedState(next);
    localStorage.setItem(CHECKED_KEY, JSON.stringify(next));
  };

  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const flash = (text: string, ok = true) => {
    setStatus({ text, ok });
    window.setTimeout(() => setStatus(null), 3000);
  };

  const copy = async () => {
    const ok = await copyText(groceryListText(data, rangeLabel, checked));
    flash(ok ? "Copied to clipboard ✓" : "Couldn't copy — your browser blocked it.", ok);
  };

  const share = async () => {
    const result = await shareText("HerBalance grocery list", groceryListText(data, rangeLabel, checked));
    if (result === "shared") flash("Shared ✓");
    else if (result === "unsupported") {
      const ok = await copyText(groceryListText(data, rangeLabel, checked));
      flash(ok ? "Sharing isn't available in this browser — copied the list instead ✓" : "Sharing isn't available in this browser.", ok);
    }
  };

  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      await downloadGroceryPdf(data, rangeLabel, checked);
      flash("PDF downloaded ✓");
    } catch {
      flash("Couldn't create the PDF. Please try again.", false);
    } finally {
      setPdfBusy(false);
    }
  };

  if (!dietPlan) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-ink-dark">Your Grocery List</h1>
        <div className="rounded-card border border-dashed border-primary/30 bg-white p-8 text-center shadow-card">
          <p className="text-3xl">🛒</p>
          <p className="mt-3 font-semibold text-ink-dark">Your list is built from your meal plan</p>
          <p className="mt-1 text-sm text-ink-mid">Generate a plan first and every ingredient will show up here, sorted by aisle.</p>
          <Link
            to="/diet"
            className="btn-press mt-5 inline-flex rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-primary-dark"
          >
            Go to My Diet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-ink-dark">Your Grocery List</h1>
            <select
              value={week}
              onChange={(e) => setWeek(e.target.value as "this" | "next")}
              className="rounded-input border border-border bg-white px-3 py-2 text-sm font-medium text-ink-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/30">
              <option>This week</option>
              <option>Next week</option>
            </select>
          </div>
          <p className="mt-1 text-sm text-ink-mid">
            {rangeLabel || "Your meal plan doesn't cover next week — generate a 2-week plan to plan ahead"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void share()}
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-dark shadow-sm btn-press hover:shadow-card"
        >
          Share List
        </button>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-dark shadow-sm btn-press hover:shadow-card"
        >
          Copy to clipboard
        </button>
        <button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={pdfBusy || data.length === 0}
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-dark shadow-sm btn-press hover:shadow-card disabled:opacity-50"
        >
          {pdfBusy ? "Creating PDF…" : "Download PDF"}
        </button>
      </div>
      {status && (
        <p
          role="status"
          className={`-mt-3 text-sm font-medium ${status.ok ? "text-emerald-700" : "text-rose-700"}`}
        >
          {status.text}
        </p>
      )}

      <div className="space-y-6">
        {data.map((cat) => (
          <section key={cat.label}>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${cat.tone}`}>{cat.label}</span>
            <div className="mt-3 divide-y divide-border rounded-card border border-border bg-white shadow-card">
              {cat.items.map((item) => {
                const k = item.name.toLowerCase();
                return (
                  <div key={k} className="px-3 py-1">
                    <GroceryItem
                      checked={!!checked[k]}
                      name={item.name}
                      note={item.note}
                      quantity={item.qty || undefined}
                      onToggle={() => toggle(k)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-card border border-border bg-white p-4 shadow-card">
        <p className="text-sm font-semibold text-ink-dark">
          You&apos;ve checked off {done} of {total} items
        </p>
        <div className="mt-3">
          <ProgressBar value={pct} showLabel={false} />
          <p className="mt-2 text-right text-xs font-semibold text-primary">{Math.round(pct)}%</p>
        </div>
      </div>
    </div>
  );
}
