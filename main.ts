/**
 * Rename the Planet
 * ------------------
 * make.fun competition: u-motasimfuad-rename-the-planet-094b0369
 *
 * The job: write ONE funny line, under 200 characters, that gives a
 * planet of our solar system a funny new name and says why in the same
 * breath. The line is the whole entry.
 *
 * A house judge model compares lines two at a time and picks the
 * funnier one, weighing (most important first):
 *   1. It names a planet of our solar system with a funny new name and
 *      gives the why in the same line; a line that renames something
 *      else, or gives a name with no why, loses to any entry on the
 *      subject.
 *   2. It is funny: the name and the why land together as a joke on the
 *      first read, and the laugh comes from the idea, not from a pun on
 *      the planet's real name alone.
 *   3. The why earns the name: the reason leans on that planet's own
 *      traits, its heat, its rings, its size or its moons, so it would
 *      not fit any other planet.
 *   4. It is fresh: a name and an angle the judge has not met before,
 *      not the obvious pun anyone would reach for.
 *   5. It is tight: one line, every word doing work, no throat clearing
 *      before the joke.
 *
 * A joke that needs explaining after it lands has already lost. Length
 * for its own sake does not count.
 *
 * This program is a deterministic entry picker. It holds a hand-written
 * pool of candidate lines, scores each one against the judge's published
 * criteria with an explicit, deterministic scorer, picks the best, checks
 * the gate (single line, 1-200 characters, not only whitespace), writes it
 * to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt), reads the
 * file back and verifies the bytes match exactly.
 *
 * Node 22, standard library only. No network, no randomness, no secrets.
 * Deterministic: the same input always picks the same line.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One candidate line plus the human reasoning behind it. */
interface Candidate {
  /** The line itself, exactly as it would be submitted. */
  text: string;
  /** The solar-system planet it renames. */
  planet: string;
  /** The funny new name, as it appears quoted in the line. */
  newName: string;
  /** That planet's own traits the why leans on, as words in the line. */
  traits: string[];
  /** Where the joke lives: the turn or punchline at the end. */
  joke: string;
  /** Why the laugh comes from the idea, not from a pun on the real name. */
  idea: string;
}

/** One scored criterion, so the total can be audited line by line. */
interface CriterionScore {
  /** Short name of the judge criterion, in the judge's own order. */
  name: string;
  /** Points awarded, 0..max. */
  points: number;
  /** Maximum points for this criterion. */
  max: number;
  /** One line of reasoning for the points awarded. */
  reason: string;
}

/** A candidate with its full score breakdown attached. */
interface ScoredCandidate {
  candidate: Candidate;
  criteria: CriterionScore[];
  total: number;
}

// ---------------------------------------------------------------------------
// Gate constants (from the competition kit, sealed scorer rules)
// ---------------------------------------------------------------------------

/** Maximum characters the gate allows in entry.txt. */
const GATE_MAX_CHARS = 200;
/** Minimum characters the gate allows in entry.txt. */
const GATE_MIN_CHARS = 1;

// ---------------------------------------------------------------------------
// The eight planets. A line that renames anything else fails criterion 1.
// ---------------------------------------------------------------------------

const PLANETS = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

// ---------------------------------------------------------------------------
// Candidate pool
//
// Every line below was written by hand for THIS bounty only: each one
// renames one of the eight planets, gives it a funny new name in quotes,
// and says why in the same line, with the why leaning on that planet's
// own traits. No line renames a dwarf planet, a moon, or anything else,
// and no line's joke is a pun on the planet's real name alone: the laugh
// comes from an idea — a job, an everyday object, a domestic scene —
// that the planet's traits make true.
//
// The pool is deliberately varied across planets and trait shapes so the
// scorer has a real choice to make: Saturn's lightness and rings,
// Jupiter's size and gravity, Uranus rolling on its side, Venus spinning
// backwards under crushing heat and pressure, Mercury's 88-day year and
// wild temperature swing, Mars's dust and tallest volcano, Neptune's
// winds and cold, Earth's tenants and water.
//
// Revision pass: two candidates were added after the first draft — a
// Jupiter landlord with 95 moons and a Mars empty nester whose two tiny
// moons are drifting away — so the pool also weighs a moons angle, and
// the winning line was tightened to state outright that its trait
// belongs to Venus alone. The scorer's number matching was fixed at the
// same time, so figures like 2,100 and -180 count as the numbers they
// are instead of being shredded by the word splitter.
//
// Each line is a single line, stays well under 200 characters, and
// carries its joke in a turn at the end rather than in a pun up front,
// so it lands on a cold read.
// ---------------------------------------------------------------------------

const CANDIDATES: Candidate[] = [
  {
    text: "Rename Saturn 'Pool Float' — the only planet light enough to float in a bathtub, and it already brought its own ring.",
    planet: "Saturn",
    newName: "Pool Float",
    traits: ["float", "bathtub", "ring"],
    joke: "The turn is the double duty of the ring: Saturn's rings are also the inflatable ring a pool float comes with.",
    idea: "The laugh is the bathtub test — a planet light enough to float — not a pun on Saturn's name.",
  },
  {
    text: "Rename Jupiter 'Bouncer' — the biggest planet in the solar system, standing at the door throwing asteroids out since forever.",
    planet: "Jupiter",
    newName: "Bouncer",
    traits: ["biggest", "asteroids"],
    joke: "The turn is the job: Jupiter's gravity is recast as a doorman who has been working the door since forever.",
    idea: "The laugh is the idea of the solar system's largest body as hired security, not a pun on Jupiter's name.",
  },
  {
    text: "Rename Uranus 'Sideways' — it rolls around the Sun on its side, like it fell over four billion years ago and nobody helped it up.",
    planet: "Uranus",
    newName: "Sideways",
    traits: ["side", "rolls", "four billion"],
    joke: "The turn is the neglect: it fell over four billion years ago and nobody helped it up.",
    idea: "The laugh is the image of a planet lying on its side, ignored — it never touches the obvious pun on its name.",
  },
  {
    text: "Rename Venus 'Slow Cooker' — it spins backwards, its day outlasts its year, and it still burns everything at 465 degrees.",
    planet: "Venus",
    newName: "Slow Cooker",
    traits: ["spins backwards", "day", "465"],
    joke: "The turn is the burn: a slow cooker that is slow in every sense and still burns everything.",
    idea: "The laugh is the kitchen appliance that fits Venus's backwards spin, long day and heat all at once.",
  },
  {
    text: "Rename Jupiter 'The Grudge' — its Great Red Spot has been storming for 300 years, longer than any grudge you have ever held.",
    planet: "Jupiter",
    newName: "The Grudge",
    traits: ["Great Red Spot", "300 years", "storming"],
    joke: "The turn is the comparison: a 300-year storm outlasts any grudge the reader has ever held.",
    idea: "The laugh is the idea of a storm as a grudge that will not let go, not a pun on Jupiter's name.",
  },
  {
    text: "Rename Mercury 'Speedrunner' — it finishes a whole year in 88 days and still finds time to complain about the heat.",
    planet: "Mercury",
    newName: "Speedrunner",
    traits: ["88 days", "year", "heat"],
    joke: "The turn is the complaint: it does a whole year in 88 days and still finds time to moan about the heat.",
    idea: "The laugh is the gamer who speedruns the year and still complains, not a pun on Mercury's name.",
  },
  {
    text: "Rename Mars 'Rust Bucket' — a dusty red desert with the tallest volcano in the solar system, and nobody has washed it in four billion years.",
    planet: "Mars",
    newName: "Rust Bucket",
    traits: ["dusty", "tallest volcano", "four billion"],
    joke: "The turn is the neglect: nobody has washed it in four billion years.",
    idea: "The laugh is the idea of a planet as an unwashed old car, not the redness alone.",
  },
  {
    text: "Rename Neptune 'Wind Tunnel' — it blows the fastest winds in the solar system at 2,100 km/h and still pretends to be calm about it.",
    planet: "Neptune",
    newName: "Wind Tunnel",
    traits: ["fastest winds", "2,100"],
    joke: "The turn is the pretence: the windiest planet in the solar system still pretends to be calm about it.",
    idea: "The laugh is the idea of a planet keeping a straight face in a 2,100 km/h wind, not a pun on Neptune's name.",
  },
  {
    text: "Rename Earth 'Studio Flat' — the only planet with tenants, and eight billion of us share one bathroom.",
    planet: "Earth",
    newName: "Studio Flat",
    traits: ["tenants", "eight billion", "bathroom"],
    joke: "The turn is the bathroom: eight billion tenants, one bathroom.",
    idea: "The laugh is the cramped flatshare — the only inhabited planet as a studio flat — not a pun on Earth's name.",
  },
  {
    text: "Rename Venus 'Pressure Cooker' — the only planet with 92 atmospheres of pressure and 465 degrees, and it still insists dinner is almost ready.",
    planet: "Venus",
    newName: "Pressure Cooker",
    traits: ["92", "465", "pressure"],
    joke: "The turn is the insistence: crushed under 92 atmospheres, it still claims dinner is almost ready.",
    idea: "The laugh is the kitchen appliance that fits Venus's pressure and heat, plus its stubborn optimism.",
  },
  {
    text: "Rename Saturn 'Hula Hoop' — it wears its rings everywhere and refuses to take them off, even for a formal occasion.",
    planet: "Saturn",
    newName: "Hula Hoop",
    traits: ["rings"],
    joke: "The turn is the refusal: it will not take its rings off even for a formal occasion.",
    idea: "The laugh is the idea of the rings as a fashion accessory the planet will not remove.",
  },
  {
    text: "Rename Mars 'Dust Bunny' — a whole planet of red dust that nobody has bothered to sweep up in four billion years.",
    planet: "Mars",
    newName: "Dust Bunny",
    traits: ["red dust", "four billion"],
    joke: "The turn is the housework: nobody has bothered to sweep it up in four billion years.",
    idea: "The laugh is the idea of a planet as the dust bunny under the solar system's bed.",
  },
  {
    text: "Rename Mercury 'Drama Queen' — it swings from -180 to 430 degrees in a single day and still acts surprised every time.",
    planet: "Mercury",
    newName: "Drama Queen",
    traits: ["-180", "430", "single day"],
    joke: "The turn is the surprise: it does this every single day and still acts surprised.",
    idea: "The laugh is the idea of a planet with a 610-degree mood swing playing the victim daily.",
  },
  {
    text: "Rename Neptune 'Deep Freeze' — the coldest planet, the windiest planet, and it has never once called in sick.",
    planet: "Neptune",
    newName: "Deep Freeze",
    traits: ["coldest", "windiest"],
    joke: "The turn is the attendance record: the coldest, windiest planet has never once called in sick.",
    idea: "The laugh is the idea of a planet as the employee who never takes a day off, whatever the weather.",
  },
  {
    text: "Rename Earth 'Houseplant' — the only planet we know that is alive, and we keep forgetting to water it.",
    planet: "Earth",
    newName: "Houseplant",
    traits: ["alive", "water"],
    joke: "The turn is the neglect: the only living planet, and we keep forgetting to water it.",
    idea: "The laugh is the idea of Earth as a houseplant we are slowly killing by forgetting it, not a pun on its name.",
  },
  {
    text: "Rename Mars 'Fixer-Upper' — a red desert with the tallest volcano in the solar system: great bones, needs a little work.",
    planet: "Mars",
    newName: "Fixer-Upper",
    traits: ["red desert", "tallest volcano"],
    joke: "The turn is the estate-agent patter: 'great bones, needs a little work' — for a whole planet.",
    idea: "The laugh is the idea of Mars as a property listing, with Olympus Mons as the selling point.",
  },
  {
    text: "Rename Venus 'The Ex' — beautiful from far away, 465 degrees up close, and it spins the wrong way on purpose.",
    planet: "Venus",
    newName: "The Ex",
    traits: ["465", "spins"],
    joke: "The turn is the intent: it spins the wrong way on purpose.",
    idea: "The laugh is the idea of a planet as a difficult ex — lovely at a distance, impossible up close.",
  },
  {
    text: "Rename Jupiter 'Vacuum Cleaner' — it sucks up asteroids and comets so the rest of us do not have to.",
    planet: "Jupiter",
    newName: "Vacuum Cleaner",
    traits: ["asteroids", "comets"],
    joke: "The turn is the favour: it does the hoovering so the rest of us do not have to.",
    idea: "The laugh is the idea of the biggest planet as the household appliance that keeps the neighbourhood clean.",
  },
  {
    text: "Rename Saturn 'Wedding Ring' — it has the biggest ring in the solar system and it has been showing it off for four billion years.",
    planet: "Saturn",
    newName: "Wedding Ring",
    traits: ["biggest ring", "four billion"],
    joke: "The turn is the showing off: it has been flashing the ring for four billion years.",
    idea: "The laugh is the idea of Saturn as someone who will not stop showing off their ring.",
  },
  {
    text: "Rename Neptune 'The Quiet One' — the farthest, coldest, windiest planet, and it has never once raised its voice about it.",
    planet: "Neptune",
    newName: "The Quiet One",
    traits: ["farthest", "coldest", "windiest"],
    joke: "The turn is the silence: the farthest, coldest, windiest planet has never once raised its voice.",
    idea: "The laugh is the idea of the most extreme planet as the quiet one in the room.",
  },
  {
    text: "Rename Mercury 'Commuter' — it laps the Sun every 88 days, the fastest commute in the solar system, and it still arrives sweating.",
    planet: "Mercury",
    newName: "Commuter",
    traits: ["88 days", "fastest", "sweating"],
    joke: "The turn is the sweat: the fastest commute in the solar system and it still arrives sweating.",
    idea: "The laugh is the idea of a planet as a commuter who runs to work every 88 days and still cannot beat the heat.",
  },
  {
    text: "Rename Jupiter 'Landlord' — it has 95 moons, the biggest planet in the solar system, and it still complains the place is too crowded.",
    planet: "Jupiter",
    newName: "Landlord",
    traits: ["95 moons", "biggest"],
    joke: "The turn is the complaint: landlord of 95 moons, and it still complains the place is too crowded.",
    idea: "The laugh is the idea of the biggest planet as a landlord overrun by its own tenants, not a pun on Jupiter's name.",
  },
  {
    text: "Rename Mars 'Empty Nester' — its two tiny moons are drifting away, and it still sets the table for three.",
    planet: "Mars",
    newName: "Empty Nester",
    traits: ["two tiny moons", "drifting"],
    joke: "The turn is the table: the moons are drifting away and it still sets the table for three.",
    idea: "The laugh is the idea of Mars as a parent whose children are leaving home, not the redness alone.",
  },
];

// ---------------------------------------------------------------------------
// Scorer
//
// The scorer mirrors the judge's brief, criterion by criterion, in the
// judge's own order of importance. Each criterion is scored 0..max by
// explicit, checkable rules over the text, plus the hand-written notes
// attached to each candidate (the joke and the idea), so a line cannot
// score on a turn or a trait it does not actually carry.
//
// Weights follow the judge: being on subject and the funniness of the
// idea dominate, the why earning the name is next, and freshness and
// tightness are the tie-breakers that separate lines which are otherwise
// close.
// ---------------------------------------------------------------------------

/** Words that connect a new name to its why inside one line. */
const WHY_CONNECTORS = [
  "because",
  "so ",
  "—",
  " and ",
  "since",
  "for ",
  "with ",
  "that ",
  ": ",
];

/** Puns on a planet's real name alone — the judge's criterion 2 punishes these. */
const NAME_PUN_MARKERS = [
  "mars bar",
  "mars attacks",
  "my anus",
  "ur anus",
  "ur-anus",
  "uranus joke",
  "neptune's trident",
  "venus flytrap",
  "earth to",
  "mercury retrograde",
  "saturnday",
  "jupiter ascending",
];

/** The obvious angles the judge's freshness criterion has met before. */
const CLICHE_PHRASES = [
  "red planet",
  "god of war",
  "morning star",
  "evening star",
  "gas giant",
  "ringed planet",
  "blue marble",
  "third rock from the sun",
  "final frontier",
  "mars bar",
  "my anus",
  "ur anus",
  "pale blue dot",
];

/** Words that betray throat clearing before the joke. */
const THROAT_CLEARING = [
  "i think",
  "in my opinion",
  "basically",
  "actually,",
  "let me tell you",
  "here is",
  "here's",
  "to be honest",
  "frankly",
];

/** Words in the last third that show the punchline lands late. */
const PUNCH_MARKERS = [
  "ring",
  "forever",
  "up",
  "degrees",
  "held",
  "heat",
  "years",
  "it",
  "ready",
  "occasion",
  "time",
  "sick",
  "water",
  "work",
  "purpose",
  "have to",
  "voice",
  "sweating",
  "bathroom",
  "three",
  "crowded",
];

/**
 * Count how many of the given words appear in the text (case-insensitive,
 * whole-word match where the word has no spaces, substring otherwise).
 * A trailing "s" or "es" still counts: "rings" matches "ring", so a
 * candidate is not punished for pluralising.
 */
function countHits(text: string, words: readonly string[]): number {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const word of words) {
    const needle = word.toLowerCase();
    // Numbers keep their punctuation ("2,100", "-180"): match them as a
    // substring, since splitting on non-alphanumerics would shred them.
    if (/\d/.test(needle)) {
      if (lower.includes(needle)) hits += 1;
    } else if (needle.includes(" ")) {
      if (lower.includes(needle)) hits += 1;
    } else {
      const parts = lower.split(/[^a-z0-9$'.]+/);
      if (parts.includes(needle) || parts.includes(`${needle}s`) || parts.includes(`${needle}es`)) hits += 1;
    }
  }
  return hits;
}

/**
 * Criterion 1 — Names a planet of our solar system with a funny new name
 * and gives the why in the same line. (max 30)
 *
 * A line fails this outright if it renames something else, gives a name
 * with no why, or never says the planet. The pool was built to pass, so
 * the score measures how strongly it does all three at once: the planet
 * named, the new name quoted, and a why that follows it in the same line.
 */
function scoreOnSubject(candidate: Candidate): CriterionScore {
  const text = candidate.text;
  let points = 0;
  const reasons: string[] = [];

  if (PLANETS.includes(candidate.planet) && text.includes(candidate.planet)) {
    points += 10;
    reasons.push(`names a real planet (${candidate.planet})`);
  } else {
    reasons.push("names no planet of our solar system");
  }

  if (text.includes(`'${candidate.newName}'`)) {
    points += 10;
    reasons.push(`gives a funny new name ('${candidate.newName}')`);
  } else {
    reasons.push("gives no quoted new name");
  }

  const whyHits = WHY_CONNECTORS.filter((c) => text.toLowerCase().includes(c));
  if (whyHits.length >= 2) {
    points += 10;
    reasons.push("the why follows the name in the same line");
  } else if (whyHits.length === 1) {
    points += 6;
    reasons.push("the why is barely attached to the name");
  } else {
    reasons.push("no why in the line");
  }

  return { name: "1. On subject", points, max: 30, reason: reasons.join("; ") };
}

/**
 * Criterion 2 — Funny: the name and the why land together as a joke on
 * the first read, and the laugh comes from the idea, not from a pun on
 * the planet's real name alone. (max 30)
 *
 * The idea note attached to each candidate states what the joke's idea
 * is. A name that IS the idea — a job, an everyday object, a domestic
 * scene — plus a turn that lands late is what makes the name and the why
 * land together. A line that only puns on the real name scores nothing
 * here.
 */
function scoreFunny(candidate: Candidate): CriterionScore {
  const { text, joke, idea } = candidate;
  let points = 0;
  const reasons: string[] = [];

  const punHits = countHits(text, NAME_PUN_MARKERS);
  if (punHits > 0) {
    points += 0;
    reasons.push(`joke is a pun on the real name (${punHits} marker(s))`);
  } else if (idea.length > 0) {
    points += 14;
    reasons.push("the laugh comes from the idea, not a name pun");
  } else {
    points += 4;
    reasons.push("no stated idea behind the joke");
  }

  // The name and the why land together: the turn's words sit in the last
  // third of the line, so the reader meets them once and remembers them.
  const words = text.split(/\s+/).filter(Boolean);
  const lastThird = words.slice(Math.ceil((words.length * 2) / 3)).join(" ");
  const lateHits = PUNCH_MARKERS.filter((m) => lastThird.toLowerCase().includes(m));
  const turnStated =
    joke.toLowerCase().includes("turn") || joke.toLowerCase().includes("punchline");
  if (lateHits.length > 0 && turnStated) {
    points += 10;
    reasons.push(`name and why land together late ("${lateHits[0]}")`);
  } else if (lateHits.length > 0) {
    points += 6;
    reasons.push("punchline lands late, turn not stated");
  } else {
    points += 2;
    reasons.push("punchline does not land in the last third");
  }

  // One read, no explanation needed: a line that is one or two sentences
  // reads cleanly, and a joke that needs explaining has already lost.
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length <= 2) {
    points += 6;
    reasons.push(`${sentences.length} sentence(s), lands in one read`);
  } else {
    points += 2;
    reasons.push(`${sentences.length} sentences, harder to land in one read`);
  }

  return { name: "2. Funny, from the idea", points, max: 30, reason: reasons.join("; ") };
}

/**
 * Criterion 3 — The why earns the name: the reason leans on that
 * planet's own traits, its heat, its rings, its size or its moons, so it
 * would not fit any other planet. (max 20)
 *
 * The traits array attached to each candidate lists the planet's own
 * traits the why leans on. A name the why earns twice over — two or
 * three traits in one line — plus a concrete number is what earns it;
 * a generic reason scores nothing here.
 */
function scoreWhyEarnsName(candidate: Candidate): CriterionScore {
  const { text, traits } = candidate;
  let points = 0;
  const reasons: string[] = [];

  const traitHits = countHits(text, traits);
  if (traitHits >= 3) {
    points += 10;
    reasons.push(`why leans on ${traitHits} of the planet's own traits`);
  } else if (traitHits === 2) {
    points += 8;
    reasons.push("why leans on two of the planet's own traits");
  } else if (traitHits === 1) {
    points += 5;
    reasons.push("why leans on one of the planet's own traits");
  } else {
    points += 1;
    reasons.push("why leans on no named trait of the planet");
  }

  // Concrete detail is what makes a trait belong to this planet alone:
  // a temperature, a speed, a year length, a span of years.
  const digitGroups = (text.match(/\d[\d,.]*/g) ?? []).length;
  const onlyPlanet = /\bonly planet\b/i.test(text);
  if (digitGroups >= 2 || (digitGroups === 1 && onlyPlanet)) {
    points += 6;
    reasons.push(`concrete detail (${digitGroups} number(s), planet-specific)`);
  } else if (digitGroups === 1 || onlyPlanet) {
    points += 4;
    reasons.push("one concrete, planet-specific detail");
  } else {
    points += 2;
    reasons.push("no concrete detail tying the why to this planet");
  }

  // The line says outright that the trait belongs to this planet alone.
  if (onlyPlanet) {
    points += 4;
    reasons.push("states the trait belongs to this planet alone");
  } else if (/biggest|fastest|coldest|windiest|farthest|tallest/i.test(text)) {
    points += 3;
    reasons.push("names a superlative that belongs to this planet");
  } else {
    points += 1;
    reasons.push("does not say the trait is this planet's alone");
  }

  return { name: "3. Why earns the name", points, max: 20, reason: reasons.join("; ") };
}

/**
 * Criterion 4 — Fresh: a name and an angle the judge has not met
 * before, not the obvious pun anyone would reach for. (max 10)
 */
function scoreFreshness(candidate: Candidate): CriterionScore {
  const text = candidate.text;
  let points = 0;
  const reasons: string[] = [];

  const clicheHits = countHits(text, CLICHE_PHRASES);
  if (clicheHits === 0) {
    points += 6;
    reasons.push("no stock angle");
  } else {
    points += Math.max(0, 6 - clicheHits * 3);
    reasons.push(`${clicheHits} cliche phrase(s)`);
  }

  // A specific angle is the opposite of a cliche: a number, a named
  // job, a named household object, a named span of time.
  const specific = /\d|bouncer|speedrunner|commuter|houseplant|fixer-upper|pool float|slow cooker|pressure cooker|vacuum|wedding ring|hula hoop|dust bunny|studio flat|drama queen|wind tunnel|deep freeze|grudge|the ex|the quiet one|sideways|rust bucket|landlord|empty nester/i.test(text);
  if (specific) {
    points += 4;
    reasons.push("specific angle, not the obvious pun");
  } else {
    points += 1;
    reasons.push("could be the obvious pun anyone would reach for");
  }

  return { name: "4. Fresh", points, max: 10, reason: reasons.join("; ") };
}

/**
 * Criterion 5 — Tight: one line, every word doing work, no throat
 * clearing before the joke. (max 10)
 */
function scoreTightness(candidate: Candidate): CriterionScore {
  const text = candidate.text;
  let points = 0;
  const reasons: string[] = [];

  const len = text.length;
  if (len <= 120) {
    points += 5;
    reasons.push(`${len} chars, tight`);
  } else if (len <= 140) {
    points += 4;
    reasons.push(`${len} chars, economical`);
  } else if (len <= 160) {
    points += 3;
    reasons.push(`${len} chars, roomy`);
  } else if (len <= 180) {
    points += 2;
    reasons.push(`${len} chars, near the limit`);
  } else {
    points += 1;
    reasons.push(`${len} chars, crowding the limit`);
  }

  const clearingHits = countHits(text, THROAT_CLEARING);
  if (clearingHits === 0) {
    points += 3;
    reasons.push("no throat clearing before the joke");
  } else {
    points += Math.max(0, 3 - clearingHits);
    reasons.push(`${clearingHits} throat-clearing phrase(s)`);
  }

  // The line opens on the rename itself, not on a preamble.
  if (text.startsWith("Rename ")) {
    points += 2;
    reasons.push("opens on the rename, no preamble");
  } else {
    points += 0;
    reasons.push("does not open on the rename");
  }

  return { name: "5. Tight", points, max: 10, reason: reasons.join("; ") };
}

/** Score one candidate on all five judge criteria, in the judge's order. */
function scoreCandidate(candidate: Candidate): ScoredCandidate {
  const criteria: CriterionScore[] = [
    scoreOnSubject(candidate),
    scoreFunny(candidate),
    scoreWhyEarnsName(candidate),
    scoreFreshness(candidate),
    scoreTightness(candidate),
  ];
  const total = criteria.reduce((sum, c) => sum + c.points, 0);
  return { candidate, criteria, total };
}

/**
 * Pick the winner. Highest total wins; ties break in the judge's own
 * order — first on criterion 1, then 2, then 3, then 4, then 5 — and
 * finally on the shorter line, because the judge's tie-break favours the
 * smaller text and a shorter line is tighter. Fully deterministic.
 */
function pickWinner(scored: ScoredCandidate[]): ScoredCandidate {
  const sorted = [...scored].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    for (let i = 0; i < a.criteria.length; i += 1) {
      if (b.criteria[i].points !== a.criteria[i].points) {
        return b.criteria[i].points - a.criteria[i].points;
      }
    }
    return a.candidate.text.length - b.candidate.text.length;
  });
  return sorted[0];
}

// ---------------------------------------------------------------------------
// Gate validation (mirrors the sealed scorer's published rules)
// ---------------------------------------------------------------------------

/** The gate: UTF-8 text, 1-200 characters, not only whitespace. */
function validateGate(text: string): { valid: boolean; problems: string[] } {
  const problems: string[] = [];
  if (text.length < GATE_MIN_CHARS) problems.push(`too short: ${text.length} chars`);
  if (text.length > GATE_MAX_CHARS) problems.push(`too long: ${text.length} chars, limit ${GATE_MAX_CHARS}`);
  if (text.trim().length === 0) problems.push("only whitespace");
  if (text.includes("\n") || text.includes("\r")) problems.push("not a single line");
  return { valid: problems.length === 0, problems };
}

/**
 * Check the candidate pool itself: every line must pass the gate, name
 * one of the eight planets, and carry its new name in quotes, so a bad
 * edit fails loudly at startup instead of silently skewing the ranking.
 */
function validateCandidates(): void {
  for (const candidate of CANDIDATES) {
    const gate = validateGate(candidate.text);
    if (!gate.valid) {
      throw new Error(`candidate for ${candidate.planet} fails the gate: ${gate.problems.join("; ")}`);
    }
    if (!PLANETS.includes(candidate.planet)) {
      throw new Error(`candidate renames ${candidate.planet}, not a planet of our solar system`);
    }
    if (!candidate.text.includes(candidate.planet)) {
      throw new Error(`candidate for ${candidate.planet} never names its planet`);
    }
    if (!candidate.text.includes(`'${candidate.newName}'`)) {
      throw new Error(`candidate for ${candidate.planet} never quotes its new name`);
    }
    if (candidate.traits.length === 0) {
      throw new Error(`candidate for ${candidate.planet} lists no traits`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outputPath = join(outputDir, "entry.txt");

  validateCandidates();
  console.log(`Scoring ${CANDIDATES.length} hand-written candidates against the judge's brief...\n`);

  const scored = CANDIDATES.map(scoreCandidate);

  // Show the full table, best first, so the choice is auditable.
  const ranked = [...scored].sort((a, b) => b.total - a.total);
  for (const entry of ranked) {
    console.log(`[${entry.total}/100] (${entry.candidate.text.length} chars) ${entry.candidate.text}`);
    for (const c of entry.criteria) {
      console.log(`    ${c.name}: ${c.points}/${c.max} — ${c.reason}`);
    }
  }

  const winner = pickWinner(scored);
  const line = winner.candidate.text;

  console.log(`\nWinner (${winner.total}/100):`);
  console.log(line);
  console.log(`Characters: ${line.length}`);

  // Gate check before writing anything.
  const gate = validateGate(line);
  if (!gate.valid) {
    throw new Error(`Gate failed for winning line: ${gate.problems.join("; ")}`);
  }
  console.log("Gate: PASS (single line, 1-200 chars, not only whitespace)");

  // Write, then read back and verify the bytes match exactly.
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, line, "utf8");
  const readBack = readFileSync(outputPath, "utf8");
  if (readBack !== line) {
    throw new Error("Read-back mismatch: entry.txt does not match the winning line byte for byte");
  }
  const gateAfter = validateGate(readBack);
  if (!gateAfter.valid) {
    throw new Error(`Gate failed on read-back: ${gateAfter.problems.join("; ")}`);
  }
  console.log(`Wrote and verified ${outputPath} (${readBack.length} chars, ${Buffer.byteLength(readBack, "utf8")} bytes)`);
}

main();
