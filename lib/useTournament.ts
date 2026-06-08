"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BRACKET } from "@/data/bracket";
import { GROUP_IDS } from "@/data/groups";
import type { GroupId, Stage, TournamentState } from "@/types/tournament";
import {
  allGroupsComplete,
  allThirdPlaceTeams,
  buildResolver,
  isGroupComplete,
  THIRD_PLACE_SLOTS,
} from "./bracketEngine";
import { clearState, EMPTY_STATE, loadState, saveState } from "./storage";
import { clearShareParam, readSharedStateFromUrl } from "./share";
import { buildRandomState, buildSeededState } from "./autoFill";

const ROUND_ORDER = ["R32", "R16", "QF", "SF", "FINAL"] as const;

/** Remove now-invalid third-place + knockout picks after any upstream change. */
function normalize(input: TournamentState): TournamentState {
  // 1. Keep only third-place picks that are still genuine third-placed teams.
  const validThirds = new Set(allThirdPlaceTeams(input).map((t) => t.teamId));
  const thirdPlacePicks = input.thirdPlacePicks
    .filter((id) => validThirds.has(id))
    .slice(0, THIRD_PLACE_SLOTS);

  const knockoutPicks: Record<string, string> = { ...input.knockoutPicks };
  const working: TournamentState = { ...input, thirdPlacePicks, knockoutPicks };
  const { resolveMatch } = buildResolver(working);

  // 2. Drop knockout winners that no longer appear in their match (round order matters).
  for (const round of ROUND_ORDER) {
    for (const m of BRACKET.filter((x) => x.round === round)) {
      const r = resolveMatch(m.id);
      const w = knockoutPicks[m.id];
      if (w && w !== r.homeTeamId && w !== r.awayTeamId) {
        delete knockoutPicks[m.id];
      }
    }
  }

  const champion = knockoutPicks["M104"] ?? null;
  return { ...working, knockoutPicks, champion };
}

export function useTournament() {
  const [state, setState] = useState<TournamentState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount. A shared prediction in the URL (?p=...) wins over
  // any locally-saved bracket, then the param is stripped from the address bar.
  useEffect(() => {
    const shared = readSharedStateFromUrl();
    if (shared) {
      setState(normalize(shared));
      clearShareParam();
    } else {
      const loaded = loadState();
      if (loaded) setState(normalize(loaded));
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const update = useCallback(
    (mutator: (prev: TournamentState) => TournamentState) => {
      setState((prev) => normalize(mutator(prev)));
    },
    [],
  );

  /** Cycle a team's rank inside a group: unranked -> 1st -> 2nd -> 3rd -> unranked. */
  const cycleTeamRank = useCallback(
    (groupId: GroupId, teamId: string) => {
      update((prev) => {
        const slots = ["first", "second", "third"] as const;
        const pick = prev.groupPicks[groupId] ?? {
          first: "",
          second: "",
          third: "",
        };
        const next = { ...pick };
        const current = slots.find((s) => pick[s] === teamId);

        if (current === undefined) {
          // Unranked: fill the first empty slot (1st -> 2nd -> 3rd).
          const empty = slots.find((s) => !pick[s]);
          // No empty slot means this is the lone 4th team: promote it into
          // 3rd and bump the old 3rd back down to unranked.
          next[empty ?? "third"] = teamId;
        } else {
          // Ranked: step down one rank, swapping with whoever holds it.
          const target = slots[slots.indexOf(current) + 1];
          next[current] = "";
          if (target) {
            const displaced = pick[target];
            next[target] = teamId;
            if (displaced) next[current] = displaced;
          }
          // Stepping down past 3rd just leaves the team unranked.
        }

        return {
          ...prev,
          groupPicks: { ...prev.groupPicks, [groupId]: next },
        };
      });
    },
    [update],
  );

  const toggleThirdPlace = useCallback(
    (teamId: string) => {
      update((prev) => {
        const selected = prev.thirdPlacePicks.includes(teamId);
        if (selected) {
          return {
            ...prev,
            thirdPlacePicks: prev.thirdPlacePicks.filter((id) => id !== teamId),
          };
        }
        if (prev.thirdPlacePicks.length >= THIRD_PLACE_SLOTS) return prev;
        return { ...prev, thirdPlacePicks: [...prev.thirdPlacePicks, teamId] };
      });
    },
    [update],
  );

  const advanceTeam = useCallback(
    (matchId: string, teamId: string) => {
      update((prev) => ({
        ...prev,
        knockoutPicks: { ...prev.knockoutPicks, [matchId]: teamId },
      }));
    },
    [update],
  );

  const setStage = useCallback(
    (stage: Stage) => {
      update((prev) => ({ ...prev, currentStage: stage }));
    },
    [update],
  );

  const resetTournament = useCallback(() => {
    clearState();
    setState(EMPTY_STATE);
  }, []);

  /** Pre-fill the whole bracket so the pot favourites advance. */
  const autoFillSeeded = useCallback(() => {
    update(() => buildSeededState());
  }, [update]);

  /** Fill a random but valid bracket. */
  const randomize = useCallback(() => {
    update(() => buildRandomState());
  }, [update]);

  const resolver = useMemo(() => buildResolver(state), [state]);

  const groupsDone = useMemo(() => allGroupsComplete(state), [state]);
  const thirdsDone = state.thirdPlacePicks.length === THIRD_PLACE_SLOTS;
  const completedGroups = useMemo(
    () => GROUP_IDS.filter((g) => isGroupComplete(g, state)).length,
    // isGroupComplete only reads groupPicks, so that's the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.groupPicks],
  );

  return {
    state,
    hydrated,
    resolver,
    groupsDone,
    thirdsDone,
    completedGroups,
    cycleTeamRank,
    toggleThirdPlace,
    advanceTeam,
    setStage,
    resetTournament,
    autoFillSeeded,
    randomize,
  };
}

export type UseTournament = ReturnType<typeof useTournament>;
