"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Play, RotateCw } from "lucide-react";
import { TEAMS } from "@/data/teams";
import { hasSavedState } from "@/lib/storage";

const TICKER = [...TEAMS, ...TEAMS];

export default function HomePage() {
  const [resumable, setResumable] = useState(false);

  useEffect(() => {
    setResumable(hasSavedState());
  }, []);

  return (
    <main className="mesh-bg noise scanlines relative flex min-h-screen flex-col overflow-hidden">
      {/* Flag ticker top */}
      <div className="relative z-10 shrink-0 overflow-hidden border-b border-border/50 py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-flag-scroll gap-6 text-2xl">
          {TICKER.map((team, i) => (
            <span key={`${team.id}-${i}`} className="opacity-70" aria-hidden>
              {team.flag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.4em] text-text-secondary"
        >
          USA · Canada · Mexico — Summer 2026
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-wordmark text-[18vw] uppercase leading-[0.82] tracking-tight sm:text-8xl md:text-9xl"
        >
          <span className="gradient-text">WC26</span>
          <br />
          <span className="text-text-primary">Final Call</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 font-display text-2xl font-bold uppercase tracking-wide text-text-secondary md:text-3xl"
        >
          48 Teams. One Champion. Your Call.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row"
        >
          <Link
            href="/groups"
            className="group inline-flex items-center gap-2 rounded-xl bg-accent-gold px-8 py-4 font-display text-xl font-bold uppercase tracking-wide text-base shadow-lg shadow-accent-gold/20 transition hover:brightness-110"
          >
            <Play className="h-5 w-5 fill-current" />
            Start Your Prediction
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>

          {resumable && (
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-6 py-4 font-display text-lg font-bold uppercase tracking-wide text-text-primary transition hover:border-white/30"
            >
              <RotateCw className="h-5 w-5" />
              Continue
            </Link>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 grid grid-cols-3 gap-8 font-mono text-text-secondary sm:mt-16"
        >
          {[
            { n: "48", l: "Teams" },
            { n: "104", l: "Matches" },
            { n: "1", l: "Champion" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-4xl font-black text-text-primary md:text-5xl">
                {s.n}
              </div>
              <div className="text-[10px] uppercase tracking-widest">{s.l}</div>
            </div>
          ))}
        </motion.div>

        <motion.a
          href="https://www.odaidh.dev/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="group mt-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-text-muted transition-colors hover:text-accent-gold sm:mt-12"
        >
          Built by Odai!
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </motion.a>
      </div>

      {/* Flag ticker bottom (reverse) */}
      <div className="relative z-10 shrink-0 overflow-hidden border-t border-border/50 py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-flag-scroll gap-6 text-2xl [animation-direction:reverse]">
          {TICKER.map((team, i) => (
            <span key={`${team.id}-b-${i}`} className="opacity-70" aria-hidden>
              {team.flag}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
