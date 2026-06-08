import type { TournamentState } from "@/types/tournament";

const LEGACY_KEY = "wc26-final-call:v1";
const SLOTS_KEY = "wc26-final-call:slots:v1";
const ACTIVE_KEY = "wc26-final-call:active:v1";
const slotDataKey = (id: string) => `wc26-final-call:slot:${id}:v1`;

export type BracketSlot = { id: string; name: string; updatedAt: number };

export const EMPTY_STATE: TournamentState = {
  groupPicks: {},
  thirdPlacePicks: [],
  knockoutPicks: {},
  currentStage: "groups",
  champion: null,
};

const hasWindow = () => typeof window !== "undefined";

function readJSON<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — fail silently */
  }
}

function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  );
}

/**
 * Ensure at least one bracket slot exists. Migrates any single-bracket save
 * from the legacy key into the first slot, then removes the legacy key.
 */
function ensureInit(): void {
  if (!hasWindow()) return;
  const slots = readJSON<BracketSlot[]>(SLOTS_KEY, []);
  if (slots.length > 0) return;

  const id = newId();
  writeJSON(SLOTS_KEY, [{ id, name: "My Bracket", updatedAt: Date.now() }]);
  window.localStorage.setItem(ACTIVE_KEY, id);

  try {
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      window.localStorage.setItem(slotDataKey(id), legacy);
      window.localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function listSlots(): BracketSlot[] {
  ensureInit();
  return readJSON<BracketSlot[]>(SLOTS_KEY, []).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}

export function getActiveSlotId(): string {
  ensureInit();
  const slots = readJSON<BracketSlot[]>(SLOTS_KEY, []);
  const active = hasWindow() ? window.localStorage.getItem(ACTIVE_KEY) : null;
  if (active && slots.some((s) => s.id === active)) return active;
  const fallback = slots[0]?.id ?? "";
  if (fallback && hasWindow()) window.localStorage.setItem(ACTIVE_KEY, fallback);
  return fallback;
}

export function setActiveSlot(id: string): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(ACTIVE_KEY, id);
}

function touchSlot(id: string): void {
  const slots = readJSON<BracketSlot[]>(SLOTS_KEY, []);
  writeJSON(
    SLOTS_KEY,
    slots.map((s) => (s.id === id ? { ...s, updatedAt: Date.now() } : s)),
  );
}

function mergeState(parsed: Partial<TournamentState>): TournamentState {
  return {
    ...EMPTY_STATE,
    ...parsed,
    groupPicks: parsed.groupPicks ?? {},
    thirdPlacePicks: parsed.thirdPlacePicks ?? [],
    knockoutPicks: parsed.knockoutPicks ?? {},
  };
}

export function loadSlot(id: string): TournamentState | null {
  if (!hasWindow() || !id) return null;
  const raw = window.localStorage.getItem(slotDataKey(id));
  if (!raw) return null;
  try {
    return mergeState(JSON.parse(raw) as Partial<TournamentState>);
  } catch {
    return null;
  }
}

/** Load the active bracket. */
export function loadState(): TournamentState | null {
  return loadSlot(getActiveSlotId());
}

/** Persist the active bracket. */
export function saveState(state: TournamentState): void {
  if (!hasWindow()) return;
  const id = getActiveSlotId();
  if (!id) return;
  try {
    window.localStorage.setItem(slotDataKey(id), JSON.stringify(state));
    touchSlot(id);
  } catch {
    /* quota / private mode — fail silently */
  }
}

/** Reset the active bracket (keeps the slot, clears its picks). */
export function clearState(): void {
  if (!hasWindow()) return;
  const id = getActiveSlotId();
  if (id) window.localStorage.removeItem(slotDataKey(id));
  touchSlot(id);
}

export function hasSavedState(): boolean {
  if (!hasWindow()) return false;
  const id = getActiveSlotId();
  return Boolean(id && window.localStorage.getItem(slotDataKey(id)));
}

// ---- Slot management ----

export function createBracket(name?: string): string {
  ensureInit();
  const slots = readJSON<BracketSlot[]>(SLOTS_KEY, []);
  const id = newId();
  const slot: BracketSlot = {
    id,
    name: (name ?? `Bracket ${slots.length + 1}`).trim() || `Bracket ${slots.length + 1}`,
    updatedAt: Date.now(),
  };
  writeJSON(SLOTS_KEY, [...slots, slot]);
  return id;
}

export function renameBracket(id: string, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const slots = readJSON<BracketSlot[]>(SLOTS_KEY, []);
  writeJSON(
    SLOTS_KEY,
    slots.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
  );
}

export function duplicateBracket(id: string, name?: string): string {
  ensureInit();
  const slots = readJSON<BracketSlot[]>(SLOTS_KEY, []);
  const source = slots.find((s) => s.id === id);
  const newSlotId = createBracket(name ?? `${source?.name ?? "Bracket"} copy`);
  if (hasWindow()) {
    const data = window.localStorage.getItem(slotDataKey(id));
    if (data) window.localStorage.setItem(slotDataKey(newSlotId), data);
  }
  return newSlotId;
}

/** Delete a slot. Returns the id that should become active afterwards. */
export function deleteBracket(id: string): string {
  if (hasWindow()) window.localStorage.removeItem(slotDataKey(id));
  const remaining = readJSON<BracketSlot[]>(SLOTS_KEY, []).filter(
    (s) => s.id !== id,
  );
  writeJSON(SLOTS_KEY, remaining);

  const wasActive = getActiveSlotIdRaw() === id;
  if (remaining.length === 0) {
    // Always keep at least one bracket.
    const fresh = createBracket("My Bracket");
    setActiveSlot(fresh);
    return fresh;
  }
  if (wasActive) {
    setActiveSlot(remaining[0].id);
    return remaining[0].id;
  }
  return getActiveSlotId();
}

function getActiveSlotIdRaw(): string | null {
  return hasWindow() ? window.localStorage.getItem(ACTIVE_KEY) : null;
}
