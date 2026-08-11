# Need to Implement — App Update Ideas, August 10 2026

Everything below is still open from the Aug 10 2026 request. Working top-to-bottom per your instruction; will update this file as items land (see `IMPLEMENTED.md`).

## Blocked
- **"Update the seed data with this: [image]"** — no image or attachment actually came through in the original message. Can't act on this until it's resent.

## In progress / needs more work
- **Bipolar 3-way split** (Bipolar Euthymic / Bipolar Currently In Depression / Bipolar Currently Manic) in the gut bacteria node map. Literature search so far: found good depression-state sources (Lu et al. 2019 — this explains most of the current single "Bipolar Disorder" entry, whose own note already says "most primary cohorts sampled during a depressive episode"), but genuinely struggled to find discrete, clean *euthymic-specific* or *manic-specific* primary studies — most bipolar microbiome papers pool across mood states or focus on depression specifically. Evans et al. 2017 (PMID 27988330) is a mixed-state severity-correlation study (not a discrete state comparison). Options going forward: (a) keep searching for state-stratified studies, (b) build the 3 entries with honestly thin euthymic/manic evidence and a clear caveat note (matching how thin entries like Wim Hof Method were handled elsewhere in this app), or (c) reconsider scope with you first.
- **Bipolar contradiction claims from the request, still unresolved**: the Firmicutes/Bacteroidetes "age-dependent flip" (the source review attributes this to MDD, not bipolar specifically — may be worth adding to the *Depression* entry instead, where it actually applies), and the Bacteroides "bibliometric" claim (that source is a citation-pattern analysis, not a data source — would need to trace back to whichever primary studies it's summarizing, if any, to verify).

## Not started yet
- **Brain region → condition map**: add a summary below "N Taxa mapped" (or wherever the region count shows) synthesizing what the collective increases/decreases across a condition's brain regions would likely present as, from a symptoms perspective.
- **Region description formatting**: reformat brain-region popup text as `<arrow> - <description>` (dash after the arrow, description written for a reader who doesn't know what the region is). Add a copy-to-clipboard button near the top of that text.
- **OCD ↔ Anorexia Nervosa recent research** — not yet checked for a direct connection on the brain map (both conditions exist there separately; haven't looked for a shared-circuit paper linking them specifically).
- **Clickable citation links**: the "Compare two conditions" screen under the Gut Flora Atlas (not the brain map) shows citations as plain text (e.g. "He 2025") rather than as links — needs investigation into the `Hf`/`jm` compare-conditions component to find exactly where this renders and wire in the actual URL. (Also worth double-checking the brain map's own Closest Neighbors table doesn't have the same issue, though it currently shows same-dir/diverges counts rather than citation labels.)
- **3 new symptoms**: low vitamin D, weight gain, weight loss — added to the symptom list but research not yet landed on clean, specific, human-data sources (searches so far surfaced mostly broad reviews and F/B-ratio-adjacent claims, which this app already treats cautiously per its own Glossary entry on F/B ratio reproducibility). Needs another research pass.
- **Final full audit**: go through every one of the 32 conditions and look for direction contradictions in the wider literature, using `seed_flora_gemini.json` as one reference source (per your instruction: not a wholesale merge, just a comparison source) alongside fresh searches. This was explicitly framed as the last item ("if you still have tokens at the very end") — still the plan, will do it last.

## Explicitly confirmed NOT contradictions (verified, no action needed)
- Bipolar's existing Bacteroidetes-up/Firmicutes-down direction — matches Lu et al. 2019's own primary finding, not contradicted.
- Bipolar's existing Faecalibacterium-down direction — matches Lu et al. 2019's own text ("more abundant in HCs" = depleted in BD), the requested "increase" claim isn't supported by that paper.
