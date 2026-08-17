# Citation audit — condition taxa

**Corrects an earlier claim of mine.** I previously said 42% of condition taxa
had no source. That was wrong: the check only looked for PMID/PMC/DOI in the
`refs` field and ignored the `links[]` arrays, where most citations actually
live. The real figure is **5.1%**.

Recording the error rather than quietly restating the number — an alarming
statistic produced by a sloppy check is its own kind of bad data.

## Current state (743 measured taxa, excluding 99 derived)

| Category | Count | Share |
|---|---|---|
| Has PMID / PMC / DOI | 437 | 58.8% |
| Has a resolvable source URL | 268 | 36.1% |
| **Orphaned ref text** | **37** | **5.0%** |
| **Nothing at all** | **1** | **0.1%** |

191 entries had a real citation in `links[]` but an empty `refs` field; those
were backfilled from the link labels so the two fields agree.

## What the remaining 38 actually are

They are not random. Three distinct groups:

### 1. Orphaned bibliography numbers — ~30 entries

`refs: "19,22"` · `"56,57"` · `"80"` · `"63"` · `"150,153"` · `"169"`

These point at a numbered reference list from an earlier version of the app
that is no longer reachable. **This is the worst category**, because the entries
*look* sourced. A reader sees a ref field and assumes provenance; a bare `80`
carries none.

Concentrated in **ADHD (10), Schizophrenia (7), Autism (5), Anxiety (4)** —
which is also, not coincidentally, where the ADHD Bifidobacterium
contradiction was found.

### 2. Author-year without an identifier — ~7 entries

`"Clos-Garcia 2019"` · `"Zeamer 2023"` · `"Malan-Müller 2022"` ·
`"Cross-cohort meta-analysis"`

These are **genuinely traceable** — a real author and year is enough to resolve
a PMID. The cheapest fix in the whole audit.

### 3. Truly empty — 1 entry

`Schizophrenia / Anaerostipes`.

Plus one landmine now fixed: **FUT2 / Firmicutes** had `refs: "derived"` as free
text, written long before `derived: true` became a structured flag meaning
cross-feeding inference. It read like a cross-feeding link while having no edge,
no citation and no note. Flagged in place as unsourced rather than deleted,
since the direction may be right.

## Priority

1. **Resolve the 7 author-year refs to PMIDs.** Cheap, mechanical, removes the
   most easily-fixed uncertainty.
2. **Decide what to do about the ~30 orphaned numbers.** Either recover the
   original bibliography, or re-source the claims, or relabel them honestly as
   unsourced. Leaving a bare `80` in a `refs` field is the worst of the three
   options, because it silently borrows the credibility of a real citation.
3. `Schizophrenia / Anaerostipes` — one entry, needs a source or removal.

## Why this matters beyond tidiness

The ADHD Bifidobacterium error — an unsourced "up" claim contradicting a cited
meta-analysis in the same condition — sat undetected until a cross-feeding
conflict surfaced it. Uncited entries are not merely unverifiable; they
accumulate contradictions that nothing catches.


---

# RESOLVED — actions taken

Worked through all 38 flagged entries.

## Re-sourced (3)

| Entry | New source |
|---|---|
| Autism / Clostridium (up) | PMID 40442917, systematic review + meta-analysis, 19 studies |
| Autism / Clostridiales (up) | PMID 40442917, same review |
| Schizophrenia / Collinsella (up) | PMID 42196583, systematic review |

## Direction CORRECTED (1)

**Anxiety / Actinobacteria: up → down** (PMID 42193332).

The entry claimed *up* on the strength of an orphaned bibliography number with
no recoverable source. The only citable evidence found says the opposite —
Actinobacteria significantly **reduced** in anxiety vs. healthy controls. An
unsourced claim does not outrank a sourced one, so this was flipped rather than
marked `both`.

## Removed (25)

Each was searched for before deletion. None could be re-sourced: the orphaned
numbers point at a bibliography that no longer exists, and the recent reviews
for these conditions do not name these taxa. Per the rule that an entry with no
recoverable source should not stand, they were removed rather than left
carrying borrowed credibility.

Preserved here so nothing is lost — all remain in git history:

```
Depression / Anaerostipes [up]  refs='19,22'
Depression / Blautia [up]  refs='19,22'
Autism (ASD) / Veillonellaceae [up]  refs='58'
Autism (ASD) / Dorea [up]  refs='57'
Autism (ASD) / Parasutterella [down]  refs='57'
ADHD / Blautia [up]  refs='80'
ADHD / Lachnospiraceae [up]  refs='80'
ADHD / Anaerostipes [up]  refs='80'
ADHD / Bacteroides [down]  refs='63'
ADHD / Prevotella [down]  refs='63'
ADHD / Lactobacillus [down]  refs='63'
ADHD / Verrucomicrobia [down]  refs='80'
ADHD / Christensenellaceae [down]  refs='80'
ADHD / Ruminococcaceae [down]  refs='80'
ADHD / Anaerococcus [down]  refs='80'
Schizophrenia / Succinivibrio [up]  refs='150,153'
Schizophrenia / Megasphaera [up]  refs='153'
Schizophrenia / Blautia [down]  refs='153'
Schizophrenia / Ruminococcus [down]  refs='150'
Schizophrenia / Haemophilus [down]  refs='152'
Anxiety / Bacteroidetes [up]  refs='169'
Anxiety / Hungatella [up]  refs='168'
Anxiety / Tenericutes [down]  refs='168'
FUT2 (Non-secretor) / Firmicutes [down]  refs='UNSOURCED - legacy entry'
Fibromyalgia / Eubacterium [down]  refs='review'
```

**Worth noting:** the ADHD systematic review (23 studies, 2015–2025) names
*Alistipes* ↓, *Faecalibacterium* ↓, *Roseburia* ↑, *Agathobacter* ↑ — and
**none** of the 10 orphaned ADHD taxa. That is not merely absence of evidence;
a current review of the field looked at ADHD microbiota and did not surface
them.

## Result

**0 measured taxa without a resolvable identifier.** Every remaining
non-derived entry in `seed_data.json` carries a PMID, PMC ID, DOI or source URL.
