# Where cross-feeding predicts the wrong direction

Generated from `cross_feeding.json` vs. measured data in `seed_data.json`.
These are **not errors to fix** — they are places where the metabolic model
says one thing and the measurements say another. Propagation skips them
(rule 1: measured data always wins), but skipping quietly would waste the
signal.

11 condition-level conflicts, and they cluster into three groups.

## 1. Anaerostipes — 5 conflicts, always inverted

| Condition | Feeder | Predicts | Measured |
|---|---|---|---|
| Depression | Bifidobacterium ↓ | Anaerostipes ↓ | **↑** |
| Depression | Akkermansia ↓ | Anaerostipes ↓ | **↑** |
| ADHD | Akkermansia ↓ | Anaerostipes ↓ | **↑** |
| Alzheimer's | Akkermansia ↑ | Anaerostipes ↑ | **↓** |
| Parkinson's | Bifidobacterium ↑ | Anaerostipes ↑ | **↓** |
| Parkinson's | Akkermansia ↑ | Anaerostipes ↑ | **↓** |

Every single one is inverted, across two independent feeders, in five
neuro/psychiatric conditions. That consistency is the interesting part — a
random mismatch would not line up this way.

**Reading:** Anaerostipes abundance in these conditions is evidently governed
by something other than lactate/acetate supply. Candidates worth checking:
competition for lactate with other utilisers, host factors, or medication
effects (several of these populations are heavily medicated). Whatever it is,
it overrides substrate availability.

## 2. Phascolarctobacterium — 3 conflicts, all the same shape

| Condition | Feeder | Predicts | Measured |
|---|---|---|---|
| Schizophrenia | Bacteroides ↓ | Phascolarctobacterium ↓ | **↑** |
| FUT2 (Non-secretor) | Bacteroides ↓ | Phascolarctobacterium ↓ | **↑** |
| Fibromyalgia | Bacteroides ↓ | Phascolarctobacterium ↓ | **↑** |

Bacteroides down, Phascolarctobacterium up — three times, no exceptions.

**This one is the most surprising**, because the Ikeyama co-culture showed
P. faecium is *asaccharolytic*: it barely uses carbohydrates and depends on
succinate from others. Losing its main succinate supplier should hurt it.
That it rises instead suggests either another succinate source in these
conditions, or that Bacteroides is a competitor as well as a feeder.

## 3. Faecalibacterium prausnitzii — 2 conflicts

| Condition | Feeder | Predicts | Measured |
|---|---|---|---|
| Anorexia nervosa | Akkermansia ↑ | F. prausnitzii ↑ | **↓** |
| PCOS | Bifidobacterium ↑ | F. prausnitzii ↑ | **↓** |

Weaker as a pattern — two conditions, two different feeders — but both point
the same way.

---

## INVESTIGATED: why "Bifido up, Faecalibacterium down" happens

The four conditions where the pair moves in opposite directions — ADHD,
Parkinson's, Alzheimer's, PCOS — turned out to have **two separate
explanations**, and neither is a broken supply chain.

### Parkinson's: the Bifidobacterium rise is the DRUG, not the disease

*Bifidobacterium* abundance is **positively correlated with L-DOPA dose** and
negatively with serum tyrosine in PD patients. Three species — *B. bifidum*,
*B. breve*, *B. longum* — metabolise levodopa directly, converting it via
deamination and reduction to DHPLA.
([PMID 37932328](https://pubmed.ncbi.nlm.nih.gov/37932328/), *Scientific Reports* 2023)

So the "prep cook" is not thriving because the gut is healthy. It is being fed
by **medication**. A long-standing puzzle in the PD literature — the paper
calls the Bifidobacterium increase "consistent and unexplained" — has a
pharmacological answer.

This matters for the atlas: a taxon can rise for reasons entirely unrelated to
the disease process, and cross-feeding predictions built on it will fail.

### The general pattern: the line cook is SUFFOCATING, not starving

*F. prausnitzii* is **extremely oxygen-sensitive** — among the most
oxygen-intolerant organisms in the human gut. It survives near the mucosa only
because epithelial hypoxia keeps local oxygen near zero, using an extracellular
electron shuttle to cope at the oxic–anoxic boundary.

Inflammation breaks exactly that. Inflamed epithelium leaks oxygen into the
lumen, and F. prausnitzii cannot tolerate it. *Bifidobacterium* is
considerably more aerotolerant and persists.

**So the supply chain is not broken — the customer is dying of something else.**
Feeding it more makes no difference if the environment has become uninhabitable.
That explains why the pattern appears across four conditions that share an
inflammatory component but little else.

### Why this is the most useful thing in this file

Both explanations are invisible to the cross-feeding model, because it only
knows who feeds whom. It has no concept of **medication** or **oxygen**. The
conflicts were the only signal that something outside the model was dominating,
and they only exist because measured data is never overwritten by inference.

**Practical read:** where a derived link conflicts with measurement, suspect an
environmental or pharmacological driver before suspecting bad data.

---

## What this is good for

The cross-feeding model is built from **in-vitro co-culture**, where two
organisms sit in a vessel with no host, no immune system, no competitors and
no drugs. These conflicts are the map of where that abstraction stops holding
in real human data.

If any of these were to be chased, **Phascolarctobacterium is the best
candidate** — the co-culture evidence is unusually strong and specific
(complete succinate-to-propionate conversion, transport genes upregulated),
which makes a consistent 3-for-3 inversion in humans genuinely puzzling
rather than just noisy.

*Regenerate this list by running `scripts/propagate_cross_feeding.py` and
reading the DISAGREE lines.*
