"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { GroupId, Team } from "@/types/tournament";
import { CONFEDERATION_COLORS, getTeam } from "@/data/teams";
import { GROUPS_BY_ID } from "@/data/groups";
import { cn } from "@/lib/cn";
import { TeamCard, type TeamCardStatus } from "./TeamCard";

export function GroupTable({
  groupId,
  first,
  second,
  third,
  onCycle,
  index = 0,
}: {
  groupId: GroupId;
  first: string;
  second: string;
  third: string;
  onCycle: (groupId: GroupId, teamId: string) => void;
  index?: number;
}) {
  const teamIds = GROUPS_BY_ID[groupId].teamIds;
  const teams = teamIds.map((id) => getTeam(id)!).filter(Boolean) as Team[];

  const remaining = teams
    .filter((t) => t.id !== first && t.id !== second && t.id !== third)
    .sort((a, b) => a.seeding - b.seeding);

  const complete = Boolean(first && second && third);
  const accent = CONFEDERATION_COLORS[teams[0]?.confederation] ?? "var(--border)";

  type Row = { team: Team; status: TeamCardStatus; rank: 1 | 2 | 3 | 4 | undefined };

  // Once complete, show the standing in rank order (1st, 2nd, 3rd, then 4th).
  // While incomplete, keep teams in seeded order, badging whatever is ranked.
  const rows: Row[] = complete
    ? [
        { team: getTeam(first)!, status: "first", rank: 1 },
        { team: getTeam(second)!, status: "second", rank: 2 },
        { team: getTeam(third)!, status: "third", rank: 3 },
        ...remaining.map((t): Row => ({ team: t, status: "fourth", rank: 4 })),
      ]
    : teams.map((t): Row => {
        if (t.id === first) return { team: t, status: "first", rank: 1 };
        if (t.id === second) return { team: t, status: "second", rank: 2 };
        if (t.id === third) return { team: t, status: "third", rank: 3 };
        return { team: t, status: "default", rank: undefined };
      });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl border border-border bg-surface/70 p-3"
      style={{ boxShadow: `inset 4px 0 0 0 ${accent}` }}
      aria-label={`Group ${groupId}`}
    >
      <div className="mb-2.5 flex items-center justify-between pl-1.5">
        <h3 className="font-display text-2xl font-black uppercase tracking-tight">
          Group {groupId}
        </h3>
        {complete ? (
          <span className="flex items-center gap-1 rounded-md bg-accent-green/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent-green">
            <Check className="h-3 w-3" strokeWidth={3} /> Set
          </span>
        ) : (
          <span className="rounded-md bg-elevated px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Pick 1 · 2 · 3
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <motion.div key={row.team.id} layout transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <TeamCard
              team={row.team}
              status={row.status}
              rank={row.rank}
              size="sm"
              onClick={() => onCycle(groupId, row.team.id)}
            />
          </motion.div>
        ))}
      </div>

      <p
        className={cn(
          "mt-2 pl-1.5 font-mono text-[10px] uppercase tracking-widest",
          complete ? "text-text-muted" : "text-text-secondary",
        )}
      >
        {complete
          ? "Tap a team to re-rank"
          : !first
            ? "Tap the winner, runner-up, then third"
            : !second
              ? "Now tap the runner-up"
              : "Now tap the third place"}
      </p>
    </motion.section>
  );
}
