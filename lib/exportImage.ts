import { BRACKET, ROUNDS } from "@/data/bracket";
import { getTeam } from "@/data/teams";
import { buildResolver } from "@/lib/bracketEngine";
import type { TournamentState } from "@/types/tournament";

const COLORS = {
  base: "#0a0a0f",
  surface: "#111118",
  border: "#2a2a3a",
  gold: "#f4a261",
  green: "#2d6a4f",
  red: "#e63946",
  blue: "#457b9d",
  text: "#f8f9fa",
  sub: "#9099a8",
  muted: "#4a5568",
};

const SIZE = 1080;
const pad = (n: number) => String(n).padStart(2, "0");

/** Read the hashed next/font family for a CSS variable, with a safe fallback. */
function fontFamily(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.body).getPropertyValue(varName).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Shrink the font size until `text` fits within `maxWidth`. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  weight: string,
  startPx: number,
  maxWidth: number,
  minPx = 16,
) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && px > minPx) {
    px -= 2;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

/** Build a square social card PNG of the champion and download it. */
export async function downloadPredictionImage(
  state: TournamentState,
): Promise<void> {
  const champ = getTeam(state.champion);
  if (!champ) return;

  // Make sure webfonts are loaded so the canvas renders the brand type.
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* fall back to system fonts */
    }
  }

  const display = fontFamily("--font-display", "Arial, sans-serif");
  const mono = fontFamily("--font-mono", "monospace");

  // Path to glory — short codes of every team the champion beat, in order.
  const { resolveMatch } = buildResolver(state);
  const beaten: string[] = [];
  for (const m of BRACKET) {
    const r = resolveMatch(m.id);
    if (r.winnerId === champ.id && r.homeTeamId && r.awayTeamId) {
      const loser = r.homeTeamId === champ.id ? r.awayTeamId : r.homeTeamId;
      const t = getTeam(loser);
      if (t) beaten.push(t.shortName);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cx = SIZE / 2;

  // ---- Background ----
  ctx.fillStyle = COLORS.base;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Diagonal brand glow.
  const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  g.addColorStop(0, "rgba(230,57,70,0.18)");
  g.addColorStop(0.5, "rgba(29,53,87,0.10)");
  g.addColorStop(1, "rgba(45,106,79,0.18)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Radial gold halo behind the champion.
  const halo = ctx.createRadialGradient(cx, 430, 40, cx, 430, 420);
  halo.addColorStop(0, "rgba(244,162,97,0.22)");
  halo.addColorStop(1, "rgba(244,162,97,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ---- Outer frame ----
  const M = 56;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(244,162,97,0.55)";
  roundRect(ctx, M, M, SIZE - 2 * M, SIZE - 2 * M, 36);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // ---- Eyebrow ----
  ctx.fillStyle = COLORS.gold;
  ctx.font = `700 24px ${mono}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "8px";
  ctx.fillText("WC26  FINAL  CALL", cx, 150);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  ctx.fillStyle = COLORS.sub;
  ctx.font = `500 22px ${mono}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
  ctx.fillText("MY  WORLD  CHAMPION", cx, 200);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  // ---- Flag ----
  ctx.font = `700 230px ${display}`;
  ctx.fillText(champ.flag, cx, 470);

  // ---- Champion name ----
  ctx.fillStyle = COLORS.gold;
  const name = champ.name.toUpperCase();
  const namePx = fitFont(ctx, name, display, "900", 132, SIZE - 2 * M - 60);
  ctx.font = `900 ${namePx}px ${display}`;
  ctx.fillText(name, cx, 620);

  // ---- Subline ----
  ctx.fillStyle = COLORS.sub;
  ctx.font = `500 26px ${mono}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
  ctx.fillText(
    `${champ.shortName} · ${champ.confederation}`,
    cx,
    672,
  );
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  // ---- Divider ----
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 220, 740);
  ctx.lineTo(cx + 220, 740);
  ctx.stroke();

  // ---- Path to glory ----
  ctx.fillStyle = COLORS.green;
  ctx.font = `700 26px ${display}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
  ctx.fillText("PATH TO GLORY", cx, 800);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  ctx.fillStyle = COLORS.text;
  const pathLine = beaten.length ? beaten.join("  ›  ") : "—";
  const pathPx = fitFont(ctx, pathLine, mono, "700", 40, SIZE - 2 * M - 80);
  ctx.font = `700 ${pathPx}px ${mono}`;
  ctx.fillText(pathLine, cx, 862);

  ctx.fillStyle = COLORS.sub;
  ctx.font = `500 24px ${mono}`;
  ctx.fillText(
    `${beaten.length} KNOCKOUT WINS · 48-TEAM FIELD`,
    cx,
    908,
  );

  // ---- Footer ----
  const now = new Date();
  ctx.fillStyle = COLORS.muted;
  ctx.font = `500 22px ${mono}`;
  ctx.fillText("48 TEAMS · ONE CHAMPION · YOUR CALL", cx, SIZE - 96);
  ctx.fillText(now.toLocaleDateString(), cx, SIZE - 64);

  // ---- Download ----
  const fileName = `wc26-champion-${now.getFullYear()}-${pad(
    now.getMonth() + 1,
  )}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.png`;

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}
