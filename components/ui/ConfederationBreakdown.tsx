"use client";

import type { Confederation, TournamentState } from "@/types/tournament";
import { CONFEDERATION_COLORS, getTeam } from "@/data/teams";
import { teamsInRound } from "@/lib/bracketEngine";

const CONF_ORDER: Confederation[] = [
  "UEFA",
  "CONMEBOL",
  "CONCACAF",
  "CAF",
  "AFC",
  "OFC",
];

function countByConfederation(teamIds: string[]) {
  const counts = {} as Record<Confederation, number>;
  for (const id of teamIds) {
    const team = getTeam(id);
    if (team) counts[team.confederation] = (counts[team.confederation] ?? 0) + 1;
  }
  return counts;
}

function Row({
  label,
  teamIds,
  total,
}: {
  label: string;
  teamIds: string[];
  total: number;
}) {
  const counts = countByConfederation(teamIds);
  const present = CONF_ORDER.filter((c) => counts[c] > 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-widest text-text-secondary">
        {label}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
        {teamIds.length}/{total}
      </span>
      {present.length === 0 ? (
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          —
        </span>
      ) : (
        present.map((conf) => {
          const color = CONFEDERATION_COLORS[conf];
          return (
            <span
              key={conf}
              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide"
              style={{ borderColor: `${color}66`, color }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {conf}
              <span className="text-text-primary">{counts[conf]}</span>
            </span>
          );
        })
      )}
    </div>
  );
}

/** Live confederation tally of the quarter-finalists (8) and semi-finalists (4). */
export function ConfederationBreakdown({ state }: { state: TournamentState }) {
  const final8 = teamsInRound(state, "QF");
  const final4 = teamsInRound(state, "SF");

  if (final8.length === 0) return null;

  return (
    <section className="mb-6 rounded-2xl border border-border bg-surface/60 p-4">
      <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.3em] text-accent-gold">
        Confederation Breakdown
      </p>
      <div className="flex flex-col gap-2.5">
        <Row label="Final 8" teamIds={final8} total={8} />
        <Row label="Final 4" teamIds={final4} total={4} />
      </div>
    </section>
  );
}
