# WC26 Final Call

A World Cup 2026 bracket-prediction app. Pick every winner — from the group
stage through the knockouts to the champion. No scores, just advancement calls.
Dark, bold, high-contrast, and fully client-side (state lives in `localStorage`).

**48 Teams. One Champion. Your Call.**

Keep **multiple saved brackets** (switch, rename, duplicate, delete from the
header) and install it as an **offline-capable PWA** — manifest + a network-first
service worker mean the app shell works with no connection after the first load.

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict, no `any`)
- **Tailwind CSS** with CSS-variable design tokens
- **Framer Motion** for transitions, advancement flashes, and bracket reveals
- **Lucide React** icons
- Fonts via `next/font`: Barlow Condensed (display), DM Sans (body),
  JetBrains Mono (labels/standings)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy (Netlify)

Connect the repo to Netlify and it builds from `netlify.toml` using the official
Next.js runtime — no extra setup. Build command `npm run build`, publish `.next`,
Node 20. Or from the CLI:

```bash
npm i -g netlify-cli
netlify deploy --build          # preview
netlify deploy --build --prod   # production
```

The service worker only registers in production builds, so offline/install
behaviour is testable on the deployed site (or a local `npm run build && npm start`).

## How it works

1. **/groups** — Tap to rank a winner (gold), runner-up (silver), and 3rd place
   in all 12 groups; the remaining team is the auto 4th. Once all groups are set,
   pick the **8 best third-placed teams** to fill the Round of 32. Two quick-start
   shortcuts fill the entire bracket in one tap: **Auto-fill by seed** (pot
   favourites advance) and **Chaos mode** (a random but valid bracket) — both
   meant as a starting point you then tweak.
2. **/bracket** — The official FIFA 2026 knockout bracket (matches 73–104).
   Click a team to advance them; the loser is greyed out everywhere instantly.
   SVG connectors draw and turn green as each match resolves. Desktop shows the
   full tree; mobile is a round-by-round stepper. Hover any team to glow their
   live route to the final, watch the **confederation breakdown** of your last 8
   and last 4 update, and **reset just the knockouts** without losing your groups.
3. **/champion** — When the final is picked: confetti, a glowing champion card,
   and the full "path to glory" (every team beaten). Export your prediction as a
   **shareable link** (`?p=` — opening it loads the whole bracket), a **social
   PNG card**, or a timestamped **PDF**.

## Structure

```
app/            page.tsx (home) · groups · bracket · champion · layout · globals.css
components/ui   TeamCard · MatchCard · GroupTable · BracketLine · ProgressBar
components/layout  AppShell · StageHeader
data/           teams.ts (48 teams) · groups.ts · bracket.ts (full knockout wiring)
lib/            useTournament.ts · bracketEngine.ts · storage.ts · motion.ts · cn.ts
types/          tournament.ts
```

## Data provenance

Teams and groups are the **real FIFA World Cup 2026 final draw** (5 Dec 2025,
Washington D.C.). The knockout structure encodes the official bracket: Round of
32 = matches 73–88, R16 = 89–96, QF = 97–100, SF = 101–102, Final = 104.

The eight third-placed qualifiers are assigned to their bracket slots at runtime
by a deterministic bipartite match against each slot's allowed source groups
(`lib/bracketEngine.ts`), mirroring FIFA's third-place allocation constraints —
so the same picks always produce the same bracket.
