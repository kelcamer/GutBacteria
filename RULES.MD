# RULES

How to decide what an entry says. Read this before changing any direction.

See also [MAP_LAYOUT_RULES.md](MAP_LAYOUT_RULES.md) for how nodes are placed on
the map, and [TO_DO.MD](TO_DO.MD) for what is queued.

---

## Rule 1 — Yellow is a last resort, not a tie-breaker

**Before marking anything yellow (`both`), analyse all the evidence on both
sides. If one direction strongly outweighs the other, use that direction.**

Yellow says "the evidence genuinely points both ways". It is the honest answer
surprisingly rarely. Most of the time one side is stronger, and saying so is
more useful than a shrug — a person reading the map wants to know what the
evidence *says*, not that reading it was hard.

**Weigh, don't count.** Two papers are not a tie. Ask, in this order:

1. **Are they answering the same question?** This dissolves more "conflicts"
   than anything else. Patients vs controls is not the same comparison as
   advanced stage vs early stage. A genus result is not a species result. Stool
   is not mucosa. Breast milk is not gut. Maternal genotype is not the
   individual's own genotype.
2. **Design.** Meta-analysis > systematic review > cohort/case-control >
   MR (exploratory, and worthless once FDR correction kills it) > animal >
   in vitro.
3. **Size.** An 18-person subgroup does not outweigh a 700-person cohort.
4. **Independence.** Three MR papers built on the same MiBioGen instruments are
   one piece of evidence, not three. Two reviews citing the same primary study
   are one study.
5. **Recency of nomenclature.** "C. coccoides group (cluster XIVa)" *is*
   Lachnospiraceae. Old names hide agreement.

**Then:** set the arrow from the winner, and name the loser in the note — with
its *n*, why it is outweighed, and what would flip it back. Only if the two
sides survive all five tests still standing does the entry go yellow.

**Grey (`none`) is a different fact.** Use it when studies looked and found
nothing. "Nobody found a difference" is not "studies disagree".

### Worked example — Endometriosis / Dialister

One source said Dialister falls as endometriosis gets more severe. Another
found Dialister *raised* in patients vs controls. That looks like a
contradiction and was briefly marked yellow.

Test 1 dissolves it: the first is a gradient *within* the disease, the second
is a case-control comparison. The map's arrow means patients vs normal, and on
that question there was exactly one measurement — up. The entry is now **up**,
with the severity gradient kept in the note as the different question it is.

---

## Rule 2 — Data integrity and accuracy come above all else

Above coverage, above tidiness, above finishing the batch. If a choice is
between an entry that is *complete* and an entry that is *correct*, correct
wins every time.

What this means in practice:

- **Never add a source to make a number go up.** A citation that does not
  actually support the claim is worse than no citation, because it launders a
  guess into a fact.
- **A wrong arrow is worse than a missing one.** Deleting or greying an entry
  that cannot be supported is a valid outcome. So is leaving a taxon
  single-sourced.
- **Report the real number.** When a measurement turns out to have been wrong —
  including one of mine — correct it loudly and say what the old number was.
  An alarming statistic produced by a sloppy check is its own kind of bad data.
- **Fix the checker, not the count.** If a script says something is broken and
  it isn't, the script is the bug. Pin it with a test so it stays fixed.
- **The pipeline is not optional.** After any data change, run it in full
  (see TO_DO.MD). The pre-commit hook blocks on duplicate keys, derived
  precedence, derived freshness and cross-file direction conflicts because
  every one of those bugs actually shipped once.

## Rule 3 — Check three axes before believing two studies disagree

Rank (genus vs species), sample site (stool vs mucosa vs milk), nomenclature
era. Four FUT2 "contradictions" dissolved this way in one sitting, including
one where a pregnancy cohort sitting on the *Clostridium* node turned out to be
corroborating a *Lachnospiraceae* claim.

## Rule 4 — Never cite a paper you have not read the abstract of

In one 12-candidate batch, 4 were unusable: porcine milk oligosaccharides in
pigs, a Parkinson's trial not using the compound at all, a vitamin-D milk paper,
and an unrelated NEC study. All four would have looked fine in a citation list.
Verification is the work; searching is the easy part.

## Rule 5 — Popup notes are read on a phone

Median note is 120 characters. Verdict first, one or two caveats, citations in
the `ref` field, long reasoning in the commit message.

## Rule 6 — An unsourced claim does not outrank a sourced one

If the only thing behind a direction is an orphaned bibliography number or a
legacy entry, and a real citation says the opposite, the real citation wins.
Do not mark it yellow to be polite.

## Rule 7 — Record the searches that found nothing

If a taxon has one source and a search turns up no second one, say so in the
note with the date. That is a result, and it stops the next person repeating
the search. `check_citation_coverage.py --list one` shows what is still thin.
