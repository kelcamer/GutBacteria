#!/usr/bin/env python3
"""Tag every entry with an evidence tier and a study population.

HEURISTIC, and honest about it. These are inferred from the free text already
in each entry's ref/note fields - nobody hand-classified 1,500 entries. The
classifier is deliberately conservative: anything it cannot place confidently
becomes "unclassified" rather than being guessed into a tier, because a wrong
tier is worse than an absent one when the whole point is calibration.

Tiers, strongest first:
  meta-analysis   pooled across studies
  human-rct       randomised controlled trial in people
  human-cohort    prospective/case-control/cross-sectional human data
  mendelian       Mendelian randomisation (genetic instrument, human)
  animal          mice, rats, pigs, primates
  in-vitro        co-culture, fermentation model, SHIME
  derived         cross-feeding inference (structured flag, not text)
  unclassified    could not be placed

Population:
  female / male   the study explicitly used one sex only
  mixed           explicitly both
  unknown         not stated
"""
import json
import re
import sys
from collections import Counter, OrderedDict

META = re.compile(r"meta-analys|systematic review|pooled|\b\d+\s+studies\b", re.I)
RCT = re.compile(r"\brandomi[sz]ed\b|\bRCT\b|placebo-controlled|double-blind|crossover trial|NCT\d+", re.I)
REVIEW = re.compile(r"narrative review|\breview\b(?!ed)|scoping review", re.I)
MR = re.compile(r"mendelian randomi|two-sample MR|\bMR\b(?!NA)", re.I)
INVITRO = re.compile(r"in vitro|in-vitro|co-?culture|SHIME|fermentation model|ex vivo|batch culture", re.I)
ANIMAL = re.compile(r"\bmice\b|\bmouse\b|\brats?\b|murine|germ-free|NOD mice|piglet|\bpigs?\b|primate|macaque|animal model|rodent", re.I)
HUMAN = re.compile(r"\bn\s*=\s*\d|cohort|case-control|cross-sectional|participants|patients|volunteers|adults|children|women|men\b", re.I)

FEMALE = re.compile(r"\bwomen\b|\bfemale\b|premenopausal|postmenopausal|pregnan|maternal|\bgirls\b", re.I)
MALE = re.compile(r"\bmen\b|\bmale\b(?!\s*and)|\bboys\b", re.I)
BOTHSEX = re.compile(r"both sexes|men and women|male and female|\bmixed[- ]sex\b", re.I)


def tier(ref, note, derived):
    """Classify from the REF first, note only as fallback.

    v1 read ref and note as one blob, which badly over-tagged `animal`. Notes
    routinely describe a human finding and then its animal follow-up - e.g.
    "depleted in fibromyalgia; FMT from patients into mice induced pain" is a
    HUMAN study with a mouse validation. v1 saw "mice" and tagged the whole
    entry animal, so "Human studies only" would have HIDDEN a human
    fibromyalgia finding. Hiding real evidence is the dangerous direction:
    the map still looks complete while quietly missing things.

    Rules now:
      - the ref describes the study design, so it decides when it can
      - if the note carries BOTH human and animal markers, human wins, because
        the animal part is nearly always a follow-up experiment
      - animal/in-vitro from the note alone only when there is no human signal
    """
    if derived:
        return "derived"

    for src in (ref, ):                      # ref is authoritative
        if INVITRO.search(src):
            return "in-vitro"
        if ANIMAL.search(src) and not HUMAN.search(src):
            return "animal"
        if META.search(src):
            return "meta-analysis"
        if RCT.search(src):
            return "human-rct"
        if MR.search(src):
            return "mendelian"

    both = ref + " " + note
    if META.search(both):
        return "meta-analysis"
    if RCT.search(both):
        return "human-rct"
    if MR.search(both):
        return "mendelian"
    if HUMAN.search(both):
        return "human-cohort"          # human wins over a mouse follow-up
    if REVIEW.search(both):
        return "review"                # narrative review: secondary, weaker than a meta-analysis
    if INVITRO.search(note):
        return "in-vitro"
    if ANIMAL.search(note):
        return "animal"
    return "unclassified"


def population(text, t):
    # Only meaningful for studies with subjects.
    if t in ("in-vitro", "derived"):
        return "n/a"
    if BOTHSEX.search(text):
        return "mixed"
    f, m = bool(FEMALE.search(text)), bool(MALE.search(text))
    if f and not m:
        return "female"
    if m and not f:
        return "male"
    if f and m:
        return "mixed"
    return "unknown"


def blob(*parts):
    return " ".join(str(p or "") for p in parts)


def main(write):
    tiers, pops = Counter(), Counter()

    seed = json.load(open("seed_data.json"), object_pairs_hook=OrderedDict)
    for c in seed["conditions"]:
        for t in c.get("taxa", []):
            ref = blob(t.get("refs"), json.dumps(t.get("links") or []))
            note = blob(t.get("note"))
            ev = t["evidence"] if t.get("evidence_source") == "hand-classified" else tier(ref, note, t.get("derived"))
            po = population(ref + " " + note, ev)
            t["evidence"], t["population"] = ev, po
            tiers[ev] += 1
            pops[po] += 1

    sd = json.load(open("symptom_data.json"), object_pairs_hook=OrderedDict)
    for b in sd["bacteria"]:
        for k in ("up", "down", "both", "none"):
            for e in b.get(k, []):
                ref = blob(e.get("ref"), e.get("url"))
                note = blob(e.get("note"))
                # Same hand-classified escape hatch the conditions loop above
                # has. It was missing here, which made the symptom side strictly
                # worse than the condition side: the classifier reads keywords
                # out of ref/note, so a lab study whose ref says "growth panel
                # on purified HMOs" or "N-acetylhexosamine 1-kinase structures"
                # lands as `unclassified` - and an unclassified in-vitro entry
                # SURVIVES the "Exclude lab-dish studies" filter, which is the
                # dangerous direction: the filter looks applied and isn't.
                # Being conservative is right for a guess; it is not right when
                # someone has actually read the paper and knows the design.
                ev = (e["evidence"] if e.get("evidence_source") == "hand-classified"
                      else tier(ref, note, e.get("derived")))
                po = population(ref + " " + note, ev)
                e["evidence"], e["population"] = ev, po
                tiers[ev] += 1
                pops[po] += 1

    print("EVIDENCE TIERS")
    for k, v in tiers.most_common():
        print(f"  {k:16} {v:5}")
    print("\nPOPULATION")
    for k, v in pops.most_common():
        print(f"  {k:16} {v:5}")

    if write:
        for path, data in (("seed_data.json", seed), ("symptom_data.json", sd)):
            json.dump(data, open(path, "w"), indent=1, ensure_ascii=False)
            open(path, "a").write("\n")
        print("\nwritten.")
    else:
        print("\nDRY RUN - pass --write to apply.")


main("--write" in sys.argv)
