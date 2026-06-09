<div align="center">

# ⚽ WC26 Final Call

### 48 Teams. One Champion. Your Call.

A bold, dark, fully client-side **FIFA World Cup 2026 bracket predictor**.
Pick every winner — from the group stage through the knockouts to the champion.
No scores, no accounts, no backend. Just advancement calls, saved in your browser.

[**Live demo →**](https://wc26-finalcall.netlify.app) &nbsp;·&nbsp; Built by [Odai Dahi](https://www.odaidh.dev/)

</div>

---

## ✨ Features

- **Group stage** — rank a winner, runner-up and 3rd place in all 12 groups; the
  last team is the auto 4th. Then pick the **8 best third-placed teams** to fill
  the Round of 32.
- **Quick-start fills** — populate the *entire* bracket in one tap: **Auto-fill
  by seed** (pot favourites advance) or **Chaos mode** (a random but valid
  bracket), then tweak from there.
- **The bracket** — the official FIFA 2026 knockout tree (matches 73–104). Click
  a team to advance them and the loser greys out everywhere instantly. SVG
  connectors draw and turn green as matches resolve.
- **Live route highlight** — hover any team to glow their path to the final in
  their confederation colour.
- **Confederation breakdown** — a live tally of how many UEFA / CONMEBOL / … teams
  reach your last 8 and last 4.
- **Champion reveal** — confetti, a glowing champion card, and the full
  "path to glory" (every team beaten).
- **Share & export** — a **shareable link** (`?p=` encodes the whole bracket),
  a polished **social PNG card**, and a timestamped **PDF**.
- **Multiple saved brackets** — keep, switch, rename, duplicate and delete as
  many predictions as you like, all from the header.
- **Installable PWA** — add to home screen and use it offline after the first
  visit.
- **Responsive & mobile-first** — desktop shows the full tree; mobile is a
  round-by-round stepper synced to the progress bar.

## 🧱 Stack

- **Next.js 14** (App Router) + **TypeScript** (strict, no `any`)
- **Tailwind CSS** with CSS-variable design tokens
- **Framer Motion** — transitions, advancement flashes, bracket reveals
- **Lucide React** icons · **jsPDF** for PDF export · canvas for the PNG card
- Fonts via `next/font`: **Anton** (hero wordmark), **Barlow Condensed**
  (display), **DM Sans** (body), **JetBrains Mono** (labels/standings)

## 🚀 Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build (needed to test PWA/offline)
```

> The service worker only registers in production builds, so install/offline
> behaviour is testable via `npm run build && npm start` or on the live site.

## ☁️ Deploy (Netlify)

Connect the repo to Netlify — it builds from [`netlify.toml`](netlify.toml) using
the official Next.js runtime, no extra setup (build `npm run build`, Node 20).
Or from the CLI:

```bash
npm i -g netlify-cli
netlify deploy --build          # preview
netlify deploy --build --prod   # production
```

## 🧠 How it works

The clever core is a **resolver pattern**. The bracket never stores teams — it
stores *references* to slots that are resolved from your picks at runtime:

```ts
type SlotRef =
  | { kind: "winner";      group: GroupId }       // group winner
  | { kind: "runnerUp";    group: GroupId }       // group runner-up
  | { kind: "third";       allowed: GroupId[] }   // a best-third from one of these groups
  | { kind: "matchWinner"; matchId: string };     // winner of a prior match
```

- **`buildResolver(state)`** turns the abstract bracket + your current picks into
  concrete `home/away/winner` teams for every match.
- **Third-place allocation** is a deterministic backtracking bipartite match
  (`assignThirds`) that places your 8 chosen thirds into the bracket while
  respecting each slot's allowed source groups — mirroring FIFA's real
  constraints, so the same picks always produce the same bracket. (All 495
  possible group combinations are provably solvable.)
- **`normalize()`** runs after every change and cascades: a changed group pick
  invalidates any downstream third-place and knockout picks that no longer make
  sense, so the state is always consistent.
- **Persistence** is a small slots model in `localStorage` — a slot index, the
  active slot pointer, and per-slot state — with migration from the original
  single-key save.

## 🗂️ Project structure

```
app/
  page.tsx            home / hero
  groups/             group standings + best-thirds picker + quick-start fills
  bracket/            knockout tree (desktop) + round stepper (mobile)
  champion/           reveal, path to glory, share/PNG/PDF export
  layout.tsx          fonts, metadata, PWA, dialog provider
  manifest.ts         PWA web manifest
  globals.css         design tokens + effects
components/
  ui/                 TeamCard · MatchCard · GroupTable · BracketLine ·
                      ProgressBar · ConfederationBreakdown · Dialog
  layout/             AppShell · StageHeader · BracketSwitcher
  PWARegister.tsx     service-worker registration
data/
  teams.ts            48 teams · groups.ts · bracket.ts (full knockout wiring)
lib/
  useTournament.ts    state hook (picks, cascade, auto-fill, reset, slots)
  bracketEngine.ts    resolver, third-place allocation, derived queries
  storage.ts          localStorage slots + migration
  share.ts            encode/decode prediction to a URL
  exportPrediction.ts PDF export   ·   exportImage.ts  social PNG card
  autoFill.ts         seeded + chaos bracket builders
  motion.ts · cn.ts   animation variants · class merge
types/
  tournament.ts       shared types
public/
  sw.js               offline service worker   ·   icon.svg  app icon
```

## 📊 Data provenance

Teams and groups are the **real FIFA World Cup 2026 final draw** (5 Dec 2025,
Washington D.C.). The knockout structure encodes the official bracket:
Round of 32 = matches 73–88, R16 = 89–96, QF = 97–100, SF = 101–102, Final = 104.

## 📄 License

Personal project — not affiliated with or endorsed by FIFA. Team names and flags
are used for identification only.

<div align="center">

Made with ⚽ by [**Odai Dahi**](https://www.odaidh.dev/)

</div>
