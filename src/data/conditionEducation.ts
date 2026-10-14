export type ConditionId = "pmos" | "thyroid" | "pcod" | "endo" | "pmdd" | "other";

export type ConditionEducationData = {
  id: ConditionId;
  emoji: string;
  name: string;
  previouslyKnownAs?: string;
  whatItIs: string;
  howItAffects: string[];
  whySupplementsHelp: string[];
};

export const CONDITION_EDUCATION: Record<ConditionId, ConditionEducationData> = {
  pmos: {
    id: "pmos",
    emoji: "🌿",
    name: "PMOS",
    previouslyKnownAs: "Previously known as PCOS (renamed May 2026, The Lancet)",
    whatItIs:
      "PMOS is a complex hormonal condition affecting 1 in 8 women worldwide — over 170 million people. It was renamed in May 2026 because the old name, PCOS, was misleading: many women with PMOS have no ovarian cysts at all. The real issue is how multiple hormone systems interact — insulin, androgens (male hormones), and reproductive hormones all out of balance at the same time.",
    howItAffects: [
      "Insulin resistance — up to 80% of women with PMOS have it; your body doesn't process insulin efficiently, which raises blood sugar and drives androgen production",
      "Irregular or absent periods because ovulation is disrupted",
      "Excess androgens causing acne, hair thinning on the scalp, and unwanted facial or body hair (hirsutism)",
      "Weight challenges — especially around the belly, driven by insulin dysregulation",
      "Mood and mental health — anxiety, depression, and sleep issues are significantly more common",
    ],
    whySupplementsHelp: [
      "Inositol (Myo-inositol) — one of the most researched supplements for PMOS; improves insulin sensitivity, supports ovulation, and reduces androgen levels",
      "Omega-3 — reduces inflammation and lowers circulating androgen levels",
      "Magnesium — supports insulin sensitivity and reduces cortisol",
      "Zinc — helps with acne and androgen-driven hair loss",
      "Vitamin D — most women with PMOS are deficient; supports metabolic and reproductive function",
      "Spearmint tea or capsules — shown in studies to reduce free testosterone levels",
    ],
  },

  thyroid: {
    id: "thyroid",
    emoji: "🦋",
    name: "Thyroid",
    whatItIs:
      "Thyroid conditions, most commonly hypothyroidism, occur when the thyroid gland doesn't produce enough hormone to meet the body's needs. Hashimoto's thyroiditis — an autoimmune condition — is the leading cause in women. Because thyroid hormone regulates virtually every cell in your body, even mild deficiency produces wide-ranging symptoms across energy, weight, mood, and your cycle.",
    howItAffects: [
      "Persistent fatigue and low energy even after adequate sleep",
      "Weight gain or difficulty losing weight despite diet and lifestyle changes",
      "Hair thinning, dry skin, and brittle nails",
      "Brain fog, poor memory, and difficulty concentrating",
      "Irregular or heavier periods due to downstream hormonal disruption",
    ],
    whySupplementsHelp: [
      "Selenium — essential cofactor for converting T4 into active T3 (the usable form); well supported for Hashimoto's",
      "Vitamin D — deficiency is significantly more prevalent in autoimmune thyroid disease and may accelerate progression",
      "Magnesium — supports over 300 enzymatic reactions including those involved in thyroid hormone synthesis",
      "Zinc — required for T3/T4 production and receptor sensitivity; commonly depleted in hypothyroidism",
      "B-Complex — supports the energy metabolism that hypothyroidism severely impairs",
    ],
  },

  pcod: {
    id: "pcod",
    emoji: "🌀",
    name: "PCOD",
    whatItIs:
      "PCOD (Polycystic Ovarian Disease) occurs when the ovaries produce an excess of immature or partially mature eggs that may develop into fluid-filled cysts over time. It is generally considered milder than PMOS and is often more responsive to lifestyle changes. Many women with PCOD ovulate inconsistently rather than not at all, and a significant number can conceive naturally with appropriate support.",
    howItAffects: [
      "Irregular periods caused by inconsistent or disrupted ovulation",
      "Pelvic heaviness or mild pain from enlarged or cystic ovaries",
      "Mild androgen excess leading to acne, oily skin, and some hair changes",
      "Weight fluctuations, particularly around the abdomen",
      "Bloating and digestive disruption are commonly reported alongside hormonal shifts",
    ],
    whySupplementsHelp: [
      "Inositol — supports more regular ovulation and improves follicular development and quality",
      "Omega-3 — reduces ovarian inflammation and modulates androgen levels",
      "Vitamin D — supports follicular maturation and menstrual regularity",
      "Magnesium — helps regulate blood sugar and reduces insulin-driven androgen production",
      "Zinc — addresses androgen-related skin changes including acne and oiliness",
    ],
  },

  endo: {
    id: "endo",
    emoji: "🔴",
    name: "Endometriosis",
    whatItIs:
      "Endometriosis affects 1 in 10 women and occurs when tissue similar to the uterine lining grows outside the uterus — on the ovaries, fallopian tubes, or pelvic wall. It causes chronic inflammation and an average diagnostic delay of 7–10 years. There is no known cure, but symptoms can be significantly managed through medical treatment, lifestyle, and targeted nutrition.",
    howItAffects: [
      "Severe, debilitating period pain (dysmenorrhea) that may require time off work or daily activities",
      "Chronic pelvic pain that persists throughout the cycle, not just during menstruation",
      "Pain during or after sex (dyspareunia) that affects intimacy and relationships",
      "Fatigue — often severe — particularly when inflammation peaks around menstruation",
      "Potential fertility challenges due to scarring, adhesions, or blocked fallopian tubes",
    ],
    whySupplementsHelp: [
      "Omega-3 — one of the most studied; anti-inflammatory action may reduce prostaglandin-driven pain and inflammation",
      "Magnesium — shown to relax uterine muscle and reduce the severity of cramping significantly",
      "Vitamin D — deficiency is significantly more common in women with endometriosis and linked to symptom severity",
      "Zinc — supports immune regulation and reduces pro-inflammatory markers associated with the condition",
      "Iron (bisglycinate) — addresses deficiency caused by heavy or prolonged blood loss during periods",
    ],
  },

  pmdd: {
    id: "pmdd",
    emoji: "🌊",
    name: "PMDD / PMS",
    whatItIs:
      "PMDD (Premenstrual Dysphoric Disorder) is a severe form of PMS classified as a mood disorder, characterised by intense emotional and physical symptoms during the luteal phase — typically 1–2 weeks before your period. It affects 3–8% of women and can significantly disrupt work, relationships, and daily functioning. The cause is believed to be an unusual sensitivity to normal hormonal fluctuations, not a hormonal abnormality per se.",
    howItAffects: [
      "Severe mood swings, sudden crying spells, or disproportionate anger in the luteal phase",
      "Anxiety, depression, or a sense of hopelessness that lifts within a few days of menstruation starting",
      "Physical symptoms: significant bloating, breast tenderness, and fatigue",
      "Sleep disruption — either difficulty falling asleep or excessive sleepiness",
      "Social withdrawal, difficulty concentrating, and reduced productivity in the weeks before a period",
    ],
    whySupplementsHelp: [
      "Magnesium glycinate — well-supported for reducing luteal phase anxiety, bloating, and cramping",
      "Vitamin B6 — a key cofactor in serotonin and dopamine synthesis, directly supporting mood regulation",
      "Calcium (dietary or supplemental) — clinical studies show it can reduce overall PMDD symptom severity by up to 48%",
      "Omega-3 — reduces systemic inflammation and may blunt the severity of mood-related symptoms",
      "Evening primrose oil — often discussed for breast tenderness and physical discomfort in the late luteal phase",
    ],
  },

  other: {
    id: "other",
    emoji: "💡",
    name: "Unsure / Other",
    whatItIs:
      "Many women experience significant hormonal symptoms that don't fit neatly into a single diagnosis — and that's both valid and common. Hormonal imbalance exists on a spectrum, and a clear label isn't always immediately available. Tracking symptoms across your cycle and working with a clinician to investigate is the most reliable path toward understanding what's happening.",
    howItAffects: [
      "Unexplained fatigue or energy crashes, often appearing to track with your cycle",
      "Mood changes, irritability, or anxiety that shift predictably across the month",
      "Irregular, painful, or unusually heavy periods without a confirmed diagnosis",
      "Skin, hair, or weight changes without an obvious or consistent cause",
      "Gut symptoms, bloating, or sleep disruption — these often co-occur with hormonal changes",
    ],
    whySupplementsHelp: [
      "Vitamin D — a foundational starting point; the majority of women are deficient without realising it",
      "Magnesium — broadly supportive across hormonal regulation, sleep quality, and stress response",
      "Omega-3 — reduces systemic inflammation, which underlies most hormonal and mood-related symptoms",
      "B-Complex — supports adrenal and nervous system function, often depleted by chronic or low-level stress",
      "Starting a symptom diary alongside these basics gives your doctor the clearest data to act on",
    ],
  },
};
