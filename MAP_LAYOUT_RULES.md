# Map layout rules

How the node maps are arranged, why, and what to do when adding nodes so the map degrades gracefully instead of turning into a hairball. Written after a long session of iterating on the Symptom → Bacteria map with the person who actually uses it.

Implementation lives in `Porting to native react/app/src/lib/buildSymptomMap.js` (search the comments for the phrases quoted below). This file is the *why*; the code is the *how*.

---

## The one idea everything else follows from

**Position must mean something.** A force-directed graph left to itself puts nodes wherever the springs settle, which is nowhere in particular. Every rule below takes one axis, one region, or one side and assigns it a meaning, so that where a node *is* answers a question before you read a single label.

If you add a feature that moves nodes for aesthetic reasons alone, you are spending the map's only currency and getting nothing back.

---

## 1. The rim: things you HAVE vs things you TAKE

- Conditions, symptoms and genotypes (**things you have**) occupy one contiguous arc, centred **top-left**.
- Interventions (**things you take**) occupy the opposite arc, centred **bottom-right**.
- Each arc is sized to its share of the rim and **centred on its own side**, so the split stays symmetrical as either group grows.

The band of shared taxa then runs corner to corner — the longest line available, and therefore the one with the most room for labels.

**Adding a rim node:** put it in the right group (`isIntervention()` in `lib/interventions.js` decides) and it places itself. Do not hand-position it unless there is a stated reason.

## 2. The horizontal axis means direction of effect

Taxa with 2+ connections are held at **exactly one y**, forming a single row, and their **x** encodes what the conditions do to them:

| Position | Meaning |
|---|---|
| Far left | **Contested** (yellow) — parked out of the way |
| Left | **Decreased** by the conditions |
| Centre | Mixed |
| Right | **Increased** by the conditions |
| Far right | **Null** (grey) — tested, no reliable effect, parked out of the way |

Only edges to the *conditions* group count toward the score. Intervention edges are deliberately excluded — otherwise an organism drifts toward "fine" precisely *because* something corrects it, which buries the finding the row exists to show. The intervention edges then visibly reach across the row to the organisms that need them.

**Yellow and grey are parked at the edges on purpose.** Neither tells you what an organism is doing. They are real findings but not actionable ones, so they get the periphery and the actionable middle stays legible. Both can be hidden entirely from Settings.

## 3. Horizontal beats radial, because reading is horizontal

Eyes track left to right; labels are horizontal text. A cloud of nodes forces the eye to hunt in two dimensions and re-fixate constantly, which is what makes a dense graph tiring rather than merely busy. A single row converts that into one sweep.

Three settings enforce it, and they only work together:

1. **Anisotropic centring** — weak pull horizontally (nodes spread wide), strong pull vertically (they flatten onto the line).
2. **A hard row** — 2+ connection nodes are clamped to one y *after* all other forces run. A spring alone yields a band, not a line: repulsion and overlap resolution keep nudging nodes off it.
3. **Horizontal label separation** — nodes close to sharing a row push apart along x until they clear a label's width. Crowding hurts sideways far more than vertically, because that is the direction text occupies.

## 4. Satellites go outward

A taxon connected to exactly one node is that node's satellite. It is pushed **along the line from the map's centre out through its parent** — so above a node at the top, below a node at the bottom, always on the far side from everything else.

"Outward" rather than "up" is what makes this survive a node moving. It also keeps satellites out of the shared row, which is the only place they could do damage.

## 5. Labels

- Alternate sides by a **fixed index parity**, not by position — a label must never flip sides as the simulation settles.
- **Never** point a lone node's label into the crowd; satellites label away from the map.
- Slight overlap in the densest patch is **accepted deliberately**. The engine's collision avoidance (`forceAllLabels: false`) was tried and reverted: it drops labels entirely rather than moving them, leaving a field of anonymous dots. Overlapping text beats no text.

## 6. Motion

- **Dragging must not restart the simulation.** Resetting `alpha` to 1 on pointer-move re-fires every spring and the whole graph visibly expands. Top the energy up only enough for neighbours to give way (`alpha = max(alpha, 0.12)`) and leave the tick count alone.
- **A dropped node rejoins the physics.** Freezing it (`manualPin`) switches the magnetism off for exactly the node the user just touched, which reads as the feature breaking.
- **Snap back means everything back** — hidden nodes restored, picker cleared, layout relaid. One button, one known state.
- **No rim node may sit level with the inner row.** A rim node on the row's line runs its edges *along* the row rather than across it, hiding the links behind the nodes they connect.
- **Status text must not recite counts.** Any banner describing behaviour should describe the behaviour, not the current selection's numbers — those move on every change and read as stale even while correct.

---

## Adding new nodes without creating chaos

Work through these in order. Most "the map is a mess" problems are one of the first three.

1. **Is it a rim node or an inner node?** Rim = something you have or take (a condition, symptom, genotype, intervention). Inner = an organism. Rim nodes are cheap — the arc absorbs them. Inner nodes are the ones that crowd.

2. **If it is an intervention, add it to `INTERVENTION_NAMES`.** Miss this and it silently files under conditions, lands on the wrong arc, and drags its taxa the wrong way along the axis. This has already happened once (2'-FL in CompareTab).

3. **Check the rank before adding.** Genus, species, family and phylum nodes all coexist here, and mixing them is the single largest source of nonsense — a phylum node averaging members that move in opposite directions is not a finding. See `MEMORY`/`taxonomic-rank-discipline`: check rank, sample site, and nomenclature era before believing two studies disagree. Prefer the rank the study actually measured.

4. **Watch the node count — the y-axis rules switch themselves off.** The single row, the vertical flattening, and the rim-clearance band all apply only at **5 or fewer rim nodes**; above that the map falls back to ordinary force layout, because there is no longer horizontal room for a row to hold the taxa. (Rim count is the trigger because it is knowable *before* layout; taxa count is not.) Within a small map, a straight row and complete labels still start conflicting at roughly **20 taxa** at current label widths — past that, accept overlap or stagger into two rows using the same index parity that picks label sides. Do not solve it by dropping labels.

5. **Never add a direction you cannot source.** Four directions exist: up, down, contested (`both`), and null (`none` — tested, no reliable effect). Reach for `none` when studies looked and found nothing; reach for `both` only when studies genuinely disagree *after* you have ruled out rank/site/nomenclature differences. Do not use `both` as a shrug.

6. **Re-run the pipeline.** `propagate_cross_feeding.py --write`, `annotate_evidence.py --write`, then the checks. Derived data is regenerated from scratch every run, so a new measured entry correctly suppresses inferences that contradict it.

7. **Look at it.** Build, open the map, and check the three failure modes: taxa balled up in one corner, labels stacked into a single strip, and edges crossing the row to reach nodes parked on the far side. Each maps to one rule above.

---

## Preferences vs rules

A few positions are **hand-chosen for the default view** and named as such in the code: the FUT2 / ADHD / Iron deficiency slot swaps, and levelling Iron deficiency with LNT. These are preferences about where a person wants to look, not anything derivable — they are marked so a future session does not mistake them for computed behaviour and "fix" them. Everything else in this document is a rule, and should hold for any selection.
