import { useMemo } from "react";
import { useProfileData } from "./useProfileData";
import { loadStoredProfile } from "../lib/profileStore";
import { computeTargets, type DailyTargets } from "../lib/targets";

/** Today's calorie, macro, water, step and workout targets for the saved profile. */
export function useTargets(): DailyTargets {
  const { phase, cycleDay, cycleLength } = useProfileData();
  return useMemo(() => {
    const p = loadStoredProfile();
    return computeTargets({ ...p, goal: p.primary_goal }, phase, cycleDay, cycleLength);
  }, [phase, cycleDay, cycleLength]);
}
