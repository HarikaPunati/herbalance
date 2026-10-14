import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { CONDITION_EDUCATION, type ConditionId } from "../data/conditionEducation";

// ─── Load user conditions from profile ───────────────────────────────────────

function loadUserConditions(): ConditionId[] {
  try {
    const raw = localStorage.getItem("herbalance_profile");
    if (!raw) return [];
    const profile = JSON.parse(raw) as { conditions?: string[] };
    const ids: string[] = profile.conditions ?? [];
    return ids.filter((id): id is ConditionId => id in CONDITION_EDUCATION);
  } catch { return []; }
}

// ─── Supplement data ──────────────────────────────────────────────────────────

type Supplement = {
  id: string;
  name: string;
  emoji: string;
  conditions: ConditionId[];
  importance: string;
  dose: string;
  time: string;
  phase: string;
  doctorNote: string | null; // null = no disclaimer (teas/herbal drinks)
};

const ALL_SUPPLEMENTS: Supplement[] = [
  {
    id: "inositol",
    name: "Inositol (Myo + D-Chiro)",
    emoji: "🫧",
    conditions: ["pmos", "pcod"],
    importance:
      "Inositol is the most extensively researched supplement for PMOS and PCOD. Myo-inositol improves insulin signalling at the cellular level, reducing the excess insulin that drives androgen overproduction — the root cause of irregular cycles, acne, and unwanted hair growth. Clinical trials show it supports regular ovulation, reduces androgen levels, and improves metabolic markers, with a safety profile comparable to a B vitamin.",
    dose: "2g myo-inositol + 50mg d-chiro-inositol (40:1 ratio), twice daily",
    time: "Morning and evening, 30 min before meals",
    phase: "Continuous use — most benefits observed after 3–6 months",
    doctorNote: "For awareness only. Consult your doctor before starting, especially if you are on medication or managing blood sugar.",
  },
  {
    id: "magnesium",
    name: "Magnesium Glycinate",
    emoji: "🌙",
    conditions: ["pmos", "thyroid", "pcod", "endo", "pmdd", "other"],
    importance:
      "Magnesium is involved in over 300 enzymatic reactions, including those that regulate cortisol, insulin sensitivity, and sex hormone production. The glycinate form is the most bioavailable and gentlest on digestion. It directly relaxes uterine muscle to reduce period cramps, calms the nervous system to ease luteal phase anxiety, and supports the deep sleep that allows hormonal repair overnight. Studies consistently show most women with hormonal conditions are deficient.",
    dose: "200–400mg elemental magnesium daily",
    time: "With dinner — especially beneficial taken 1–2 hours before sleep",
    phase: "Particularly valuable in the luteal phase (week 3–4 of cycle)",
    doctorNote: "For awareness only. Consult your doctor before starting, particularly if you have kidney conditions or take medications.",
  },
  {
    id: "omega3",
    name: "Omega-3 (EPA/DHA)",
    emoji: "🐟",
    conditions: ["pmos", "pcod", "endo", "pmdd", "other"],
    importance:
      "Omega-3 fatty acids directly suppress prostaglandin production — the inflammatory compounds responsible for period cramps, pelvic pain, and hormonal mood swings. EPA specifically reduces systemic inflammation, while DHA supports brain serotonin pathways that modulate emotional regulation. In PMOS and PCOD, omega-3 has been shown to lower circulating testosterone. In endometriosis, it may reduce lesion-associated inflammation. This is one of the most universally beneficial supplements for hormonal health.",
    dose: "1–2g combined EPA + DHA daily (look for a ratio weighted toward EPA)",
    time: "With the largest meal of the day to improve absorption",
    phase: "Helpful across all phases — consistent daily use matters most",
    doctorNote: "For awareness only. Consult your doctor before starting, especially if you take blood thinners or are pre-surgical.",
  },
  {
    id: "vitd",
    name: "Vitamin D3 + K2",
    emoji: "☀️",
    conditions: ["pmos", "thyroid", "pcod", "endo", "pmdd", "other"],
    importance:
      "Vitamin D functions as a steroid hormone, not just a vitamin. It has receptors in virtually every tissue — including the ovaries, uterus, and thyroid gland. Deficiency is found in 70–85% of women with PMOS, and is strongly linked to thyroid autoimmunity progression. Adequate vitamin D supports insulin sensitivity, regulates immune function, and is essential for follicular development and ovulation. K2 is paired to direct calcium to bones rather than soft tissues. Without sufficient D3, most hormonal protocols deliver suboptimal results.",
    dose: "1,000–4,000 IU D3 daily depending on baseline levels (test first ideally) + 100mcg K2 MK-7",
    time: "With breakfast or your fattiest meal — D3 is fat-soluble",
    phase: "Consistent daily use — levels build slowly over weeks to months",
    doctorNote: "Test your 25-OH vitamin D level before dosing — D3 is fat-soluble and can accumulate to toxic levels. Doctor guidance recommended for doses above 2,000 IU.",
  },
  {
    id: "selenium",
    name: "Selenium",
    emoji: "🧪",
    conditions: ["thyroid"],
    importance:
      "The thyroid gland concentrates more selenium than any other organ in the body. Selenium is the essential cofactor for the enzyme (deiodinase) that converts inactive T4 into the active T3 form your cells can actually use. In Hashimoto's thyroiditis, selenium supplementation has been shown in multiple studies to significantly reduce thyroid peroxidase (TPO) antibody levels and improve quality of life measures — making it one of the most evidence-backed supplements for autoimmune thyroid conditions.",
    dose: "100–200mcg selenomethionine daily (avoid exceeding 400mcg — the margin for excess is narrow)",
    time: "With lunch",
    phase: "Steady, consistent intake — work with your doctor to monitor levels",
    doctorNote: "Selenium has a narrow therapeutic window — excess intake is harmful. Do not self-dose above 200mcg without confirmed deficiency and medical oversight.",
  },
  {
    id: "zinc",
    name: "Zinc",
    emoji: "⚙️",
    conditions: ["pmos", "thyroid", "pcod", "endo"],
    importance:
      "Zinc is a critical cofactor for thyroid hormone production, immune regulation, and the conversion of androgens to oestrogen. In PMOS and PCOD, zinc reduces the androgen-driven skin symptoms — acne, oiliness, and hair changes — while also supporting more regular ovulation. In thyroid conditions, zinc deficiency impairs T3 receptor sensitivity, meaning your cells can't respond properly even when hormone levels look normal on paper. Most women with hormonal conditions test deficient.",
    dose: "15–25mg zinc bisglycinate or picolinate (these forms are best absorbed)",
    time: "With food — zinc on an empty stomach commonly causes nausea",
    phase: "Especially useful when acne or hair symptoms flare in the luteal phase",
    doctorNote: "For awareness only. Consult your doctor before starting — long-term high-dose zinc can deplete copper levels.",
  },
  {
    id: "bcomplex",
    name: "B-Complex (with methylfolate)",
    emoji: "🔋",
    conditions: ["thyroid", "pmdd", "other"],
    importance:
      "B vitamins are essential co-factors for energy metabolism, adrenal function, and neurotransmitter synthesis. In hypothyroidism, slowed cellular metabolism depletes B vitamins faster. B6 specifically is required to convert tryptophan into serotonin — making it directly relevant to the mood shifts of PMDD. B12 and folate support the methylation cycle, which governs oestrogen clearance and detoxification. A methylated form (containing methylfolate and methylcobalamin) is better absorbed, especially if you carry common MTHFR gene variants.",
    dose: "1 low-dose B-complex daily containing activated forms (methylfolate, methylcobalamin)",
    time: "Morning with food — B vitamins are energising and may disrupt sleep if taken late",
    phase: "Avoid taking after 3pm if you are sleep-sensitive",
    doctorNote: "For awareness only. Consult your doctor before starting, especially if you take medications that interact with folate or B12.",
  },
  {
    id: "iron",
    name: "Iron Bisglycinate",
    emoji: "🩸",
    conditions: ["endo", "pmdd"],
    importance:
      "Heavy or prolonged menstrual bleeding — particularly common in endometriosis and PMDD — gradually depletes iron stores, often before anaemia is detectable on standard blood tests. Low ferritin (stored iron) independently causes persistent fatigue, brain fog, and low mood that is often incorrectly attributed to the underlying condition rather than iron depletion itself. Bisglycinate is a chelated form significantly better tolerated than conventional ferrous sulphate, with less digestive discomfort and constipation.",
    dose: "14–28mg elemental iron — only supplement if lab results confirm need",
    time: "Away from coffee, tea, and calcium — take with vitamin C to enhance absorption",
    phase: "Prioritise during and after menstruation when losses are highest",
    doctorNote: "Do not supplement iron without confirmed deficiency from blood tests. Excess iron is harmful and can cause organ damage. Doctor guidance is essential before starting.",
  },
  {
    id: "vitb6",
    name: "Vitamin B6 (P5P form)",
    emoji: "🧠",
    conditions: ["pmdd"],
    importance:
      "B6 (as pyridoxal-5-phosphate, the active form) is the most important single nutrient for PMDD. It is a co-enzyme in the synthesis of serotonin, dopamine, and GABA — the neurotransmitters that govern emotional stability, anxiety levels, and sleep quality. Deficiency is consistently found in women with PMS and PMDD. Clinical trials show supplementation at appropriate doses produces measurable improvement in mood symptoms, irritability, and fatigue in the luteal phase.",
    dose: "50–100mg P5P (pyridoxal-5-phosphate) daily — avoid high-dose conventional B6 long-term",
    time: "Morning with food",
    phase: "Most impactful during the luteal phase (days 14–28); can be taken continuously",
    doctorNote: "For awareness only. High-dose B6 (above 200mg/day) can cause peripheral neuropathy over time. Consult your doctor before starting.",
  },
  {
    id: "calcium",
    name: "Calcium",
    emoji: "🦴",
    conditions: ["pmdd"],
    importance:
      "Calcium has some of the strongest clinical evidence of any supplement for PMDD. A large randomised controlled trial (Thys-Jacobs et al.) found 1,200mg calcium carbonate per day reduced overall PMDD symptom severity by 48% compared to placebo across four symptom clusters: negative affect, water retention, food cravings, and pain. The mechanism involves calcium's role in regulating the neurological hypersensitivity to oestrogen and progesterone fluctuations that defines PMDD.",
    dose: "500–600mg calcium citrate, twice daily (citrate is better absorbed than carbonate, especially without food)",
    time: "Split across two doses — calcium absorption is limited to ~500mg at a time",
    phase: "Consistent daily use — some women notice most benefit in the luteal phase",
    doctorNote: "For awareness only. Consult your doctor before starting — calcium interacts with several medications and excess intake may have cardiovascular implications.",
  },
  {
    id: "spearmint",
    name: "Spearmint Tea / Extract",
    emoji: "🌿",
    conditions: ["pmos"],
    importance:
      "Two published clinical trials found that drinking 2 cups of spearmint herbal tea daily significantly reduced free testosterone levels in women with PMOS over a 30-day period. Spearmint's anti-androgenic activity works by reducing luteinising hormone (LH) and free testosterone while raising FSH and oestradiol. This makes it a gentle, accessible tool — particularly if you experience androgen-driven symptoms like excess hair growth (hirsutism) or hormonal acne.",
    dose: "2 cups spearmint herbal tea daily, or spearmint extract capsules per label guidance",
    time: "Afternoon or evening — a calming wind-down ritual",
    phase: "Daily habit — benefits accumulate gradually over 4–8 weeks",
    doctorNote: null,
  },
  {
    id: "epo",
    name: "Evening Primrose Oil",
    emoji: "🌼",
    conditions: ["pmdd"],
    importance:
      "Evening primrose oil is a rich source of gamma-linolenic acid (GLA), an omega-6 fatty acid with anti-inflammatory and hormone-modulating properties. In PMDD, it is particularly discussed for reducing luteal phase breast tenderness (cyclical mastalgia) and general physical discomfort in the week before menstruation. It may also support skin health, which often fluctuates with hormonal shifts. Used most in the second half of the cycle.",
    dose: "1,000–2,000mg daily — per clinician guidance as evidence is mixed",
    time: "With dinner",
    phase: "Most commonly taken from ovulation to the start of menstruation (luteal phase)",
    doctorNote: "For awareness only. Consult your doctor before starting — evening primrose oil may interact with blood thinners and should be stopped before surgery.",
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

const TESTS = [
  "TSH, free T4, free T3, thyroid antibodies (TPO, TgAb) — thyroid panel",
  "Fasting insulin + fasting glucose — metabolic / PMOS screen",
  "HbA1c — longer glucose window (3-month average)",
  "Vitamin D (25-OH), B12, ferritin and full iron studies",
  "LH, FSH, total testosterone, SHBG — reproductive hormone panel",
  "Day 21 progesterone — confirms ovulation occurred",
  "Full blood count — screens for anaemia alongside iron studies",
];

// ─── Condition accordion ──────────────────────────────────────────────────────

function ConditionAccordion({ id }: { id: ConditionId }) {
  const [open, setOpen] = useState(false);
  const data = CONDITION_EDUCATION[id];

  return (
    <div className="overflow-hidden rounded-card border border-accent-light/60 shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-accent-pale px-4 py-3.5 text-left transition-colors hover:bg-accent-light/20"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="shrink-0 text-xl">{data.emoji}</span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-tight text-ink-dark">{data.name}</p>
            {data.previouslyKnownAs && (
              <p className="truncate text-[11px] text-ink-soft">{data.previouslyKnownAs}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-accent transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-accent-light/50 bg-white px-4 py-4 animate-fade-in">
          <section className="mb-4">
            <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">What it is</h4>
            <p className="text-sm leading-relaxed text-ink-mid">{data.whatItIs}</p>
          </section>

          <section className="mb-4">
            <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">How it affects your body</h4>
            <ul className="space-y-1.5">
              {data.howItAffects.map((point) => (
                <li key={point} className="flex gap-2 text-sm text-ink-mid">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/50" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">Why certain supplements help</h4>
            <ul className="space-y-1.5">
              {data.whySupplementsHelp.map((point) => {
                const [suppName, ...rest] = point.split(" — ");
                return (
                  <li key={point} className="flex gap-2 text-sm text-ink-mid">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    <span>
                      <span className="font-semibold text-ink-dark">{suppName}</span>
                      {rest.length > 0 && ` — ${rest.join(" — ")}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="flex items-start gap-2 rounded-input border border-amber-200 bg-amber-50 px-3 py-2.5">
            <span className="text-sm">⚠️</span>
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Always consult your doctor</span> — supplements interact
              with medications and individual needs vary significantly based on labs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Supplement card ──────────────────────────────────────────────────────────

const CONDITION_LABELS: Record<ConditionId, string> = {
  pmos:    "PMOS",
  thyroid: "Thyroid",
  pcod:    "PCOD",
  endo:    "Endometriosis",
  pmdd:    "PMDD / PMS",
  other:   "Hormonal Imbalance",
};

function SupplementCard({
  supp,
  matchedConditions,
}: {
  supp: Supplement;
  matchedConditions: ConditionId[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-card border border-border bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <span className="shrink-0 text-3xl">{supp.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-ink-dark leading-tight">{supp.name}</h3>
          {matchedConditions.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {matchedConditions.map((cid) => (
                <span
                  key={cid}
                  className="rounded-full border border-primary/25 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                >
                  {CONDITION_LABELS[cid]}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Why this matters */}
      <div className="border-t border-border/60 bg-brand-surface/50 px-4 py-3">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-primary">Why this matters</p>
        <p className={`text-sm leading-relaxed text-ink-mid ${!expanded ? "line-clamp-3" : ""}`}>
          {supp.importance}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[11px] font-semibold text-primary hover:underline"
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      </div>

      {/* Dosage & timing */}
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex gap-2 text-sm">
          <span className="shrink-0 font-semibold text-ink-dark w-20">Dosage</span>
          <span className="text-ink-mid">{supp.dose}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="shrink-0 font-semibold text-ink-dark w-20">Best time</span>
          <span className="text-ink-mid">{supp.time}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="shrink-0 font-semibold text-ink-dark w-20">Cycle note</span>
          <span className="text-ink-mid">{supp.phase}</span>
        </div>
      </div>

      {/* Doctor disclaimer */}
      {supp.doctorNote && (
        <div className="flex items-start gap-2 border-t border-amber-100 bg-amber-50 px-4 py-2.5">
          <span className="shrink-0 text-sm">⚠️</span>
          <p className="text-[11px] leading-relaxed text-amber-800">{supp.doctorNote}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Supplements() {
  const userConditions = loadUserConditions();
  const hasConditions  = userConditions.length > 0;

  const recommended = ALL_SUPPLEMENTS.filter((s) =>
    s.conditions.some((c) => userConditions.includes(c))
  );

  const general = ALL_SUPPLEMENTS.filter((s) =>
    !s.conditions.some((c) => userConditions.includes(c))
  );

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-dark">Supplements</h1>

      {/* Disclaimer */}
      <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        These are general wellness supplements —{" "}
        <span className="font-semibold">not medical prescriptions.</span>{" "}
        Always work with your doctor before starting anything new, especially if you are on medication.
      </div>

      {/* No conditions set prompt */}
      {!hasConditions && (
        <div className="flex items-center gap-3 rounded-card border border-blue-200 bg-blue-50 px-4 py-3">
          <Sparkles className="h-5 w-5 shrink-0 text-blue-500" />
          <p className="text-sm text-blue-800">
            Add your conditions in <span className="font-semibold">Profile → My Conditions</span> to
            get a personalised supplement plan tailored to your health picture.
          </p>
        </div>
      )}

      {/* ── Your Conditions ────────────────────────────────────────────────── */}
      {hasConditions && (
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-dark">Understanding Your Conditions</h2>
            <p className="mt-1 text-sm text-ink-mid">
              Tap each condition to understand how it affects your body and why your supplement plan
              is tailored the way it is.
            </p>
          </div>
          {userConditions.map((id) => (
            <ConditionAccordion key={id} id={id} />
          ))}
        </section>
      )}

      {/* ── Recommended for you ────────────────────────────────────────────── */}
      {hasConditions && recommended.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-dark">
              Recommended for You
            </h2>
            <p className="mt-1 text-sm text-ink-mid">
              Based on your selected conditions — these supplements have the strongest evidence for
              your specific health picture.
            </p>
          </div>
          <div className="space-y-4">
            {recommended.map((s) => {
              const matched = s.conditions.filter((c) => userConditions.includes(c));
              return <SupplementCard key={s.id} supp={s} matchedConditions={matched} />;
            })}
          </div>
        </section>
      )}

      {/* ── General wellness ───────────────────────────────────────────────── */}
      {(general.length > 0 || !hasConditions) && (
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-dark">
              {hasConditions ? "Other Wellness Supplements" : "All Supplements"}
            </h2>
            <p className="mt-1 text-sm text-ink-mid">
              Broadly supportive of hormonal health and general wellbeing.
            </p>
          </div>
          <div className="space-y-4">
            {(hasConditions ? general : ALL_SUPPLEMENTS).map((s) => (
              <SupplementCard key={s.id} supp={s} matchedConditions={[]} />
            ))}
          </div>
        </section>
      )}

      {/* ── Ask your doctor ────────────────────────────────────────────────── */}
      <div className="rounded-card border border-border bg-white p-5 shadow-card">
        <h3 className="font-display text-lg font-bold text-ink-dark">Tests to ask your doctor about</h3>
        <p className="mt-1 text-sm text-ink-mid">
          Supplements work best when you know your baseline levels. These are the key panels to
          request.
        </p>
        <ul className="mt-4 space-y-2.5">
          {TESTS.map((t) => (
            <li key={t} className="flex gap-2.5 text-sm text-ink-mid">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
