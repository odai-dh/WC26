import type { Team } from "@/types/tournament";

/**
 * All 48 teams of the FIFA World Cup 2026, per the final draw held
 * 5 December 2025 in Washington, D.C. Order within each group reflects
 * the seeded/pot position (1 = top seed / pot 1).
 */
export const TEAMS: Team[] = [
  // Group A
  { id: "mex", name: "Mexico", shortName: "MEX", flag: "🇲🇽", group: "A", confederation: "CONCACAF", seeding: 1 },
  { id: "rsa", name: "South Africa", shortName: "RSA", flag: "🇿🇦", group: "A", confederation: "CAF", seeding: 2 },
  { id: "kor", name: "Korea Republic", shortName: "KOR", flag: "🇰🇷", group: "A", confederation: "AFC", seeding: 3 },
  { id: "cze", name: "Czechia", shortName: "CZE", flag: "🇨🇿", group: "A", confederation: "UEFA", seeding: 4 },

  // Group B
  { id: "can", name: "Canada", shortName: "CAN", flag: "🇨🇦", group: "B", confederation: "CONCACAF", seeding: 1 },
  { id: "bih", name: "Bosnia & Herzegovina", shortName: "BIH", flag: "🇧🇦", group: "B", confederation: "UEFA", seeding: 2 },
  { id: "qat", name: "Qatar", shortName: "QAT", flag: "🇶🇦", group: "B", confederation: "AFC", seeding: 3 },
  { id: "sui", name: "Switzerland", shortName: "SUI", flag: "🇨🇭", group: "B", confederation: "UEFA", seeding: 4 },

  // Group C
  { id: "bra", name: "Brazil", shortName: "BRA", flag: "🇧🇷", group: "C", confederation: "CONMEBOL", seeding: 1 },
  { id: "mar", name: "Morocco", shortName: "MAR", flag: "🇲🇦", group: "C", confederation: "CAF", seeding: 2 },
  { id: "hai", name: "Haiti", shortName: "HAI", flag: "🇭🇹", group: "C", confederation: "CONCACAF", seeding: 3 },
  { id: "sco", name: "Scotland", shortName: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", confederation: "UEFA", seeding: 4 },

  // Group D
  { id: "usa", name: "United States", shortName: "USA", flag: "🇺🇸", group: "D", confederation: "CONCACAF", seeding: 1 },
  { id: "par", name: "Paraguay", shortName: "PAR", flag: "🇵🇾", group: "D", confederation: "CONMEBOL", seeding: 2 },
  { id: "aus", name: "Australia", shortName: "AUS", flag: "🇦🇺", group: "D", confederation: "AFC", seeding: 3 },
  { id: "tur", name: "Türkiye", shortName: "TUR", flag: "🇹🇷", group: "D", confederation: "UEFA", seeding: 4 },

  // Group E
  { id: "ger", name: "Germany", shortName: "GER", flag: "🇩🇪", group: "E", confederation: "UEFA", seeding: 1 },
  { id: "cuw", name: "Curaçao", shortName: "CUW", flag: "🇨🇼", group: "E", confederation: "CONCACAF", seeding: 2 },
  { id: "civ", name: "Ivory Coast", shortName: "CIV", flag: "🇨🇮", group: "E", confederation: "CAF", seeding: 3 },
  { id: "ecu", name: "Ecuador", shortName: "ECU", flag: "🇪🇨", group: "E", confederation: "CONMEBOL", seeding: 4 },

  // Group F
  { id: "ned", name: "Netherlands", shortName: "NED", flag: "🇳🇱", group: "F", confederation: "UEFA", seeding: 1 },
  { id: "jpn", name: "Japan", shortName: "JPN", flag: "🇯🇵", group: "F", confederation: "AFC", seeding: 2 },
  { id: "swe", name: "Sweden", shortName: "SWE", flag: "🇸🇪", group: "F", confederation: "UEFA", seeding: 3 },
  { id: "tun", name: "Tunisia", shortName: "TUN", flag: "🇹🇳", group: "F", confederation: "CAF", seeding: 4 },

  // Group G
  { id: "bel", name: "Belgium", shortName: "BEL", flag: "🇧🇪", group: "G", confederation: "UEFA", seeding: 1 },
  { id: "egy", name: "Egypt", shortName: "EGY", flag: "🇪🇬", group: "G", confederation: "CAF", seeding: 2 },
  { id: "irn", name: "Iran", shortName: "IRN", flag: "🇮🇷", group: "G", confederation: "AFC", seeding: 3 },
  { id: "nzl", name: "New Zealand", shortName: "NZL", flag: "🇳🇿", group: "G", confederation: "OFC", seeding: 4 },

  // Group H
  { id: "esp", name: "Spain", shortName: "ESP", flag: "🇪🇸", group: "H", confederation: "UEFA", seeding: 1 },
  { id: "cpv", name: "Cape Verde", shortName: "CPV", flag: "🇨🇻", group: "H", confederation: "CAF", seeding: 2 },
  { id: "ksa", name: "Saudi Arabia", shortName: "KSA", flag: "🇸🇦", group: "H", confederation: "AFC", seeding: 3 },
  { id: "uru", name: "Uruguay", shortName: "URU", flag: "🇺🇾", group: "H", confederation: "CONMEBOL", seeding: 4 },

  // Group I
  { id: "fra", name: "France", shortName: "FRA", flag: "🇫🇷", group: "I", confederation: "UEFA", seeding: 1 },
  { id: "sen", name: "Senegal", shortName: "SEN", flag: "🇸🇳", group: "I", confederation: "CAF", seeding: 2 },
  { id: "irq", name: "Iraq", shortName: "IRQ", flag: "🇮🇶", group: "I", confederation: "AFC", seeding: 3 },
  { id: "nor", name: "Norway", shortName: "NOR", flag: "🇳🇴", group: "I", confederation: "UEFA", seeding: 4 },

  // Group J
  { id: "arg", name: "Argentina", shortName: "ARG", flag: "🇦🇷", group: "J", confederation: "CONMEBOL", seeding: 1 },
  { id: "alg", name: "Algeria", shortName: "ALG", flag: "🇩🇿", group: "J", confederation: "CAF", seeding: 2 },
  { id: "aut", name: "Austria", shortName: "AUT", flag: "🇦🇹", group: "J", confederation: "UEFA", seeding: 3 },
  { id: "jor", name: "Jordan", shortName: "JOR", flag: "🇯🇴", group: "J", confederation: "AFC", seeding: 4 },

  // Group K
  { id: "por", name: "Portugal", shortName: "POR", flag: "🇵🇹", group: "K", confederation: "UEFA", seeding: 1 },
  { id: "cod", name: "DR Congo", shortName: "COD", flag: "🇨🇩", group: "K", confederation: "CAF", seeding: 2 },
  { id: "uzb", name: "Uzbekistan", shortName: "UZB", flag: "🇺🇿", group: "K", confederation: "AFC", seeding: 3 },
  { id: "col", name: "Colombia", shortName: "COL", flag: "🇨🇴", group: "K", confederation: "CONMEBOL", seeding: 4 },

  // Group L
  { id: "eng", name: "England", shortName: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", confederation: "UEFA", seeding: 1 },
  { id: "cro", name: "Croatia", shortName: "CRO", flag: "🇭🇷", group: "L", confederation: "UEFA", seeding: 2 },
  { id: "gha", name: "Ghana", shortName: "GHA", flag: "🇬🇭", group: "L", confederation: "CAF", seeding: 3 },
  { id: "pan", name: "Panama", shortName: "PAN", flag: "🇵🇦", group: "L", confederation: "CONCACAF", seeding: 4 },
];

export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
);

export function getTeam(id: string | null | undefined): Team | undefined {
  if (!id) return undefined;
  return TEAMS_BY_ID[id];
}

export const CONFEDERATION_COLORS: Record<Team["confederation"], string> = {
  UEFA: "var(--accent-blue-bright)",
  CONMEBOL: "var(--accent-green)",
  CONCACAF: "var(--accent-red)",
  CAF: "var(--accent-gold)",
  AFC: "#9b5de5",
  OFC: "#00bbf9",
};
