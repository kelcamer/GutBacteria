# Implemented — App Update Ideas, August 10 2026

Tracking against the full request list from the Aug 10 2026 message. Dated entries below; see `NEED_TO_IMPLEMENT.md` for what's left.

## 2026-08-10

1. **OCD Symptoms/OCD condition misalignment (the "huge bug")** — fixed. "OCD symptoms" in the Symptoms map was missing 10 of the OCD condition's 12 taxa. Ported all of them over with matching direction; verified 12/12 (now 13/13) exact alignment between `seed_data.json`'s OCD condition and `GFA_SYMPTOM_DATA`'s "OCD symptoms" entry, and re-verify after every subsequent OCD edit.

2. **Separate JSON file for symptoms** — done, chose the separate-file option. `symptom_data.json` created, mirrors `GFA_SYMPTOM_DATA` (35 symptoms, 88 bacteria as of this entry). Backup screen (Export/Import/Copy JSON) now bundles/accepts `{conditions, symptomData}` together; importing symptom data saves to `localStorage` (`gfa_symptom_data_override`) and reloads to apply; Reset to seed data also clears the override. Added a 4th stat card to the Backup screen for symptom-taxa count.

3. **Bilophila/OCD note wording** — fixed in both `seed_data.json` and `GFA_SYMPTOM_DATA`. Direction (down) was already correct per standard MR protective-effect convention; the note was just missing the same directional clarifier its sibling Ruminococcaceae entry has. Audited the rest of `seed_data.json` for the same bare-"protective" pattern — everything else already had a clarifier elsewhere in its note (checked Tourette's 3 MR entries specifically).

4. **Bipolar Faecalibacterium "both directions" request** — investigated using the actual source papers (not just the paraphrased summary). Lu et al. 2019's own text says Faecalibacterium was "more abundant in HCs," i.e. *depleted* in BD — matching existing data, not a contradiction. Did **not** add a false "increase" data point. See `NEED_TO_IMPLEMENT.md` for the honest status of the other bipolar contradiction claims.

5. **New "both" (yellow, conflicting evidence) direction** — built as a real feature, not just for bipolar. Added `dir:"both"` alongside up/down; `GFA_dirColor`/`GFA_dirArrow` helpers (yellow `#FBBF24`, ↕ glyph) wired into all 6 color + 4 arrow rendering call sites across `GFA_buildMap` and `GFA_buildSymptomMap`, so every node map (Conditions↔bacteria, Symptoms, Brain map) renders it consistently. `GFA_SYMPTOM_DATA`'s schema extended with a `both` bucket alongside `up`/`down`.
   - Applied to: **OCD ↔ Proteobacteria** (2025 MR study: protective/depleted-when-OCD vs. 2023 UC-comorbidity study: increased in patients with OCD-like features — corrected a wrong PMID the request cited, 36932788 was an unrelated pediatric oncology case report; real PMID is 37280117).
   - Applied to: **OCD ↔ Lachnospiraceae, Ruminococcaceae** (human clinical studies show depletion; the quinpirole rat model of compulsive checking, PMID 29194070, shows the opposite — animal vs. human, flagged as such).

6. **Bipolar 3-way mood-state split (Euthymic / Depressed / Manic)** — NOT done. See `NEED_TO_IMPLEMENT.md` — literature search so far hasn't turned up clean discrete per-state primary studies; needs more work or a scope decision.

7. **OCD contradictions from the request** — Lachnospiraceae/Ruminococcaceae animal-model (done, #5 above). Proteobacteria/UC-comorbidity (done, #5 above, with corrected PMID).

11 & 12. **"Show Connections" and "Hide Isolated Nodes" buttons** — done, on all 4 map components (Conditions↔bacteria, both Brain map directions, both Symptoms map directions, and the per-condition mini-map). Implemented by attaching `showConnectionsOnly`/`hideIsolatedNodes` methods onto the graph-instance function returned from `GFA_buildMap`/`GFA_buildSymptomMap` (stored in a new `graphRef`), so the existing cleanup-function call site keeps working unchanged. Both reuse the existing `hideNode()`/`hiddenNamesRef` mechanism, so "Snap back into position" un-hides everything from either action; "Scramble me" does not (per the earlier fix in this same session).
   - **Show Connections** was corrected mid-build per user feedback: it now keeps only neighbors *shared* by 2+ selected nodes (revealing actual overlap between the selection), not the union of every neighbor each selected node individually touches. A single selected node still shows its full neighborhood (no "sharing" concept applies with just one). Verified behaviorally with a mock graph before and after the fix.

Also, mid-batch, per explicit user request:
- **FUT2 added to the Symptoms map** — "Non-secretor status (FUT2)" added as a new symptom entry, 20 taxa ported from the existing FUT2 condition in `seed_data.json` with matching directions.

## Verification standard used throughout
Every change in this file was verified with: `jsc` (JavaScriptCore CLI) syntax check via `new Function()` on the full extracted `<script>` content; `qf()` embedded-fallback round-trip equality against `seed_data.json`; structural checks (no duplicate IDs, no broken URLs, OCD condition/symptom alignment re-checked after each OCD-touching edit); and standalone behavioral tests (mock data through `jsc`) for any new interactive logic (hide/show/connection-filtering) before wiring it into the UI.
