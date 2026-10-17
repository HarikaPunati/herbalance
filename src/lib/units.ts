// Weight and height are always stored in kg / cm; these only change how they're shown and typed.

export type Units = "metric" | "imperial";

export type AppSettings = { showAffirmation: boolean; units: Units };
export const DEFAULT_SETTINGS: AppSettings = { showAffirmation: true, units: "metric" };

export const readSettings = (p: { settings?: Partial<AppSettings> } | null | undefined): AppSettings => ({
  ...DEFAULT_SETTINGS,
  ...(p?.settings ?? {}),
});

const LB_PER_KG = 2.20462;
const CM_PER_IN = 2.54;

export const kgToLb = (kg: number) => Math.round(kg * LB_PER_KG * 10) / 10;
export const lbToKg = (lb: number) => Math.round((lb / LB_PER_KG) * 100) / 100;

export function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalIn = Math.round(cm / CM_PER_IN);
  return { ft: Math.floor(totalIn / 12), inches: totalIn % 12 };
}
export const ftInToCm = (ft: number, inches: number) => Math.round((ft * 12 + inches) * CM_PER_IN * 10) / 10;

export function formatWeight(kgStr: string, units: Units): string {
  const kg = parseFloat(kgStr);
  if (!kg) return "—";
  return units === "imperial" ? `${kgToLb(kg)} lb` : `${kgStr} kg`;
}

export function formatHeight(cmStr: string, units: Units): string {
  const cm = parseFloat(cmStr);
  if (!cm) return "—";
  if (units === "metric") return `${cmStr} cm`;
  const { ft, inches } = cmToFtIn(cm);
  return `${ft}′ ${inches}″`;
}
