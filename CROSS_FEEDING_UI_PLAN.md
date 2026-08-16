# Plan: draw cross-feeding edges as purple lines

**Status:** data layer done (`cross_feeding.json`), UI not started.

Deliberately not begun at the end of a long session — this touches
`buildSymptomMap.js` / `buildMap.js`, the two engines responsible for most of
this project's historical bugs (pointercancel clearing selection, scroll-vs-drag
pointer capture, the rAF/tab-focus phantom stacked nodes). Both are ~1000 lines
of vanilla SVG with fragile pointer handling. Start this fresh, not tired.

## Concept

Existing edges answer *"this taxon moves with this symptom"* — pink for
increased, blue for decreased. Cross-feeding edges answer a different question:
*"this taxon feeds that one."* Different relation, so it needs a visually
distinct channel rather than another shade of the same thing.

**Purple**, dashed, drawn beneath the existing edges.

## Where to hook in

`buildSymptomMap.js` structure (verified):

| Line | What |
|---|---|
| ~129 | `nodes.push(n)` — symptom nodes |
| ~153 | `nodes.push(bNode)` — bacterium nodes |
| ~167 / ~189 / ~211 | `edges.push(...)` — up / down / both |

Add a **fourth** edge-construction block after ~211. Do **not** modify the
existing three.

## Algorithm

```
import cfData from '../../../../cross_feeding.json'

// after bacterium nodes exist:
const byName = new Map(nodes.filter(n => n.kind === 'bact').map(n => [n.name, n]))
for (const e of cfData.edges) {
  const a = byName.get(e.from), b = byName.get(e.to)
  if (!a || !b) continue            // only draw when BOTH ends are on screen
  edges.push({ from: a, to: b, kind: 'crossfeed', meta: e })
}
```

Then in the render pass, branch on `kind === 'crossfeed'`:

- `stroke: #A78BFA` (purple, distinct from pink `#FF5C86` / blue `#4FC3F7`)
- `stroke-dasharray: 4 3` — reads as "indirect", and stays legible if a
  colour-blind viewer can't separate purple from pink
- `stroke-opacity: 0.55`, thinner than a symptom edge
- render **before** the symptom edges so it sits underneath
- **exclude from the force simulation** — these are annotations, not layout
  constraints. Letting them pull nodes together would silently change every
  existing map's geometry, which is the single biggest risk here.

## Gotchas

1. **`from`/`to` are not always taxa.** `cf_host_veillonella` starts at
   "host exercise-derived lactate" and `cf_psilocybin_community_butyrate` ends at
   "community butyrate pool". Skip any edge whose endpoint doesn't resolve to a
   node — the `if (!a || !b) continue` above handles it, but don't "fix" it by
   inventing pseudo-nodes without deciding that deliberately.

2. **Directionality is real.** Cross-feeding is one-way (A's waste feeds B). If
   the engine draws undirected lines, add an arrowhead or the map will imply a
   mutual relationship that doesn't exist.

3. **Genus vs species.** The edges say `Bifidobacterium` (genus) but the
   underlying studies used *B. bifidum* and *B. infantis*. The node is the
   genus, so it will draw — but the tooltip must carry the strain caveat or the
   map overstates what was shown.

4. **Two engines.** `buildSymptomMap.js` covers SymptomTab, ConditionMap and
   BacteriumFocusMap. `buildMap.js` covers ConditionsMap and BrainTab. Do
   buildSymptomMap first, confirm on one map, then port.

5. **Legend.** Every map's lead paragraph currently explains pink/blue. Adding a
   third line type without updating that text makes the map less readable, not
   more.

## Verification (not optional)

Both engines have shipped subtle regressions this session. Before committing:

- a map with **neither** endpoint present renders unchanged (no stray lines)
- a map with **one** endpoint present renders unchanged
- a map with **both** present shows exactly one purple dashed line
- node positions are **identical** to before with the feature off — proves the
  edges aren't feeding the simulation
- drag, tap-to-pin, background-clear and zoom all still behave

That last row matters most: those are the exact behaviours previously broken.

---

## Filter toggle (BUILT — UI only, engine pending)

Superseded the earlier two-button idea. One toggle is simpler and encodes the
right default: **proven data only, unless you ask otherwise.**

- Single button that flips label: **🔀 Show Cross-Feeders** ⇄ **🚫 Hide Cross-Feeders**
- **Default: cross-feeders HIDDEN** (`showCrossFeed = false`)
- Lives in `MapControls.jsx`'s `overflow` array, so it renders inline on desktop
  and inside the `⋯ More` popover on mobile, alongside the other filters

Rationale for the default: cross-feeding links are *inferred* from metabolic
relationships, not measured in the condition or symptom they appear under. The
atlas should show what was observed unless the user deliberately asks for the
inferred layer.

Same shape as the existing filters: `graphRef.current?.showProvenOnly?.()` and
`showCrossFedOnly?.()`, matching `showIncreasedOnly` / `showDecreasedOnly`.
Put them in the collapsed `⋯ More` group on mobile — the visible row is already
at two buttons by design.

### Remaining work, in order

1. **Derived data.** Propagate cross-feeding across the 92 targets, writing
   `derived: true` on every generated link. Never derive over an observation.
2. **Engine method `setCrossFeedVisible(bool)`** in `buildSymptomMap.js` and
   `buildMap.js`, alongside the existing `showIncreasedOnly` /
   `showDecreasedOnly` / `hideIsolatedNodes`. It should hide/show links whose
   `derived` flag is set, and respect the hidden default on first build.
3. Nothing else — the button is already wired.

**The button is currently inert by design.** All five maps call
`graphRef.current?.setCrossFeedVisible?.(v)`; optional chaining makes it a safe
no-op until step 2 lands. That is acceptable *only* because there is also no
derived data yet, so "hidden" is both the default state and the truthful one —
there is genuinely nothing to hide. Once step 1 adds derived links, step 2 must
land in the same session, or the toggle will silently fail to hide real data.

### Why these toggles are the payoff for `derived: true`

This is the concrete reason derived entries need a structured flag rather than
just a prose line at the top of the popup: prose cannot be filtered. The whole
point of propagating cross-feeding across 92 targets is being able to collapse
back to measured-only in one tap when you want to know what is actually
observed versus inferred.
