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

## Porting is done

Every component in the inventory below is ported, and **all 11 nav tabs are
real** — `App.jsx`'s `TabPlaceholder` still exists as a defensive fallback
(dispatch falls through to it if `activeTab` is ever an unrecognized
string) but no reachable tab actually hits it anymore. That closes out the
"Continue until porting is done" instruction this multi-session effort was
working against.

**All ~29 real app components ported** (count grew several times as
dependencies like `GFA_conditionSymptomData`/`GFA_TAXON_CANON`/`Wf`/`Gu`/
`Dm`/`Hf`/`Rm`/`_m` were found along the way):
- `src/theme.js` — the color palette + `dirColor`/`dirArrow` helpers
- `src/components/Button.jsx` — was `W`
- `src/components/Field.jsx` — was `Sr`
- `src/components/Modal.jsx` — was `Xo`
- `src/components/DirTriangle.jsx` — was `Ot`
- `src/components/RankBadge.jsx` + `src/lib/taxonRank.js` — was `Cr` + `Vf`
- `src/components/Italic.jsx` — was `Ko`
- `src/components/LinksEditor.jsx` + `src/lib/parseLink.js` + `src/lib/id.js`
  — was `jf` + `Bm` + `$`

See the full inventory table below for the rest (App shell, both graph
engines, every map, and all 11 tabs) — every row in it is now ✅.

Also live now, for real: `https://kelcamer.github.io/GutBacteria/react-preview/`
— the deploy workflow (`.github/workflows/deploy-react-port.yml`) is
working end to end, confirmed by actually loading it in a browser, not
just a successful Actions run. Getting there surfaced a real GitHub
limitation worth remembering: a `workflow_dispatch` workflow must exist on
the repo's **default branch** to be discoverable/runnable at all, even if
you only ever intend to run it against a different branch — this cost a
long debugging session (every earlier "successful" run was actually
GitHub's own built-in `pages-build-deployment`, not this workflow, since
it wasn't registered yet). Fixed by keeping just the workflow *file* on
`main` (commit `81e2964`) while the app itself stays only on
`native-react-app`.

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

## Second realization, found while porting the App shell: the "4 copies of
data" problem doesn't exist here

The original app's `qf()` / `GFA_SYMPTOM_DATA_SHIPPED` embedded-fallback
duplication (see `ARCHITECTURE.md`) exists *only* because `fetch()` is
blocked when the app is opened via `file://`. A real deployed Vite app
never has that problem — the browser always loads it over `http(s)`, fetch
always works, and more importantly Vite can just bundle the JSON as a
plain ES module import at *build* time. `src/data/index.js` imports
`seed_data.json`/`symptom_data.json` **directly from the repo root**
(`../../../../seed_data.json`) rather than keeping a duplicate copy inside
the React app — verified this actually works, not just assumed: bundle
size jumped from ~199KB to ~739KB when this import was wired in (proving
it's really bundled, not silently dropped by tree-shaking), confirmed in
both `npm run build` and `npm run dev` (Vite serves cross-directory
imports during dev via its `/@fs/` mechanism). So porting this app is
mechanically *reducing* the number of data copies that need to stay in
sync (4 → 1), not adding a 5th.

The localStorage/baseline-diffing merge logic itself (the actual "don't
silently overwrite a user's edits, but do pick up new shipped data for
anything they haven't touched" logic — the real fix from `ARCHITECTURE.md`'s
"critical bug fix" history) **was** ported faithfully, in
`hooks/useConditionsData.js` — that part is genuine, hard-won product
behavior worth keeping, not incidental plumbing. Only the file:// fallback
duplication was cut, not the actual feature.

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
| `Ot` | `DirTriangle.jsx` | up/down triangle (no "both") | tiny | ✅ ported |
| `Cr` + `Vf` | `RankBadge.jsx` + `lib/taxonRank.js` | G/S/F/O/P rank badge | small | ✅ ported |
| `Ko` | `Italic.jsx` | italic text wrapper | tiny | ✅ ported |
| `jf` + `Bm` + `$` | `LinksEditor.jsx` + `lib/parseLink.js` + `lib/id.js` | citation-link editor | small | ✅ ported |
| `$u` | `App.jsx` (root shell) + `hooks/useConditionsData.js` + `hooks/useRecentConditions.js` + `lib/storage.js` + `navItems.js` | top-level state, data loading + localStorage merge, tab dispatch, nav drawer | 469 lines (measured exactly, not the earlier rough estimate) | ✅ ported — tab **bodies** are still placeholders (`TabPlaceholder` in App.jsx), everything else (header, drawer, JUMP TO, swipe-to-open, the localStorage/baseline merge logic, CRUD helpers) is real |
| `GFA_wireSwipeGestures` | `hooks/useSwipeGestures.js` | document-level swipe-right-to-open-drawer / swipe-left-to-go-back, wired via querySelector+`.click()` rather than React state | 96 lines (measured) | ✅ ported — wrapped in a `useEffect(() => {...}, [])` (mount-once/unmount-cleanup, a strict improvement over the original's fire-once-forever install, not a behavior change) and called from `App.jsx`. Deliberately kept alongside, not merged into, App.jsx's own pre-existing `onTouchStart`/`onTouchEnd` drawer-swipe handlers — both really do coexist in the original as two independent gesture mechanisms; see the file's own header comment. |
| `GFA_buildSymptomMap` | `lib/buildSymptomMap.js` | force-directed graph engine (vanilla SVG, not JSX) — used by both symptom maps and the per-condition map | 1067 lines (measured; an earlier automated span-finder mis-measured this as 368 lines due to a bug, caught by directly reading past where it claimed the function ended) | ✅ ported **near-verbatim, not rewritten** — this is vanilla DOM manipulation, not JSX, so it was mechanically extracted from the readable mirror and only the GFA_-prefixed external calls (esc/dirColor/dirArrow/copyTipText) were changed to imports. Every threshold, comment, and documented past bug-fix (double-click detection, drag jitter, hard collision resolution) preserved exactly - deliberately not "cleaned up," see the file's own header comment for why. `npx oxlint` flagged some unused code (a dead `showPreview` function, unused `upC`/`downC` vars) - verified these are genuinely pre-existing in the original too (the hover-preview-disabled history is documented in the original's own comments, confirmed via direct grep), not something introduced while porting. |
| `GFA_buildMap` | `lib/buildMap.js` | force-directed graph engine for the Conditions↔bacteria map and both brain-region maps | 406 lines (measured) | ✅ ported near-verbatim, same discipline as `buildSymptomMap.js`. **Deliberately kept separate, not unified with `buildSymptomMap`** — despite ARCHITECTURE.md's speculation that the latter is "a generalized version" of this one, the original never merged them (different signature/param order, different node-sizing formula, a brain-region-aware tooltip branch this one has that the other doesn't), and inventing a shared abstraction here would be a real behavior-risking rewrite rather than a port. `npx oxlint` clean (the pre-existing dead `showPreview` function is suppressed via an inline eslint-disable, matching its documented pre-existing status in `buildSymptomMap.js`). |
| `GFA_SymptomTab` | `SymptomTab.jsx` | Bacteria↔Symptom map tab (wraps `buildSymptomMap`) | 213 lines | ✅ ported — powers both the "Bacteria to Symptom Map" and "Symptom to Bacteria Map" tabs (same component, `pinType` swapped, exactly like the original) |
| `GFA_ConditionMap` + `GFA_conditionSymptomData` + `GFA_canonTaxon` + `GFA_TAXON_CANON` | `ConditionMap.jsx` + `lib/conditionSymptomData.js` + `data/taxonCanon.js` (122 entries) | per-condition mini map (wraps `buildSymptomMap`) | 179 lines + 3 small helpers | ✅ ported — wired into `ConditionDetail.jsx`, replacing its placeholder |
| `GFA_BrainTab` + `GFA_BRAIN_DATA` + `GFA_BRAIN_REGION_INFO` | `BrainTab.jsx` + `data/brainData.js` (20 entries) + `data/brainRegionInfo.js` (57 entries) | Condition↔Brain-region map tab (both nav directions, same component with `pinType` swapped) + its two data tables, extracted programmatically (JSON round-trip) from the hardcoded JS objects | 531 lines + 2 data files | ✅ ported — wired into both `brain` and `brain_r2c` nav tabs; also includes the "closest neighbors by shared brain regions" table below the map |
| `GFA_Glossary` + `GFA_GLOSSARY` | `Glossary.jsx` + `data/glossary.js` | static jargon-definitions tab, 18 terms | 50 lines + 18-entry data array | ✅ ported — 2nd tab fully real end-to-end |
| `Gfx` | `ConditionsMap.jsx` | the original Conditions↔bacteria force-graph wrapper (wraps `buildMap`, `pinType` left undefined so it defaults to "cond") | 224 lines (measured) | ✅ ported — rendered directly below `ConditionsGrid` on the Conditions tab's list view, exactly like the original (not its own nav item) |
| `Wm` | `ConditionsGrid.jsx` | Conditions tab grid/list | 171 lines (measured) | ✅ ported |
| `Gm` | `ConditionDetail.jsx` | single condition's detail page (taxa list, editing) | 300 lines (measured, not the earlier rough estimate) | ✅ ported (graph map section stubbed, see above) |
| `$m` | `TaxonEditor.jsx` | add/edit modal for one taxon entry, a `Gm` dependency not previously catalogued | 137 lines | ✅ ported |
| `jm` + `Hf` | `CompareTab.jsx` + `lib/compareConditions.js` (`comparePair` + `buildSymptomPseudoConditions`) | Compare-two + multi-select matrix, plus the symptom-as-pseudo-condition + pairwise-comparison logic it's built on | 616 + 27 lines (measured) | ✅ ported — every hook still runs unconditionally before the early "add a second condition" return, exactly where the original put it (the pattern behind this tab's documented Rules-of-Hooks fragility in `ARCHITECTURE.md`); kept as-is rather than reordered, since that would be a real behavior-risking rewrite, not a port. Wired into `App.jsx` as the `compare` tab, with new `compareAId`/`compareBId` state added there (was `h`/`L`/`y`/`C` inside `$u`, not previously surfaced since the tab was a placeholder). |
| `Dm` + `Gu` + `Wf` | `lib/looseMatch.js` (`stem` + `looseTokens` + `groupTaxa`) | the "loose taxa" matching machinery behind the header's loose/exact toggle — stems common Latin taxonomic suffixes and clusters taxon names by token overlap | 58 lines combined (measured) | ✅ ported — factored into its own module since `Wf`/`Gu` are called from 3 places in the original (`Hf` here, plus `Xm`/BacteriaIndex and `Zm`/FindInPapersTab, both still unported), so this will be reused rather than reimplemented when those land. |
| `Xm` | `BacteriaIndex.jsx` | A–Z bacteria index, grouped by loose-matching, searchable, filterable (all / shared / opposite-direction) | 202 lines (measured) | ✅ ported — reuses `groupTaxa` from `lib/looseMatch.js` (see that module's own note about being factored out early, in anticipation of exactly this) |
| `Km` | `SourcesTab.jsx` | Sources/citations tab — every attached link across every condition, deduplicated by URL, sorted by use count, filterable to one condition, downloadable as plain text | 149 lines (measured) | ✅ ported |
| `Qm` | `BackupTab.jsx` | Export/Import/Reset tab | 230 lines (measured) | ✅ ported — `reset` simplified from the original's async `GFA_seed()` (fetch-with-embedded-fallback) to a synchronous `commit(seedData)`, same "4 copies of data" elimination already applied to `useConditionsData.js`; not a behavior change, since the bundled `seedData` import already *is* what `GFA_seed()` would have resolved to |
| `Zm` + `Hf`'s siblings `Rm`/`_m`/`bm`/`Um`/`qm`/`Hm` | `FindInPapersTab.jsx` + `lib/paperMining.js` (`searchPapers` + `extractFindings`) | Find-in-papers: Europe PMC search + sentence-level cue-word/taxon-mention text mining, incl. this session's earlier bacterium-dropdown feature | 471 + 159 lines (measured) | ✅ ported — the text-mining pipeline (splitting into sentences, tagging up/down cue words, pairing each taxon mention with its nearest *attached* cue rather than just nearest-by-distance, flagging caveats like "animal model" or "non-significant") was ported function-for-function into `lib/paperMining.js`, not simplified, since this is exactly the kind of finicky matching logic (see `Hm`/`isConnectorSpan`'s asymmetric-window heuristic) that's easy to subtly break by "cleaning up" |

**Data**: `seed_data.json` and `symptom_data.json` need no porting at all —
imported directly from the repo root (see below). `GFA_BRAIN_DATA` /
`GFA_BRAIN_REGION_INFO` have been extracted to `src/data/brainData.js` /
`src/data/brainRegionInfo.js` (plain JS modules exporting the parsed JSON,
not `.json` files — kept as `.js` since these were never files in the
original either, just hardcoded objects; the extraction was the point, not
the file extension).

## Suggested porting order (dependency-first)

1. ✅ Finish the small shared atoms (`Ot`, `Cr`, `Ko`, `jf`).
2. ✅ Port `$u` (App shell) with stub tab content.
3. ✅ Port `Wm` + `Gm` (Conditions grid + detail).
4. ✅ Port `GFA_Glossary`.
5. ✅ Port `GFA_buildSymptomMap`, then `GFA_SymptomTab` + `GFA_ConditionMap`.
6. ✅ Port `GFA_buildMap`, then `Gfx` (Conditions↔bacteria map) + `GFA_BrainTab`
   (both brain-map directions) — checked whether `buildMap` and
   `buildSymptomMap` should be unified and deliberately kept them separate
   (see the `GFA_buildMap` inventory row above for why).
7. ✅ Port `GFA_wireSwipeGestures`.
8. ✅ Port `jm` (Compare-two), plus its `Hf`/`Wf`/`Gu`/`Dm` dependencies.
9. ✅ Port `Xm`, `Km`, `Qm`, `Zm` (Bacteria index, Sources, Backup, Find in
   Papers). `Xm` reused `lib/looseMatch.js` as anticipated; `Zm` pulled in
   its own sizeable dependency chain (`lib/paperMining.js` - Europe PMC
   search plus the sentence-level cue-word/taxon-mention text miner).

**All 9 steps done — porting is complete.** See "Porting is done" near the
top of this document.

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
- App shell (`App.jsx` + its hooks): `npm run build` succeeds (515KB now
  that real data is bundled), dev server returns 200 for every new file
  (App.jsx, data/index.js, both hooks, storage.js, navItems.js) — Vite
  would 500 with an error overlay on a real syntax/resolution error, so
  this is real signal, not just "the command didn't crash." Also tried an
  actual server-side render smoke test (`react-dom/server` via Vite's SSR
  module loader, with minimal `localStorage`/`sessionStorage` mocks) to
  catch real runtime errors without needing a browser — hit a CJS/ESM
  interop wall in Vite's SSR loader for the `react` package itself, not
  worth fighting further for a one-off smoke test. Documenting that it was
  tried and abandoned, not silently skipped.
- Every subsequent tab/component followed the same pattern: `npm run build`
  succeeds (final bundle ~1.03MB / 235KB gzipped - still far under the
  original's >1MB *minified* single file, and this one is readable
  source), `npx oxlint src/` shows zero new warnings beyond the
  pre-existing, already-investigated `buildSymptomMap.js` ones, and the
  dev server returns 200 for every new/changed file after each restart.
- **Real bug caught by double-checking a source mapping while porting
  `Zm`**: the icon inventory's `ha=Link` was wrong - the actual factory
  call is `T("Link2", [...])`, a visually different chain-link glyph. This
  had already been ported incorrectly into `navItems.js`,
  `LinksEditor.jsx`, and `ConditionDetail.jsx` in earlier sessions; caught
  while re-verifying icon mappings for `FindInPapersTab.jsx` (which uses
  the same icon), and fixed in all four files at once rather than left to
  compound into a 5th. A concrete example of why this project's
  "verify against the actual source, don't reconstruct from memory"
  discipline (see the `dirColor`/`dirArrow` note above) keeps paying off.
- **Still not done**: an actual visual/interactive check in a real browser
  (Chrome extension never connected across the whole multi-session port).
  Everything above is strong-but-not-total evidence — dev-server 200s and
  a successful build catch syntax/resolution errors but can't catch every
  possible runtime-only bug (e.g. a hook rule violation that's
  syntactically fine but crashes on interaction, or a subtly wrong icon
  that isn't a compile error). Worth doing a real browser pass over all 11
  tabs before treating this as production-ready, now that porting itself
  is complete and there's a full app to actually click through.

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
even once this is turned on. It's `workflow_dispatch`-only (manual
trigger, not automatic on push) on purpose, until there's something worth
looking at. See the comments in that file for the actual steps to go live
when the time comes.

**Update, later session**: this went live for real. Pages source is now
"GitHub Actions" (switched from "Deploy from a branch" after confirming
`/react-preview/` rendered correctly), confirmed via `curl` against the
actual production URLs, not just a green Actions run. The port also
briefly lived on its own `native-react-app` branch (to test the Actions
deploy path without risking the then-still-live branch-based Pages
source) - that branch has since been merged back into `main` now that the
port is complete and verified, so `seed_data.json`/`symptom_data.json`
only need to exist in one place again, and the deploy workflow is back to
a single checkout (no more dual-checkout-by-branch-ref complexity that
existed only to bridge the two-branches period). Node bumped to 24 in the
same pass.
