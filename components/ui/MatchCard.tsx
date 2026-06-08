"use client";

import { motion } from "framer-motion";
import type { Team } from "@/types/tournament";
import { cn } from "@/lib/cn";
import { TeamCard } from "./TeamCard";

export function MatchCard({
  matchLabel,
  home,
  away,
  winnerId,
  onPick,
  className,
  compact,
}: {
  matchLabel?: string;
  home: Team | null | undefined;
  away: Team | null | undefined;
  winnerId: string | null;
  onPick: (teamId: string) => void;
  className?: string;
  compact?: boolean;
}) {
  const decided = Boolean(winnerId);

  const statusFor = (team: Team | null | undefined) => {
    if (!team) return "default" as const;
    if (!decided) return "default" as const;
    return winnerId === team.id ? ("winner" as const) : ("eliminated" as const);
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-surface/60 p-1.5",
        decided && "border-accent-green/30",
        className,
      )}
    >
      {matchLabel && (
        <span className="absolute -top-2 left-3 z-10 rounded bg-elevated px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-text-muted">
          {matchLabel}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <TeamCard
          team={home}
          status={statusFor(home)}
          size={compact ? "sm" : "md"}
          onClick={home ? () => onPick(home.id) : undefined}
          disabled={!home || !away}
        />
        <div className="flex items-center gap-2 px-2 py-0.5" aria-hidden>
          <span className="h-px flex-1 bg-border" />
          <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
            vs
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <TeamCard
          team={away}
          status={statusFor(away)}
          size={compact ? "sm" : "md"}
          onClick={away ? () => onPick(away.id) : undefined}
          disabled={!home || !away}
        />
      </div>
      {decided && (
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-full bg-accent-green/60"
        />
      )}
    </div>
  );
}
