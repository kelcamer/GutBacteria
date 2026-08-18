#!/usr/bin/env python3
"""What is MISSING from the atlas, as opposed to what is wrong with it.

The other checks ask whether what is here is sound. This asks what is not here,
which is invisible by construction: a condition nobody has filled in looks
exactly like a condition with nothing to say, and a taxon measured in one file
but not the other looks complete from whichever file you happen to open.

Gaps are not errors. A thin condition may simply be a thin literature. The
output is a worklist ordered by how much a reader would notice.

    python3 scripts/find_data_gaps.py
    python3 scripts/find_data_gaps.py --section cross-file
    python3 scripts/find_data_gaps.py --json gaps.json
"""
import argparse
import json
import os
import sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_citation_coverage import load_claims  # noqa: E402

DIRECTIONS = ("up", "down", "both", "none")


def load(seed_path, symptom_path, cf_path):
    seed = json.load(open(seed_path, encoding="utf-8"))
    sd = json.load(open(symptom_path, encoding="utf-8"))
    try:
        cf = json.load(open(cf_path, encoding="utf-8"))
    except (OSError, ValueError):
        cf = {}
    return seed, sd, cf


def gaps(seed, sd, cf, claims):
    out = {}

    # --- 1. Cross-file asymmetry -------------------------------------------
    # A condition taxon with no matching symptom entry is invisible on the
    # symptom map, and vice versa. Each file looks complete on its own.
    # Only meaningful where the condition ALSO exists as a symptom - the two
    # files model different things, so demanding a symptom entry for every
    # condition taxon flagged 682 of 719 and meant nothing.
    sym_names = set(sd.get("symptoms", []))
    sym_pairs = set()
    for b in sd["bacteria"]:
        for d in DIRECTIONS:
            for e in b.get(d, []):
                sym_pairs.add((b["name"], e.get("symptom")))
    cond_only = []
    for c in seed["conditions"]:
        counterparts = [s for s in (c["name"], c["name"] + " status") if s in sym_names]
        if not counterparts:
            continue
        for t in c.get("taxa", []):
            if t.get("derived"):
                continue
            if not any((t["name"], s) in sym_pairs for s in counterparts):
                cond_only.append(f"{c['name']} / {t['name']}")
    out["cross-file"] = cond_only
    out["_paired-conditions"] = sorted(
        c["name"] for c in seed["conditions"]
        if c["name"] in sym_names or c["name"] + " status" in sym_names)

    # --- 2. Thin conditions and symptoms -----------------------------------
    cond_size = {c["name"]: len([t for t in c.get("taxa", []) if not t.get("derived")])
                 for c in seed["conditions"]}
    out["thin-conditions"] = sorted((n for n, k in cond_size.items() if k < 8),
                                    key=lambda n: cond_size[n])
    sym_size = Counter()
    for b in sd["bacteria"]:
        for d in DIRECTIONS:
            for e in b.get(d, []):
                if not e.get("derived"):
                    sym_size[e.get("symptom")] += 1
    listed = set(sd.get("symptoms", []))
    out["empty-symptoms"] = sorted(s for s in listed if sym_size[s] == 0)
    out["thin-symptoms"] = sorted((s for s in listed if 0 < sym_size[s] < 5),
                                  key=lambda s: sym_size[s])

    # --- 3. Nobody records nulls -------------------------------------------
    # A condition with no grey entry has never had a "we looked and found
    # nothing" recorded - so absence of a taxon is ambiguous between untested
    # and tested-null.
    has_null = set()
    for c in seed["conditions"]:
        if any(t.get("dir") == "none" for t in c.get("taxa", [])):
            has_null.add(c["name"])
    out["no-null-recorded"] = sorted(set(cond_size) - has_null)

    # --- 4. Direction monocultures -----------------------------------------
    # Every taxon pointing the same way usually means one source was mined for
    # its "increased" list and the decreases were never entered.
    mono = []
    for c in seed["conditions"]:
        dirs = Counter(t.get("dir") for t in c.get("taxa", []) if not t.get("derived"))
        total = sum(dirs.values())
        if total >= 5 and max(dirs.values()) == total:
            mono.append(f"{c['name']} ({total} taxa, all '{list(dirs)[0]}')")
    out["direction-monoculture"] = mono

    # --- 5. Rank monocultures ----------------------------------------------
    # Phylum-only conditions say very little: a phylum averages members that
    # move in opposite directions.
    def rank_of(name):
        if name.endswith("aceae"):
            return "family"
        if name.endswith("ales"):
            return "order"
        if name in ("Firmicutes", "Bacteroidetes", "Proteobacteria", "Actinobacteria",
                    "Verrucomicrobia", "Fusobacteria", "Tenericutes", "Cyanobacteria"):
            return "phylum"
        return "species" if " " in name else "genus"
    coarse = []
    for c in seed["conditions"]:
        ranks = Counter(rank_of(t["name"]) for t in c.get("taxa", []) if not t.get("derived"))
        total = sum(ranks.values())
        if total >= 4 and (ranks["phylum"] + ranks["family"] + ranks["order"]) / total > 0.6:
            coarse.append(f"{c['name']} ({ranks['phylum']}p/{ranks['family']}f/{ranks['order']}o of {total})")
    out["coarse-rank-only"] = coarse

    # --- 6. Unclassified evidence and unknown population --------------------
    ev = Counter()
    pop = Counter()
    for c in seed["conditions"]:
        for t in c.get("taxa", []):
            if not t.get("derived"):
                ev[t.get("evidence", "missing")] += 1
                pop[t.get("population", "missing")] += 1
    for b in sd["bacteria"]:
        for d in DIRECTIONS:
            for e in b.get(d, []):
                if not e.get("derived"):
                    ev[e.get("evidence", "missing")] += 1
                    pop[e.get("population", "missing")] += 1
    out["_evidence-tiers"] = dict(ev.most_common())
    out["_populations"] = dict(pop.most_common())

    # --- 7. Cross-feeding partners that exist nowhere in the data ----------
    named = {c.taxon for c in claims}
    cf_taxa = set()
    for edge in cf.get("edges", []) or []:
        for key in ("from", "to", "source", "target", "producer", "consumer"):
            if isinstance(edge, dict) and edge.get(key):
                cf_taxa.add(edge[key])
    out["cross-feeding-orphans"] = sorted(t for t in cf_taxa if t not in named)

    # --- 7b. One taxon, two spellings -------------------------------------
    # Found the hard way: "Escherichia-Shigella" (4 conditions) and
    # "Escherichia/Shigella" (7 conditions + 20 symptom links) were the same
    # organism drawn as two separate nodes, splitting its cross-condition
    # context in half. Normalising away punctuation and case catches the class.
    import re as _re
    all_names = {t["name"] for c in seed["conditions"] for t in c.get("taxa", [])}
    all_names |= {b["name"] for b in sd["bacteria"]}
    by_norm = defaultdict(set)
    for n in all_names:
        by_norm[_re.sub(r"[^a-z0-9]", "", n.lower())].add(n)
    out["split-identity"] = [" / ".join(sorted(v)) for v in by_norm.values() if len(v) > 1]

    # --- 8. Taxa that appear exactly once in the whole atlas ---------------
    # No cross-condition context: nothing to compare the direction against.
    counts = Counter(c.taxon for c in claims)
    out["single-appearance-taxa"] = sorted(t for t, k in counts.items() if k == 1)

    # --- 9. Conditions with no note ----------------------------------------
    out["no-condition-note"] = sorted(c["name"] for c in seed["conditions"]
                                      if len((c.get("note") or "").strip()) < 80)

    # --- 10. Contested clusters --------------------------------------------
    contested = Counter(c.taxon for c in claims if c.direction == "both")
    out["_contested-total"] = sum(contested.values())
    out["contested-clusters"] = [f"{t} x{k}" for t, k in contested.most_common(10)]

    return out


ORDER = ["cross-file", "empty-symptoms", "thin-symptoms", "thin-conditions",
         "direction-monoculture", "coarse-rank-only", "no-null-recorded",
         "split-identity", "cross-feeding-orphans", "single-appearance-taxa", "no-condition-note",
         "contested-clusters"]

BLURB = {
    "cross-file": "taxa missing from the symptom map, for conditions that HAVE a symptom counterpart",
    "empty-symptoms": "symptoms listed but with zero bacteria (dead nodes)",
    "thin-symptoms": "symptoms with fewer than 5 bacteria",
    "thin-conditions": "conditions with fewer than 8 taxa",
    "direction-monoculture": "conditions where every taxon points the same way",
    "coarse-rank-only": "conditions described mostly at phylum/family/order level",
    "no-null-recorded": "conditions with no grey 'tested, found nothing' entry",
    "split-identity": "one taxon spelled two ways - drawn as two nodes, context split in half",
    "cross-feeding-orphans": "cross-feeding partners that appear nowhere in the atlas",
    "single-appearance-taxa": "taxa appearing exactly once - no cross-condition context",
    "no-condition-note": "conditions with a note under 80 characters",
    "contested-clusters": "taxa most often marked contested",
}


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--seed", default="seed_data.json")
    ap.add_argument("--symptom", default="symptom_data.json")
    ap.add_argument("--cross-feeding", default="cross_feeding.json")
    ap.add_argument("--section", help="print one section in full")
    ap.add_argument("--limit", type=int, default=10)
    ap.add_argument("--json", metavar="PATH")
    args = ap.parse_args()

    seed, sd, cf = load(args.seed, args.symptom, args.cross_feeding)
    claims, derived = load_claims(args.seed, args.symptom)
    found = gaps(seed, sd, cf, claims)

    print(f"DATA GAPS - {len(seed['conditions'])} conditions, {len(sd.get('symptoms', []))} symptoms, "
          f"{len(sd['bacteria'])} bacteria, {len(claims)} measured claims\n")

    if args.section:
        items = found.get(args.section, [])
        print(f"  --- {len(items)} in '{args.section}' ---")
        for i in items:
            print(f"    {i}")
        return

    for key in ORDER:
        items = found.get(key, [])
        print(f"  {len(items):>4}  {key:<24} {BLURB[key]}")
        for i in items[:args.limit]:
            print(f"          {i}")
        if len(items) > args.limit:
            print(f"          ... {len(items) - args.limit} more (--section {key})")
        print()

    print(f"  evidence tiers: {found['_evidence-tiers']}")
    print(f"  populations   : {found['_populations']}")
    print(f"  contested entries in total: {found['_contested-total']}")

    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(found, fh, indent=1)
        print(f"\n  wrote {args.json}")


if __name__ == "__main__":
    main()
