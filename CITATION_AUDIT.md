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
