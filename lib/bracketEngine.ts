import { BRACKET, BRACKET_BY_ID } from "@/data/bracket";
import { GROUPS_BY_ID } from "@/data/groups";
import type {
  BracketMatch,
  GroupId,
  KnockoutRound,
  SlotRef,
  TournamentState,
} from "@/types/tournament";

/** The third-placed team of a group is the one the user explicitly ranked 3rd. */
export function thirdPlaceTeam(
  groupId: GroupId,
  state: TournamentState,
): string | null {
  return state.groupPicks[groupId]?.third || null;
}

/**
 * The fourth-placed team is whichever team is left once 1st, 2nd and 3rd
 * are picked. Null until the group is fully ranked.
 */
export function fourthPlaceTeam(
  groupId: GroupId,
  state: TournamentState,
): string | null {
  const pick = state.groupPicks[groupId];
  if (!pick?.first || !pick?.second || !pick?.third) return null;
  const remaining = GROUPS_BY_ID[groupId].teamIds.filter(
    (id) => id !== pick.first && id !== pick.second && id !== pick.third,
  );
  return remaining[0] ?? null;
}

/** All 12 third-placed teams (groupId -> teamId), for the selection screen. */
export function allThirdPlaceTeams(
  state: TournamentState,
): { group: GroupId; teamId: string }[] {
  return (Object.keys(GROUPS_BY_ID) as GroupId[])
    .map((g) => ({ group: g, teamId: thirdPlaceTeam(g, state) }))
    .filter((x): x is { group: GroupId; teamId: string } => x.teamId != null);
}

/** The third-place R32 slots, in match order, with their allowed source groups. */
function thirdSlots(): { matchId: string; side: "home" | "away"; allowed: GroupId[] }[] {
  const slots: { matchId: string; side: "home" | "away"; allowed: GroupId[] }[] = [];
  for (const m of BRACKET) {
    if (m.home.kind === "third") slots.push({ matchId: m.id, side: "home", allowed: m.home.allowed });
    if (m.away.kind === "third") slots.push({ matchId: m.id, side: "away", allowed: m.away.allowed });
  }
  return slots;
}

/**
 * Assign the chosen third-place teams to the eight third-place bracket slots,
 * respecting each slot's allowed source groups (FIFA allocation constraints).
 * Returns a map of `${matchId}:${side}` -> teamId. Uses deterministic
 * backtracking so the same picks always yield the same bracket.
 */
export function assignThirds(
  state: TournamentState,
): Record<string, string> {
  const slots = thirdSlots();
  // group -> teamId for the chosen thirds only
  const chosen = new Map<GroupId, string>();
  for (const teamId of state.thirdPlacePicks) {
    const group = teamId ? findGroupOfTeam(teamId) : null;
    if (group) chosen.set(group, teamId);
  }
  const chosenGroups = [...chosen.keys()].sort();

  // Backtracking bipartite match: slot index -> group
  const assignment: Record<number, GroupId> = {};
  const usedGroups = new Set<GroupId>();

  const solve = (i: number): boolean => {
    if (i === slots.length) return true;
    const allowedHere = chosenGroups.filter(
      (g) => slots[i].allowed.includes(g) && !usedGroups.has(g),
    );
    for (const g of allowedHere) {
      assignment[i] = g;
      usedGroups.add(g);
      if (solve(i + 1)) return true;
      usedGroups.delete(g);
      delete assignment[i];
    }
    return false;
  };

  const result: Record<string, string> = {};
  if (chosenGroups.length === slots.length && solve(0)) {
    slots.forEach((slot, i) => {
      const g = assignment[i];
      const teamId = chosen.get(g);
      if (teamId) result[`${slot.matchId}:${slot.side}`] = teamId;
    });
  }
  return result;
}

function findGroupOfTeam(teamId: string): GroupId | null {
  for (const g of Object.keys(GROUPS_BY_ID) as GroupId[]) {
    if (GROUPS_BY_ID[g].teamIds.includes(teamId)) return g;
  }
  return null;
}

/** Resolved teams for a knockout match (either may be null if upstream undecided). */
export type ResolvedMatch = {
  match: BracketMatch;
  homeTeamId: string | null;
  awayTeamId: string | null;
  winnerId: string | null;
};

export function buildResolver(state: TournamentState) {
  const thirdAssignment = assignThirds(state);

  const resolveSlot = (
    ref: SlotRef,
    matchId: string,
    side: "home" | "away",
  ): string | null => {
    switch (ref.kind) {
      case "winner":
        return state.groupPicks[ref.group]?.first ?? null;
      case "runnerUp":
        return state.groupPicks[ref.group]?.second ?? null;
      case "third":
        return thirdAssignment[`${matchId}:${side}`] ?? null;
      case "matchWinner":
        return state.knockoutPicks[ref.matchId] ?? null;
    }
  };

  const resolveMatch = (matchId: string): ResolvedMatch => {
    const match = BRACKET_BY_ID[matchId];
    const homeTeamId = resolveSlot(match.home, matchId, "home");
    const awayTeamId = resolveSlot(match.away, matchId, "away");
    const winnerId = state.knockoutPicks[matchId] ?? null;
    return { match, homeTeamId, awayTeamId, winnerId };
  };

  return { resolveMatch, resolveSlot, thirdAssignment };
}

/** Set of all team ids that have been eliminated in the knockout stage. */
export function eliminatedTeams(state: TournamentState): Set<string> {
  const { resolveMatch } = buildResolver(state);
  const out = new Set<string>();
  for (const m of BRACKET) {
    const r = resolveMatch(m.id);
    if (r.winnerId && r.homeTeamId && r.awayTeamId) {
      const loser = r.winnerId === r.homeTeamId ? r.awayTeamId : r.homeTeamId;
      if (loser) out.add(loser);
    }
  }
  return out;
}

export function isGroupComplete(groupId: GroupId, state: TournamentState): boolean {
  const p = state.groupPicks[groupId];
  if (!p?.first || !p?.second || !p?.third) return false;
  return new Set([p.first, p.second, p.third]).size === 3;
}

export function allGroupsComplete(state: TournamentState): boolean {
  return (Object.keys(GROUPS_BY_ID) as GroupId[]).every((g) =>
    isGroupComplete(g, state),
  );
}

export const THIRD_PLACE_SLOTS = 8;

/** Distinct teams currently appearing in a given knockout round's matches. */
export function teamsInRound(
  state: TournamentState,
  round: KnockoutRound,
): string[] {
  const { resolveMatch } = buildResolver(state);
  const ids = new Set<string>();
  for (const m of BRACKET) {
    if (m.round !== round) continue;
    const r = resolveMatch(m.id);
    if (r.homeTeamId) ids.add(r.homeTeamId);
    if (r.awayTeamId) ids.add(r.awayTeamId);
  }
  return [...ids];
}

/** Match ids a team currently appears in — their live route through the bracket. */
export function teamPathMatchIds(
  state: TournamentState,
  teamId: string,
): Set<string> {
  const { resolveMatch } = buildResolver(state);
  const out = new Set<string>();
  for (const m of BRACKET) {
    const r = resolveMatch(m.id);
    if (r.homeTeamId === teamId || r.awayTeamId === teamId) out.add(m.id);
  }
  return out;
}
