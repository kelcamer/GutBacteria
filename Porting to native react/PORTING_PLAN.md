# Porting gut-flora-atlas.html to native React — plan & status

Goal: turn the minified, hand-patched single-file app into a normal React
project with readable source, real component names, and a real build step —
without breaking the live app at `gut-flora-atlas.html` while the port is in
progress. See the top-level `ARCHITECTURE.md` for background on why this was
worth doing.

## Where things stand right now

**Scaffold**: `app/` is a working Vite + React 19 + Tailwind v4 + lucide-react
project. `npm run build` and `npm run dev` both work (verified, not assumed —
see "Verification done so far" below).

**Ported so far** (3 of ~19 real app components):
- `src/theme.js` — the color palette + `dirColor`/`dirArrow` helpers
- `src/components/Button.jsx` — was `W`
- `src/components/Field.jsx` — was `Sr`
- `src/components/Modal.jsx` — was `Xo`

Everything else below is **not started**. This document exists so that's an
honest, checkable claim rather than something you have to take on faith.

## The big realization that changes the scope

The original 1MB minified file is **not** 1MB of app-specific logic. A large
fraction of it is vendored third-party code that doesn't need porting by
hand at all — it needs installing:

| What | Evidence | Native React equivalent |
|---|---|---|
| React 18.3.1 + ReactDOM | `E.version = "18.3.1"` found directly in the bundle | `npm install react react-dom` (already done, v19 — fine, no breaking changes affect this app's API surface) |
| lucide-react (icon library) | Every icon is built via a `T("IconName", [svg path data])` factory — that factory *is* lucide-react's internal `createLucideIcon` | `npm install lucide-react` (already done), `import { X, Search, ... } from 'lucide-react'` |
| Tailwind CSS v4.3.3 | Found compiled and inlined as a `<style>` block, with the literal comment `/*! tailwindcss v4.3.3 ... */` still in it | `@tailwindcss/vite` plugin (already installed & configured) — className strings throughout the app should work completely unchanged |

So the real porting work is the app's own ~19 components, not "the whole
file." That's still real work, just a much smaller mountain than it looked
like from the outside.

## Full component inventory (from `gut-flora-atlas.readable.html`)

Sizes are rough line-count deltas between where each function starts in the
readable mirror — a proxy for "how much work," not exact. Large gaps
between adjacent entries usually mean embedded JSON data blobs or smaller
helper functions sitting in between that aren't catalogued individually yet.

| Minified name | Real name (proposed) | What it is | Rough size | Status |
|---|---|---|---|---|
| `f` | `theme.js` | color palette | tiny | ✅ ported |
| `zf` | `theme.js` palette | 12-color condition palette | tiny | ✅ ported |
| `W` | `Button.jsx` | button, 4 tones | tiny | ✅ ported |
| `Sr` | `Field.jsx` | labeled text input | tiny | ✅ ported |
| `Xo` | `Modal.jsx` | modal dialog | tiny | ✅ ported |
| `Ot`, `Cr`, `Ko` | (small shared atoms, not yet identified precisely) | ~12–150 lines each | small | not started |
| `$u` | `App.jsx` (root shell) | top-level state, data loading + localStorage merge, tab dispatch, nav drawer | **large** — this is the central piece everything else plugs into | not started |
| `GFA_wireSwipeGestures` | `hooks/useSwipeGestures.js` | mobile edge-swipe-to-open-drawer / swipe-back | ~100 lines | not started |
| `GFA_buildSymptomMap` | `lib/buildSymptomMap.js` | force-directed graph engine (vanilla SVG, not JSX) — used by both symptom maps and the per-condition map | ~1000 lines | not started (highest priority — 3 features depend on it) |
| `GFA_buildMap` | `lib/buildMap.js` | force-directed graph engine for the original Conditions↔bacteria map | ~880 lines | not started |
| `GFA_SymptomTab` | `SymptomTab.jsx` | Bacteria↔Symptom map tab (wraps `buildSymptomMap`) | ~215 lines | not started |
| `GFA_ConditionMap` | `ConditionMap.jsx` | per-condition mini map (wraps `buildSymptomMap`) | ~200 lines | not started |
| `GFA_BrainTab` | `BrainTab.jsx` | Condition↔Brain-region map tab | ~700 lines | not started |
| `GFA_Glossary` | `Glossary.jsx` | static jargon-definitions tab | ~120 lines | not started (easiest full tab — good next target after the shared pieces) |
| `Gfx` | `ConditionsMap.jsx` | the original Conditions↔bacteria force-graph wrapper (wraps `buildMap`) | ~225 lines | not started |
| `Wm` | `ConditionsGrid.jsx` | Conditions tab grid/list | ~170 lines | not started |
| `Gm` | `ConditionDetail.jsx` | single condition's detail page (taxa list, editing) | ~470 lines | not started |
| `jm` | `CompareTab.jsx` | Compare-two + multi-select matrix | ~620 lines | not started (the most complex single tab — has the Rules-of-Hooks history noted in `ARCHITECTURE.md`, be careful) |
| `Xm` | `BacteriaIndex.jsx` | A–Z bacteria index | ~200 lines | not started |
| `Km` | `SourcesTab.jsx` | Sources/citations tab | ~150 lines | not started |
| `Qm` | `BackupTab.jsx` | Export/Import/Reset tab | ~230 lines | not started |
| `Zm` | `FindInPapersTab.jsx` | Find-in-papers (Europe PMC search), incl. tonight's new bacterium dropdown | ~400 lines | not started |
| `jf` | (a links-editor sub-component used inside `Gm`) | ~unclear, needs isolating from surrounding data blobs | small–medium | not started |

**Data**: `seed_data.json` and `symptom_data.json` need no porting at all —
copy them into `app/src/data/` as-is and `import` them directly; Vite handles
JSON imports natively. `GFA_BRAIN_DATA` / `GFA_BRAIN_REGION_INFO` (brain-map
data, currently hardcoded JS with no JSON file — see `ARCHITECTURE.md`)
should get extracted to their own JSON files as part of this port, since
there's no longer a reason not to.

## Suggested porting order (dependency-first)

1. Finish the small shared atoms (`Ot`, `Cr`, `Ko`, `jf`) — quick wins, and
   several bigger components depend on them.
2. Port `$u` (App shell) with **stub** tab content — proves data loading,
   the nav drawer, and tab switching all work before any individual tab is
   real.
3. Port `Wm` + `Gm` (Conditions grid + detail) — the "home" experience, and
   the most self-contained pair (no force-graph dependency).
4. Port `GFA_Glossary` (static, no state, no data dependency — easiest full
   tab, good for building confidence before the harder ones).
5. Port `GFA_buildSymptomMap` (the shared graph engine) once, then the 3
   things that use it: `GFA_SymptomTab`, `GFA_ConditionMap`,
   and fold `GFA_buildMap`/`Gfx` into the same engine if they turn out to be
   similar enough to unify (worth checking — `ARCHITECTURE.md` already notes
   `buildSymptomMap` is "a generalized version of the original buildMap").
6. Port `GFA_BrainTab` (reuses the same graph engine).
7. Port `jm` (Compare-two) last among the "normal" tabs — it's the biggest
   and has known Rules-of-Hooks fragility, worth having the rest of the
   porting patterns well-established first.
8. Port `Xm`, `Km`, `Qm`, `Zm` (Bacteria index, Sources, Backup, Find in
   Papers) — roughly similar complexity to each other, any order.

## Verification done so far (not just "looks right")

- `npm run build` succeeds: 195KB JS / 8.6KB CSS output (61.9KB / 2.6KB
  gzipped) for React + ReactDOM + lucide-react (currently just the `X` icon,
  tree-shaken) + the 3 ported components — vs. >1MB for the entire original
  minified bundle. Real evidence the vendored-dependency approach works, not
  just a theory.
- `npm run dev` serves correctly (`curl` confirmed 200 + real HTML).
- Direction color/arrow values (`dirColor`/`dirArrow`) were checked against
  the actual `GFA_dirColor`/`GFA_dirArrow` source rather than reconstructed
  from memory — caught a real mistake doing this (guessed ↑/↓ arrows,
  actual source uses ▲/▼, and "both" is a fallback-else branch not a
  strict-equals check).
- Not yet done: an actual visual/interactive check in a browser (Chrome
  extension wasn't connected this session — same recurring issue noted
  elsewhere in this project's history). The dev server was left running at
  `http://localhost:5173/` for a manual look.

## Deployment

**Still needs Node locally to build** — this environment didn't have it;
installed via `brew install node` as part of tonight's session (Node 26.7.0,
npm 11.19.0).

**GitHub Pages status, checked before touching anything**: Pages is already
live for this repo via the classic "Deploy from a branch" source —
`kelcamer.github.io/GutBacteria/` currently serves a Jekyll-rendered README
at the root, with `gut-flora-atlas.html` reachable directly at its own path.
A repo can only have one Pages source at a time, and switching to "GitHub
Actions" as the source **replaces** the branch-based deploy rather than
adding to it — so naively turning on Actions-based Pages right now would
break the currently-live, currently-working app on the day it's flipped.

`.github/workflows/deploy-react-port.yml` (at the repo root, not in this
folder) is written to avoid that: it assembles a combined artifact — the
entire existing repo root, byte-for-byte unchanged, **plus** this port's
build output at `/react-preview/` — so nothing that works today would break
even once this is turned on. It's currently `workflow_dispatch`-only (manual
trigger, not automatic on push) on purpose, until there's something worth
looking at. See the comments in that file for the actual steps to go live
when the time comes.
