"use client";

import { motion } from "framer-motion";

export type Connector = {
  id: string;
  /** SVG path 'd' string for the elbow connector. */
  d: string;
  /** Drawn fully + green when the feeding match is decided. */
  active: boolean;
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
          stroke={c.active ? "var(--accent-green)" : "var(--border)"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: c.active ? 1 : 1, opacity: c.active ? 1 : 0.6 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
