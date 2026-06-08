import type { BracketMatch, GroupId, KnockoutRound } from "@/types/tournament";

const W = (group: GroupId) => ({ kind: "winner", group } as const);
const R = (group: GroupId) => ({ kind: "runnerUp", group } as const);
const T = (...allowed: GroupId[]) => ({ kind: "third", allowed } as const);
const MW = (matchId: string) => ({ kind: "matchWinner", matchId } as const);

/**
 * Official FIFA World Cup 2026 knockout bracket.
 * Round of 32 = matches 73-88, Round of 16 = 89-96, QF = 97-100,
 * SF = 101-102, Final = 104. `order` is the top-to-bottom display
 * position within each round so the columns line up as a bracket tree.
 */
export const BRACKET: BracketMatch[] = [
  // ---- Round of 32 (matches 73-88) ----
  { id: "M74", round: "R32", order: 0, home: W("E"), away: T("A", "B", "C", "D", "F") },
  { id: "M77", round: "R32", order: 1, home: W("I"), away: T("C", "D", "F", "G", "H") },
  { id: "M73", round: "R32", order: 2, home: R("A"), away: R("B") },
  { id: "M75", round: "R32", order: 3, home: W("F"), away: R("C") },
  { id: "M83", round: "R32", order: 4, home: R("K"), away: R("L") },
  { id: "M84", round: "R32", order: 5, home: W("H"), away: R("J") },
  { id: "M81", round: "R32", order: 6, home: W("D"), away: T("B", "E", "F", "I", "J") },
  { id: "M82", round: "R32", order: 7, home: W("G"), away: T("A", "E", "H", "I", "J") },
  { id: "M76", round: "R32", order: 8, home: W("C"), away: R("F") },
  { id: "M78", round: "R32", order: 9, home: R("E"), away: R("I") },
  { id: "M79", round: "R32", order: 10, home: W("A"), away: T("C", "E", "F", "H", "I") },
  { id: "M80", round: "R32", order: 11, home: W("L"), away: T("E", "H", "I", "J", "K") },
  { id: "M86", round: "R32", order: 12, home: W("J"), away: R("H") },
  { id: "M88", round: "R32", order: 13, home: R("D"), away: R("G") },
  { id: "M85", round: "R32", order: 14, home: W("B"), away: T("E", "F", "G", "I", "J") },
  { id: "M87", round: "R32", order: 15, home: W("K"), away: T("D", "E", "I", "J", "L") },

  // ---- Round of 16 (matches 89-96) ----
  { id: "M89", round: "R16", order: 0, home: MW("M74"), away: MW("M77") },
  { id: "M90", round: "R16", order: 1, home: MW("M73"), away: MW("M75") },
  { id: "M93", round: "R16", order: 2, home: MW("M83"), away: MW("M84") },
  { id: "M94", round: "R16", order: 3, home: MW("M81"), away: MW("M82") },
  { id: "M91", round: "R16", order: 4, home: MW("M76"), away: MW("M78") },
  { id: "M92", round: "R16", order: 5, home: MW("M79"), away: MW("M80") },
  { id: "M95", round: "R16", order: 6, home: MW("M86"), away: MW("M88") },
  { id: "M96", round: "R16", order: 7, home: MW("M85"), away: MW("M87") },

  // ---- Quarter-finals (matches 97-100) ----
  { id: "M97", round: "QF", order: 0, home: MW("M89"), away: MW("M90") },
  { id: "M98", round: "QF", order: 1, home: MW("M93"), away: MW("M94") },
  { id: "M99", round: "QF", order: 2, home: MW("M91"), away: MW("M92") },
  { id: "M100", round: "QF", order: 3, home: MW("M95"), away: MW("M96") },

  // ---- Semi-finals (matches 101-102) ----
  { id: "M101", round: "SF", order: 0, home: MW("M97"), away: MW("M98") },
  { id: "M102", round: "SF", order: 1, home: MW("M99"), away: MW("M100") },

  // ---- Final (match 104) ----
  { id: "M104", round: "FINAL", order: 0, home: MW("M101"), away: MW("M102") },
];

export const BRACKET_BY_ID: Record<string, BracketMatch> = Object.fromEntries(
  BRACKET.map((m) => [m.id, m]),
);

export const ROUNDS: { round: KnockoutRound; label: string; short: string }[] = [
  { round: "R32", label: "Round of 32", short: "R32" },
  { round: "R16", label: "Round of 16", short: "R16" },
  { round: "QF", label: "Quarter-Finals", short: "QF" },
  { round: "SF", label: "Semi-Finals", short: "SF" },
  { round: "FINAL", label: "Final", short: "FINAL" },
];

export function matchesForRound(round: KnockoutRound): BracketMatch[] {
  return BRACKET.filter((m) => m.round === round).sort(
    (a, b) => a.order - b.order,
  );
}

export const FINAL_MATCH_ID = "M104";
