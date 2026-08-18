# Data gaps audit — 2026-08-17

What is **missing** from the atlas, as opposed to what is wrong with it. Gaps
are invisible by construction: a condition nobody has filled in looks exactly
like a condition with nothing to say.

Regenerate at any time:

```
python3 scripts/find_data_gaps.py
python3 scripts/find_data_gaps.py --section cross-file
```

Scope: 41 conditions, 57 symptoms, 127 bacteria, 1,530 measured claims.

---

## 1. Seventeen conditions have no corroborated entry at all

Not one taxon in them rests on two different papers. Ranked by how few papers
carry how many taxa — the ratio is the tell, because it shows one paper was
mined for a taxon list and nothing was ever checked against a second.

| Condition | Taxa | Distinct papers | Corroborated |
|---|---:|---:|---:|
| Borderline Personality Disorder | 6 | **1** | 0 |
| Type 1 Diabetes | 10 | **2** | 0 |
| Lupus (SLE) | 10 | **2** | 0 |
| Traumatic Brain Injury | 6 | 2 | 0 |
| Cannabis / THC use | 4 | 2 | 0 |
| Ehlers-Danlos (hypermobile) | 3 | 2 | 0 |
| Premenstrual Disorders (PMS/PMDD) | 5 | 1 | 0 |
| Perimenopause | 3 | 1 | 0 |
| **Polycystic Ovary Syndrome (PCOS)** | **19** | **4** | 0 |
| **Anorexia nervosa** | **28** | **7** | 0 |
| ME/CFS | 18 | 5 | 0 |
| Tourette syndrome | 17 | 5 | 0 |
| **Crohn's disease** | **20** | 14 | 0 |
| **Rheumatoid arthritis** | **23** | 10 | 0 |
| Alcohol use disorder | 15 | 8 | 0 |
| Oral iron supplementation (effect) | 7 | 2 | 0 |
| Menopause (transition) | 12 | 2 | **1** |

**PCOS is the standout gap.** 19 taxa on 4 papers, nothing corroborated, in a
condition with a large literature and real interventions attached.

For contrast, the two conditions worked over today: Endometriosis 24 taxa /
19 papers / 75% corroborated, FUT2 31 / 23 / 58%. That is what a worked
condition looks like, and it is what makes the others measurable as thin.

## 2. Four major conditions have a completely empty note

| Condition | Taxa | Note |
|---|---:|---|
| ADHD | 35 | *(empty)* |
| Alzheimer's | 29 | *(empty)* |
| Schizophrenia | 22 | *(empty)* |
| Anxiety | 20 | *(empty)* |

106 taxa with no framing at all — no caveat, no mechanism, no "what this
literature is like". Depression, Endometriosis and FUT2 all carry long notes
that do exactly that work, so the absence here is an oversight rather than a
house style. These are also four of the five largest conditions in the atlas.

## 3. The grey "tested, found nothing" state is used in 2 of 41 conditions

Only **FUT2** (Proteobacteria, Faecalibacterium, Firmicutes) and **Iron
deficiency** (Firmicutes) record a null — and both were added today.

This matters more than it sounds. Without a grey entry, a taxon's absence from
a condition is ambiguous between *nobody looked* and *people looked and found
nothing*, and those are opposite facts for a reader deciding whether a question
is open. Every null found during a search should be recorded rather than
discarded (RULES.MD Rule 8).

## 4. Population is unknown for 89% of entries

| | Before | After the fix below |
|---|---:|---:|
| unknown | 1,405 | 1,360 |
| female | 86 | **136** |
| male | 16 | 16 |
| mixed | 8 | 3 |

**Fixed in this pass.** Conditions that are single-sex *by definition* are now
declared in `annotate_evidence.py` rather than guessed from text. The keyword
classifier could never get these right: a PCOS abstract rarely bothers to say
"women", so **19 of 19 PCOS entries were tagged `unknown`** and the app's
"female participants" filter could not see the one condition in the atlas that
is female by definition. Endometriosis was worse — five entries read `mixed`,
which is not a state that exists for endometriosis.

The remaining 1,360 unknowns are genuine: most abstracts do not report sex
breakdowns, and guessing would be worse than admitting it.

## 5. Fourteen taxa are on the Conditions screen but missing from the symptom map

Where a condition also exists as a symptom, the two should agree. Eleven
Anxiety taxa (Fusicatenibacter, Butyricicoccus, Actinobacteria,
Escherichia-Shigella, Firmicutes, Prevotella 9, Dialister, Agathobacter,
Eubacterium rectale, Lachnospira, Blautia) and three FUT2 taxa (Candida
albicans, Helicobacter pylori, Clostridiaceae) appear on one screen only.

Same evidence, already sourced — this is a propagation gap, not a research gap.

## 6. Ninety-six contested entries, concentrated in six genera

Bacteroides ×16, Prevotella ×11, Lactobacillus ×11, Ruminococcus ×9,
Bifidobacterium ×6, Dorea ×5.

Per RULES.MD Rule 1, these need re-examination rather than acceptance: yellow
is a last resort, and a genus that is contested in sixteen places is usually a
genus whose *species* disagree — the atlas already splits *R. gnavus* and
*R. torques* out of bare *Ruminococcus* for exactly this reason. A species
split is more likely to resolve these than another literature search.

## 7. Smaller gaps

- **99 taxa appear exactly once** in the whole atlas, so there is no
  cross-condition context to sanity-check their direction against.
- **340 entries (22%) have an unclassified evidence tier** — the classifier
  declines to guess, which is correct, but they are invisible to the evidence
  filters.
- **9 thin conditions** (<8 taxa) and **9 thin symptoms** (<5 bacteria).
- **Testosterone is a direction monoculture**: 6 taxa, all `up`. Usually the
  signature of a source mined for its "increased" list only.
- **2 cross-feeding orphans** — "community butyrate pool" and "host
  exercise-derived lactate" are abstract nodes rather than taxa, so these are
  by design.
- **0 empty symptoms** and **0 phylum-only conditions**. Both clean.

---

## Recommended order

1. **PCOS** — biggest gap with the most literature behind it, and interventions
   attached. 19 taxa on 4 papers.
2. **The four empty condition notes** — cheapest visible improvement in the
   whole atlas; 106 taxa currently have no framing.
3. **The 14 cross-file taxa** — mechanical, no research needed.
4. **The contested clusters** — species splits, not searches.
5. **Crohn's / Rheumatoid arthritis / Anorexia** — large, entirely
   single-sourced, real literatures available.
