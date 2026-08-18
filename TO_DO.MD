# TO DO

Queued work with enough context to start cold. Ordered by what unblocks the most.

Everything below is on `main` as of 2026-08-17. Live at `kelcamer.github.io/GutBacteria/react-preview/` (built from `main`) and `/branch-preview/` (built from whatever branch was last pushed).

---

## 1. ~~Write the citation-coverage audit properly~~ — DONE 2026-08-17

`scripts/check_citation_coverage.py`. Runs as a non-blocking report in `.githooks/pre-commit`; `--verify` resolves every identifier at NCBI/Crossref; `--selftest` pins the namespace bug. Full write-up in [CITATION_AUDIT.md](CITATION_AUDIT.md).

**The numbers below replace the ones this file used to carry** (519 named / 902 one / 107 multi / 332 identifiers). That pass read only the `refs`/`ref` text and ignored `url` — and 540 claims state their identifier *only* in the URL. Coverage was understated by ~460 claims. 1,528 measured claims:

| Bucket | Count | Share |
|---|---|---|
| No citation of any kind | 0 | 0% |
| Named paper, no identifier | 59 | 3.9% |
| Exactly one identifier | 1,335 | 87.4% |
| Two or more | 134 | 8.8% |
| **Single-sourced** | **1,394** | **91.2%** |

429 distinct identifiers, **all 429 resolve** — no fabricated or dead citations. After crosswalking PMID/PMC/DOI of the same paper: **417 distinct works**, and only **133 claims (8.7%) rest on two genuinely different papers**.

**Still open, surfaced by the audit:**
- **65 claims carry an orphaned bibliography number as their ref text** (`115`, `220`, `20–22`). The URL is fine, so they are not uncited — but the ref line borrows credibility it cannot back. `--list orphan` prints them.
- **540 claims hide their identifier in the URL only.** Backfilling the ref text is mechanical.
- **PMC6421268 alone carries 57 claims** (Parada Venegas 2019 SCFA review). One review, 57 arrows.

## 2. Iron deficiency → Firmicutes

Kelsey believes this exists. **I could not find it and did not add it.** Do not add it on recollection.

**Searched already, all dead ends:** `iron deficiency AND (Firmicutes OR Bacillota) AND gut microbiota`, `iron deficiency anemia AND gut microbiome AND (Firmicutes OR Bacteroidetes) AND human`, `iron status AND gut microbiome AND Firmicutes AND (infants OR children) AND trial`, `iron deficiency anemia AND gut microbiota AND women AND (phylum OR Firmicutes)`.

**Everything found was iron *supplementation*, not iron *deficiency state*** — Cambodian women (PMID 37199608), US infants (PMID 27548249), and mouse studies of iron-chelate products (PMID 41679208, 37449470). That distinction matters: supplementation floods the colon with unabsorbed iron, which is a different exposure from being deficient.

**Untried angles:** full texts of 37199608 and 27548249 (abstracts omit phylum results); the hepcidin/iron-absorption literature; searching by author on the Zimmermann/Jaeggi iron-and-microbiome group; Crossref rather than PubMed (see the memory note — Europe PMC and PubMed both lag).

**Note the FUT2 precedent:** the parallel claim "non-secretors → Firmicutes up" turned out to be **null at phylum level but true of five member genera**. Iron may be the same shape. Check genus-level results before concluding.

## 3. Sourcing: FUT2's remaining taxa

Done so far: **Faecalibacterium** (7 sources, resolved to grey/null), **2'-FL** (24 screened → 2 kept), **Lachnospiraceae** (resolved to down), **Proteobacteria** (grey), **Firmicutes** (grey), **Bacteroidetes** (corroborated), **Prevotella** (dissent recorded), **Sutterella** (searched — *nothing exists*, recorded in the note so nobody repeats it).

**Not yet done:** Blautia, Dorea, Klebsiella, Enterocloster, Phascolarctobacterium, Erysipelotrichaceae, Streptococcus, Escherichia/Shigella, Enterobacteriaceae, Akkermansia, Anaerostipes, Bacteroides vulgatus, Ruminococcus gnavus, the three Bifidobacterium species, Clostridium.

**Method that worked:** search → **read every abstract before citing it**. In the 2'-FL batch, 4 of 12 candidates were unusable (porcine milk oligosaccharides in pigs; a Parkinson's trial not using 2'-FL; a vitamin-D milk-composition paper; a Lactiplantibacillus NEC study). All four would have looked fine in a citation list. Verification is the work, not the search.

## 4. The real prize: 1,394 single-sourced claims

Bigger lever than deepening entries that are already the best-sourced in the app. A single citation means no second opinion exists in the dataset — if that paper was small, measured a different rank or sample site, or used superseded nomenclature, the claim inherits the error and the map still draws a confident arrow.

**Today proved it is not theoretical:** four FUT2 entries all rested on the *same* weak source (Rausch 2011, an OTU indicator test inside an 18-person healthy subgroup — PMID 22068912). Two of them moved once corroboration was sought. Three still stand on it alone.

Prioritise by **what a person would act on**: personally relevant conditions first (FUT2, endometriosis, iron deficiency, ADHD), then anything with an intervention attached.

`check_citation_coverage.py --list one --group "ADHD"` prints the queue for any one condition or symptom; the report's "thinnest coverage" table ranks them. Worst offenders right now: Systemic inflammation (51/51 single-sourced), Gut barrier dysfunction (50/51), Autism (38/42), Bloating & gas (31/31), ADHD (30/35).

## 5. UI: corroboration marker

Offered, never started. Show source count on an entry — a small marker for 2+ independent sources — so fragility is visible at a glance instead of requiring every popup to be opened. Roughly an hour. It would change how the map reads more than another twenty citations would, because it makes the 8.7% that *are* corroborated usable as a different class of claim.

**Count works, not identifiers** — a PMID and the same paper's DOI is one source, not two. `check_citation_coverage.py --verify --json` emits the crosswalk the marker should be driven from.

## 6. Known data-model gaps

- **Symptom side lacks the conditions side's `already_covered()` genus rule**, so a derived species entry can still be created under a genus that was actually measured. The conditions path was fixed today (a measured GENUS covers its species; a measured SIBLING SPECIES covers nothing).
- **Two 2'-FL links** (*E. hallii*, *F. prausnitzii*) have notes saying "INDIRECT / cross-fed" but lack the structured `derived` flag, so "Hide crossfeeding" leaves them on screen. They are hand-authored and predate the flag.
- **~79 contested entries elsewhere** in the dataset, concentrated in six genera (Bacteroides 12, Lactobacillus 10, Ruminococcus 7, Prevotella 7, Dorea 5, Bifidobacterium 5). The Bacteroides and Ruminococcus clusters want a **species split**, not a literature search — the app already splits *R. gnavus* and *R. torques* out of bare *Ruminococcus* for exactly this reason.

## 7. `git stash@{0}`

Holds a verified scroll fix for the old `gut-flora-atlas.html` (`user-select: none` on the map SVGs, plus making background clicks inert). Measured there: dragging a node scrolled the page from y=1601 to 0. Kelsey said they only use the React preview, so it was parked rather than committed. Apply or drop.

---

## Working rules — read before touching data

- **[MAP_LAYOUT_RULES.md](MAP_LAYOUT_RULES.md)** — layout rules and the checklist for adding nodes without creating a hairball.
- **Check three axes before believing two studies disagree:** rank (genus vs species), sample site (stool vs mucosa), nomenclature era. Four FUT2 "contradictions" dissolved this way today — including one where "C. coccoides group (cluster XIVa)" turned out to *be* the Lachnospiraceae family, so a pregnancy cohort was sitting on the *Clostridium* node corroborating a *Lachnospiraceae* claim.
- **Don't default to yellow.** The stronger study sets the arrow; the dissent stays named in the note with its *n* and why it is outweighed, plus what would flip it back. Use the grey `none` state when studies looked and found nothing — that is a different fact from disagreement.
- **Popup notes are read on a phone.** Median note is 120 characters. Verdict first, one or two caveats, citations in the `ref` field, long reasoning in the commit message.
- **Never cite a paper you have not read the abstract of.**

## Pipeline, after any data change

```
python3 scripts/propagate_cross_feeding.py --write   # regenerates ALL derived entries from scratch
python3 scripts/annotate_evidence.py --write
python3 scripts/check_duplicate_keys.py && python3 scripts/check_derived_precedence.py \
  && python3 scripts/check_derived_freshness.py && python3 scripts/check_data_integrity.py
python3 scripts/sync_embedded_data.py                # keeps gut-flora-atlas.html's embedded copy in sync
```

The pre-commit hook runs these against **staged** content and will block a commit that breaks them.

## Verifying in a browser

The Chrome extension was not connected; a dependency-free CDP driver was used instead (Node has a global `WebSocket`). Launch headless Chrome with `--remote-debugging-port=9222`, drive it via `Runtime.evaluate` / `Input.dispatchMouseEvent`. **CDP input events are trusted**, so native behaviours (text-selection auto-scroll, smooth `scrollTo`, scroll clamping) actually fire — synthetic `dispatchEvent` cannot reproduce them, and both scroll bugs fixed today were in that class.

**Three traps that each produced a confident false pass:**
1. Clicking a node's bounding-box centre can miss it — the `<g>` includes its text label. Target the child `<circle>`.
2. Node coordinates are viewport-relative. Scroll the map into view *before* clicking.
3. `hideNode` sets `display:none` rather than removing elements, so counting `[data-i]` nodes reports the same number whether or not anything is hidden. Count only `style.display !== 'none'`.

If an interaction test reports *no change at all*, suspect these before believing the app is broken.
