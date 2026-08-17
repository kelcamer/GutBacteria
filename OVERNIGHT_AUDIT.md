# Overnight audit — branch `overnight-audit-2026-08-17`

Four roles, one branch. Everything below was found by checking, not by
assuming — including the parts where the checks turned out to be wrong.

---

## 🔬 Data engineer

### Contradictions the app was presenting as fact

**Parkinson's / Escherichia-Shigella appeared twice with opposite directions.**
One entry said decreased (GMrepo, n=378 PD vs 293 healthy), another said
increased (systematic review, 26 studies). The map drew the same taxon as both,
in the same condition, with nothing indicating a problem. Merged to `both` with
each side cited — this is genuine equipoise.

**Anxiety / Lactobacillus said UP on the Conditions screen and DOWN on the
Symptom map.** The app gave opposite answers depending on which screen you were
on, both looking equally authoritative.

**FUT2 / Streptococcus was a category error.** It read UP citing increased
susceptibility to *S. pneumoniae* **infection** — a clinical susceptibility
finding, not gut abundance, which is what the field encodes. The abundance
evidence points the other way. Corrected; the pneumococcal finding retained as
context.

**Iron deficiency / Bacteroides showed the animal direction as the headline.**
Marked DOWN, while its own note said "decreased in rodent models; human data
show it HIGHER when ferritin is low". With the new *Human studies only* filter
on, that is exactly the finding a user asked not to see, presented as the
answer. Now `both`, human direction called out.

Plus two duplicate-entry merges and one orphaned duplicate removed.

### The classifier was wrong in the dangerous direction

The evidence tiers were inferred from free text. v1 read ref and note as one
blob, so entries got tagged `animal` on the strength of a **supporting** mouse
experiment. The clearest case: *Faecalibacterium / Chronic pain*, whose note
reads "depleted in fibromyalgia; FMT from patients into mice induced pain
sensitivity" — a human study with mouse validation, tagged animal. Turning on
*Human studies only* would have **hidden a human fibromyalgia finding** while
the map still looked complete.

Hiding real evidence is worse than showing uncertain evidence, because nothing
signals the absence. v2 classifies from the ref first and lets human beat an
animal follow-up. Animal tags dropped 40 → 19.

### Where my own checks were the problem

A detector for notes contradicting their direction field flagged **32**. Thirty-one
were false positives *in the check*:

- "higher in controls than in MDD (**i.e. depleted in depression**)" reads as an
  increase to a naive regex
- "Reduced abundance contributing to **elevated** cardiovascular risk" — the
  elevation is the risk, not the taxon
- worst of my own bugs: **"sulfate-reducer"** and **"reduces tight-junction
  protein"** both matched a direction word

Refining cut it to 18; reading those left **exactly one** real problem (the iron
entry above). Worth recording: the data held up under adversarial checking far
better than the checking did.

---

## 🎨 UI

- **94-pill picker wall → collapsible searchable sections.** Counts in headers,
  filter box past 12 items, selected pills hoisted to the front, per-section
  selected badges. Extracted as one shared `PickerSection` — the previous
  duplication is exactly how INTERVENTIONS went missing from Compare for a
  whole session.
- **iOS auto-zoom bug.** Safari zooms the page when a focused input is under
  16px; the new filter boxes were 14px, so tapping one silently zoomed the
  layout. All inputs forced to 16px on mobile.
- **Dead-feeling buttons.** No hover on touch meant presses had no feedback.
  Added a 0.975 active scale gated behind `(hover: none)`, with a proper
  reduced-motion opt-out.
- Theme-matched tap highlight (iOS paints grey boxes on dark themes), momentum
  scrolling and overscroll containment on the five map wrappers, theme-matched
  selection colour.
- **`FilteredEmptyState`** — a filtered-empty map now explains itself. Turning on
  *Human studies only* empties the Psilocybin map entirely, and that is a
  genuine finding (no human psilocybin gut studies exist), not a rendering
  failure. The app now says which.

---

## 🧭 Manager — where the two collided

**The old single-file app was presenting inference as measurement.** The React
port hides derived cross-feeding links behind Settings; `gut-flora-atlas.html`
has no such UI, and the sync script was faithfully embedding all 236 of them
where they rendered identically to measured findings. The landing page still
labels that file "current app", so it is the version most people would open.

`sync_embedded_data.py` now strips derived entries before embedding. Nothing is
lost — they remain in the JSON and in the port that can express the distinction.

That fix then broke `make_readable.py`, whose verifier compared against the raw
JSON and began reporting a permanent, expected mismatch — the kind that trains
people to ignore a check. Now imports the same `strip_derived()` so the two
agree by construction.

---

## 🐛 QA

| Bug | Why it was invisible |
|---|---|
| CompareTab never migrated to global filters | Build and lint passed; Settings silently did nothing on that one screen |
| MapControls' crossfeed toggle rendered but nothing passed the handler | The guard hid it, so a control vanished from five maps without erroring |
| `entryPasses` dereferenced `filters` directly | Any component missing the prop would blank an entire map |
| Readable verifier vs stripped data | Would have reported failure forever |
| My own wiring guard searched a 400-char window | Matched the *next* component's prop and concluded the work was done |

Stress-tested the degenerate case — every filter on at once: 0 conditions
emptied, 16 bacteria left with no links, 3 symptoms left with none.

---

## Still open

- **~30 `both` entries citing only one source.** Equipoise needs two sides; a
  single citation suggests some are weak dissent mislabelled as balance.
- **512 entries still `unclassified`** by evidence tier. The classifier refuses
  to guess, which is right, but hand-checking the ~80 touching the personally
  relevant conditions would pay off most.
- **Phascolarctobacterium** remains the best unexplained finding: asaccharolytic,
  obligately dependent on Bacteroides for succinate, yet rises 3-for-3 when
  Bacteroides falls.
