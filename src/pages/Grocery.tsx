import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GroceryItem } from "../components/GroceryItem";
import { ProgressBar } from "../components/ProgressBar";
import { loadLocalPlan, todayPlanIndex } from "../lib/dietPlanStore";

type Item = { name: string; note?: string; qty: string };
type Cat = { label: string; tone: string; items: Item[] };

// Checked in order — first match wins, so specific words (e.g. "coconut milk") come before generic ones.
const CATEGORIES: { label: string; tone: string; words: string[] }[] = [
  { label: "🍵 Drinks & Teas", tone: "bg-teal-100 text-teal-900", words: ["tea", "coffee", "matcha", "kombucha"] },
  { label: "🥛 Dairy/Alternatives", tone: "bg-sky-100 text-sky-900", words: ["milk", "yogurt", "yoghurt", "curd", "cheese", "paneer", "feta", "butter", "ghee", "kefir", "cream", "labneh"] },
  { label: "🥩 Proteins", tone: "bg-rose-100 text-rose-800", words: ["chicken", "salmon", "fish", "tuna", "cod", "mackerel", "sardine", "prawn", "shrimp", "egg", "tofu", "tempeh", "beef", "lamb", "turkey", "pork", "edamame", "protein powder", "seitan"] },
  { label: "🫘 Legumes", tone: "bg-lime-100 text-lime-900", words: ["lentil", "dal", "chickpea", "bean", "chana", "moong", "rajma", "hummus", "pea"] },
  { label: "🌰 Nuts & Seeds", tone: "bg-orange-100 text-orange-900", words: ["almond", "walnut", "cashew", "pistachio", "peanut", "pecan", "seed", "flax", "chia", "nut butter", "tahini", "nuts"] },
  { label: "🌾 Grains", tone: "bg-yellow-100 text-yellow-900", words: ["oat", "quinoa", "rice", "bread", "tortilla", "pasta", "noodle", "millet", "barley", "buckwheat", "couscous", "bulgur", "roti", "flour", "poha", "dosa", "idli", "wrap", "cracker"] },
  { label: "🍎 Fruits", tone: "bg-amber-100 text-amber-900", words: ["berry", "berries", "apple", "banana", "orange", "lemon", "lime", "mango", "pear", "kiwi", "pomegranate", "grape", "cherry", "date", "fig", "papaya", "pineapple", "peach", "plum", "melon", "avocado"] },
  { label: "🥦 Vegetables", tone: "bg-emerald-100 text-emerald-800", words: ["spinach", "kale", "broccoli", "carrot", "pepper", "tomato", "cucumber", "onion", "garlic", "ginger", "zucchini", "courgette", "cauliflower", "cabbage", "lettuce", "greens", "arugula", "rocket", "mushroom", "beet", "sweet potato", "potato", "squash", "pumpkin", "asparagus", "celery", "eggplant", "aubergine", "okra", "radish", "leek", "scallion", "herb", "cilantro", "coriander", "parsley", "basil", "mint", "dill", "bok choy", "sprout"] },
];
const PANTRY = { label: "🫙 Pantry Staples", tone: "bg-stone-100 text-stone-800" };

function categorise(ingredient: string): { label: string; tone: string } {
  const s = ingredient.toLowerCase();
  return CATEGORIES.find((c) => c.words.some((w) => s.includes(w))) ?? PANTRY;
}

function buildList(days: { meals: { ingredients: string[] }[] }[]): Cat[] {
  const counts = new Map<string, { name: string; n: number }>();
  for (const day of days) {
    for (const meal of day.meals) {
      for (const raw of meal.ingredients) {
        const name = raw.trim();
        if (!name) continue;
        const key = name.toLowerCase();
        const cur = counts.get(key);
        if (cur) cur.n += 1;
        else counts.set(key, { name: name.charAt(0).toUpperCase() + name.slice(1), n: 1 });
      }
    }
  }
  const order = [...CATEGORIES.map((c) => c.label), PANTRY.label];
  const cats = new Map<string, Cat>();
  for (const { name, n } of counts.values()) {
    const c = categorise(name);
    if (!cats.has(c.label)) cats.set(c.label, { label: c.label, tone: c.tone, items: [] });
    cats.get(c.label)!.items.push({ name, qty: n > 1 ? `×${n} meals` : "" });
  }
  return [...cats.values()]
    .sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))
    .map((c) => ({ ...c, items: c.items.sort((a, b) => a.name.localeCompare(b.name)) }));
}

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
    if (!dietPlan) return { data: [] as Cat[], rangeLabel: "" };
    const from = (todayPlanIndex(dietPlan) ?? 0) + (week === "next" ? 7 : 0);
    const days = dietPlan.plan.slice(from, from + 7);
    const label = days.length > 0 ? `Days ${from + 1}–${from + days.length} of your ${dietPlan.plan.length}-day meal plan` : "";
    return { data: buildList(days), rangeLabel: label };
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

  const copy = () => {
    const text = data
      .map((c) => `${c.label}\n${c.items.map((i) => `- ${i.name}${i.qty ? ` (${i.qty})` : ""}`).join("\n")}`)
      .join("\n\n");
    void navigator.clipboard.writeText(text);
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
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-dark shadow-sm btn-press hover:shadow-card"
        >
          Share List
        </button>
        <button
          type="button"
          onClick={copy}
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-dark shadow-sm btn-press hover:shadow-card"
        >
          Copy to clipboard
        </button>
        <button
          type="button"
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-dark shadow-sm btn-press hover:shadow-card"
        >
          Download PDF
        </button>
      </div>

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
