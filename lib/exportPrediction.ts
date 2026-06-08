import { jsPDF } from "jspdf";
import { BRACKET, matchesForRound, ROUNDS } from "@/data/bracket";
import { GROUP_IDS, GROUPS_BY_ID } from "@/data/groups";
import { getTeam } from "@/data/teams";
import { buildResolver, fourthPlaceTeam, thirdPlaceTeam } from "@/lib/bracketEngine";
import type { KnockoutRound, TournamentState } from "@/types/tournament";

const ROUND_KEYS: KnockoutRound[] = ["R32", "R16", "QF", "SF", "FINAL"];

const roundLabel = (round: KnockoutRound) =>
  ROUNDS.find((r) => r.round === round)?.short ?? round;

const teamLabel = (id: string | null | undefined) => {
  const team = getTeam(id);
  return team ? `${team.name} (${team.shortName})` : "TBD";
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Build and download a timestamped PDF of the user's full prediction. */
export function downloadPredictionPdf(state: TournamentState): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const { resolveMatch } = buildResolver(state);

  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const now = new Date();
  const stamp = now.toLocaleString();

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text: string) => {
    ensureSpace(34);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20);
    doc.text(text, margin, y);
    y += 18;
  };

  const line = (
    text: string,
    opts: { bold?: boolean; size?: number; gray?: boolean; indent?: number } = {},
  ) => {
    const size = opts.size ?? 10;
    ensureSpace(size + 6);
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(opts.gray ? 120 : 40);
    doc.text(text, margin + (opts.indent ?? 0), y);
    y += size + 5;
  };

  // ---- Title ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(20);
  doc.text("WC26 FINAL CALL", margin, y);
  y += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(110);
  doc.text("My FIFA World Cup 2026 Prediction", margin, y);
  y += 16;
  doc.setFontSize(9);
  doc.text(`Generated ${stamp}`, margin, y);
  y += 10;

  // ---- Champion ----
  heading("Champion");
  const champ = getTeam(state.champion);
  if (champ) {
    line(`${champ.name} (${champ.shortName}) — ${champ.confederation}`, {
      bold: true,
      size: 15,
    });
  } else {
    line("Not yet decided", { gray: true });
  }

  // ---- Path to Glory ----
  if (champ) {
    heading("Path to Glory");
    let any = false;
    for (const m of BRACKET) {
      const r = resolveMatch(m.id);
      if (r.winnerId === champ.id && r.homeTeamId && r.awayTeamId) {
        const loser = r.homeTeamId === champ.id ? r.awayTeamId : r.homeTeamId;
        line(`${roundLabel(m.round).padEnd(6)}  def. ${teamLabel(loser)}`, {
          indent: 4,
        });
        any = true;
      }
    }
    if (!any) line("No wins recorded.", { gray: true });
  }

  // ---- Knockout Results ----
  heading("Knockout Results");
  for (const rk of ROUND_KEYS) {
    line(ROUNDS.find((r) => r.round === rk)?.label ?? rk, { bold: true, size: 11 });
    for (const m of matchesForRound(rk)) {
      const r = resolveMatch(m.id);
      const matchNo = m.id.replace("M", "Match ");
      const winner = r.winnerId ? teamLabel(r.winnerId) : "—";
      line(
        `${matchNo}: ${teamLabel(r.homeTeamId)} vs ${teamLabel(r.awayTeamId)}  ->  ${winner}`,
        { indent: 8, size: 9, gray: !r.winnerId },
      );
    }
    y += 2;
  }

  // ---- Group Stage ----
  heading("Group Stage");
  for (const g of GROUP_IDS) {
    const pick = state.groupPicks[g];
    line(`Group ${g}`, { bold: true, size: 11 });
    if (!pick?.first || !pick?.second || !pick?.third) {
      line("Incomplete", { indent: 8, gray: true, size: 9 });
      continue;
    }
    const fourth = fourthPlaceTeam(g, state);
    line(`1. ${teamLabel(pick.first)}`, { indent: 8, size: 9 });
    line(`2. ${teamLabel(pick.second)}`, { indent: 8, size: 9 });
    line(`3. ${teamLabel(thirdPlaceTeam(g, state))}`, { indent: 8, size: 9 });
    line(`4. ${teamLabel(fourth)}`, { indent: 8, size: 9, gray: true });
  }

  // ---- Best third-placed qualifiers ----
  if (state.thirdPlacePicks.length > 0) {
    heading("Best Third-Placed Qualifiers");
    for (const id of state.thirdPlacePicks) {
      const team = getTeam(id);
      const grp = team ? ` — Group ${team.group}` : "";
      line(`${teamLabel(id)}${grp}`, { indent: 4, size: 9 });
    }
  }

  const fileName = `wc26-prediction-${now.getFullYear()}-${pad(
    now.getMonth() + 1,
  )}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.pdf`;

  doc.save(fileName);
}
