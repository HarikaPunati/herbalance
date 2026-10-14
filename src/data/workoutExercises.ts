import type { WorkoutExercise } from "../components/WorkoutCard";
import type { WorkoutIntensity } from "../hooks/useDailyWorkout";

// ─── Exercise Banks ───────────────────────────────────────────────────────────

const EXERCISE_BANKS: Record<string, { restorative: WorkoutExercise[]; moderate: WorkoutExercise[]; high: WorkoutExercise[] }> = {
  "Yoga": {
    restorative: [
      { id: "yoga-r1", name: "Child's pose", detail: "Hold 90s × 3", tip: "Breathe into your lower back.", description: "Kneel, sit back on heels, fold forward with arms extended.", modification: "Place a pillow under your forehead for support." },
      { id: "yoga-r2", name: "Supine twist", detail: "60s each side", tip: "Let gravity do the work — no forcing the knee down.", description: "Lying on your back, draw one knee across the body.", modification: "Place a folded blanket between knees if hips feel tight." },
      { id: "yoga-r3", name: "Legs up wall", detail: "5 min", tip: "This is active rest — it counts.", description: "Lie on your back with legs resting vertically up a wall.", modification: "Bend knees slightly if hamstrings are tight." },
      { id: "yoga-r4", name: "Butterfly fold", detail: "Hold 90s", tip: "Let your knees naturally drop, don't force them down.", description: "Sit with soles of feet together, fold gently forward.", modification: "Sit on a folded blanket to tilt the pelvis forward." },
      { id: "yoga-r5", name: "Savasana", detail: "5 min", tip: "Allow full stillness — no fidgeting.", description: "Lie flat on your back, arms slightly away from body, palms up.", modification: "Place a bolster under your knees for lower back support." },
    ],
    moderate: [
      { id: "yoga-m1", name: "Cat-cow", detail: "10 reps", tip: "Let the exhale round you, the inhale open you.", description: "On hands and knees, alternate arching and rounding with each breath.", modification: "Seated on a chair works just as well." },
      { id: "yoga-m2", name: "Sun salutations A", detail: "5 rounds", tip: "Breathe every transition — one move per breath.", description: "Mountain pose → forward fold → plank → cobra → downward dog → repeat.", modification: "Drop knees during the plank-cobra transition." },
      { id: "yoga-m3", name: "Warrior I + II", detail: "45s each", tip: "Square your hips forward in Warrior I.", description: "Step one foot forward into a lunge; Warrior I: arms overhead; Warrior II: arms out wide.", modification: "Shorten stance if hip flexors feel strained." },
      { id: "yoga-m4", name: "Pigeon pose", detail: "60s each side", tip: "Use a folded blanket under the hip if one side is tighter.", description: "From downward dog, bring one knee forward behind wrist. Fold forward gently.", modification: "Supine figure-four stretch is a gentler version." },
      { id: "yoga-m5", name: "Seated forward fold", detail: "90s", tip: "Fold from the hips, not the waist — hinge, don't curve.", description: "Sitting with legs extended, breathe out and fold forward.", modification: "Sit on a folded blanket to tilt the pelvis forward." },
    ],
    high: [
      { id: "yoga-h1", name: "Sun salutations A + B", detail: "10 rounds", tip: "Keep the breath steady through all transitions.", description: "Full Surya Namaskar A and B sequences alternating.", modification: "Drop knees on lowering if needed." },
      { id: "yoga-h2", name: "Crow pose", detail: "5 attempts", tip: "Look forward, not down — it shifts your weight correctly.", description: "Squat, place hands on mat, lean forward and lift feet balancing on bent arms.", modification: "Use a block under feet to reduce the height of the lift." },
      { id: "yoga-h3", name: "Warrior III", detail: "3 × 30s each side", tip: "Find one point of focus and lock your gaze.", description: "From Warrior I, shift weight to front foot and hinge forward extending back leg long.", modification: "Keep back toes on the floor rather than lifting fully." },
      { id: "yoga-h4", name: "Boat pose", detail: "3 × 30s", tip: "Balance on your tailbone — arms and legs create a V shape.", description: "Sit, roll back to 45°, then extend legs and arms long simultaneously.", modification: "Keep knees bent (feet on floor) and work the balance." },
      { id: "yoga-h5", name: "Bridge-to-wheel", detail: "3 ×", tip: "Press evenly through all four corners of your hands.", description: "Start in bridge, then if accessible press up into full wheel/upward bow pose.", modification: "Stay in bridge if wheel is not yet accessible." },
    ],
  },

  "Pilates": {
    restorative: [
      { id: "pil-r1", name: "Hundred gentle", detail: "50 beats", tip: "Pump from the shoulders, not the wrists.", description: "Lie on back, legs in tabletop, head and shoulders lifted. Pump arms gently.", modification: "Keep feet on floor if neck feels strained." },
      { id: "pil-r2", name: "Single leg stretch", detail: "3 × 8", tip: "Don't pull the neck — support with fingertips only.", description: "Curl up. Alternate drawing each knee to chest while extending the other leg long.", modification: "Keep the extended leg higher off the floor." },
      { id: "pil-r3", name: "Swan prep", detail: "3 × 6", tip: "Extension starts from the crown of your head, not the lower back.", description: "Lie face down, hands under shoulders. Press up slightly lifting chest, using back muscles.", modification: "Keep elbows on the floor (sphinx position) for a gentler version." },
      { id: "pil-r4", name: "Side-lying circles", detail: "3 × 8 each side", tip: "Stack hips directly on top of each other.", description: "Lying on your side, draw circles with the top leg. Keep the foot flexed.", modification: "Reduce range of motion, focus on control." },
      { id: "pil-r5", name: "Cat-cow", detail: "10 reps", tip: "Let each breath lead the movement.", description: "On hands and knees, alternate arching and rounding the spine with each breath.", modification: "Seated on a chair works just as well." },
    ],
    moderate: [
      { id: "pil-m1", name: "Hundred", detail: "100 beats", tip: "Pump from the shoulders, not the wrists.", description: "Lie on back, legs in tabletop, head and shoulders lifted. Pump arms rapidly.", modification: "Keep legs higher (less challenging) or feet on the floor if neck is uncomfortable." },
      { id: "pil-m2", name: "Roll-up", detail: "3 × 8", tip: "Peel each vertebra off the mat — no momentum.", description: "Lie flat, arms overhead. Slowly roll up to seated and back down one vertebra at a time.", modification: "Bend knees slightly if hamstrings limit the movement." },
      { id: "pil-m3", name: "Double leg stretch", detail: "3 × 10", tip: "Scoop the abs on every rep — no collapsing.", description: "Curl up, hug knees to chest, then extend both legs and arms long. Draw back in.", modification: "Extend arms only (keep legs in tabletop) if the full version is too challenging." },
      { id: "pil-m4", name: "Side-kick series", detail: "3 × 10 each side", tip: "Keep your waist lifted off the mat throughout.", description: "From side-lying, kick the top leg forward and back in a controlled sweep.", modification: "Reduce range on the kick, focus on control." },
      { id: "pil-m5", name: "Swimming", detail: "3 × 20s", tip: "Lengthen away from centre — reach through fingers and toes.", description: "Lie face down, lift opposite arm and leg alternately in a rapid flutter.", modification: "Lift only the arms or only the legs if full version is too intense." },
    ],
    high: [
      { id: "pil-h1", name: "Hundred advanced", detail: "100 beats", tip: "Lower the legs only as far as your back stays flat.", description: "As above but with legs extended lower toward the floor, adding more core demand.", modification: "Return to tabletop legs if lower back lifts from mat." },
      { id: "pil-h2", name: "Teaser V-sit", detail: "3 × 5", tip: "Balance on your tailbone — arms and legs create a V shape.", description: "Sit, roll back to 45°, then extend legs and arms long simultaneously, balancing on tailbone.", modification: "Keep knees bent and work the balance and upper body extension." },
      { id: "pil-h3", name: "Double leg lower-lift", detail: "3 × 8", tip: "Keep lower back pressed into mat at all times.", description: "Curl up, extend both legs to ceiling, lower them toward floor and raise back up.", modification: "Lower legs only halfway if back begins to arch." },
      { id: "pil-h4", name: "Control balance prep", detail: "3 × 5", tip: "Use breath to initiate — exhale to roll.", description: "Roll over to shoulder stand, hold ankles, balance and reach one leg up while the other lowers.", modification: "Stay in shoulder stand without reaching the legs apart." },
      { id: "pil-h5", name: "Corkscrew", detail: "3 × 5", tip: "Circle only as wide as your pelvis stays stable.", description: "From supine, legs to ceiling. Circle both legs together to one side, down, and around.", modification: "Bend knees to reduce lever arm and spinal demand." },
    ],
  },

  "HIIT": {
    restorative: [
      { id: "hiit-r1", name: "Slow squats", detail: "3 × 10", tip: "4 counts down, 2 counts up.", description: "Squat slowly with a long lowering phase. Keep knees tracking over toes.", modification: "Squat to a chair for guidance and safety." },
      { id: "hiit-r2", name: "Wall push-ups", detail: "3 × 10", tip: "Keep your body in one straight line.", description: "Hands on wall at shoulder height. Bend elbows to bring chest toward wall.", modification: "Move feet further from wall to decrease difficulty." },
      { id: "hiit-r3", name: "Gentle marching", detail: "3 × 30s", tip: "Swing your arms to naturally increase rhythm.", description: "March on the spot, lifting knees to comfortable height.", modification: "Reduce range of motion as needed." },
      { id: "hiit-r4", name: "Hip circles", detail: "2 × 10 each direction", tip: "Stand tall and let the hips lead.", description: "Standing with feet hip-width, draw large circles with your hips.", modification: "Hold a wall for balance if needed." },
      { id: "hiit-r5", name: "Step touches", detail: "3 × 30s", tip: "Gentle side to side — let your body warm up naturally.", description: "Step side to side with a light touch of the foot.", modification: "Sit in a chair and do seated side taps instead." },
    ],
    moderate: [
      { id: "hiit-m1", name: "Jump squats", detail: "3 × 10", tip: "Land softly — absorb through ankles, knees, hips.", description: "Squat down, then drive through heels to jump. Land with soft knees.", modification: "Pulse squats (no jump) for low-impact version.", altKey: "Jump Squats" },
      { id: "hiit-m2", name: "Burpees", detail: "3 × 8", tip: "Keep the pace — these are meant to be uncomfortable.", description: "Squat, kick feet back, push-up optional, feet in, jump up with arms overhead.", modification: "Step feet back instead of jumping for a lower-impact version.", altKey: "Burpees" },
      { id: "hiit-m3", name: "Mountain climbers", detail: "3 × 20s", tip: "Drive the knee to the chest — don't let hips rise.", description: "High plank position, alternately drive knees to chest rapidly.", modification: "Slow the pace to a walking mountain climber if hip rocking occurs.", altKey: "Mountain Climbers" },
      { id: "hiit-m4", name: "High knees", detail: "3 × 30s", tip: "Pump your arms — they drive the legs.", description: "Run on the spot driving knees to hip height alternately.", modification: "Marching high knees for low-impact with the same cardio benefit." },
      { id: "hiit-m5", name: "Push-ups", detail: "3 × 10", tip: "Brace core — body stays a rigid plank.", description: "Hands under shoulders, full range without sagging hips.", modification: "Elevate hands on a bench for less load.", altKey: "Push-ups" },
    ],
    high: [
      { id: "hiit-h1", name: "Jump squats", detail: "4 × 15", tip: "Land softly — absorb through ankles, knees, hips.", description: "Squat down, then drive through heels to jump. Land with soft knees.", modification: "Pulse squats (no jump) for low-impact version.", altKey: "Jump Squats" },
      { id: "hiit-h2", name: "Burpees", detail: "4 × 10", tip: "Full effort every rep — no half reps.", description: "Squat, kick feet back, push-up, feet in, jump up. Maximum pace.", modification: "Step feet back instead of jumping for a lower-impact version.", altKey: "Burpees" },
      { id: "hiit-h3", name: "Mountain climbers", detail: "4 × 30s", tip: "Drive the knee to the chest — don't let hips rise.", description: "High plank, alternately drive knees to chest at maximum cadence.", modification: "Slow the pace if hip rocking starts — form beats speed.", altKey: "Mountain Climbers" },
      { id: "hiit-h4", name: "High knees", detail: "4 × 45s", tip: "Pump your arms — they drive the legs.", description: "Run on the spot driving knees to hip height at full speed.", modification: "Marching high knees for low-impact." },
      { id: "hiit-h5", name: "Sprint finisher", detail: "4 × 20s on / 40s off", tip: "Nothing left in the tank — that's the goal.", description: "On a treadmill, bike, or outdoors. Max effort sprint then full recovery walk.", modification: "Brisk walk / jog intervals if a full sprint isn't accessible." },
    ],
  },

  "Cardio": {
    restorative: [
      { id: "card-r1", name: "Walking in place", detail: "10 min", tip: "Easy, comfortable pace. Let your body warm up.", description: "Walk in place at a gentle pace, breathing normally.", modification: "Seated marching works just as well." },
      { id: "card-r2", name: "Gentle step touches", detail: "3 × 60s", tip: "Soft and rhythmic — no bouncing.", description: "Side-to-side step touches with a gentle sway.", modification: "Reduce range of motion as needed." },
      { id: "card-r3", name: "Slow marching", detail: "3 × 30s", tip: "Focus on your breath, not the intensity.", description: "March on the spot at a slow, controlled pace.", modification: "Reduce pace or do seated marching." },
      { id: "card-r4", name: "Shoulder rolls", detail: "2 × 10 each direction", tip: "Let the shoulders fully relax on each roll.", description: "Roll shoulders forward and back in large circles.", modification: "Do one shoulder at a time if needed." },
    ],
    moderate: [
      { id: "card-m1", name: "Jogging in place", detail: "3 × 2 min", tip: "Stay light on the balls of your feet.", description: "Jog on the spot at a steady, sustainable pace.", modification: "Brisk walking in place for lower impact." },
      { id: "card-m2", name: "Jumping jacks", detail: "3 × 45s", tip: "Land softly and keep the knees soft.", description: "Classic jumping jacks — jump feet out and in while swinging arms overhead.", modification: "Step side to side instead of jumping for low-impact." },
      { id: "card-m3", name: "Butt kicks", detail: "3 × 30s", tip: "Drive the heel toward the glute — don't just let it dangle.", description: "Jog on the spot kicking heels up toward glutes.", modification: "Walking butt kicks for lower impact." },
      { id: "card-m4", name: "High knees moderate", detail: "3 × 30s", tip: "Drive arms forward for power.", description: "Run on the spot at a moderate pace driving knees to hip height.", modification: "Marching high knees for low-impact." },
      { id: "card-m5", name: "Lateral shuffles", detail: "3 × 30s", tip: "Stay low in a slight squat throughout.", description: "Shuffle side to side in an athletic stance, keeping hips low.", modification: "Walk side to side without the shuffle for lower impact." },
    ],
    high: [
      { id: "card-h1", name: "Sprint in place", detail: "4 × 30s / 30s rest", tip: "Maximum cadence for the full work interval.", description: "Sprint on the spot at full speed for 30 seconds.", modification: "High knees at fast pace if full sprint is too intense." },
      { id: "card-h2", name: "Power jacks", detail: "4 × 45s", tip: "Explode on the way up — absorb on the way down.", description: "Jumping jacks with a squat at the bottom — explode up and land soft.", modification: "Regular jumping jacks for lower impact." },
      { id: "card-h3", name: "Speed skaters", detail: "4 × 30s", tip: "Long lateral leaps — touch the floor on landing.", description: "Leap laterally landing on one foot then the other, reaching opposite hand to floor.", modification: "Side steps without the leap for lower impact." },
      { id: "card-h4", name: "Invisible jump rope", detail: "4 × 60s", tip: "Stay on the balls of your feet the whole time.", description: "Jump rope motion without a rope — light bounces with wrist circles.", modification: "March in place if jumping is uncomfortable." },
      { id: "card-h5", name: "Criss-cross feet", detail: "4 × 45s", tip: "Keep the upper body relaxed and still.", description: "Rapid alternate crossing of feet in front, like a speed skater on the spot.", modification: "Slow step-over pattern for lower impact." },
    ],
  },

  "Resistance Bands": {
    restorative: [
      { id: "band-r1", name: "Band pull-aparts", detail: "3 × 12", tip: "Squeeze shoulder blades at the end of each rep.", description: "Hold band with both hands at shoulder height, pull apart by spreading arms wide.", modification: "Use a lighter band or reduce range of motion." },
      { id: "band-r2", name: "Seated rows light", detail: "3 × 12", tip: "Drive the elbows back, not the hands.", description: "Sit with band looped around feet, pull handles to sides of ribs.", modification: "Reduce resistance by using a shorter band position." },
      { id: "band-r3", name: "Clamshells", detail: "3 × 12 each side", tip: "Keep feet stacked — don't let the hip roll back.", description: "Side-lying with band just above knees, open and close top knee like a clamshell.", modification: "Do without band if resistance is too high." },
      { id: "band-r4", name: "Side steps", detail: "3 × 10 each direction", tip: "Keep the band taut throughout the movement.", description: "Band around ankles or above knees, step side to side in a slight squat.", modification: "Remove band and do unresisted side steps." },
      { id: "band-r5", name: "Glute bridges with band", detail: "3 × 12", tip: "Push knees out against band as you drive up.", description: "Band above knees, feet flat on floor. Drive hips up squeezing glutes at top.", modification: "Do without band if resistance is too high.", altKey: "Glute Bridges" },
    ],
    moderate: [
      { id: "band-m1", name: "Squats with band", detail: "3 × 12", tip: "Sit between hips — knees track over toes.", description: "Band above knees, squat pushing knees out into band throughout.", modification: "Reduce depth or remove band.", altKey: "Barbell Squats" },
      { id: "band-m2", name: "Bicep curls", detail: "3 × 12", tip: "Keep elbows at sides — don't swing.", description: "Stand on band, curl handles to shoulders with controlled tempo.", modification: "Use lighter band or reduce reps.", altKey: "Dumbbell Curls" },
      { id: "band-m3", name: "Overhead press", detail: "3 × 10", tip: "Don't arch your lower back — brace and press.", description: "Stand on band, press handles overhead until arms fully extend.", modification: "Reduce resistance or switch to seated.", altKey: "Overhead Press" },
      { id: "band-m4", name: "Bent-over row", detail: "3 × 12", tip: "Drive the elbows back, not the hands.", description: "Hinge at hips, stand on band, row handles to sides of ribs.", modification: "Lighten band or reduce range of motion.", altKey: "Bent Over Row" },
      { id: "band-m5", name: "Lateral band walks", detail: "3 × 10 each direction", tip: "Stay in a mini-squat throughout for glute activation.", description: "Band around ankles, walk side to side in athletic stance keeping tension on band.", modification: "Move band above knees for less ankle resistance." },
    ],
    high: [
      { id: "band-h1", name: "Jump squats with band", detail: "4 × 12", tip: "Land softly — absorb through ankles, knees, hips.", description: "Band above knees, perform jump squats pushing knees out on each landing.", modification: "Slow tempo squats if jumping is uncomfortable.", altKey: "Jump Squats" },
      { id: "band-h2", name: "Heavy rows", detail: "4 × 15", tip: "Full contraction at the top — squeeze the shoulder blades.", description: "Heavier band, bent-over row with slower eccentric (3 count lowering).", modification: "Reduce band resistance or reps.", altKey: "Bent Over Row" },
      { id: "band-h3", name: "Shoulder press + squat", detail: "4 × 10", tip: "Press as you stand — create one fluid movement.", description: "Stand on band, squat down, then press overhead as you rise.", modification: "Do squats and presses as separate exercises." },
      { id: "band-h4", name: "Single-leg deadlift", detail: "3 × 10 each side", tip: "Hinge from the hip — think 'T shape' at the bottom.", description: "Stand on band with one foot, hinge forward lifting opposite leg behind you.", modification: "Use a chair for balance support.", altKey: "Deadlifts" },
      { id: "band-h5", name: "Plank row", detail: "3 × 10 each side", tip: "Don't let the hips rotate when you row.", description: "High plank, one hand holding band anchored to door or heavy object. Row to ribcage.", modification: "Perform kneeling to reduce core demand.", altKey: "Plank" },
    ],
  },

  "Calisthenics": {
    restorative: [
      { id: "cal-r1", name: "Dead bugs", detail: "3 × 10 each side", tip: "Press lower back into floor throughout.", description: "Lie on back, arms to ceiling, knees at 90°. Lower opposite arm and leg slowly.", modification: "Move only arms or only legs, not both together." },
      { id: "cal-r2", name: "Wall push-ups", detail: "3 × 12", tip: "Keep your body in one straight line.", description: "Hands on wall at shoulder height. Bend elbows to bring chest toward wall.", modification: "Move feet further from wall to decrease difficulty." },
      { id: "cal-r3", name: "Bodyweight squats", detail: "3 × 10", tip: "Sit between your hips — knees track over toes.", description: "Feet hip-width, arms forward for balance. Squat to comfortable depth.", modification: "Squat to a chair for guidance." },
      { id: "cal-r4", name: "Glute bridges", detail: "3 × 12", tip: "Squeeze glutes at the top — hold a moment.", description: "Lie on back, feet flat on floor. Drive hips up squeezing glutes.", modification: "Reduce range of motion if hips feel uncomfortable.", altKey: "Glute Bridges" },
      { id: "cal-r5", name: "Knee tuck crunches", detail: "3 × 10", tip: "Exhale as you crunch — don't pull the neck.", description: "Lie on back, crunch upper body forward while drawing knees to chest.", modification: "Keep feet on floor and just do upper body crunches." },
    ],
    moderate: [
      { id: "cal-m1", name: "Push-ups", detail: "3 × 12", tip: "Brace core — body stays a rigid plank.", description: "Hands under shoulders, full range without sagging hips.", modification: "Elevate hands on a bench for less load.", altKey: "Push-ups" },
      { id: "cal-m2", name: "Squats", detail: "4 × 15", tip: "Sit between hips — knees track over toes.", description: "Feet hip-width, lower until thighs approach parallel.", modification: "Reduce depth or use a chair as a target.", altKey: "Barbell Squats" },
      { id: "cal-m3", name: "Lunges", detail: "3 × 10 each side", tip: "Front shin stays vertical — don't let knee cave in.", description: "Step forward into lunge, lower back knee toward floor. Step back.", modification: "Hold a wall for balance if needed.", altKey: "Lunges" },
      { id: "cal-m4", name: "Plank", detail: "3 × 30s", tip: "Squeeze glutes and quads — not just abs.", description: "High plank or forearm plank. Keep hips level and in line with shoulders.", modification: "Drop to knees to reduce core demand.", altKey: "Plank" },
      { id: "cal-m5", name: "Australian pull-ups", detail: "3 × 8", tip: "Pull chest to bar — don't just do half reps.", description: "Hang from a low bar or table edge at an angle. Pull chest up to bar.", modification: "Increase angle (more upright) to make easier." },
    ],
    high: [
      { id: "cal-h1", name: "Plyometric push-ups", detail: "4 × 10", tip: "Explode off the floor — land soft.", description: "Push up explosively so hands leave the floor. Control the descent.", modification: "Regular push-ups if plyometric isn't accessible.", altKey: "Push-ups" },
      { id: "cal-h2", name: "Jump squats", detail: "4 × 15", tip: "Land softly — absorb through ankles, knees, hips.", description: "Squat down, then drive through heels to jump. Land with soft knees.", modification: "Pulse squats (no jump) for low-impact version.", altKey: "Jump Squats" },
      { id: "cal-h3", name: "Burpees", detail: "3 × 10", tip: "Full effort every rep — keep the pace.", description: "Squat, kick feet back, push-up, feet in, jump up.", modification: "Step feet back instead of jumping for lower impact.", altKey: "Burpees" },
      { id: "cal-h4", name: "L-sit holds", detail: "5 × 10s", tip: "Depress shoulders — push the floor away from you.", description: "Seated, hands either side of hips. Press into hands and lift hips and legs off floor.", modification: "Tuck one or both knees to reduce lever arm." },
      { id: "cal-h5", name: "Pistol squat practice", detail: "3 × 5 each side", tip: "Sit back and down — let the heel stay on the floor.", description: "Balance on one leg, extend other leg forward, lower into a single-leg squat.", modification: "Hold a suspension strap or door frame for assistance." },
    ],
  },

  "Boxing": {
    restorative: [
      { id: "box-r1", name: "Slow jab-cross", detail: "3 × 30s", tip: "Focus on extension and rotation — not speed.", description: "Shadow box slowly, focusing on full arm extension and hip rotation on the cross.", modification: "Reduce arm extension range if shoulder is tight." },
      { id: "box-r2", name: "Footwork drills", detail: "3 × 30s", tip: "Stay light on the balls of your feet.", description: "Practice basic boxing footwork: forward/back steps, lateral shuffles.", modification: "Slow the pace to a walk-through if fatigued." },
      { id: "box-r3", name: "Shoulder shakeout", detail: "3 × 30s", tip: "Let the arms be completely limp.", description: "Arms down by sides, shake and loosen the shoulders and wrists.", modification: "Gentle shoulder circles if shakeout feels too passive." },
      { id: "box-r4", name: "Slip movement", detail: "3 × 30s", tip: "Bend at the knees — don't just lean the head.", description: "Practice slipping punches by bending knees and shifting weight side to side.", modification: "Slow the movement to a controlled rock if dizzy." },
    ],
    moderate: [
      { id: "box-m1", name: "Jab-cross-hook combo", detail: "3 × 1 min", tip: "Snap the jab — the speed creates the power.", description: "Throw jab, cross, hook in sequence. Reset guard between combos.", modification: "Focus on one punch at a time until coordination builds." },
      { id: "box-m2", name: "Slip and counter", detail: "3 × 45s", tip: "Slip outside — counter with the cross.", description: "Slip an imaginary jab to the outside then counter with jab-cross.", modification: "Do the slip and counter separately before combining." },
      { id: "box-m3", name: "Body shots practice", detail: "3 × 45s", tip: "Drop the level before throwing — don't just bend forward.", description: "Practice body hooks and body crosses by level-changing with each shot.", modification: "Reduce level change to a slight knee bend." },
      { id: "box-m4", name: "Defensive head movement", detail: "3 × 45s", tip: "Move in a U shape — not just side to side.", description: "Practice rolling under punches with a U-shaped head movement.", modification: "Practice with slow, small movements first." },
    ],
    high: [
      { id: "box-h1", name: "Full combo rounds", detail: "4 × 2 min", tip: "Commit to every punch — half-effort breeds bad habits.", description: "Extended combinations: jab-cross-hook-cross-uppercut-hook. Work continuously.", modification: "Reduce to 90s rounds if 2 min is too demanding." },
      { id: "box-h2", name: "Speed punching", detail: "4 × 1 min", tip: "Relax the shoulders — tension kills speed.", description: "Rapid-fire jabs and crosses at maximum speed with relaxed muscles.", modification: "Reduce speed and focus on form if shoulders fatigue." },
      { id: "box-h3", name: "Power punching", detail: "4 × 30s", tip: "Rotate fully through the hips — the power comes from the ground.", description: "Slow, powerful punches focusing on maximum hip rotation and full extension.", modification: "Reduce power and focus on rotation mechanics." },
      { id: "box-h4", name: "Conditioning burpees + combos", detail: "3 × 2 min", tip: "Burpee, stand up, throw a 4-punch combo — repeat.", description: "Burpee followed immediately by a 4-punch combination. Repeat for the duration.", modification: "Step feet back instead of jumping on the burpee.", altKey: "Burpees" },
    ],
  },

  "Walking": {
    restorative: [
      { id: "walk-r1", name: "Easy walk", detail: "20 min", tip: "Comfortable pace — no targets today.", description: "A slow, relaxed walk outdoors or on a treadmill at your own pace.", modification: "Even 10 minutes counts. The goal is circulation, not distance." },
      { id: "walk-r2", name: "Hip flexor stretch", detail: "45s each side", tip: "Tuck your pelvis under — that's where the stretch lives.", description: "Kneeling lunge position. Squeeze the back glute and tuck hips under to feel the front hip stretch.", modification: "Place a folded towel under the back knee for comfort." },
      { id: "walk-r3", name: "Calf stretch", detail: "45s each side", tip: "Keep the heel on the ground — don't let it rise.", description: "Step one foot back, press heel down, lean forward to stretch the calf.", modification: "Reduce lean if the stretch is too intense." },
      { id: "walk-r4", name: "Quad stretch", detail: "30s each side", tip: "Stand tall — don't lean forward.", description: "Stand on one leg, pull the other foot to your glute. Keep knees together.", modification: "Hold a wall or chair for balance." },
    ],
    moderate: [
      { id: "walk-m1", name: "Brisk walk", detail: "30–45 min", tip: "Aim for a pace where you can hold a conversation but feel slightly breathless.", description: "Brisk walking at 60–70% effort. Swing arms for additional calorie burn.", modification: "Flat route if energy is lower than expected." },
      { id: "walk-m2", name: "Walking lunges", detail: "3 × 20 steps", tip: "Long stride — front shin stays vertical.", description: "Alternating forward lunges for 20 steps. Keep torso tall throughout.", modification: "Stationary lunges if space is limited.", altKey: "Lunges" },
      { id: "walk-m3", name: "Calf raises", detail: "2 × 15", tip: "Go all the way up onto the toes and fully lower.", description: "Standing on flat ground or the edge of a step. Full range, controlled lowering.", modification: "Hold a wall for balance if needed.", altKey: "Calf Raises" },
      { id: "walk-m4", name: "Side leg swings", detail: "2 × 10 each side", tip: "Keep the standing leg slightly bent.", description: "Standing on one leg, swing the other leg side to side in a controlled arc.", modification: "Hold a wall for support." },
    ],
    high: [
      { id: "walk-h1", name: "Power walk or jog", detail: "45 min", tip: "Push the pace — you should be breathing audibly.", description: "Brisk walk or light jog. If running, aim for 60–70% max effort.", modification: "Stick to brisk walking if the jog feels like too much." },
      { id: "walk-h2", name: "Walking lunges uphill", detail: "3 × 25 steps", tip: "Use the incline to increase glute activation.", description: "Walking lunges on a hill or incline. The grade adds resistance naturally.", modification: "Flat-ground walking lunges if no incline is available.", altKey: "Lunges" },
      { id: "walk-h3", name: "Step-ups", detail: "3 × 12 each leg", tip: "Push through the heel of the elevated foot, not the toe.", description: "Use a step, bench, or low wall. Drive through the heel to stand fully.", modification: "Use a lower step height or hold a wall for balance." },
      { id: "walk-h4", name: "Single-leg calf raises", detail: "3 × 15 each side", tip: "Full range of motion — slow and controlled on the way down.", description: "Single-leg on the edge of a step if available, or flat ground.", modification: "Two-leg version on flat ground.", altKey: "Calf Raises" },
    ],
  },

  "Cycling": {
    restorative: [
      { id: "cyc-r1", name: "Easy spin", detail: "20 min low resistance", tip: "Keep the cadence comfortable — no pushing.", description: "Spin on a stationary bike or easy outdoor ride at very low resistance and RPM.", modification: "Reduce duration to 10 min if 20 min feels too long." },
      { id: "cyc-r2", name: "Hip stretch off bike", detail: "60s each side", tip: "Keep the pelvis neutral — don't tuck or tilt.", description: "Standing hip flexor stretch after cycling. Kneeling lunge, press hips forward.", modification: "Use a chair for balance support." },
      { id: "cyc-r3", name: "Quad stretch", detail: "45s each side", tip: "Stand tall — don't lean forward.", description: "Stand on one leg, pull the other foot to your glute. Keep knees together.", modification: "Hold a wall or chair for balance." },
      { id: "cyc-r4", name: "Lower back stretch", detail: "60s", tip: "Let gravity gently traction the spine.", description: "Stand and fold forward with a slight bend in knees, letting upper body hang.", modification: "Cat-cow on hands and knees as an alternative." },
    ],
    moderate: [
      { id: "cyc-m1", name: "Steady state ride", detail: "30 min 70–80 RPM", tip: "Maintain a consistent cadence throughout.", description: "Moderate effort cycling at a steady cadence. Aim for 70–80 RPM.", modification: "Reduce to 20 min or lower cadence if needed." },
      { id: "cyc-m2", name: "Sprint intervals", detail: "3 × 30s", tip: "Increase resistance slightly for each sprint.", description: "30 seconds of high-cadence or high-resistance cycling followed by 90s recovery.", modification: "Reduce sprint to 15s if 30s is too demanding." },
      { id: "cyc-m3", name: "Standing climb", detail: "3 × 1 min", tip: "Press through the full pedal stroke — push and pull.", description: "Increase resistance significantly, stand up from saddle, and climb for 1 minute.", modification: "Stay seated and increase resistance instead." },
      { id: "cyc-m4", name: "Cool-down spin", detail: "5 min", tip: "Gradually reduce cadence and resistance.", description: "Light spinning at very low resistance to bring heart rate down.", modification: "Slow walk or gentle stretch instead." },
    ],
    high: [
      { id: "cyc-h1", name: "Tabata intervals", detail: "8 × 20s on / 10s off", tip: "Maximum effort for every 20s work period.", description: "8 rounds of 20 seconds max effort cycling followed by 10 seconds complete rest.", modification: "Reduce to 4 rounds if 8 rounds is too demanding." },
      { id: "cyc-h2", name: "Hill simulation seated", detail: "4 × 2 min", tip: "Keep the cadence slow and the resistance high.", description: "High resistance, seated climb simulation. Aim for 50–60 RPM under load.", modification: "Reduce resistance to maintain form." },
      { id: "cyc-h3", name: "Speed sprints", detail: "6 × 30s", tip: "Spin out the legs — go for maximum RPM.", description: "Low resistance, very high cadence sprints. Aim for 110+ RPM.", modification: "Reduce to 4 sprints if fatigue accumulates." },
      { id: "cyc-h4", name: "Recovery spin", detail: "5 min", tip: "Let the heart rate come all the way down.", description: "Easy spin at minimal resistance to fully recover before finishing.", modification: "Static stretching instead if legs are too fatigued to spin." },
    ],
  },
};

// ─── Gym Exercises by Muscle Focus ───────────────────────────────────────────

const GYM_EXERCISES: Record<string, { moderate: WorkoutExercise[]; high: WorkoutExercise[] }> = {
  "Full Body": {
    moderate: [
      { id: "gym-fb-m1", name: "Barbell Squats", detail: "4 × 10", tip: "Sit between hips — knees track over toes.", description: "Bar on traps, squat until thighs reach parallel.", modification: "Goblet squat with dumbbell for less spinal load.", altKey: "Barbell Squats" },
      { id: "gym-fb-m2", name: "Bench Press", detail: "3 × 10", tip: "Arch your back slightly — keep shoulder blades retracted.", description: "Lie on bench, lower bar to mid-chest, press back up.", modification: "Dumbbell chest press for more freedom of movement.", altKey: "Bench Press" },
      { id: "gym-fb-m3", name: "Bent Over Row", detail: "4 × 10", tip: "Drive the elbows back, not the hands.", description: "Hinge at hips, overhand grip, row bar to lower ribs.", modification: "Single-arm dumbbell row with bench support.", altKey: "Bent Over Row" },
      { id: "gym-fb-m4", name: "Romanian Deadlift", detail: "3 × 10", tip: "Push hips back — not knees forward.", description: "Slight knee bend, hinge at hips lowering bar along legs.", modification: "Dumbbell RDL for lighter load.", altKey: "Deadlifts" },
      { id: "gym-fb-m5", name: "Plank", detail: "3 × 45s", tip: "Squeeze glutes and quads — not just abs.", description: "High plank or forearm plank. Keep hips level.", modification: "Drop to knees to reduce core demand.", altKey: "Plank" },
    ],
    high: [
      { id: "gym-fb-h1", name: "Deadlifts", detail: "4 × 5", tip: "Push the floor away — don't pull the bar up.", description: "Conventional or sumo deadlift. Heavy load, full lock-out at the top.", modification: "Romanian deadlift for less technical demand.", altKey: "Deadlifts" },
      { id: "gym-fb-h2", name: "Bench Press", detail: "4 × 8", tip: "Arch your back slightly — keep shoulder blades retracted.", description: "Heavy bench press. Last 2 reps should be challenging.", modification: "Dumbbell press if shoulder discomfort occurs.", altKey: "Bench Press" },
      { id: "gym-fb-h3", name: "Pull-ups", detail: "4 × max", tip: "Full range — start from dead hang, chin over bar.", description: "Bodyweight pull-ups. Add weight with a belt if bodyweight is easy.", modification: "Lat pulldown at heavy weight.", altKey: "Pull-ups" },
      { id: "gym-fb-h4", name: "Overhead Press", detail: "3 × 8", tip: "Don't arch your lower back — brace and press.", description: "Standing barbell or dumbbell overhead press.", modification: "Seated press for more stability.", altKey: "Overhead Press" },
      { id: "gym-fb-h5", name: "Box Jumps", detail: "3 × 8", tip: "Stick the landing — absorb through the whole foot.", description: "Jump onto a sturdy box, land softly, step back down.", modification: "Step-ups if jumping is uncomfortable.", altKey: "Box Jumps" },
    ],
  },
  "Upper Body": {
    moderate: [
      { id: "gym-ub-m1", name: "Bench Press", detail: "4 × 10", tip: "Arch your back slightly — keep shoulder blades retracted.", description: "Lie on bench, lower bar to mid-chest, press back up.", modification: "Dumbbell chest press for more freedom of movement.", altKey: "Bench Press" },
      { id: "gym-ub-m2", name: "Overhead Press", detail: "3 × 10", tip: "Don't arch your lower back — brace and press.", description: "Standing or seated barbell or dumbbell overhead press.", modification: "Seated press for more stability.", altKey: "Overhead Press" },
      { id: "gym-ub-m3", name: "Bent Over Row", detail: "4 × 10", tip: "Drive the elbows back, not the hands.", description: "Hinge at hips, row bar to lower ribs.", modification: "Single-arm dumbbell row with bench support.", altKey: "Bent Over Row" },
      { id: "gym-ub-m4", name: "Dumbbell Curls", detail: "3 × 12", tip: "Keep elbows at sides — don't swing.", description: "Curl dumbbells to shoulders with controlled tempo.", modification: "Resistance band curls.", altKey: "Dumbbell Curls" },
      { id: "gym-ub-m5", name: "Tricep Dips", detail: "3 × 12", tip: "Keep elbows tracking back, not flaring wide.", description: "Dips off a bench or dip station. Full range of motion.", modification: "Bodyweight only, or reduce range of motion.", altKey: "Tricep Dips" },
    ],
    high: [
      { id: "gym-ub-h1", name: "Heavy Bench Press", detail: "5 × 5", tip: "Arch your back slightly — keep shoulder blades retracted.", description: "Heavy bench press. Last rep should be maximum effort.", modification: "Dumbbell press if shoulder discomfort occurs.", altKey: "Bench Press" },
      { id: "gym-ub-h2", name: "Weighted Pull-ups", detail: "4 × 6", tip: "Full range — start from dead hang, chin over bar.", description: "Pull-ups with weight belt. Add load until 6 reps is challenging.", modification: "Lat pulldown at heavy weight.", altKey: "Pull-ups" },
      { id: "gym-ub-h3", name: "Arnold Press", detail: "4 × 10", tip: "Rotate through the full range — slow and controlled.", description: "Start with palms facing you, rotate outward as you press overhead.", modification: "Standard shoulder press with less rotational demand.", altKey: "Overhead Press" },
      { id: "gym-ub-h4", name: "EZ Bar Curls", detail: "4 × 10", tip: "Full range — all the way down and squeeze at top.", description: "EZ bar curls with heavier load than dumbbell curls.", modification: "Dumbbell curls if EZ bar is unavailable.", altKey: "Dumbbell Curls" },
      { id: "gym-ub-h5", name: "Weighted Tricep Dips", detail: "4 × 10", tip: "Keep elbows tracking back, not flaring wide.", description: "Dips with weight plate on lap. Full range of motion.", modification: "Bodyweight dips.", altKey: "Tricep Dips" },
    ],
  },
  "Lower Body": {
    moderate: [
      { id: "gym-lb-m1", name: "Barbell Squats", detail: "4 × 10", tip: "Sit between hips — knees track over toes.", description: "Bar on traps, squat until thighs reach parallel.", modification: "Goblet squat with dumbbell for less spinal load.", altKey: "Barbell Squats" },
      { id: "gym-lb-m2", name: "Lunges", detail: "3 × 12 each side", tip: "Front shin stays vertical — don't let knee cave.", description: "Walking or stationary lunges with dumbbells or barbell.", modification: "Hold a rack or wall for balance.", altKey: "Lunges" },
      { id: "gym-lb-m3", name: "Romanian Deadlift", detail: "4 × 10", tip: "Push hips back — not knees forward.", description: "Slight knee bend, hinge at hips lowering bar along legs.", modification: "Dumbbell RDL for lighter load.", altKey: "Deadlifts" },
      { id: "gym-lb-m4", name: "Leg Press", detail: "3 × 12", tip: "Don't lock knees at the top — keep a slight bend.", description: "Press platform away with feet shoulder-width. Full range.", modification: "Reduce weight to maintain full range." },
      { id: "gym-lb-m5", name: "Calf Raises", detail: "3 × 15", tip: "Go all the way up onto the toes and fully lower.", description: "On calf raise machine or standing on a step. Full range.", modification: "Seated calf raises for less balance demand.", altKey: "Calf Raises" },
    ],
    high: [
      { id: "gym-lb-h1", name: "Heavy Squats", detail: "5 × 5", tip: "Sit between hips — knees track over toes.", description: "Heavy barbell squats. Last rep should be maximum effort.", modification: "Reduce weight if depth is compromised.", altKey: "Barbell Squats" },
      { id: "gym-lb-h2", name: "Deadlifts", detail: "4 × 5", tip: "Push the floor away — don't pull the bar up.", description: "Conventional deadlift. Heavy load, full lock-out.", modification: "Romanian deadlift for less technical demand.", altKey: "Deadlifts" },
      { id: "gym-lb-h3", name: "Box Jumps", detail: "3 × 8", tip: "Stick the landing — absorb through the whole foot.", description: "Jump onto a sturdy box, land softly, step back down.", modification: "Step-ups if jumping is uncomfortable.", altKey: "Box Jumps" },
      { id: "gym-lb-h4", name: "Bulgarian Split Squats", detail: "3 × 10 each side", tip: "Keep the front shin vertical — sit back and down.", description: "Rear foot elevated on bench, lower into a single-leg squat.", modification: "Hold a rack for balance support.", altKey: "Lunges" },
      { id: "gym-lb-h5", name: "Jump Squats", detail: "4 × 12", tip: "Land softly — absorb through ankles, knees, hips.", description: "Squat down, then drive through heels to jump. Land with soft knees.", modification: "Slow tempo squats for lower impact.", altKey: "Jump Squats" },
    ],
  },
  "Core": {
    moderate: [
      { id: "gym-co-m1", name: "Plank", detail: "3 × 45s", tip: "Squeeze glutes and quads — not just abs.", description: "High plank or forearm plank. Keep hips level.", modification: "Drop to knees to reduce core demand.", altKey: "Plank" },
      { id: "gym-co-m2", name: "Dead Bug", detail: "3 × 10 each side", tip: "Press lower back into floor throughout.", description: "Lie on back, arms to ceiling, knees at 90°. Lower opposite arm and leg slowly.", modification: "Move only arms or only legs, not both together." },
      { id: "gym-co-m3", name: "Bicycle Crunches", detail: "3 × 20", tip: "Rotate from the ribcage — not the neck.", description: "Lying crunch with rotation, bringing elbow toward opposite knee.", modification: "Slow tempo and reduce range of motion.", altKey: "Bicycle Crunches" },
      { id: "gym-co-m4", name: "Russian Twist", detail: "3 × 15 each side", tip: "Keep the chest lifted — don't hunch forward.", description: "Seated V-sit position, rotate torso side to side with or without weight.", modification: "Keep feet on floor for less balance demand." },
      { id: "gym-co-m5", name: "Leg Raises", detail: "3 × 12", tip: "Press lower back into floor throughout.", description: "Lying on back, raise straight legs to 90° and lower slowly.", modification: "Bend knees to reduce lever arm and lower back demand." },
    ],
    high: [
      { id: "gym-co-h1", name: "Plank", detail: "4 × 60s", tip: "Squeeze glutes and quads — not just abs.", description: "High plank or forearm plank. Full 60 seconds.", modification: "Drop to knees if 60s is unachievable with good form.", altKey: "Plank" },
      { id: "gym-co-h2", name: "Hollow body hold", detail: "4 × 30s", tip: "Lower back stays pressed to floor — find the edge of control.", description: "Lie on back, arms overhead, legs extended low. Hold the hollow shape.", modification: "Bend knees or raise legs higher to reduce demand." },
      { id: "gym-co-h3", name: "Ab wheel rollout", detail: "3 × 10", tip: "Engage abs before rolling — don't let the lower back sag.", description: "Kneeling, roll wheel forward until almost flat, then pull back in.", modification: "Reduce range of motion until strength builds." },
      { id: "gym-co-h4", name: "Dragon flag negatives", detail: "3 × 5", tip: "Control every inch of the descent — this is where the work is.", description: "Grab a bench, press body up, lower as a rigid plank as slowly as possible.", modification: "Tuck knees to reduce the lever arm." },
      { id: "gym-co-h5", name: "Hanging leg raises", detail: "3 × 12", tip: "Don't swing — use abs to initiate each rep.", description: "Hang from pull-up bar, raise straight legs to 90°.", modification: "Bent-knee raises for less abdominal demand." },
    ],
  },
  "Glutes": {
    moderate: [
      { id: "gym-gl-m1", name: "Hip Thrusts", detail: "4 × 12", tip: "Drive through the whole foot — squeeze at the top.", description: "Shoulders on bench, bar across hips, thrust hips up to full extension.", modification: "Glute bridges on floor without bench.", altKey: "Hip Thrusts" },
      { id: "gym-gl-m2", name: "Glute Bridges", detail: "3 × 15", tip: "Squeeze glutes at the top — hold a moment.", description: "Lie on back, feet flat on floor. Drive hips up squeezing glutes.", modification: "Reduce range if hips feel uncomfortable.", altKey: "Glute Bridges" },
      { id: "gym-gl-m3", name: "Romanian Deadlift", detail: "3 × 12", tip: "Push hips back — not knees forward.", description: "Slight knee bend, hinge at hips lowering bar along legs.", modification: "Dumbbell RDL for lighter load.", altKey: "Deadlifts" },
      { id: "gym-gl-m4", name: "Cable kickbacks", detail: "3 × 12 each side", tip: "Keep hips level — don't rotate on the kickback.", description: "Ankle attached to cable, kick leg back squeezing glute at the top.", modification: "Bodyweight donkey kicks if cable machine unavailable." },
      { id: "gym-gl-m5", name: "Clamshells", detail: "3 × 15 each side", tip: "Keep feet stacked — don't let the hip roll back.", description: "Side-lying with band just above knees, open and close top knee like a clamshell.", modification: "Do without band if resistance is too high." },
    ],
    high: [
      { id: "gym-gl-h1", name: "Heavy Hip Thrusts", detail: "5 × 8", tip: "Drive through the whole foot — squeeze at the top for a full second.", description: "Heavy barbell hip thrusts. Last 2 reps should be challenging.", modification: "Reduce weight to maintain full range.", altKey: "Hip Thrusts" },
      { id: "gym-gl-h2", name: "Single-leg hip thrusts", detail: "4 × 10 each side", tip: "Keep hips square — don't let one side drop.", description: "Hip thrust with one leg extended. Drives glute activation higher.", modification: "Both feet on floor for bilateral version." },
      { id: "gym-gl-h3", name: "Deadlifts", detail: "4 × 5", tip: "Push the floor away — don't pull the bar up.", description: "Conventional deadlift focusing on glute lockout.", modification: "Romanian deadlift for more isolated glute focus.", altKey: "Deadlifts" },
      { id: "gym-gl-h4", name: "Box Jumps", detail: "3 × 8", tip: "Stick the landing — absorb through the whole foot.", description: "Explosive box jump focusing on hip drive.", modification: "Step-ups if jumping is uncomfortable.", altKey: "Box Jumps" },
      { id: "gym-gl-h5", name: "Jump Squats", detail: "4 × 12", tip: "Land softly — absorb through ankles, knees, hips.", description: "Squat down, then drive through heels to jump. Land with soft knees.", modification: "Slow tempo squats for lower impact.", altKey: "Jump Squats" },
    ],
  },
  "Back": {
    moderate: [
      { id: "gym-bk-m1", name: "Bent Over Row", detail: "4 × 10", tip: "Drive the elbows back, not the hands.", description: "Hinge at hips, overhand grip, row bar to lower ribs.", modification: "Single-arm dumbbell row with bench support.", altKey: "Bent Over Row" },
      { id: "gym-bk-m2", name: "Lat Pulldown", detail: "3 × 12", tip: "Pull to the chin — don't pull behind the neck.", description: "Wide grip pulldown. Pull bar to chest level.", modification: "Reduce weight to maintain form.", altKey: "Pull-ups" },
      { id: "gym-bk-m3", name: "Seated Cable Row", detail: "3 × 12", tip: "Keep torso upright — don't sway.", description: "Sit at cable row, pull handle to lower ribs keeping back neutral.", modification: "Resistance band row as alternative." },
      { id: "gym-bk-m4", name: "Face pulls", detail: "3 × 15", tip: "Pull to eye level and rotate the hands back at the end.", description: "Cable or band face pulls for rear delts and rotator cuff.", modification: "Band pull-aparts as an alternative." },
      { id: "gym-bk-m5", name: "Superman holds", detail: "3 × 12", tip: "Lift from the chest — don't just raise the head.", description: "Lie face down, raise arms and legs simultaneously. Hold briefly at top.", modification: "Lift only arms or only legs if both is too demanding." },
    ],
    high: [
      { id: "gym-bk-h1", name: "Deadlifts", detail: "4 × 5", tip: "Push the floor away — don't pull the bar up.", description: "Conventional deadlift. Heavy load, full lock-out.", modification: "Romanian deadlift for less technical demand.", altKey: "Deadlifts" },
      { id: "gym-bk-h2", name: "Weighted Pull-ups", detail: "4 × 6", tip: "Full range — start from dead hang, chin over bar.", description: "Pull-ups with weight belt. Add load until 6 reps is challenging.", modification: "Lat pulldown at heavy weight.", altKey: "Pull-ups" },
      { id: "gym-bk-h3", name: "T-bar row", detail: "4 × 10", tip: "Keep chest on pad — drive the elbows back.", description: "T-bar row machine or landmine setup. Heavy load.", modification: "Bent-over row with barbell instead.", altKey: "Bent Over Row" },
      { id: "gym-bk-h4", name: "Heavy Barbell Row", detail: "4 × 8", tip: "Brace hard — maintain a flat back throughout.", description: "Heavy barbell bent-over row with a strict hinge position.", modification: "Dumbbell rows for more individual range of motion.", altKey: "Bent Over Row" },
      { id: "gym-bk-h5", name: "Rack pulls", detail: "3 × 5", tip: "Full upper back tension — retract shoulder blades at the top.", description: "Deadlift from rack pins at knee height. Focus on upper back.", modification: "Full range deadlifts from the floor." },
    ],
  },
  "Shoulders": {
    moderate: [
      { id: "gym-sh-m1", name: "Overhead Press", detail: "4 × 10", tip: "Don't arch your lower back — brace and press.", description: "Standing or seated barbell or dumbbell overhead press.", modification: "Seated press for more stability.", altKey: "Overhead Press" },
      { id: "gym-sh-m2", name: "Lateral Raises", detail: "3 × 15", tip: "Lead with the elbow, not the wrist — slight internal rotation.", description: "Light dumbbells raised to shoulder height to the sides. Controlled lowering.", modification: "Resistance band version works just as well." },
      { id: "gym-sh-m3", name: "Front raises", detail: "3 × 12", tip: "Keep a slight bend in the elbow throughout.", description: "Dumbbells raised to shoulder height in front. Slow eccentric.", modification: "Alternate arms to reduce load." },
      { id: "gym-sh-m4", name: "Bent-over lateral raises", detail: "3 × 12", tip: "Hinge to 45° — raise to ear height.", description: "Bent-over dumbbell raises for rear deltoids.", modification: "Face pulls as a cable alternative." },
      { id: "gym-sh-m5", name: "Shrugs", detail: "3 × 15", tip: "Straight up — no rolling forward or back.", description: "Barbell or dumbbell shrugs. Hold at top briefly.", modification: "Reduce weight for a clean range of motion." },
    ],
    high: [
      { id: "gym-sh-h1", name: "Heavy Overhead Press", detail: "5 × 5", tip: "Don't arch your lower back — brace and press.", description: "Heavy standing barbell press. Last rep should be maximum effort.", modification: "Seated press if lower back is a limiting factor.", altKey: "Overhead Press" },
      { id: "gym-sh-h2", name: "Push press", detail: "4 × 8", tip: "Use the leg drive to get the bar moving, not just arms.", description: "Dip knees slightly, drive hips and press bar overhead explosively.", modification: "Strict overhead press without leg drive.", altKey: "Overhead Press" },
      { id: "gym-sh-h3", name: "Arnold Press", detail: "4 × 10", tip: "Rotate through the full range — slow and controlled.", description: "Start with palms facing you, rotate outward as you press overhead.", modification: "Standard shoulder press with less rotational demand." },
      { id: "gym-sh-h4", name: "Cable lateral raises", detail: "4 × 15", tip: "Keep a slight forward lean for better deltoid activation.", description: "Single cable lateral raise. Use cable for constant tension.", modification: "Dumbbell lateral raises as alternative." },
      { id: "gym-sh-h5", name: "Upright rows", detail: "4 × 10", tip: "Keep the bar close to the body throughout.", description: "Barbell or cable upright row, pulling elbows up to chin height.", modification: "Reduce weight or use wider grip to protect the rotator cuff." },
    ],
  },
  "Arms": {
    moderate: [
      { id: "gym-ar-m1", name: "Dumbbell Curls", detail: "3 × 12", tip: "Keep elbows at sides — don't swing.", description: "Curl dumbbells to shoulders with controlled tempo.", modification: "Resistance band curls.", altKey: "Dumbbell Curls" },
      { id: "gym-ar-m2", name: "Hammer curls", detail: "3 × 12", tip: "Keep wrists neutral — thumbs pointing up.", description: "Neutral grip dumbbell curls for brachialis and bicep.", modification: "Alternate arms to reduce shoulder fatigue." },
      { id: "gym-ar-m3", name: "Tricep Dips", detail: "3 × 12", tip: "Keep elbows tracking back, not flaring wide.", description: "Dips off a bench or dip station. Full range of motion.", modification: "Bodyweight only, or reduce range of motion.", altKey: "Tricep Dips" },
      { id: "gym-ar-m4", name: "Overhead extension", detail: "3 × 12", tip: "Keep elbows close to your head throughout.", description: "Hold one dumbbell with both hands, lower behind head then press up.", modification: "Use a lighter weight or swap to pushdowns with a band." },
      { id: "gym-ar-m5", name: "Close-grip push-ups", detail: "3 × 12", tip: "Elbows track close to ribs — don't flare.", description: "Push-ups with hands narrower than shoulder-width. Tricep emphasis.", modification: "Elevate hands on a bench for less load.", altKey: "Push-ups" },
    ],
    high: [
      { id: "gym-ar-h1", name: "Barbell curls", detail: "4 × 10", tip: "Full range — all the way down and squeeze at top.", description: "Heavy barbell curls. Strict form, no swinging.", modification: "EZ bar for less wrist stress." },
      { id: "gym-ar-h2", name: "Preacher curls", detail: "4 × 10", tip: "Don't let elbows come off the pad at the top.", description: "EZ bar or dumbbell preacher curl. Full range, slow eccentric.", modification: "Dumbbell curls if preacher bench is unavailable.", altKey: "Dumbbell Curls" },
      { id: "gym-ar-h3", name: "Weighted Tricep Dips", detail: "4 × 10", tip: "Keep elbows tracking back, not flaring wide.", description: "Dips with weight plate on lap. Full range of motion.", modification: "Bodyweight dips.", altKey: "Tricep Dips" },
      { id: "gym-ar-h4", name: "Skull crushers", detail: "4 × 10", tip: "Only the forearms move — upper arms stay vertical.", description: "Lie on bench, lower EZ bar to forehead then extend back up.", modification: "Overhead extension with dumbbell for less joint stress." },
      { id: "gym-ar-h5", name: "Cable curls", detail: "3 × 15", tip: "Keep tension on the bicep throughout — don't drop the cable.", description: "Cable curls with constant tension through full range.", modification: "Resistance band curls as alternative." },
    ],
  },
  "Chest": {
    moderate: [
      { id: "gym-ch-m1", name: "Bench Press", detail: "4 × 10", tip: "Arch your back slightly — keep shoulder blades retracted.", description: "Lie on bench, lower bar to mid-chest, press back up.", modification: "Dumbbell chest press for more freedom of movement.", altKey: "Bench Press" },
      { id: "gym-ch-m2", name: "Incline Dumbbell Press", detail: "3 × 12", tip: "Keep shoulders packed — don't let them shrug up.", description: "Incline bench at 30–45°. Press dumbbells from chest level overhead.", modification: "Flat bench if incline bench is uncomfortable." },
      { id: "gym-ch-m3", name: "Dumbbell fly", detail: "3 × 12", tip: "Arc the arms out — slight bend in elbows throughout.", description: "Lying on bench, lower dumbbells in wide arc and bring together at top.", modification: "Cable crossover for more consistent tension." },
      { id: "gym-ch-m4", name: "Push-ups", detail: "3 × 15", tip: "Brace core — body stays a rigid plank.", description: "Hands under shoulders, full range without sagging hips.", modification: "Elevate hands on a bench for less load.", altKey: "Push-ups" },
      { id: "gym-ch-m5", name: "Cable crossover", detail: "3 × 12", tip: "Keep a slight bend in elbows throughout.", description: "High cable pulleys, cross hands in front of chest in an arc.", modification: "Dumbbell fly as alternative." },
    ],
    high: [
      { id: "gym-ch-h1", name: "Heavy Bench Press", detail: "5 × 5", tip: "Arch your back slightly — keep shoulder blades retracted.", description: "Heavy bench press. Last rep should be maximum effort.", modification: "Dumbbell press if shoulder discomfort occurs.", altKey: "Bench Press" },
      { id: "gym-ch-h2", name: "Weighted push-ups", detail: "4 × 12", tip: "Brace core — body stays a rigid plank.", description: "Push-ups with weight plate on back or in weighted vest.", modification: "Standard push-ups without added weight.", altKey: "Push-ups" },
      { id: "gym-ch-h3", name: "Incline barbell press", detail: "4 × 8", tip: "Keep the bar path consistent — slightly back toward the chin.", description: "Heavy incline barbell press at 30–45°.", modification: "Dumbbell incline press for more freedom of movement." },
      { id: "gym-ch-h4", name: "Decline press", detail: "3 × 8", tip: "Use a spotter — the decline position makes it harder to bail.", description: "Decline bench barbell press. Lower chest emphasis.", modification: "Decline dumbbell press for less spinal loading." },
      { id: "gym-ch-h5", name: "Heavy dumbbell flys", detail: "4 × 10", tip: "Arc the arms out — slight bend in elbows throughout.", description: "Heavy dumbbell fly with a slow eccentric (3 count lowering).", modification: "Reduce weight if shoulder joint is under strain." },
    ],
  },
  "Legs": {
    moderate: [
      { id: "gym-lg-m1", name: "Barbell Squats", detail: "4 × 10", tip: "Sit between hips — knees track over toes.", description: "Bar on traps, squat until thighs reach parallel.", modification: "Goblet squat with dumbbell for less spinal load.", altKey: "Barbell Squats" },
      { id: "gym-lg-m2", name: "Lunges", detail: "3 × 12 each side", tip: "Front shin stays vertical — don't let knee cave.", description: "Walking or stationary lunges with dumbbells or barbell.", modification: "Hold a rack or wall for balance.", altKey: "Lunges" },
      { id: "gym-lg-m3", name: "Leg Press", detail: "3 × 15", tip: "Don't lock knees at the top — keep a slight bend.", description: "Press platform away with feet shoulder-width. Full range.", modification: "Reduce weight to maintain full range." },
      { id: "gym-lg-m4", name: "Leg curl", detail: "3 × 12", tip: "Don't let hips rise — keep them pressed into the pad.", description: "Lying or seated leg curl. Full range, controlled lowering.", modification: "Romanian deadlift as a free-weight alternative." },
      { id: "gym-lg-m5", name: "Calf Raises", detail: "3 × 15", tip: "Go all the way up onto the toes and fully lower.", description: "On calf raise machine or standing on a step. Full range.", modification: "Seated calf raises for less balance demand.", altKey: "Calf Raises" },
    ],
    high: [
      { id: "gym-lg-h1", name: "Heavy Squats", detail: "5 × 5", tip: "Sit between hips — knees track over toes.", description: "Heavy barbell squats. Last rep should be maximum effort.", modification: "Reduce weight if depth is compromised.", altKey: "Barbell Squats" },
      { id: "gym-lg-h2", name: "Deadlifts", detail: "4 × 5", tip: "Push the floor away — don't pull the bar up.", description: "Conventional deadlift. Heavy load, full lock-out.", modification: "Romanian deadlift for less technical demand.", altKey: "Deadlifts" },
      { id: "gym-lg-h3", name: "Box Jumps", detail: "3 × 8", tip: "Stick the landing — absorb through the whole foot.", description: "Jump onto a sturdy box, land softly, step back down.", modification: "Step-ups if jumping is uncomfortable.", altKey: "Box Jumps" },
      { id: "gym-lg-h4", name: "Bulgarian Split Squats", detail: "3 × 10 each side", tip: "Keep the front shin vertical — sit back and down.", description: "Rear foot elevated on bench, lower into a single-leg squat.", modification: "Hold a rack for balance support.", altKey: "Lunges" },
      { id: "gym-lg-h5", name: "Jump Squats", detail: "4 × 12", tip: "Land softly — absorb through ankles, knees, hips.", description: "Squat down, then drive through heels to jump. Land with soft knees.", modification: "Slow tempo squats for lower impact.", altKey: "Jump Squats" },
    ],
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getExercises(
  workoutType: string,
  intensity: WorkoutIntensity,
  muscleFocus: string[] = []
): WorkoutExercise[] {
  if (workoutType === "Gym") {
    const focus = muscleFocus[0] ?? "Full Body";
    const bank = GYM_EXERCISES[focus] ?? GYM_EXERCISES["Full Body"];
    // restorative mood at gym → use moderate exercises
    return intensity === "high" ? bank.high : bank.moderate;
  }
  const bank = EXERCISE_BANKS[workoutType];
  if (!bank) return [];
  return bank[intensity] ?? bank.moderate;
}
