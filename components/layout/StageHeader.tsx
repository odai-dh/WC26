"use client";

import { motion } from "framer-motion";

export function StageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 md:mb-8"
    >
      {eyebrow && (
        <p className="mb-1 font-mono text-xs font-medium uppercase tracking-[0.3em] text-accent-gold">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-text-primary md:text-7xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
          {subtitle}
        </p>
      )}
    </motion.header>
  );
}
