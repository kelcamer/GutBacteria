#!/usr/bin/env python3
"""Structural invariants for the atlas data. Runs in pre-commit.

Each check exists because the corresponding bug was actually found in this
data, not because it was imagined:

1. DUPLICATE TAXA - Parkinson's carried Escherichia/Shigella twice with
   OPPOSITE directions, so the map drew the same taxon as increased and
   decreased simultaneously. Depression carried Alistipes twice.

2. CROSS-FILE DIRECTION - Anxiety/Lactobacillus read UP on the Conditions
   screen and DOWN on the Symptom map. The app contradicted itself depending
   on which screen you happened to be on, which is the worst kind of error
   here: both answers look authoritative.

3. ORPHANED SYMPTOMS - a link pointing at a symptom that is not in the
   symptoms list renders as a dead node.

4. SELF-CONTRADICTION - the same taxon listed under both up and down for one
   symptom.

5. COUNT DRIFT - the `count` field disagreeing with the actual number of
   links, which silently changes node sizing on the maps.
"""
import json
import sys
from collections import Counter, defaultdict

seed = json.load(open("seed_data.json"))
sd = json.load(open("symptom_data.json"))
fail = []

# 1
for c in seed["conditions"]:
    for name, k in Counter(t["name"] for t in c.get("taxa", [])).items():
        if k > 1:
            fail.append(f"DUPLICATE TAXON: {c['name']} / {name} appears {k}x")

# 2
sym = {}
for b in sd["bacteria"]:
    for d in ("up", "down", "both", "none"):
        for e in b.get(d, []):
            sym[(b["name"], e.get("symptom"))] = d
for c in seed["conditions"]:
    for t in c.get("taxa", []):
        if t.get("derived"):
            continue
        for key in [(t["name"], c["name"]), (t["name"], c["name"] + " status")]:
            d = sym.get(key)
            if d and d != t.get("dir") and "both" not in (d, t.get("dir")):
                fail.append(
                    f"CROSS-FILE CONFLICT: {c['name']} / {t['name']} is "
                    f"'{t.get('dir')}' in seed_data but '{d}' in symptom_data"
                )

# 3
valid = set(sd.get("symptoms", []))
for b in sd["bacteria"]:
    for d in ("up", "down", "both", "none"):
        for e in b.get(d, []):
            if e.get("symptom") not in valid:
                fail.append(f"ORPHANED SYMPTOM: {b['name']} -> {e.get('symptom')!r}")

# 4
for b in sd["bacteria"]:
    seen = defaultdict(set)
    for d in ("up", "down", "both", "none"):
        for e in b.get(d, []):
            seen[e.get("symptom")].add(d)
    for s, dirs in seen.items():
        if "up" in dirs and "down" in dirs:
            fail.append(f"SELF-CONTRADICTION: {b['name']} / {s} listed both up and down")

# 5
for b in sd["bacteria"]:
    actual = sum(len(b.get(d, [])) for d in ("up", "down", "both", "none"))
    if b.get("count") != actual:
        fail.append(f"COUNT DRIFT: {b['name']} count={b.get('count')} actual={actual}")

if fail:
    for f in fail:
        print(f, file=sys.stderr)
    print(f"\n{len(fail)} data integrity failure(s).", file=sys.stderr)
    sys.exit(1)
print(
    f"Data integrity OK: {sum(len(c.get('taxa', [])) for c in seed['conditions'])} condition taxa, "
    f"{sum(len(b.get(d, [])) for b in sd['bacteria'] for d in ('up', 'down', 'both', 'none'))} symptom links."
)
