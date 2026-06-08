"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Download, ImageIcon, Share2, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BRACKET, ROUNDS } from "@/data/bracket";
import { getTeam } from "@/data/teams";
import { buildResolver } from "@/lib/bracketEngine";
import { downloadPredictionImage } from "@/lib/exportImage";
import { downloadPredictionPdf } from "@/lib/exportPrediction";
import { buildShareUrl } from "@/lib/share";
import { useTournament } from "@/lib/useTournament";

const CONFETTI_COLORS = [
  "var(--accent-red)",
  "var(--accent-blue-bright)",
  "var(--accent-green)",
  "var(--accent-gold)",
];

export default function ChampionPage() {
  const t = useTournament();
  const [confetti, setConfetti] = useState<
    { id: number; left: number; delay: number; dur: number; color: string; size: number }[]
  >([]);
  const [copied, setCopied] = useState(false);

  const champion = t.state.champion ? getTeam(t.state.champion) : null;

  useEffect(() => {
    if (!champion) return;
    const pieces = Array.from({ length: 90 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.5,
      dur: 2.6 + Math.random() * 2.4,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 8,
    }));
    setConfetti(pieces);
  }, [champion]);

  // Path to glory: every team the champion beat, in round order.
  const path = useMemo(() => {
    if (!champion) return [];
    const { resolveMatch } = buildResolver(t.state);
    const out: { round: string; teamId: string }[] = [];
    for (const m of BRACKET) {
      const r = resolveMatch(m.id);
      if (r.winnerId === champion.id && r.homeTeamId && r.awayTeamId) {
        const loser = r.homeTeamId === champion.id ? r.awayTeamId : r.homeTeamId;
        const label = ROUNDS.find((x) => x.round === m.round)?.short ?? m.round;
        if (loser) out.push({ round: label, teamId: loser });
      }
    }
    return out;
  }, [champion, t.state]);

  const handleShare = async () => {
    if (!champion) return;
    const url = buildShareUrl(t.state);
    const text = `I predict ${champion.flag} ${champion.name} will win WC26 Final Call! 🏆 #WorldCup2026`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "WC26 Final Call", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      /* user dismissed share sheet */
    }
  };

  if (!t.hydrated) {
    return (
      <AppShell activeStage="FINAL">
        <div className="h-[60vh] animate-pulse rounded-xl border border-border bg-surface/50" />
      </AppShell>
    );
  }

  if (!champion) {
    return (
      <AppShell activeStage="FINAL">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <Trophy className="h-14 w-14 text-text-muted" />
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            No champion yet
          </h1>
          <p className="max-w-md text-text-secondary">
            Finish the bracket all the way to the final, then come back to crown
            your winner.
          </p>
          <Link
            href="/bracket"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-accent-gold px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-base hover:brightness-110"
          >
            Go to the Bracket
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeStage="FINAL">
      {/* Confetti */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="absolute -top-4 rounded-sm"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * 1.6,
              backgroundColor: c.color,
              animation: `fall ${c.dur}s linear ${c.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`@keyframes fall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(540deg); opacity: 0.9; }
      }`}</style>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.4em] text-accent-gold"
        >
          <Sparkles className="h-4 w-4" /> Your Champion
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl border-2 border-accent-gold bg-accent-gold/[0.08] p-8 animate-gold-pulse"
        >
          <div className="text-8xl md:text-9xl" aria-hidden>
            {champion.flag}
          </div>
          <h1 className="mt-4 font-display text-6xl font-black uppercase leading-none tracking-tight text-accent-gold md:text-7xl">
            {champion.name}
          </h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.3em] text-text-secondary">
            {champion.shortName} · {champion.confederation} · World Champions
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid w-full max-w-md grid-cols-2 gap-3"
        >
          <Stat n={`${path.length}`} l="Knockout wins" />
          <Stat n="48" l="Teams in the field" />
        </motion.div>

        {/* Path to glory */}
        <div className="mt-10 w-full text-left">
          <h2 className="mb-3 text-center font-display text-2xl font-black uppercase tracking-tight">
            Path to Glory
          </h2>
          <div className="flex flex-col gap-2">
            {path.map((step, i) => {
              const beaten = getTeam(step.teamId);
              if (!beaten) return null;
              return (
                <motion.div
                  key={`${step.round}-${step.teamId}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface/60 px-4 py-2.5"
                >
                  <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-widest text-accent-gold">
                    {step.round}
                  </span>
                  <span className="text-xl" aria-hidden>
                    {beaten.flag}
                  </span>
                  <span className="flex-1 font-display font-bold uppercase tracking-wide">
                    {beaten.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    defeated
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-gold px-5 py-3 font-display text-lg font-bold uppercase tracking-wide text-base transition hover:brightness-110"
          >
            {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
            {copied ? "Link copied!" : "Share my call"}
          </button>
          <button
            type="button"
            onClick={() => downloadPredictionImage(t.state)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 font-display text-lg font-bold uppercase tracking-wide text-text-primary transition hover:border-accent-gold/60 hover:text-accent-gold"
          >
            <ImageIcon className="h-5 w-5" />
            Save image
          </button>
          <button
            type="button"
            onClick={() => downloadPredictionPdf(t.state)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 font-display text-lg font-bold uppercase tracking-wide text-text-primary transition hover:border-accent-gold/60 hover:text-accent-gold"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Reset your entire prediction? This clears every pick.",
                )
              ) {
                t.resetTournament();
                window.location.href = "/";
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 font-display text-lg font-bold uppercase tracking-wide text-text-secondary transition hover:border-accent-red/60 hover:text-text-primary"
          >
            Reset Prediction
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 px-4 py-3">
      <div className="font-display text-3xl font-black text-text-primary">{n}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
        {l}
      </div>
    </div>
  );
}
