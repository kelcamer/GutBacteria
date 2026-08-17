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
MR = re.compile(r"mendelian randomi|two-sample MR|\bMR\b(?!NA)", re.I)
INVITRO = re.compile(r"in vitro|in-vitro|co-?culture|SHIME|fermentation model|ex vivo|batch culture", re.I)
ANIMAL = re.compile(r"\bmice\b|\bmouse\b|\brats?\b|murine|germ-free|NOD mice|piglet|\bpigs?\b|primate|macaque|animal model|rodent", re.I)
HUMAN = re.compile(r"\bn\s*=\s*\d|cohort|case-control|cross-sectional|participants|patients|volunteers|adults|children|women|men\b", re.I)

FEMALE = re.compile(r"\bwomen\b|\bfemale\b|premenopausal|postmenopausal|pregnan|maternal|\bgirls\b", re.I)
MALE = re.compile(r"\bmen\b|\bmale\b(?!\s*and)|\bboys\b", re.I)
BOTHSEX = re.compile(r"both sexes|men and women|male and female|\bmixed[- ]sex\b", re.I)


def tier(text, derived):
    if derived:
        return "derived"
    if INVITRO.search(text):
        return "in-vitro"
    if ANIMAL.search(text):
        return "animal"
    if META.search(text):
        return "meta-analysis"
    if RCT.search(text):
        return "human-rct"
    if MR.search(text):
        return "mendelian"
    if HUMAN.search(text):
        return "human-cohort"
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
            text = blob(t.get("refs"), t.get("note"), json.dumps(t.get("links") or []))
            ev = tier(text, t.get("derived"))
            po = population(text, ev)
            t["evidence"], t["population"] = ev, po
            tiers[ev] += 1
            pops[po] += 1

    sd = json.load(open("symptom_data.json"), object_pairs_hook=OrderedDict)
    for b in sd["bacteria"]:
        for k in ("up", "down", "both"):
            for e in b.get(k, []):
                text = blob(e.get("ref"), e.get("note"), e.get("url"))
                ev = tier(text, e.get("derived"))
                po = population(text, ev)
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
