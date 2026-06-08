import type { TournamentState } from "@/types/tournament";
import { EMPTY_STATE } from "./storage";

const PARAM = "p";

/** Compact payload — only the picks; stage/champion are derived on import. */
type SharePayload = {
  g: TournamentState["groupPicks"];
  t: TournamentState["thirdPlacePicks"];
  k: TournamentState["knockoutPicks"];
};

function toBase64Url(s: string): string {
  return btoa(s)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const padded = s.length % 4 === 0 ? s : s + "=".repeat(4 - (s.length % 4));
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

/** Encode a prediction into a URL-safe base64 string. */
export function encodeState(state: TournamentState): string {
  const payload: SharePayload = {
    g: state.groupPicks,
    t: state.thirdPlacePicks,
    k: state.knockoutPicks,
  };
  return toBase64Url(JSON.stringify(payload));
}

/** Decode a share param back into a (un-normalized) TournamentState. */
export function decodeState(param: string): TournamentState | null {
  try {
    const obj = JSON.parse(fromBase64Url(param)) as Partial<SharePayload>;
    const knockoutPicks = obj.k ?? {};
    return {
      ...EMPTY_STATE,
      groupPicks: obj.g ?? {},
      thirdPlacePicks: obj.t ?? [],
      knockoutPicks,
      currentStage: "complete",
      champion: knockoutPicks["M104"] ?? null,
    };
  } catch {
    return null;
  }
}

/** Full shareable URL pointing at the champion reveal. */
export function buildShareUrl(state: TournamentState): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/champion?${PARAM}=${encodeState(state)}`;
}

/** Read an incoming shared prediction from the current URL, if present. */
export function readSharedStateFromUrl(): TournamentState | null {
  if (typeof window === "undefined") return null;
  const param = new URLSearchParams(window.location.search).get(PARAM);
  return param ? decodeState(param) : null;
}

/** Strip the share param from the address bar without a reload. */
export function clearShareParam(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (url.searchParams.has(PARAM)) {
    url.searchParams.delete(PARAM);
    window.history.replaceState({}, "", url.toString());
  }
}
