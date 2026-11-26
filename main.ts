#!/usr/bin/env node
/**
 * Rename the Planet — a deterministic picker for Earth's new name.
 *
 * Earth has had the same name for roughly a thousand years, and frankly it
 * is a branding disaster. "Earth" is literally just the word for "dirt".
 * Every other planet in the solar system got a god, a myth, a story.
 * We got soil.
 *
 * This program fixes that. It holds fourteen candidate replacement names,
 * each with a one-line justification, and scores every one of them against
 * five fixed criteria with fixed weights. The highest total wins. There is
 * no randomness anywhere in this file, no network access, no clock reads,
 * no environment sniffing: run it a thousand times on a thousand machines
 * and you will get the same winner every single time.
 *
 * Usage:
 *   bun main.ts            print the full ranking and the winner
 *   bun main.ts --winner   print only the winning name + justification
 *   bun main.ts --list     print every candidate with its justification
 *   bun main.ts --json     print the full ranking as JSON
 *   node main.ts           same as above (Node 22+ strips types natively,
 *                          but this file is written as plain TypeScript
 *                          with erasable-only syntax so it also runs
 *                          under `tsc` + `node dist/main.js`)
 *
 * The scoring rubric is deliberately boring and transparent. Each candidate
 * carries five integer sub-scores from 0 to 10, one per criterion, assigned
 * by hand and frozen in the source below. The weights sum to exactly 1.00,
 * so every final score lands on a clean 0–10 scale with two decimals.
 *
 * Criteria and weights:
 *   memorability      0.25   — sticks after one hearing
 *   wit               0.20   — makes you smile, not cringe
 *   pronounceability  0.20   — a child on any continent can say it
 *   fit for Earth     0.20   — actually describes this planet
 *   originality       0.15   — not already taken by a moon, a band, or a soap
 *
 * Ties are broken deterministically: first by total score (descending),
 * then by fit-for-Earth sub-score (descending), then by name, A to Z.
 * With the frozen sub-scores in this file there are no ties at the top,
 * but the rule is written down so the ordering is total either way.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The five scoring criteria, in the order they are printed. */
export type Criterion =
  | "memorability"
  | "wit"
  | "pronounceability"
  | "fit"
  | "originality";

/** One candidate replacement name for the planet Earth. */
export interface Candidate {
  /** The proposed new name for the planet. */
  name: string;
  /** One line explaining why this name deserves the job. */
  justification: string;
  /** Hand-assigned sub-scores, integers from 0 to 10, one per criterion. */
  scores: Record<Criterion, number>;
}

/** A candidate with its computed total and weighted breakdown attached. */
export interface ScoredCandidate extends Candidate {
  /** Weighted total on a 0–10 scale, rounded to two decimals. */
  total: number;
  /** Weighted contribution of each criterion, in criterion order. */
  breakdown: Record<Criterion, number>;
  /** Position in the final ranking, 1-based. */
  rank: number;
}

// ---------------------------------------------------------------------------
// The rubric: fixed weights, frozen at authoring time.
// ---------------------------------------------------------------------------

/** Weight of each criterion. These must sum to exactly 1.00. */
export const WEIGHTS: Record<Criterion, number> = {
  memorability: 0.25,
  wit: 0.2,
  pronounceability: 0.2,
  fit: 0.2,
  originality: 0.15,
};

/** Criteria in display order, with a short human gloss for each one. */
export const CRITERIA: Array<{ key: Criterion; label: string; gloss: string }> = [
  {
    key: "memorability",
    label: "Memorability",
    gloss: "sticks after a single hearing",
  },
  {
    key: "wit",
    label: "Wit",
    gloss: "makes you smile instead of cringe",
  },
  {
    key: "pronounceability",
    label: "Pronounceability",
    gloss: "a child on any continent can say it",
  },
  {
    key: "fit",
    label: "Fit for Earth",
    gloss: "actually describes this planet",
  },
  {
    key: "originality",
    label: "Originality",
    gloss: "not already a moon, a band, or a soap",
  },
];

/** The number of candidates the field is required to hold. */
export const EXPECTED_CANDIDATE_COUNT = 14;

/** The only name that ever gets to be the answer. */
export const OLD_NAME = "Earth";

// ---------------------------------------------------------------------------
// The fourteen candidates.
// ---------------------------------------------------------------------------
//
// Scoring notes, written down so the numbers are not mysterious:
//   - Memorability rewards short, punchy, already-half-familiar words.
//   - Wit rewards a grin; a pun that lands once is worth more than a pun
//     that needs explaining, and a name that is only a joke scores low.
//   - Pronounceability rewards plain syllables and punishes consonant
//     pile-ups, silent letters, and anything that needs a pronunciation
//     guide taped to the side of the planet.
//   - Fit rewards names that describe what Earth actually is: blue,
//     alive, watery, green, home.
//   - Originality rewards names that are not already claimed by a moon,
//     a spacecraft, a shampoo, or a 1970s prog-rock band.
//
// Every justification is exactly one line. Every sub-score is an integer
// from 0 to 10. Nothing here is computed at runtime from outside data.

export const CANDIDATES: Candidate[] = [
  {
    name: "Terra",
    justification:
      "The planet's own Latin name, already used by scientists — the dignified upgrade from dirt.",
    scores: {
      memorability: 8,
      wit: 5,
      pronounceability: 9,
      fit: 9,
      originality: 4,
    },
  },
  {
    name: "Gaia",
    justification:
      "The living-Earth goddess herself; the planet finally gets the mythic name its siblings enjoy.",
    scores: {
      memorability: 9,
      wit: 6,
      pronounceability: 8,
      fit: 9,
      originality: 5,
    },
  },
  {
    name: "Terra Nova",
    justification:
      "Latin for 'new Earth' — a fresh start that still nods to the old name, and it sounds like a starship already.",
    scores: {
      memorability: 9,
      wit: 7,
      pronounceability: 8,
      fit: 9,
      originality: 7,
    },
  },
  {
    name: "Eden",
    justification:
      "The garden planet, named for the garden — paradise branding, zero rebranding budget required.",
    scores: {
      memorability: 8,
      wit: 6,
      pronounceability: 9,
      fit: 7,
      originality: 5,
    },
  },
  {
    name: "Aqua",
    justification:
      "Seventy percent ocean, one hundred percent accurate — the wettest name on the list.",
    scores: {
      memorability: 7,
      wit: 5,
      pronounceability: 9,
      fit: 8,
      originality: 4,
    },
  },
  {
    name: "Blue Marble",
    justification:
      "What the astronauts actually saw — the most famous photograph of home, promoted to official name.",
    scores: {
      memorability: 9,
      wit: 8,
      pronounceability: 7,
      fit: 8,
      originality: 8,
    },
  },
  {
    name: "Haven",
    justification:
      "The one safe harbour we know of in the entire universe; the name is the promise.",
    scores: {
      memorability: 7,
      wit: 6,
      pronounceability: 9,
      fit: 7,
      originality: 5,
    },
  },
  {
    name: "Oasis",
    justification:
      "A drink of water in a desert of dead rocks — exactly what this planet is to a traveller.",
    scores: {
      memorability: 7,
      wit: 7,
      pronounceability: 8,
      fit: 7,
      originality: 6,
    },
  },
  {
    name: "Garden",
    justification:
      "The only garden in the solar system, and the name comes with a built-in instruction: tend it.",
    scores: {
      memorability: 7,
      wit: 5,
      pronounceability: 9,
      fit: 8,
      originality: 4,
    },
  },
  {
    name: "Cradle",
    justification:
      "Where humanity was born and raised — every species gets a cradle, and this one is ours.",
    scores: {
      memorability: 7,
      wit: 7,
      pronounceability: 8,
      fit: 8,
      originality: 6,
    },
  },
  {
    name: "Hearth",
    justification:
      "The warm fire at the centre of the house — home, but with the cosiness turned all the way up.",
    scores: {
      memorability: 6,
      wit: 7,
      pronounceability: 8,
      fit: 7,
      originality: 7,
    },
  },
  {
    name: "Verde",
    justification:
      "Green in three languages at once — the living planet, named for the colour you see from orbit.",
    scores: {
      memorability: 6,
      wit: 6,
      pronounceability: 7,
      fit: 7,
      originality: 6,
    },
  },
  {
    name: "Sol III",
    justification:
      "The brutally honest catalogue entry — third rock from the Sun, no poetry, no arguments, no mercy.",
    scores: {
      memorability: 5,
      wit: 7,
      pronounceability: 6,
      fit: 6,
      originality: 7,
    },
  },
  {
    name: "Mother",
    justification:
      "Every culture already calls her Mother Earth — this just drops the surname and makes it official.",
    scores: {
      memorability: 6,
      wit: 6,
      pronounceability: 8,
      fit: 8,
      originality: 3,
    },
  },
];

// ---------------------------------------------------------------------------
// Validation: the data set must be exactly what the field promises.
// ---------------------------------------------------------------------------

/**
 * Check the candidate list for the structural promises this program makes:
 * exactly fourteen candidates, unique names, exactly one justification line
 * each, and every sub-score an integer inside 0–10. Throws on the first
 * violation it finds, naming the offending candidate, so a bad edit fails
 * loudly at startup instead of silently skewing the ranking.
 */
export function validateCandidates(candidates: Candidate[]): void {
  if (candidates.length !== EXPECTED_CANDIDATE_COUNT) {
    throw new Error(
      `expected ${EXPECTED_CANDIDATE_COUNT} candidates, got ${candidates.length}`,
    );
  }

  const seenNames = new Set<string>();
  for (const candidate of candidates) {
    if (candidate.name.trim().length === 0) {
      throw new Error("candidate with an empty name found");
    }
    if (seenNames.has(candidate.name)) {
      throw new Error(`duplicate candidate name: ${candidate.name}`);
    }
    seenNames.add(candidate.name);

    if (candidate.justification.trim().length === 0) {
      throw new Error(`candidate ${candidate.name} has an empty justification`);
    }
    if (candidate.justification.includes("\n")) {
      throw new Error(
        `candidate ${candidate.name} has a multi-line justification`,
      );
    }

    for (const criterion of CRITERIA) {
      const value = candidate.scores[criterion.key];
      if (!Number.isInteger(value) || value < 0 || value > 10) {
        throw new Error(
          `candidate ${candidate.name}: ${criterion.key} score ${value} ` +
            `is not an integer from 0 to 10`,
        );
      }
    }
  }
}

/**
 * Check the rubric itself: every weight must be positive, and the weights
 * must sum to exactly 1.00 (within a hair of floating-point dust).
 */
export function validateWeights(weights: Record<Criterion, number>): void {
  let sum = 0;
  for (const criterion of CRITERIA) {
    const weight = weights[criterion.key];
    if (!(weight > 0)) {
      throw new Error(`weight for ${criterion.key} must be positive, got ${weight}`);
    }
    sum += weight;
  }
  if (Math.abs(sum - 1) > 1e-9) {
    throw new Error(`weights must sum to 1.00, got ${sum}`);
  }
}

// ---------------------------------------------------------------------------
// The scorer: weighted sum, two decimals, fully deterministic.
// ---------------------------------------------------------------------------

/** Round a number to exactly two decimal places. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Score one candidate. Each criterion contributes
 * sub-score × weight, and the contributions are rounded to two decimals
 * individually so the printed breakdown adds up to the printed total
 * exactly — no hidden floating-point dust in the output.
 */
export function scoreCandidate(candidate: Candidate): ScoredCandidate {
  const breakdown = {} as Record<Criterion, number>;
  let total = 0;
  for (const criterion of CRITERIA) {
    const contribution = round2(
      candidate.scores[criterion.key] * WEIGHTS[criterion.key],
    );
    breakdown[criterion.key] = contribution;
    total += contribution;
  }
  return {
    ...candidate,
    total: round2(total),
    breakdown,
    rank: 0, // filled in by rankCandidates
  };
}

/**
 * Compare two scored candidates for ranking order. Total score decides;
 * then fit-for-Earth; then the name, A to Z. The comparator is total,
 * so the same input always produces the same ranking — no sort is ever
 * left to chance or to engine internals.
 */
export function compareScored(a: ScoredCandidate, b: ScoredCandidate): number {
  if (a.total !== b.total) {
    return b.total - a.total;
  }
  if (a.scores.fit !== b.scores.fit) {
    return b.scores.fit - a.scores.fit;
  }
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}

/**
 * Score every candidate and return them in final ranking order, ranks
 * numbered from 1. Validates the data and the rubric first, so a broken
 * edit can never produce a confident-looking wrong answer.
 */
export function rankCandidates(
  candidates: Candidate[] = CANDIDATES,
): ScoredCandidate[] {
  validateCandidates(candidates);
  validateWeights(WEIGHTS);
  const scored = candidates.map(scoreCandidate);
  scored.sort(compareScored);
  scored.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  return scored;
}

/** The single winning candidate: rank 1 of the deterministic ranking. */
export function pickWinner(
  candidates: Candidate[] = CANDIDATES,
): ScoredCandidate {
  return rankCandidates(candidates)[0];
}

/**
 * How far ahead the winner finished: winner total minus runner-up total,
 * in points on the 0–10 scale. A small margin means the field was close;
 * a large one means the winner ran away with it. Returns 0 when the
 * ranking holds a single entry, so callers never divide by a missing row.
 */
export function marginOfVictory(ranked: ScoredCandidate[]): number {
  if (ranked.length < 2) return 0;
  return round2(ranked[0].total - ranked[1].total);
}

// ---------------------------------------------------------------------------
// Presentation helpers: plain text, no colour codes, no dependencies.
// ---------------------------------------------------------------------------

/** Repeat a character n times (a tiny helper, kept explicit on purpose). */
function repeat(char: string, count: number): string {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    out += char;
  }
  return out;
}

/** Pad a string on the right with spaces to a fixed width. */
function padRight(text: string, width: number): string {
  if (text.length >= width) return text;
  return text + repeat(" ", width - text.length);
}

/** Pad a string on the left with spaces to a fixed width. */
function padLeft(text: string, width: number): string {
  if (text.length >= width) return text;
  return repeat(" ", width - text.length) + text;
}

/** Format a score as a fixed two-decimal string, e.g. "8.10". */
function fmt(value: number): string {
  return value.toFixed(2);
}

/** A horizontal rule for the tables. */
const RULE = repeat("-", 72);

/** Print one candidate's weighted breakdown, one criterion per line. */
export function breakdownLines(entry: ScoredCandidate): string[] {
  const lines: string[] = [];
  for (const criterion of CRITERIA) {
    const weight = WEIGHTS[criterion.key];
    const raw = entry.scores[criterion.key];
    const contribution = entry.breakdown[criterion.key];
    lines.push(
      `  ${padRight(criterion.label, 16)} ${raw}/10 x ${weight.toFixed(2)} = ${fmt(contribution)}`,
    );
  }
  lines.push(`  ${padRight("TOTAL", 16)} ${padRight("", 11)} = ${fmt(entry.total)}`);
  return lines;
}

/** Render the full ranking table as text lines. */
export function rankingLines(ranked: ScoredCandidate[]): string[] {
  const nameWidth = Math.max(...ranked.map((entry) => entry.name.length));
  const lines: string[] = [];
  lines.push(RULE);
  lines.push(
    `${padRight("#", 3)} ${padRight("Name", nameWidth)}  ${padRight("Total", 5)}  ` +
      `Mem  Wit  Pro  Fit  Ori`,
  );
  lines.push(RULE);
  for (const entry of ranked) {
    const s = entry.scores;
    lines.push(
      `${padRight(String(entry.rank), 3)} ${padRight(entry.name, nameWidth)}  ` +
        `${fmt(entry.total)}  ` +
        `${padLeft(String(s.memorability), 3)}  ` +
        `${padLeft(String(s.wit), 3)}  ` +
        `${padLeft(String(s.pronounceability), 3)}  ` +
        `${padLeft(String(s.fit), 3)}  ` +
        `${padLeft(String(s.originality), 3)}`,
    );
  }
  lines.push(RULE);
  return lines;
}

/** Render the winner announcement as text lines. */
export function winnerLines(winner: ScoredCandidate): string[] {
  const lines: string[] = [];
  lines.push("");
  lines.push(`The planet formerly known as ${OLD_NAME} shall henceforth be called:`);
  lines.push("");
  lines.push(`  *** ${winner.name} ***`);
  lines.push("");
  lines.push(`  ${winner.justification}`);
  lines.push("");
  lines.push("Score breakdown:");
  lines.push(...breakdownLines(winner));
  lines.push("");
  return lines;
}

/** Render the whole result as a JSON-serialisable object. */
export function rankingJson(ranked: ScoredCandidate[]): Record<string, unknown> {
  return {
    oldName: OLD_NAME,
    winner: ranked[0].name,
    winnerJustification: ranked[0].justification,
    winnerTotal: ranked[0].total,
    criteria: CRITERIA.map((criterion) => ({
      key: criterion.key,
      label: criterion.label,
      weight: WEIGHTS[criterion.key],
      gloss: criterion.gloss,
    })),
    ranking: ranked.map((entry) => ({
      rank: entry.rank,
      name: entry.name,
      justification: entry.justification,
      scores: entry.scores,
      breakdown: entry.breakdown,
      total: entry.total,
    })),
  };
}

// ---------------------------------------------------------------------------
// The CLI.
// ---------------------------------------------------------------------------

/** The flags this CLI understands. Anything else is a usage error. */
const KNOWN_FLAGS = new Set(["--winner", "--list", "--json", "--help"]);

function printUsage(): void {
  console.log("Rename the Planet — deterministic picker for Earth's new name");
  console.log("");
  console.log("Usage:");
  console.log("  bun main.ts            full ranking + winner");
  console.log("  bun main.ts --winner   winner only");
  console.log("  bun main.ts --list     every candidate + justification");
  console.log("  bun main.ts --json     full ranking as JSON");
  console.log("  bun main.ts --help     this message");
  console.log("");
  console.log("No network. No randomness. Same winner every run.");
}

function printList(ranked: ScoredCandidate[]): void {
  console.log(`Fourteen candidates for the new name of ${OLD_NAME}:`);
  console.log("");
  for (const entry of ranked) {
    console.log(`  ${entry.rank}. ${entry.name} — ${entry.justification}`);
  }
  console.log("");
}

function printFull(ranked: ScoredCandidate[]): void {
  console.log(`Rename the Planet — ${CANDIDATES.length} candidates, one winner`);
  console.log("");
  console.log("How it works: five criteria, fixed weights (memorability 0.25,");
  console.log("wit 0.20, pronounceability 0.20, fit 0.20, originality 0.15).");
  console.log("Highest weighted total wins; ties break on fit, then A to Z.");
  console.log("");
  for (const line of rankingLines(ranked)) {
    console.log(line);
  }
  for (const line of winnerLines(ranked[0])) {
    console.log(line);
  }
  console.log("Runner-up, for the record:");
  console.log(`  ${ranked[1].name} — ${ranked[1].justification}`);
  console.log(`  (total ${fmt(ranked[1].total)}, ${fmt(marginOfVictory(ranked))} behind the winner)`);
  console.log("");
}

/** Entry point: parse flags, rank, print. Exits non-zero on bad flags. */
export function main(argv: string[]): number {
  const flags = argv.slice(2);
  for (const flag of flags) {
    if (!KNOWN_FLAGS.has(flag)) {
      console.error(`Unknown flag: ${flag}`);
      console.error("Run with --help for usage.");
      return 2;
    }
  }

  if (flags.includes("--help")) {
    printUsage();
    return 0;
  }

  const ranked = rankCandidates();

  if (flags.includes("--json")) {
    console.log(JSON.stringify(rankingJson(ranked), null, 2));
    return 0;
  }
  if (flags.includes("--winner")) {
    for (const line of winnerLines(ranked[0])) {
      console.log(line);
    }
    return 0;
  }
  if (flags.includes("--list")) {
    printList(ranked);
    return 0;
  }

  printFull(ranked);
  return 0;
}

// Run the CLI when this file is executed directly, and stay importable
// as a library when it is not. The argv check is the standard dual-mode
// guard: `bun main.ts` and `node main.ts` both land here, while an
// `import` from a test or a REPL does not trigger any output.
const entryPoint =
  typeof process !== "undefined" &&
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith("main.ts") || process.argv[1].endsWith("main.js"));

if (entryPoint) {
  process.exitCode = main(process.argv);
}
