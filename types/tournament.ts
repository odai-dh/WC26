export type Confederation =
  | "UEFA"
  | "CONMEBOL"
  | "CONCACAF"
  | "CAF"
  | "AFC"
  | "OFC";

export type GroupId =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export type Team = {
  id: string;
  name: string;
  shortName: string; // 3-letter code e.g. "ARG"
  flag: string; // emoji flag e.g. "🇦🇷"
  group: GroupId;
  confederation: Confederation;
  seeding: number; // 1-4 within group (pot order)
};

export type Group = {
  id: GroupId;
  teamIds: string[]; // four team ids, in seeded order
};

/** A reference to a slot whose occupant is resolved at runtime. */
export type SlotRef =
  | { kind: "winner"; group: GroupId } // group winner
  | { kind: "runnerUp"; group: GroupId } // group runner-up
  | { kind: "third"; allowed: GroupId[] } // best third from one of these groups
  | { kind: "matchWinner"; matchId: string }; // winner of a prior knockout match

export type KnockoutRound = "R32" | "R16" | "QF" | "SF" | "FINAL";

export type BracketMatch = {
  id: string; // e.g. "M73"
  round: KnockoutRound;
  /** display order within the round, top-to-bottom */
  order: number;
  home: SlotRef;
  away: SlotRef;
};

export type Stage = "groups" | "third-place" | "bracket" | "complete";

export type GroupPick = { first: string; second: string; third: string };

export type TournamentState = {
  groupPicks: Record<string, GroupPick>; // groupId -> team ids
  thirdPlacePicks: string[]; // exactly 8 team ids
  knockoutPicks: Record<string, string>; // matchId -> winning team id
  currentStage: Stage;
  champion: string | null;
};
