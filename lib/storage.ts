import type { TournamentState } from "@/types/tournament";

const STORAGE_KEY = "wc26-final-call:v1";

export const EMPTY_STATE: TournamentState = {
  groupPicks: {},
  thirdPlacePicks: [],
  knockoutPicks: {},
  currentStage: "groups",
  champion: null,
};

export function loadState(): TournamentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TournamentState>;
    return {
      ...EMPTY_STATE,
      ...parsed,
      groupPicks: parsed.groupPicks ?? {},
      thirdPlacePicks: parsed.thirdPlacePicks ?? [],
      knockoutPicks: parsed.knockoutPicks ?? {},
    };
  } catch {
    return null;
  }
}

export function saveState(state: TournamentState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — fail silently */
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasSavedState(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) != null;
}
