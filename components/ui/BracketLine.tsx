"use client";

import { motion } from "framer-motion";

export type Connector = {
  id: string;
  /** SVG path 'd' string for the elbow connector. */
  d: string;
  /** Drawn fully + green when the feeding match is decided. */
  active: boolean;
  /** When set, the connector glows in this colour (a highlighted team's route). */
  highlightColor?: string;
};

/**
 * Absolutely-positioned SVG layer that draws elbow connectors between
 * bracket columns. Lines draw themselves (stroke-dashoffset via pathLength)
 * and turn green once their feeding match has a winner.
 */
export function BracketLine({
  width,
  height,
  connectors,
}: {
  width: number;
  height: number;
  connectors: Connector[];
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute inset-0"
      aria-hidden
      fill="none"
    >
      {connectors.map((c) => (
        <motion.path
          key={c.id}
          d={c.d}
          stroke={
            c.highlightColor
              ? c.highlightColor
              : c.active
                ? "var(--accent-green)"
                : "var(--border)"
          }
          strokeWidth={c.highlightColor ? 3 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ opacity: c.highlightColor ? 1 : c.active ? 1 : 0.6 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={
            c.highlightColor
              ? { filter: `drop-shadow(0 0 5px ${c.highlightColor})` }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
