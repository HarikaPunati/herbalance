// Turns a meal plan's free-text ingredients into a short, aisle-sorted shopping list.
// Pure functions only — no React, no storage — so it's easy to test against real plans.

export type GroceryRow = { name: string; note?: string; qty: string };
export type GroceryCategory = { label: string; tone: string; items: GroceryRow[] };

const CAT = {
  produce: { label: "🥦 Vegetables & Herbs", tone: "bg-emerald-100 text-emerald-800" },
  fruit: { label: "🍎 Fruits", tone: "bg-amber-100 text-amber-900" },
  protein: { label: "🥩 Proteins", tone: "bg-rose-100 text-rose-800" },
  dairy: { label: "🥛 Dairy/Alternatives", tone: "bg-sky-100 text-sky-900" },
  legumes: { label: "🫘 Legumes", tone: "bg-lime-100 text-lime-900" },
  grains: { label: "🌾 Grains & Bread", tone: "bg-yellow-100 text-yellow-900" },
  nuts: { label: "🌰 Nuts & Seeds", tone: "bg-orange-100 text-orange-900" },
  pantry: { label: "🫙 Pantry Staples", tone: "bg-stone-100 text-stone-800" },
  drinks: { label: "🍵 Drinks & Teas", tone: "bg-teal-100 text-teal-900" },
} as const;
type CatKey = keyof typeof CAT;
const CAT_ORDER: CatKey[] = ["produce", "fruit", "protein", "dairy", "legumes", "grains", "nuts", "pantry", "drinks"];

// Words that don't change what you buy. Stripped before merging ("fresh ginger" = "ginger").
const FILLER = /\b(fresh|plain|natural|unsweetened|light|lean|extra virgin|virgin|organic|raw|dried|ground|firm|low-fat|full-fat|chopped|sliced|large|small|ripe)\b/g;

// Phrases checked first, because a generic word inside them would mis-file them
// ("peanut butter" is not dairy, "fish sauce" is not a protein, "rice vinegar" is not a grain).
const OVERRIDES: [string, CatKey][] = [
  ["peanut butter", "nuts"], ["almond butter", "nuts"], ["nut butter", "nuts"], ["tahini", "nuts"],
  ["coconut milk", "pantry"], ["coconut cream", "pantry"], ["coconut flakes", "pantry"],
  ["almond milk", "dairy"], ["oat milk", "dairy"], ["soy milk", "dairy"],
  ["vinegar", "pantry"], ["sauce", "pantry"], ["paste", "pantry"], ["mustard", "pantry"],
  ["blossom water", "pantry"], ["stock", "pantry"], ["broth", "pantry"],
  ["green beans", "produce"], ["tomato", "produce"], ["lime leaves", "produce"], ["sweetcorn", "produce"],
  ["corn tortilla", "grains"], ["rice paper", "grains"], ["bread", "grains"], ["crispbread", "grains"],
];

// First match wins, in this order.
const CATEGORY_WORDS: [CatKey, string[]][] = [
  ["drinks", ["tea", "coffee", "matcha", "kombucha"]],
  ["dairy", ["milk", "yogurt", "yoghurt", "skyr", "kefir", "curd", "cheese", "paneer", "feta", "halloumi", "butter", "ghee", "cream", "labneh"]],
  ["protein", ["chicken", "turkey", "beef", "lamb", "pork", "salmon", "tuna", "cod", "mackerel", "sardine", "trout", "fish", "prawn", "shrimp", "egg", "tofu", "tempeh", "seitan", "edamame", "protein powder"]],
  ["legumes", ["lentil", "dal", "chickpea", "bean", "chana", "moong", "rajma", "hummus", "split pea"]],
  ["grains", ["oat", "quinoa", "rice", "tortilla", "pasta", "noodle", "soba", "millet", "barley", "buckwheat", "couscous", "bulgur", "freekeh", "roti", "flour", "poha", "wrap", "cracker"]],
  ["nuts", ["almond", "walnut", "cashew", "pistachio", "peanut", "pecan", "brazil nut", "hazelnut", "seed", "flax", "chia", "hemp"]],
  ["fruit", ["berry", "berries", "apple", "banana", "orange", "lemon", "lime", "mango", "pear", "kiwi", "pomegranate", "grape", "cherry", "date", "fig", "papaya", "pineapple", "peach", "plum", "melon", "avocado", "guava"]],
  ["produce", ["spinach", "kale", "chard", "broccoli", "carrot", "pepper", "tomato", "cucumber", "onion", "shallot", "garlic", "ginger", "zucchini", "courgette", "cauliflower", "cabbage", "lettuce", "greens", "rocket", "arugula", "watercress", "mushroom", "beet", "potato", "squash", "pumpkin", "asparagus", "celery", "aubergine", "eggplant", "okra", "radish", "leek", "scallion", "bok choy", "choy", "sprout", "jicama", "corn", "peas", "chilli", "chili", "jalapeñ", "basil", "mint", "dill", "parsley", "coriander", "cilantro", "thyme", "rosemary", "lemongrass"]],
];

// Dried spices and seasonings collapse into a single row.
const SPICES = ["cumin", "turmeric", "paprika", "cinnamon", "garam masala", "chilli powder", "chili powder", "kashmiri chilli", "chipotle", "cayenne", "coriander seed", "cardamom", "clove", "nutmeg", "oregano", "black pepper", "salt", "sumac", "za'atar", "curry powder", "fennel seed", "mustard seed", "bay lea", "allspice", "five spice", "ras el hanout"];

// Variants of the same item merge into one row named by the group; `strip` removes the
// group word so the note lists just the variants ("chicken thigh" → "thigh").
const GROUPS: { name: string; match: RegExp; strip?: RegExp }[] = [
  { name: "Chicken", match: /^chicken\b/, strip: /\bchicken\b/ },
  { name: "Eggs", match: /^eggs?$|^egg (whites?|yolks?)$/ },
  { name: "Rice", match: /\brice$/, strip: /\brice$/ },
  { name: "Lentils & dal", match: /\b(lentils?|dal)$/, strip: /\blentils?$/ },
  { name: "Bell peppers", match: /\bbell peppers?$/, strip: /\bbell peppers?$/ },
  { name: "Lettuce", match: /\blettuce$/, strip: /\blettuce$/ },
  { name: "Bread", match: /\b(bread|crispbread)$/, strip: /\bbread$/ },
  { name: "Fish", match: /\b(cod|salmon|mackerel|trout|sardines?|tuna|haddock|sea bass|tilapia|white fish)\b/, strip: /\s*fillets?$/ },
  { name: "Fresh herbs", match: /^(thai )?(coriander|cilantro|dill|mint|parsley|basil|thyme|rosemary|chives)$/ },
  { name: "Fresh chillies", match: /^(green|red|bird's eye) chill?(i|ies)$|^jalape(ñ|n)os?$/ },
  { name: "Beans", match: /^(?!green beans$).*\bbeans$/, strip: /\s*beans$/ },
  { name: "Berries", match: /berr(y|ies)$/ },
  { name: "Tomatoes", match: /^(cherry |plum |vine )?tomato(es)?$/, strip: /\s*tomato(es)?$/ },
];

// Kept-in-stock rows: no "×N meals" count, it would only be noise.
const STOCK_ROWS = new Set(["Spices & seasonings", "Cooking oils"]);

const normalize = (s: string) => s.toLowerCase().replace(FILLER, " ").replace(/\s+/g, " ").trim();

const singular = (s: string) =>
  s.endsWith("ies") ? s.slice(0, -3) + "y"
  : s.endsWith("oes") ? s.slice(0, -2)
  : s.endsWith("s") && !s.endsWith("ss") && !s.endsWith("us") ? s.slice(0, -1)
  : s;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);


export function categorise(name: string): CatKey {
  const n = normalize(name);
  const o = OVERRIDES.find(([phrase]) => n.includes(phrase));
  if (o) return o[1];
  if (n.endsWith(" oil") || n === "oil") return "pantry";
  return CATEGORY_WORDS.find(([, words]) => words.some((w) => n.includes(w)))?.[0] ?? "pantry";
}

export function buildGroceryList(days: { meals: { ingredients: string[] }[] }[]): GroceryCategory[] {
  type Row = { name: string; cat: CatKey; meals: number; variants: Set<string> };
  const rows = new Map<string, Row>();

  const add = (key: string, name: string, cat: CatKey, variant?: string) => {
    const row = rows.get(key) ?? { name, cat, meals: 0, variants: new Set<string>() };
    row.meals += 1;
    if (variant) row.variants.add(variant);
    rows.set(key, row);
  };

  for (const day of days) {
    for (const meal of day.meals) {
      for (const raw of meal.ingredients) {
        const n = normalize(raw);
        if (!n || n === "water") continue;

        if (SPICES.some((s) => n.includes(s))) {
          add("__spices", "Spices & seasonings", "pantry", n);
          continue;
        }
        if (n.endsWith(" oil") || n === "oil") {
          add("__oils", "Cooking oils", "pantry", n.replace(/ oil$/, ""));
          continue;
        }
        const group = GROUPS.find((g) => g.match.test(n));
        if (group) {
          const variant = group.strip ? n.replace(group.strip, "").trim() || "plain" : n;
          add(`__${group.name}`, group.name, categorise(n), variant);
          continue;
        }
        add(singular(n), titleCase(n), categorise(n));
      }
    }
  }

  const byCat = new Map<CatKey, GroceryRow[]>();
  for (const r of rows.values()) {
    const variants = [...r.variants].filter((v) => v !== "plain");
    const note = variants.length > 0 ? variants.join(", ") : undefined;
    const list = byCat.get(r.cat) ?? [];
    list.push({ name: r.name, note, qty: r.meals > 1 && !STOCK_ROWS.has(r.name) ? `×${r.meals} meals` : "" });
    byCat.set(r.cat, list);
  }

  return CAT_ORDER.filter((k) => byCat.has(k)).map((k) => ({
    ...CAT[k],
    items: byCat.get(k)!.sort((a, b) => a.name.localeCompare(b.name)),
  }));
}
