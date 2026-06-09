"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Crown,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StageHeader } from "@/components/layout/StageHeader";
import { MatchCard } from "@/components/ui/MatchCard";
import { BracketLine, type Connector } from "@/components/ui/BracketLine";
import { ConfederationBreakdown } from "@/components/ui/ConfederationBreakdown";
import { useDialog } from "@/components/ui/Dialog";
import { matchesForRound, ROUNDS } from "@/data/bracket";
import { CONFEDERATION_COLORS, getTeam } from "@/data/teams";
import type { KnockoutRound } from "@/types/tournament";
import { teamPathMatchIds } from "@/lib/bracketEngine";
import { useTournament } from "@/lib/useTournament";

// ---- desktop canvas geometry ----
const CARD_H = 132;
const SLOT_H = 152;
const COL_W = 248;
const COL_GAP = 76;
const TOTAL_H = 16 * SLOT_H;
const ROUND_KEYS: KnockoutRound[] = ["R32", "R16", "QF", "SF", "FINAL"];
const colX = (r: number) => r * (COL_W + COL_GAP);
const centerY = (n: number, idx: number) => ((idx + 0.5) * TOTAL_H) / n;
const CANVAS_W = colX(ROUND_KEYS.length - 1) + COL_W;

export default function BracketPage() {
  const t = useTournament();
  const { confirm } = useDialog();
  const [stepRound, setStepRound] = useState(0);

  if (!t.hydrated) {
    return (
      <AppShell activeStage="R32">
        <div className="h-[60vh] animate-pulse rounded-xl border border-border bg-surface/50" />
      </AppShell>
    );
  }

  const champion = t.state.champion ? getTeam(t.state.champion) : null;

  return (
    <AppShell activeStage={ROUND_KEYS[stepRound]}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <StageHeader
          eyebrow="Stage 2 — Knockouts"
          title="The Bracket"
          subtitle="Click a team to send them through. The loser is eliminated everywhere, instantly. Win six rounds to crown a champion."
        />
        <AnimatePresence>
          {champion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Link
                href="/champion"
                onClick={() => t.setStage("complete")}
                className="mb-2 inline-flex items-center gap-2 rounded-lg bg-accent-gold px-5 py-3 font-display text-lg font-bold uppercase tracking-wide text-base transition hover:brightness-110"
              >
                <Crown className="h-5 w-5" />
                {champion.flag} {champion.name} — See the reveal
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {Object.keys(t.state.knockoutPicks).length > 0 && (
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: "Reset knockouts?",
                message: "Your group-stage standings are kept.",
                confirmLabel: "Reset",
                tone: "danger",
              });
              if (ok) t.resetKnockouts();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 font-display text-sm font-bold uppercase tracking-wide text-text-secondary transition hover:border-accent-red/60 hover:text-text-primary"
          >
            <RotateCcw className="h-4 w-4" />
            Reset knockouts
          </button>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-text-muted sm:inline">
            Group picks stay intact
          </span>
        </div>
      )}

      <ConfederationBreakdown state={t.state} />

      {/* Desktop / tablet full bracket */}
      <div className="hidden overflow-x-auto pb-6 lg:block">
        <DesktopBracket t={t} />
      </div>

      {/* Mobile round stepper */}
      <div className="lg:hidden">
        <MobileBracket
          t={t}
          stepRound={stepRound}
          setStepRound={setStepRound}
        />
      </div>
    </AppShell>
  );
}

function DesktopBracket({ t }: { t: ReturnType<typeof useTournament> }) {
  const [pathTeam, setPathTeam] = useState<string | null>(null);

  const decided = (matchId: string) =>
    Boolean(t.state.knockoutPicks[matchId]);

  const pathSet = useMemo(
    () =>
      pathTeam ? teamPathMatchIds(t.state, pathTeam) : new Set<string>(),
    [pathTeam, t.state],
  );
  const pathColor = pathTeam
    ? CONFEDERATION_COLORS[getTeam(pathTeam)?.confederation ?? "UEFA"]
    : undefined;

  const connectors = useMemo<Connector[]>(() => {
    const out: Connector[] = [];
    for (let r = 0; r < ROUND_KEYS.length - 1; r++) {
      const childMatches = matchesForRound(ROUND_KEYS[r]);
      const parentMatches = matchesForRound(ROUND_KEYS[r + 1]);
      const nChild = childMatches.length;
      const nParent = parentMatches.length;
      const cRight = colX(r) + COL_W;
      const pLeft = colX(r + 1);
      const midX = (cRight + pLeft) / 2;
      for (let j = 0; j < nParent; j++) {
        const cy0 = centerY(nChild, 2 * j);
        const cy1 = centerY(nChild, 2 * j + 1);
        const pCY = centerY(nParent, j);
        const d = `M ${cRight} ${cy0} H ${midX} M ${cRight} ${cy1} H ${midX} M ${midX} ${cy0} V ${cy1} M ${midX} ${pCY} H ${pLeft}`;
        const child0 = childMatches[2 * j].id;
        const child1 = childMatches[2 * j + 1].id;
        const parentId = parentMatches[j].id;
        const active = decided(child0) && decided(child1);
        const onPath =
          pathColor &&
          pathSet.has(parentId) &&
          (pathSet.has(child0) || pathSet.has(child1));
        out.push({
          id: `${ROUND_KEYS[r]}-${j}`,
          d,
          active,
          highlightColor: onPath ? pathColor : undefined,
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.state.knockoutPicks, pathSet, pathColor]);

  return (
    <div
      className="relative mx-auto"
      style={{ width: CANVAS_W, height: TOTAL_H }}
    >
      <BracketLine width={CANVAS_W} height={TOTAL_H} connectors={connectors} />

      {/* round labels */}
      {ROUND_KEYS.map((rk, r) => {
        const meta = ROUNDS.find((x) => x.round === rk)!;
        return (
          <div
            key={rk}
            className="absolute -top-1 flex justify-center"
            style={{ left: colX(r), width: COL_W }}
          >
            <span className="rounded-md bg-elevated px-3 py-1 font-display text-sm font-bold uppercase tracking-[0.18em] text-text-secondary">
              {meta.short}
            </span>
          </div>
        );
      })}

      {ROUND_KEYS.map((rk, r) => {
        const matches = matchesForRound(rk);
        const n = matches.length;
        return matches.map((m, idx) => {
          const resolved = t.resolver.resolveMatch(m.id);
          return (
            <div
              key={m.id}
              className="absolute"
              style={{
                left: colX(r),
                top: centerY(n, idx) - CARD_H / 2 + 34,
                width: COL_W,
                height: CARD_H,
              }}
            >
              <MatchCard
                matchLabel={m.id.replace("M", "Match ")}
                home={getTeam(resolved.homeTeamId)}
                away={getTeam(resolved.awayTeamId)}
                winnerId={resolved.winnerId}
                onPick={(teamId) => t.advanceTeam(m.id, teamId)}
                highlightTeamId={pathTeam}
                highlightColor={pathColor}
                onHoverTeam={setPathTeam}
                compact
              />
            </div>
          );
        });
      })}
    </div>
  );
}

function MobileBracket({
  t,
  stepRound,
  setStepRound,
}: {
  t: ReturnType<typeof useTournament>;
  stepRound: number;
  setStepRound: (n: number) => void;
}) {
  const rk = ROUND_KEYS[stepRound];
  const meta = ROUNDS.find((x) => x.round === rk)!;
  const matches = matchesForRound(rk);

  return (
    <div>
      <div
        className="sticky z-20 mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-base/90 p-2 backdrop-blur"
        style={{ top: "calc(var(--app-header-h, 104px) + 8px)" }}
      >
        <button
          type="button"
          onClick={() => setStepRound(Math.max(0, stepRound - 1))}
          disabled={stepRound === 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary disabled:opacity-30"
          aria-label="Previous round"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-display text-xl font-black uppercase tracking-tight">
            {meta.label}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Round {stepRound + 1} of {ROUND_KEYS.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setStepRound(Math.min(ROUND_KEYS.length - 1, stepRound + 1))
          }
          disabled={stepRound === ROUND_KEYS.length - 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary disabled:opacity-30"
          aria-label="Next round"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={rk}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {matches.map((m) => {
            const resolved = t.resolver.resolveMatch(m.id);
            return (
              <MatchCard
                key={m.id}
                matchLabel={m.id.replace("M", "Match ")}
                home={getTeam(resolved.homeTeamId)}
                away={getTeam(resolved.awayTeamId)}
                winnerId={resolved.winnerId}
                onPick={(teamId) => t.advanceTeam(m.id, teamId)}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
