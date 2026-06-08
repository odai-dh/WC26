"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StageHeader } from "@/components/layout/StageHeader";
import { GroupTable } from "@/components/ui/GroupTable";
import { TeamCard } from "@/components/ui/TeamCard";
import { GROUP_IDS } from "@/data/groups";
import { getTeam } from "@/data/teams";
import { allThirdPlaceTeams, THIRD_PLACE_SLOTS } from "@/lib/bracketEngine";
import { staggerContainer } from "@/lib/motion";
import { useTournament } from "@/lib/useTournament";

export default function GroupsPage() {
  const t = useTournament();
  const { state } = t;

  if (!t.hydrated) {
    return (
      <AppShell activeStage="GROUPS">
        <SkeletonGroups />
      </AppShell>
    );
  }

  const thirds = allThirdPlaceTeams(state);
  const selectedCount = state.thirdPlacePicks.length;

  return (
    <AppShell activeStage="GROUPS">
      <StageHeader
        eyebrow="Stage 1 of 6"
        title="Group Stage"
        subtitle="Tap to crown a winner, runner-up, and third place in all 12 groups. Then pick the eight best third-placed teams to advance to the Round of 32."
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
          <motion.div
            className="h-full rounded-full bg-gradient-hero"
            initial={false}
            animate={{ width: `${(t.completedGroups / 12) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-text-secondary">
          {t.completedGroups}/12 groups
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GROUP_IDS.map((g, i) => (
          <GroupTable
            key={g}
            groupId={g}
            first={state.groupPicks[g]?.first ?? ""}
            second={state.groupPicks[g]?.second ?? ""}
            third={state.groupPicks[g]?.third ?? ""}
            onCycle={t.cycleTeamRank}
            index={i}
          />
        ))}
      </div>

      <AnimatePresence>
        {t.groupsDone && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-10 rounded-2xl border border-border bg-surface/70 p-5 md:p-7"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 font-mono text-xs font-medium uppercase tracking-[0.3em] text-accent-gold">
                  Best Third-Placed Teams
                </p>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
                  Pick the 8 that advance
                </h2>
              </div>
              <span className="rounded-md bg-elevated px-3 py-1 font-mono text-sm uppercase tracking-widest text-text-secondary">
                {selectedCount}/{THIRD_PLACE_SLOTS} selected
              </span>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {thirds.map(({ group, teamId }) => {
                const team = getTeam(teamId);
                const selected = state.thirdPlacePicks.includes(teamId);
                const atCap = selectedCount >= THIRD_PLACE_SLOTS;
                return (
                  <div key={teamId} className="relative">
                    <span className="absolute -top-1.5 left-2 z-10 rounded bg-elevated px-1.5 font-mono text-[9px] uppercase tracking-widest text-text-muted">
                      Grp {group}
                    </span>
                    <TeamCard
                      team={team}
                      status={selected ? "winner" : "default"}
                      onClick={() => t.toggleThirdPlace(teamId)}
                      disabled={!selected && atCap}
                      className={!selected && atCap ? "opacity-40" : undefined}
                    />
                  </div>
                );
              })}
            </motion.div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                {t.thirdsDone
                  ? "32 teams locked in for the Round of 32."
                  : `Select ${THIRD_PLACE_SLOTS - selectedCount} more to fill the bracket.`}
              </p>
              <Link
                href="/bracket"
                aria-disabled={!t.thirdsDone}
                tabIndex={t.thirdsDone ? 0 : -1}
                className={
                  "inline-flex items-center gap-2 rounded-lg px-5 py-3 font-display text-lg font-bold uppercase tracking-wide transition " +
                  (t.thirdsDone
                    ? "bg-accent-gold text-base hover:brightness-110"
                    : "pointer-events-none bg-elevated text-text-muted")
                }
                onClick={() => t.setStage("bracket")}
              >
                <Trophy className="h-5 w-5" />
                Enter the Bracket
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function SkeletonGroups() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-xl border border-border bg-surface/50"
        />
      ))}
    </div>
  );
}
