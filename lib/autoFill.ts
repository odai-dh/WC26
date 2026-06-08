import { BRACKET } from "@/data/bracket";
import { GROUP_IDS, GROUPS_BY_ID } from "@/data/groups";
import { TEAMS_BY_ID } from "@/data/teams";
import type {
  GroupId,
  GroupPick,
  KnockoutRound,
  TournamentState,
} from "@/types/tournament";
import {
  allThirdPlaceTeams,
  buildResolver,
  THIRD_PLACE_SLOTS,
} from "./bracketEngine";
import { EMPTY_STATE } from "./storage";

const ROUND_ORDER: KnockoutRound[] = ["R32", "R16", "QF", "SF", "FINAL"];

/**
 * Global strength proxy: pot/seeding first (lower = stronger), then draw order
 * by group. So all pot-1 teams outrank all pot-2 teams, and ties break by
 * group letter — deterministic "favourites advance".
 */
function strength(teamId: string): number {
  const t = TEAMS_BY_ID[teamId];
  if (!t) return Number.MAX_SAFE_INTEGER;
  return (t.seeding - 1) * GROUP_IDS.length + GROUP_IDS.indexOf(t.group);
}

function shuffle<T>(input: T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Resolve and decide every knockout match in round order. */
function fillKnockouts(
  groupPicks: Record<string, GroupPick>,
  thirdPlacePicks: string[],
  pickWinner: (homeId: string, awayId: string) => string,
): Record<string, string> {
  const knockoutPicks: Record<string, string> = {};
  for (const round of ROUND_ORDER) {
    for (const m of BRACKET.filter((x) => x.round === round)) {
      const { resolveMatch } = buildResolver({
        ...EMPTY_STATE,
        groupPicks,
        thirdPlacePicks,
        knockoutPicks,
      });
      const r = resolveMatch(m.id);
      if (r.homeTeamId && r.awayTeamId) {
        knockoutPicks[m.id] = pickWinner(r.homeTeamId, r.awayTeamId);
      }
    }
  }
  return knockoutPicks;
}

function assemble(
  groupPicks: Record<string, GroupPick>,
  thirdPlacePicks: string[],
  knockoutPicks: Record<string, string>,
): TournamentState {
  return {
    ...EMPTY_STATE,
    groupPicks,
    thirdPlacePicks,
    knockoutPicks,
    currentStage: "complete",
    champion: knockoutPicks["M104"] ?? null,
  };
}

/** Seeded auto-fill: pot order wins every group, favourites win every match. */
export function buildSeededState(): TournamentState {
  const groupPicks: Record<string, GroupPick> = {};
  for (const g of GROUP_IDS) {
    const ids = GROUPS_BY_ID[g].teamIds; // already in seeding order
    groupPicks[g] = { first: ids[0], second: ids[1], third: ids[2] };
  }

  const thirdPlacePicks = allThirdPlaceTeams({ ...EMPTY_STATE, groupPicks })
    .map((x) => x.teamId)
    .sort((a, b) => strength(a) - strength(b))
    .slice(0, THIRD_PLACE_SLOTS);

  const knockoutPicks = fillKnockouts(groupPicks, thirdPlacePicks, (a, b) =>
    strength(a) <= strength(b) ? a : b,
  );

  return assemble(groupPicks, thirdPlacePicks, knockoutPicks);
}

/** Chaos mode: a random but valid bracket, with a guaranteed champion. */
export function buildRandomState(): TournamentState {
  const coin = (a: string, b: string) => (Math.random() < 0.5 ? a : b);

  // Retry guard: a random set of 8 thirds always has a valid allocation, but
  // bail out cleanly if a slot ever fails to resolve rather than loop forever.
  for (let attempt = 0; attempt < 25; attempt++) {
    const groupPicks: Record<string, GroupPick> = {};
    for (const g of GROUP_IDS) {
      const ids = shuffle(GROUPS_BY_ID[g].teamIds);
      groupPicks[g] = { first: ids[0], second: ids[1], third: ids[2] };
    }

    const thirdPlacePicks = shuffle(
      allThirdPlaceTeams({ ...EMPTY_STATE, groupPicks }).map((x) => x.teamId),
    ).slice(0, THIRD_PLACE_SLOTS);

    const knockoutPicks = fillKnockouts(groupPicks, thirdPlacePicks, coin);
    if (knockoutPicks["M104"]) {
      return assemble(groupPicks, thirdPlacePicks, knockoutPicks);
    }
  }

  // Extremely unlikely fallback: seeded fill always resolves.
  return buildSeededState();
}
