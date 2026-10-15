// Dependency-free so both the browser app and the /api server function can import it.
export const CONDITION_NAMES: Record<string, string> = {
  thyroid: "a thyroid condition",
  pmos: "PMOS (formerly PCOS)",
  pcod: "PCOD",
  endo: "endometriosis",
  pmdd: "PMDD / severe PMS",
  other: "an undiagnosed hormonal imbalance",
};
