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

## Session 2 — per-bacterium sweep

### Desulfovibrio → Parkinson's disease (**added**, `up`)

Murros et al. 2021, *Front Cell Infect Microbiol* (PMID 34012926), n=20 PD/20
controls. **Every** PD patient harboured Desulfovibrio, at higher levels than
controls, and concentration correlated with PD severity. Mechanistically loaded
rather than merely correlational: these sulfate-reducers make hydrogen sulfide and
LPS, and some strains synthesise magnetite — all proposed triggers of
alpha-synuclein oligomerisation. A 2025 oral-gut-brain-axis analysis independently
found the genus rising with PD severity. Small cohort, so recorded in-app as a
strong mechanistic hypothesis, not settled epidemiology.

This was a genuine gap — Parkinson's had 29 taxa and none of them Desulfovibrio.

### Akkermansia muciniphila → Metabolic dysregulation (**strengthened**)

Mount et al. 2026, *Nature Medicine* (PMID 42120725) — a real **RCT**, n=90 adults
with overweight/obesity. 8-week low-energy diet, then 24 weeks daily pasteurised
A. muciniphila MucT vs. placebo. MucT group regained **1.2 kg vs. 3.2 kg** placebo
and held greater net loss; no serious adverse events. Baseline Akkermansia
abundance predicted cardiometabolic response — it worked best in those who started
with the least. Interventional evidence is rare in this app, so this materially
upgrades an entry that was previously observational + mouse-mechanistic only.

### Bilophila → Gut barrier dysfunction (**added**, `up`)

Sayavedra et al. 2025, *Nature Communications* (PMID 40447622). High-fat diets
expand this sulfide producer. 34 genes critical for colonisation identified —
bacterial microcompartments + energy-metabolism enzymes that metabolise taurine
and isethionate into H2S, acetate and ethanol. Co-colonised with other microbiota
it increased gut permeability, raised liver ethanol, drove hepatic macrophage
infiltration. The authors' own conclusion is worth preserving: metabolic
flexibility and microbial *interactions* — not H2S alone — determine the harm.

### Checked, nothing added yet

- **Prevotella copri** — the literature is genuinely unsettled (strain-level
  differences dominate; a high-fiber diet *exacerbated* arthritis in P. copri-
  colonised RA models, which cuts against the usual fiber-is-good framing). The
  app's existing Prevotella entries already reflect this ambiguity. Revisit with a
  strain-resolved source.
- **Christensenella minuta** — Phase I trial (NCT04663139) reportedly safe with
  LDL reduction, but results are **unpublished**. Not citable yet. Worth watching.
- **Ruminococcus gnavus** — 2025 global survey of 12,791 metagenomes
  (Nat Commun) recapitulates known IBD/metabolic associations rather than adding
  new directions. App already carries R. gnavus links.

---

## Session 3 — 2'-FL intervention + further sweep

### 2'-Fucosyllactose (HMO) supplementation → Bifidobacterium (**added**, new intervention)

Two verified adult RCTs:

- **PMID 40738103**, *Cell Reports Medicine* 2025, n=89 healthy older adults
  (mean age 67.3), 6 weeks, NCT03690999. 2'-FL raised gut Bifidobacterium, plus
  serum insulin, HDL and FGF21.
- **PMID 41243448**, *Gut Microbes* 2025. 2'-FL after vancomycin improved microbial
  resilience — but **transiently** (present at 2 weeks, gone by 8) — while lowering
  fasting IL-6.

**Two caveats deliberately preserved in the app entry**, because the headline alone
would mislead: the first trial's **primary endpoint (cytokine response) was NOT met**,
and **non-responders were specifically the people who lacked Bifidobacterium at
baseline**. 2'-FL appears to *feed an existing population rather than establish one* —
which matters enormously for FUT2 non-secretors, who can't make this glycan themselves
and are therefore most likely to start from a depleted baseline.

Only Bifidobacterium was linked, since it's the only genus either abstract names.

### Checked, nothing added

- **Klebsiella** — 2025–26 work has pivoted to *therapeutic* strains (ARO112,
  *K. oxytoca* restoring colonization resistance). Interesting, but it's about
  engineered//selected strains, not a shift in the genus-level disease direction the
  app records.
- **Eggerthella lenta** — a 2026 *Nature Reviews Microbiology* review and a 2025
  *Sci Transl Med* paper (TUDCA metabolite impairing neutrophil function in lung
  infection) are both substantial, but neither maps onto a symptom this app tracks.
  The digoxin-inactivation pharmacology is well established and out of scope.

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
- **Fusobacterium nucleatum → cardiovascular / arterial stiffness** — a 2025 review
  states F. nucleatum is "detected in atherosclerotic plaques… contributes to
  endothelial dysfunction." Traced to primary data and it **did not hold up**: the
  study found ASCVD patients had **similar** F. nucleatum levels to healthy subjects,
  with *Porphyromonas gingivalis* being the taxon actually associated
  ([PMID 36140246](https://pubmed.ncbi.nlm.nih.gov/36140246/)). A clean example of a
  review overstating a primary finding. **Not added.**
- **"2'-FL clinically proven to raise Bifidobacteria in non-secretors"** — widely
  claimed by supplement retailers. **No human trial stratified by secretor status
  exists.** The secretor-stratified literature is about breastfeeding mothers and
  infants, not adult supplementation. The mechanism is sound and the adult RCT data
  is real, but this specific claim is marketing ahead of evidence.
- **"Alternate-day iron dosing is better"** — an 11-RCT meta-analysis (n=1,014)
  actually found a small, non-significant advantage for **daily** dosing
  ([PMID 40841680](https://pubmed.ncbi.nlm.nih.gov/40841680/)), and the PANDA trial
  suggests daily best meets pregnancy demand ([PMID 42024457](https://pubmed.ncbi.nlm.nih.gov/42024457/)).
  Alternate-day's clearer benefit is GI tolerability, not correction. The microbiome
  rationale is plausible but was **not directly tested**.
