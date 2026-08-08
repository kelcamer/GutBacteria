# Finished Changes — overnight session (2026-08-08)

Running log, newest at top. Each entry = actually applied to `gut-flora-atlas.html` & verified in-browser,
not just planned. See PROPOSED_CHANGES.md for what's still queued.

---

## ⚠️ Important: found (and fixed) why new data might not show up for you

The app caches its whole dataset in your browser's `localStorage` the first time you open it, and was written
to **always prefer that local cache over a fresh `seed_data.json`, forever, with no version check**. That means
if you've opened this app in your browser before tonight, every condition I add below would have been
**invisible to you** — silently overridden by your old cached copy — until you noticed and manually hit
"Backup → Reset to seed data" (which also wipes any personal edits/notes you'd made, which felt too destructive
to require).

**Fixed properly**: on load, the app now diffs the fresh seed data against your local copy by condition `id`
and merges in only the ones you don't already have — anything you've personally edited is left completely
untouched, nothing is ever overwritten or removed. Verified in-browser: loaded the app with an old cached
23-condition copy still sitting in localStorage, reloaded after this fix, and it correctly grew to 28 (merging
in the 5 new conditions below) with zero data loss and zero console errors.

**Practical effect for you**: next time you open the app in your normal browser, the 5 new conditions and all
the fixed citations should just appear — no manual reset needed.

---

## Citation URL audit — fixed all 135 PubMed-search-fallback links (Bacteria↔Symptom maps)

You remembered correctly — clicking some citations landed on a PubMed *search* instead of a paper. Confirmed:
**135 of 201** links in the Bacteria→Symptom / Symptom→Bacteria maps (`GFA_SYMPTOM_DATA`) were
`pubmed.ncbi.nlm.nih.gov/?term=...` search URLs, not direct papers.

They collapsed to 29 unique underlying claims (lots of bacteria shared the same generic "SCFA producer" /
"IBD bloom" / "dysbiosis bloom" style justification). Researched each one and replaced with a real, direct,
verifiable link — PMID, PMC, or a named journal DOI (Nature, Nature Microbiology, Nature Reviews Microbiology,
Cell Reports, mBio, MDPI, Science, etc). Examples of what changed:

- Coprococcus/Dialister ↔ depressed mood → **Valles-Colomer et al. 2019, Nat Microbiol** (the actual landmark paper)
- Eggerthella ↔ mania → replaced a vague review cite with the actual primary study, **Painold et al. 2019** (LDA stats match exactly)
- Eggerthella ↔ brain fog (dopamine claim) → **Nature Reviews Microbiology 2026**, "Eggerthella lenta: metabolism, pathogenesis and therapeutic implications" (direct nature.com link)
- Desulfovibrio ↔ abdominal pain → confirmed the MDPI ref was real: `mdpi.com/2076-2607/11/7/1772`
- Turicibacter ↔ sleep disturbance → **Fung et al. 2019, Nat Microbiol** (the actual TuriSERT/serotonin-transporter paper)
- SCFA-producer genera (19 taxa × 3 symptoms) → anchored to a real PMC review on SCFA gut-barrier/immune mechanisms
- Restless-legs/Lachnoclostridium → the actual Dec-2025 *Sleep* paper (`zsaf383`)
- ...and 20+ more — full mapping is in the session's `fix_citations.py` if you want the audit trail.

**Also caught 2 claims that don't actually hold up** and removed them rather than force a citation on:
- **Tenericutes → "up, systemic inflammation"**: the literature actually associates Tenericutes with *lower*
  BMI / healthier metabolic markers (PCOS studies show it *decreased* in the diseased group) — backwards from
  what the claim said. Removed.
- **Anaerotaenia → "up, systemic inflammation"**: no genus-specific evidence exists at all; it sits in family
  Lachnospiraceae, whose members are overwhelmingly SCFA-producing/protective, which cuts against the claim.
  Removed.

**Bug found + fixed as a side effect**: removing those two taxa's only edge dropped their edge-count to 0, and
that exposed a real rendering bug — the Bacteria→Symptom map's "All bacteria" mode showed a node for *any*
bacterium regardless of edge count, so a 0-edge bacterium would render as a dangling, unclickable dot. Fixed
`GFA_buildSymptomMap`'s visibility filter to require `deg>0` in all modes. Verified in-browser: node/link counts
now correctly read 80 bacteria · 27 symptoms · **199** links (was 201), and the two removed taxa no longer
appear as orphan nodes.

Net: **0 search-fallback URLs remain** in the app (verified by scanning the live embedded data for `term=`).

---

## Added 5 new conditions (with real, direct citations)

You asked for conditions with "enough gut flora research to make it worth it." Biggest gap I found: **inflammatory
bowel disease itself wasn't in the app**, despite being the single most-studied condition in gut-microbiome
research generally (IBS was in, IBD wasn't). Added, each with 6–9 taxa and direct PMID/PMC/Nature-family links
(no search fallbacks), added to both `seed_data.json` and the `qf()` file:// fallback so they stay in sync:

1. **Crohn's disease** (CD) — F. prausnitzii ↓ (Sokol 2008 PNAS), adherent-invasive E. coli ↑ (Darfeuille-Michaud
   2004, the foundational AIEC paper), R. gnavus ↑ (Henke 2019 PNAS, inflammatory polysaccharide mechanism), plus
   Roseburia/Coprococcus/Akkermansia ↓, Fusobacterium/Bacteroides/Prevotella shifts.
2. **Ulcerative colitis** (UC) — kept separate from Crohn's since they have distinct signatures (a 2024 Nat Commun
   multi-biome study directly compares the two). F. prausnitzii ↓, Escherichia/Shigella ↑, Bacteroides/Parabacteroides/
   Collinsella ↓, Akkermansia ↓.
3. **Type 2 diabetes** (T2D) — grounded in a 2024 meta-analysis (7 studies, 600 cases/543 controls): Akkermansia/
   Roseburia/Faecalibacterium/Bifidobacterium/Bacteroides ↓, Escherichia-Shigella/Fusobacterium/Blautia/Lactobacillus ↑.
   Deliberately did NOT use the classic "Firmicutes/Bacteroidetes ratio" claim — noted in the condition's caveat that
   large re-analyses (Sze & Schloss 2016) couldn't reproduce it.
4. **Rheumatoid arthritis** (RA) — anchored on the single most-replicated finding in this space: Prevotella copri
   expansion in new-onset untreated RA (Scher et al. 2013), plus Collinsella ↑ (disrupts tight junctions, worsens
   arthritis in mouse models), Bifidobacterium/Eubacterium rectale ↓.
5. **Psoriasis** (PSO) — included with an explicit caveat in its note field: individual studies disagree more here
   than any other condition added tonight (even Faecalibacterium/Bacteroides direction isn't consistent across
   cohorts). Went with the more commonly replicated direction and flagged it as noisier-than-average evidence,
   the same way the app already caveats Depression's phylum-level claims.

**Considered and deliberately left out**: Celiac disease (literature was too self-contradictory on directionality
to responsibly include — e.g. Bacteroides reported both up and down depending on the study) and Obesity (the F/B
ratio story it's usually built on is the same one debunked above). Both are in PROPOSED_CHANGES.md if you want them
revisited with a narrower, better-grounded claim.

**Bug found as a side effect of adding these**: the Bacteria→Symptom map's node-visibility filter showed *any*
bacterium node in "All bacteria" mode even with zero edges (see the citation-audit section above) — fixed there,
verified no orphan nodes remain.

---

## Added 2 new symptoms — Histamine reactions, Acne / skin flares

You asked for common symptoms with solid research that aren't in the app yet. The existing 27-symptom list
was already pretty thorough (it already had Brain fog, Sleep disturbance, etc.), so I looked for gaps with
*real* mechanistic literature rather than padding the list:

- **Histamine reactions** — grounded in *De Palma et al. 2022, Science Translational Medicine* (PMID 35895832):
  Klebsiella aerogenes strains carrying a histidine-decarboxylase gene were identified as major gut histamine
  producers, highly abundant across 3 independent IBS cohorts, and colonizing germ-free mice with high-histamine
  microbiota directly caused visceral hyperalgesia via the histamine-4 receptor. Added Klebsiella ↑, and a new
  taxon **Morganella** ↑ (classic high-capacity histamine former) plus Faecalibacterium ↓, both from a dedicated
  histamine-intolerance dysbiosis study (PMC9102523).
- **Acne / skin flares** — grounded in a Mendelian-randomization causal-inference study (PMC10507220): Bacteroides
  ↑ (OR≈2.25) and Bacteroidaceae increase acne risk; Lactobacillus ↓ and Fusicatenibacter ↓ are protective.
  Mendelian randomization is a stronger evidence tier than plain correlation since it uses genetic instruments to
  approximate causality, which is worth knowing when you're weighing how much to trust it.

**Left out after checking**: bad breath/halitosis (evidence is almost entirely about *oral*, not gut, microbiome —
wrong axis for this app) and food-craving-specific claims (nothing beyond speculative/rodent-only mechanism papers
turned up, so it's left out per the project's existing "no literature found → don't invent it" rule).

---

## Optimization pass

Actually investigated the app's performance characteristics rather than guessing. Good news first: the
force-directed map's animation loop already self-terminates (alpha decay + tick cap, not an infinite loop) and
all three map components (`Gfx`, `GFA_SymptomTab`, `GFA_ConditionMap`) properly cancel their `requestAnimationFrame`
and remove event listeners on unmount — switching tabs mid-animation doesn't leak. No fix needed there.

**Applied**: added `<link rel="preconnect">` for `fonts.googleapis.com` and `fonts.gstatic.com` — lets the browser
open the font connection in parallel with everything else instead of only starting after it parses the `@import`
inside the stylesheet. Small, safe, real win on cold loads.

**Evaluated and deliberately left alone** (see PROPOSED_CHANGES.md for the reasoning on each) — the file is
already fairly lean (no bloated base64 assets, no dead animation loops), so most further "optimization" would be
speculative without real profiling tools in this environment (no Lighthouse/DevTools perf trace available here).

---

## New section: Glossary

Added a full nav tab (`Glossary`, next to `Sources`) with 18 plain-English definitions for the jargon that gets
used throughout the app without ever being defined in it — SCFA, butyrate, LPS/endotoxin, dysbiosis, pathobiont,
mucin-degrader, facultative anaerobe, phylum/genus/species, alpha-diversity, the Firmicutes/Bacteroidetes ratio
(with a note on why it's unreliable), meta-analysis, Mendelian randomization (freshly relevant given tonight's
new RA/T2D/acne citations use it), gut-brain axis, gut-skin axis, endotoxemia, histamine intolerance, PMID/PMC/DOI,
and non-secretor (FUT2). Styled to match the existing "Sources" tab exactly (same card style, same typography) so
it doesn't look bolted on. Verified rendering and no console errors.

---

## General bug scan

Went looking for problems rather than assuming things were fine:

- **Taxon-canon check**: every new taxon name used in the 5 new conditions (Faecalibacterium prausnitzii,
  Escherichia coli, Ruminococcus gnavus, Akkermansia muciniphila, Prevotella copri, etc.) already had a
  canonical mapping in `GFA_TAXON_CANON` — 0 missing. Confirmed the new conditions' per-condition scoped maps
  render correctly (verified Crohn's disease: 8/9 taxa matched, 54-node SVG map rendered, real citations shown
  in the increased/decreased lists).
- **ID collision check**: all 874 `id` fields across `seed_data.json` (conditions, condition-links, taxa,
  taxa-links) are unique — no accidental overwrites from the new entries.
- **All 3 data-loading paths tested end-to-end**, not just assumed:
  1. Fresh fetch (no localStorage) → 28 conditions, 0 console errors, correctly saves to localStorage after.
  2. Returning user with a stale cached copy → the new merge-by-id logic (see citation-audit section) correctly
     grows it to 28 with no data loss.
  3. `file://`-style fallback (`seed_data.json` temporarily hidden from the server to force the fetch to fail) →
     `qf()`'s embedded copy correctly serves all 28 conditions, 0 console errors. Restored the file afterward.
- **Clicked through every nav tab** (Conditions, Compare two, Find in papers, Bacteria index, Symptom→Bacteria
  map, Bacteria→Symptom map, Sources, new Glossary, Backup) — 0 console errors or warnings anywhere.
- **Compare-two dropdown** correctly lists all 28 conditions including the 5 new ones.
- JS syntax balance-checker run after every single edit tonight — always the same 1 pre-existing harmless false
  positive (documented in project memory), never a real new mismatch.

**Known gap, not fixed tonight** (documented, not silently skipped): `bacteria_symptoms.json` — a reference/
source file the app does *not* fetch at runtime (only `seed_data.json` and the embedded `qf()` do) — is now out
of sync with the 5 new conditions and 2 new symptoms. It's manually-maintained scaffolding for regenerating
`GFA_SYMPTOM_DATA`, not something the live app reads, so nothing user-facing is broken by leaving it stale, but
flagging it so it doesn't get forgotten if the symptom-map build scripts are ever rerun from it.
