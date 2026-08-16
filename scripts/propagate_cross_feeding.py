#!/usr/bin/env python3
"""Propose derived cross-feeding entries across conditions and symptoms.

DRY RUN BY DEFAULT. Pass --write to actually modify the JSON.

WHAT THIS DOES
--------------
cross_feeding.json says who feeds whom. If Bifidobacterium is raised in some
condition, and Bifidobacterium feeds Faecalibacterium prausnitzii, then
F. prausnitzii is *plausibly* raised there too - not because anyone measured
it, but because the metabolic relationship implies it.

Those proposals get written with `"derived": true` so they can be filtered out
by the Show/Hide Crossfeeding toggle, and every note leads with the fact that
it is inferred.

THE THREE RULES (agreed before this was written - they are the whole point)
--------------------------------------------------------------------------
1. NEVER derive over an observation. If the target already has a measured entry
   for that taxon, skip it. A measurement always beats an inference, even when
   they agree - and when they DISAGREE that is a finding, so it gets reported
   rather than silently resolved.

2. DOWN-DIRECTION IS WEAKER THAN UP. The cocultures showed "more Bifidobacterium
   -> more butyrate producers". The reverse ("less -> fewer") is plausible but
   was not tested. Derived-down entries are marked lower confidence.

3. STRUCTURED, NOT PROSE. `derived: true` is a field, not a sentence. Prose
   cannot be filtered, sorted, audited, or bulk-reverted if an edge is retracted.

DEPENDENCY - READ THIS
----------------------
Do NOT --write until `setCrossFeedVisible()` exists in buildSymptomMap.js and
buildMap.js. The UI toggle already ships and defaults to "hidden"; if derived
data lands before the engine can hide it, the button silently lies.
See CROSS_FEEDING_UI_PLAN.md.
"""
import argparse
import collections
import json

CF = "cross_feeding.json"
SEED = "seed_data.json"
SYM = "symptom_data.json"

# Edges whose endpoints are not real taxon nodes (host lactate, community
# butyrate pool) cannot propagate - there is nothing to match against.
def usable_edges(cf, bacteria_names):
    out = []
    for e in cf["edges"]:
        if e["from"] in bacteria_names and e["to"] in bacteria_names:
            out.append(e)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="actually modify symptom_data.json")
    args = ap.parse_args()

    cf = json.load(open(CF))
    sd = json.load(open(SYM), object_pairs_hook=collections.OrderedDict)
    names = {b["name"] for b in sd["bacteria"]}
    edges = usable_edges(cf, names)

    print(f"usable edges (both endpoints are taxa): {len(edges)} of {len(cf['edges'])}")
    for e in edges:
        print(f"  {e['from']} -> {e['to']}  ({e['product']}, {e['evidence']})")
    print()

    # index: taxon -> {symptom: direction} as OBSERVED today
    observed = collections.defaultdict(dict)
    for b in sd["bacteria"]:
        for d in ("up", "down", "both"):
            for en in b.get(d, []):
                if not en.get("derived"):
                    observed[b["name"]][en["symptom"]] = d

    proposals, conflicts, skipped = [], [], 0
    for e in edges:
        src, dst = e["from"], e["to"]
        for symptom, direction in observed.get(src, {}).items():
            if direction == "both":
                continue  # ambiguous source, nothing to propagate
            existing = observed.get(dst, {}).get(symptom)
            if existing:
                skipped += 1
                if existing != direction:
                    conflicts.append((symptom, src, direction, dst, existing))
                continue
            proposals.append((symptom, src, dst, direction, e))

    print(f"proposed derived entries : {len(proposals)}")
    print(f"skipped (already measured): {skipped}")
    print(f"  of which DISAGREE with the derived direction: {len(conflicts)}\n")

    if conflicts:
        print("CONFLICTS - measured data points the other way. These are findings,")
        print("not errors to paper over. Review before trusting the edge:")
        for sym, src, sdir, dst, edir in conflicts[:20]:
            print(f"  {sym}: {src} {sdir} would imply {dst} {sdir}, but {dst} is measured {edir}")
        print()

    by_symptom = collections.Counter(p[0] for p in proposals)
    print("top targets by proposed additions:")
    for s, n in by_symptom.most_common(12):
        print(f"  {n:3}  {s}")

    if not args.write:
        print("\nDRY RUN - nothing written. Re-run with --write once")
        print("setCrossFeedVisible() exists in both graph engines.")
        return

    added = 0
    for symptom, src, dst, direction, e in proposals:
        for b in sd["bacteria"]:
            if b["name"] != dst:
                continue
            conf = "lower confidence - the reverse direction was not tested" if direction == "down" \
                else "same direction as the demonstrated cross-feed"
            b.setdefault(direction, [])
            b[direction].append(collections.OrderedDict([
                ("symptom", symptom),
                ("derived", True),
                ("note",
                 f"FROM CROSS-FEEDING - inferred, not measured for this entry. "
                 f"{src} is {direction} here, and {src} feeds {dst} "
                 f"({', '.join(e['metabolites'])} -> {e['product']}), so {dst} is "
                 f"expected to follow. {conf.capitalize()}. The underlying feeding "
                 f"relationship is real ({e['evidence']}); its presence in THIS "
                 f"condition/symptom is an inference. Source edge: {e['id']}."),
                ("ref", f"derived via {e['id']} - {e['ref']}"),
                ("url", e["url"]),
            ]))
            b["count"] = b.get("count", 0) + 1
            added += 1
    json.dump(sd, open(SYM, "w"), indent=1, ensure_ascii=False)
    open(SYM, "a").write("\n")
    print(f"\nWROTE {added} derived entries to {SYM}.")
    print("Now verify: python3 scripts/check_duplicate_keys.py && python3 scripts/sync_embedded_data.py")


if __name__ == "__main__":
    main()
