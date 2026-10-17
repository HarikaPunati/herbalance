import type { CyclePhaseKey } from "../types/cycle";


/** Menstrual — rest, nourish, inward (15+). */
const MENSTRUAL: readonly string[] = [
  "Rest is not laziness. Your body is doing extraordinary work right now.",
  "You don't have to perform today. Existing is enough.",
  "This is your season to slow down. Let yourself.",
  "Bleeding is release; let your schedule soften where it can.",
  "Warmth, slow breaths, and gentle food are enough for today.",
  "You do not have to push through pain to prove you are strong.",
  "Honour the quiet: your nervous system is listening.",
  "Tiny care counts — water, socks, a softer voice toward yourself.",
  "You are allowed to cancel noise and choose stillness.",
  "This phase asks for nourishment, not punishment.",
  "Let go of the story that productivity equals worth.",
  "Your womb is working; you can meet it with patience.",
  "Soft lighting, soft plans, soft expectations — all valid.",
  "You are not behind; you are in a different tempo this week.",
  "Cramps and fatigue do not make you unreliable — they make you human.",
  "Choose one small comfort and call it a win.",
];

/** Follicular — rising energy, new starts (15+). */
const FOLLICULAR: readonly string[] = [
  "You're just getting started, and that's exactly the right place to be.",
  "Something new is building in you. Let it.",
  "Energy returns like spring — curious, light, and new.",
  "This is a good week to try something that excites you a little.",
  "Ideas feel closer; capture them without forcing them all today.",
  "Movement can feel playful again — follow what feels fun.",
  "Your body is rebuilding; meet it with curiosity, not pressure.",
  "Fresh starts do not have to be perfect — they only have to be honest.",
  "Say yes to what sparks you; no is allowed for what drains you.",
  "Light weights, brisk walks, and bright food all belong here.",
  "You can stretch your comfort zone one gentle step at a time.",
  "Hope is hormonal too — let yourself feel it.",
  "Organise, plan, dream — your mind likes clarity right now.",
  "Social energy may rise; choose people who feel safe.",
  "Colour returns to your world; notice it without rushing.",
  "You are allowed to feel lighter without explaining it.",
];

/** Ovulatory — peak, confidence, connection (15+). */
const OVULATORY: readonly string[] = [
  "You are at your most magnetic. Own it.",
  "This is your moment. Show up fully.",
  "Confidence is not loudness — it is alignment with what feels true.",
  "Peak energy is a gift; spend it on what actually matters to you.",
  "Your voice carries farther today; use it kindly and clearly.",
  "Strength does not erase softness — you can hold both.",
  "This is a powerful window for focused work and bold asks.",
  "You do not need permission to take up space.",
  "Let your workouts feel expressive, not punitive.",
  "Magnetism is energy in balance — rest still belongs in the mix.",
  "Speak your boundaries as clearly as your desires.",
  "You are allowed to shine without apologising for the glow.",
  "Collaboration flows now; choose partners who respect your pace.",
  "Trust your instincts — they are loud for a reason this week.",
  "Joy is not frivolous; it is fuel.",
  "Stand tall in your body; it is doing remarkable chemistry.",
];

/** Luteal — slow down, self-compassion, cravings are real (15+). */
const LUTEAL: readonly string[] = [
  "You're allowed to want more comfort right now. That's biology, not weakness.",
  "Winding down is its own kind of strength.",
  "Winding down is wisdom, not weakness.",
  "Cravings are information — meet them with curiosity, not shame.",
  "Your inner critic may get louder; you do not owe it the microphone.",
  "Slower tempo does not mean you are failing — it means you are human.",
  "Gentle strength training and walks honour this hormonal shift.",
  "You can lower the bar on output and raise the bar on care.",
  "Irritability can be a signal to simplify, not to self-attack.",
  "Magnesium moments, warm meals, and early nights are strategy.",
  "You are not 'too much' — you are metabolically busy.",
  "Say no without a paragraph of guilt.",
  "Soft textures, steady routines, and honest rest help you land.",
  "Progesterone's hush is a cue to listen inward.",
  "You deserve patience from yourself, especially now.",
  "This phase ends; your kindness toward yourself can stay.",
];

const POOLS: Record<CyclePhaseKey, readonly string[]> = {
  menstrual: MENSTRUAL,
  follicular: FOLLICULAR,
  ovulatory: OVULATORY,
  luteal: LUTEAL,
};

/**
 * Phase-aware affirmation for this cycle day. Consecutive days step through the phase's pool
 * without repeating until it wraps; `rotation` (the refresh button) advances within it.
 */
export function getAffirmation(phase: CyclePhaseKey, cycleDay: number, rotation = 0): string {
  const pool = POOLS[phase];
  return pool[(Math.max(0, cycleDay - 1) + rotation) % pool.length];
}
