"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { Team } from "@/types/tournament";
import { cn } from "@/lib/cn";

export type TeamCardStatus =
  | "default"
  | "first"
  | "second"
  | "third"
  | "fourth"
  | "eliminated"
  | "winner"
  | "champion";

const RANK_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: "1", cls: "bg-accent-gold text-base" },
  2: { label: "2", cls: "bg-text-secondary text-base" },
  3: { label: "3", cls: "bg-elevated text-text-secondary border border-border" },
  4: { label: "4", cls: "bg-elevated text-text-muted border border-border" },
};

export function TeamCard({
  team,
  status = "default",
  rank,
  onClick,
  disabled,
  layoutId,
  size = "md",
  className,
  accentColor,
  highlight,
  highlightColor,
  onHoverStart,
  onHoverEnd,
}: {
  team?: Team | null;
  status?: TeamCardStatus;
  rank?: 1 | 2 | 3 | 4;
  onClick?: () => void;
  disabled?: boolean;
  layoutId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  accentColor?: string;
  highlight?: boolean;
  highlightColor?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) {
  const interactive = Boolean(onClick) && !disabled;
  const eliminated = status === "eliminated";
  const glowColor = highlightColor ?? "var(--accent-gold)";
  const boxShadow = highlight
    ? `0 0 0 2px ${glowColor}, 0 0 16px ${glowColor}66`
    : status === "winner"
      ? "inset 4px 0 0 0 var(--accent-green)"
      : "inset 0 0 0 0 transparent";

  // Empty / unresolved slot.
  if (!team) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-dashed border-border bg-surface/40 px-3",
          size === "sm" ? "h-11" : size === "lg" ? "h-16" : "h-14",
          className,
        )}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          TBD
        </span>
      </div>
    );
  }

  const Comp = interactive ? motion.button : motion.div;

  return (
    <Comp
      layoutId={layoutId}
      onClick={interactive ? onClick : undefined}
      disabled={interactive ? false : undefined}
      type={interactive ? "button" : undefined}
      aria-pressed={
        interactive
          ? status === "first" || status === "second" || status === "winner"
          : undefined
      }
      whileHover={interactive ? { scale: 1.015 } : undefined}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      animate={{ boxShadow }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-lg border bg-surface px-3 text-left transition-colors",
        size === "sm" ? "h-11" : size === "lg" ? "h-16" : "h-14",
        interactive && "cursor-pointer hover:border-white/30 hover:bg-elevated",
        !interactive && "cursor-default",
        status === "default" && "border-border",
        status === "first" && "border-accent-gold/70 bg-accent-gold/[0.06]",
        status === "second" && "border-text-secondary/40 bg-white/[0.02]",
        (status === "third" || status === "fourth") &&
          "border-border bg-surface/60",
        status === "winner" && "border-accent-green/60 bg-accent-green/[0.06]",
        status === "champion" &&
          "border-accent-gold bg-accent-gold/[0.1] animate-gold-pulse",
        eliminated && "border-border/50 opacity-50 grayscale",
        eliminated && interactive && "hover:opacity-80",
        className,
      )}
      style={
        accentColor && status === "default"
          ? { boxShadow: `inset 3px 0 0 0 ${accentColor}` }
          : undefined
      }
    >
      <span
        className={cn(
          "shrink-0 leading-none",
          size === "sm" ? "text-xl" : size === "lg" ? "text-3xl" : "text-2xl",
        )}
        aria-hidden
      >
        {team.flag}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate font-display font-bold uppercase tracking-wide leading-tight",
            size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base",
            eliminated && "line-through",
            status === "champion" && "text-accent-gold",
          )}
        >
          {team.name}
        </span>
        <span className="block font-mono text-[10px] uppercase tracking-widest text-text-muted">
          {team.shortName} · {team.confederation}
        </span>
      </span>

      {rank && RANK_BADGE[rank] && (
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold",
            RANK_BADGE[rank].cls,
          )}
        >
          {RANK_BADGE[rank].label}
        </span>
      )}

      {status === "winner" && (
        <Check className="h-4 w-4 shrink-0 text-accent-green" strokeWidth={3} />
      )}
      {eliminated && (
        <X className="h-4 w-4 shrink-0 text-accent-red/70" strokeWidth={3} />
      )}
    </Comp>
  );
}
