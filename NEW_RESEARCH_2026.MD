# New Research Sweep — 2026

Running log of the systematic per-bacterium literature sweep. Every citation
below was verified against Europe PMC (or another primary source) before being
added to the app. Anything that could NOT be verified is recorded here too, in
the "Rejected / unverified" section, rather than silently dropped.

**Method per bacterium:** targeted searches for 2025–2026 findings → verify PMID
and direction against the primary abstract → check the direction against what the
app already stores → add, strengthen, or mark as a genuine contradiction (`both`).

---

## Session 1 — Arterial stiffness / vascular aging (NEW SYMPTOM)

Prompted by the "stiff arteries" lead. The app had **no cardiovascular symptom at
all**, which was a real gap. Added `Arterial stiffness / vascular aging` as a new
symptom with **12 verified bacterium links**.

### Primary sources

| Source | Cohort | PMID |
|---|---|---|
| Menni et al. 2018, *European Heart Journal* | TwinsUK, n=617 middle-aged women | 29750272 |
| Cuadrat et al. 2023, *Scientific Reports* | EPIC-Potsdam, n=3,087 | 37587126 |
| Zhang et al. 2025, *Gut Microbes* | causal mouse + human elderly HF | 40364435 |

**Menni 2018 headline:** pulse wave velocity negatively correlated with microbiome
alpha diversity (Beta=-0.25, P=1e-4). The microbiome explained **8.3% of PWV
variance**, and only 5.51% of that was mediated through metabolic syndrome — so
this is largely *independent* of classic cardiometabolic risk factors. Seven OTUs
were negatively associated with PWV.

**Zhang 2025 is the strongest mechanistic result:** F. prausnitzii (or butyrate
alone) prevented age-related cardiac dysfunction by suppressing cardiomyocyte
ferroptosis via LCN2 downregulation. A gene-edited strain that *cannot* make
butyrate **lost** the effect — pinning causation to butyrate specifically.

### Links added

| Bacterium | Dir | Source |
|---|---|---|
| Ruminococcaceae | down | Menni 2018 (2 OTUs) |
| Rikenellaceae | down | Menni 2018 (1 OTU) |
| Clostridiaceae | down | Menni 2018 (2 OTUs) |
| Odoribacter | down | Menni 2018 (1 OTU) |
| Barnesiella | down | Menni 2018 (Barnesiellaceae OTU) |
| Sutterella | down | Cuadrat 2023 — *S. wadsworthensis*, AIX β=-0.11, PWV β=-0.14 |
| Bacteroides uniformis | down | Cuadrat 2023 (already sold as a probiotic) |
| Eubacterium siraeum | down | Cuadrat 2023 (AIX) |
| Ruminiclostridium5 | down | Cuadrat 2023 (AIX + ABI) |
| Faecalibacterium prausnitzii | down | Zhang 2025 (causal, butyrate/ferroptosis) |
| Blautia | **up** | Cuadrat 2023 — *B. massiliensis*, positive with AIX *and* PWV |
| Collinsella | **both** | genuine cross-cohort contradiction (see below) |

### Contradictions recorded honestly

- **Collinsella aerofaciens** — POSITIVELY associated with PWV in EPIC-Potsdam
  (more stiffness), but NEGATIVELY associated in TwinsUK (less stiffness). Marked
  `both`. Notably the pro-stiffness signal lost significance after adjusting for
  type 2 diabetes, hinting it may be partly metabolic confounding.
- **Sutterella** — protective here, but pro-inflammatory elsewhere in this app
  (autism GI, migraine). Noted in-entry as a real context split, not an error.

---

## Session 1 — Parkinson's disease

- **Actinobacteria (up)** — Marzouk et al. 2025, *npj Parkinson's Disease*
  (PMID 40461531). Meta-analysis, 5 case-control studies, 1,007 fecal samples
  (Japan, Malaysia, Italy, South Korea, China), ANCOM-BC FDR<0.05. Phylum and its
  class Coriobacteriia upregulated; Bifidobacterium within it consistently up from
  species to phylum level. **Added.**

## Session 1 — Type 2 diabetes

Toubon et al. 2026, *Cell Reports Medicine* (PMID 42202790) — prospective SIMPLER
cohort, 4,685 Swedish adults, 383 incident cases, median 5.3y follow-up.

- **Added:** *Desulfovibrio piger* (up), *Alistipes communis* (up),
  *Alistipes finegoldii* (up), *Ruminococcus gnavus* (up), *Coprococcus catus* (down/protective).
- **Changed to `both`:** *Akkermansia muciniphila*. This cohort found higher
  baseline abundance predicts **increased** future T2D risk — opposite the app's
  existing entry (depleted in *established* T2D). These measure different things
  (baseline-predicts-onset vs. established-disease depletion); neither supersedes
  the other, so both directions are now recorded with an explanatory note.
- **Skipped:** 3 further species were too taxonomically vague to name
  (unclassified Erysipelotrichaceae / Clostridia SGB / Lachnospiraceae SGB).

## Session 1 — Psilocybin / Psychedelics (NEW INTERVENTION)

Xu et al. 2024, *PeerJ* (PMID 38846751). Rats, oral psilocybin/norbaeocystin,
fecal 16S at 1 and 3 weeks. Verrucomicrobia **up**, Actinobacteria **up**,
Proteobacteria **down**, all dose- and time-dependent. **Explicitly rat-only** —
no human gut-microbiome psilocybin studies were found. Flagged as such in every note.

---

## Rejected / unverified — NOT added

Recorded so the same dead ends aren't re-walked.

- **"89% of studies show butyrate-producer depletion in autoimmune disease"** —
  searched extensively across multiple angles; the specific figure could not be
  located in any primary source. Not added. (Added a genuinely-missing **Lupus (SLE)**
  condition instead, which was the more valuable gap.)
- **Actinobacteria in Crohn's / ulcerative colitis** — available evidence is
  small-cohort and directionally inconsistent (a pediatric CD cohort and a UC
  severity cohort both showed increases, but no systematic review supports a
  consistent direction). Below this app's citation bar.
- **Vitamin D / IBD** (Gubatan et al. 2026, *Cell Reports Medicine*, PMID 41895287)
  — paywalled past the abstract; neither the abstract nor any press coverage names
  specific genera, only "IgA-bound bacteria" generically. Nothing concrete to add.
- **Zhai et al. 2026 IBD atlas** (PMID 42575094) — the cell.com full text now
  returns 403. Only the abstract-level findings already in the app could be
  re-confirmed (diversity decline, MIRS 19-genera score AUC=0.92). No further
  per-taxon detail obtainable.
- **D'Adamo et al. 2023** (*Cell Reports Medicine*, PMID 37467722) — found
  functionally distinct *Enterococcus* clades in IBD, but strain-level with no
  clean abundance direction. Doesn't fit this app's genus-level format.
- **Flavonifractor plautii / arterial stiffness** — surfaced in secondary
  summaries but the primary source wasn't verified this pass. Deferred, not added.
- **Apiotrichum / fungal arterial stiffness** (Aging Cell 2026) — real, but
  **fungal**, not bacterial. Out of scope for this app's schema.
