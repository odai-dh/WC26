"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type StageKey = "GROUPS" | "R32" | "R16" | "QF" | "SF" | "FINAL";

const STAGES: { key: StageKey; label: string }[] = [
  { key: "GROUPS", label: "Group Stage" },
  { key: "R32", label: "Round of 32" },
  { key: "R16", label: "Round of 16" },
  { key: "QF", label: "Quarter-Finals" },
  { key: "SF", label: "Semi-Finals" },
  { key: "FINAL", label: "Final" },
];

export function ProgressBar({ active }: { active: StageKey }) {
  const activeIndex = STAGES.findIndex((s) => s.key === active);
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // Keep the lit stage centred in the (horizontally-scrolling) bar on mobile.
  useEffect(() => {
    const nav = navRef.current;
    const el = activeRef.current;
    if (!nav || !el) return;
    const target = el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2;
    nav.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeIndex]);

  return (
    <nav
      ref={navRef}
      aria-label="Tournament progress"
      className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1"
    >
      {STAGES.map((stage, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        return (
          <div key={stage.key} className="flex items-center gap-1 shrink-0">
            <div
              ref={isActive ? activeRef : undefined}
              className={cn(
                "relative flex items-center gap-2 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-widest transition-colors",
                isActive && "text-text-primary",
                isDone && "text-accent-green",
                !isActive && !isDone && "text-text-muted",
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  isActive && "bg-accent-gold",
                  isDone && "bg-accent-green",
                  !isActive && !isDone && "bg-border",
                )}
              />
              {stage.key}
              {isActive && (
                <motion.span
                  layoutId="progress-underline"
                  className="absolute inset-x-1.5 -bottom-0.5 h-0.5 rounded-full bg-accent-gold"
                />
              )}
            </div>
            {i < STAGES.length - 1 && (
              <span className="text-text-muted/50 text-[10px]">›</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
