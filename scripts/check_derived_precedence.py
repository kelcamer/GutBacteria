#!/usr/bin/env python3
"""Fail if any derived cross-feeding link coexists with a measured one.

MEASURED DATA WINS, ALWAYS. A derived link is inferred from a metabolic
relationship, not observed in the condition or symptom it appears under. If
one ever lands on a taxon+symptom pair that already has a real measurement,
the map could render an inferred direction over an observed one - i.e. an
inference silently changing the colour of a line backed by a study.

propagate_cross_feeding.py already refuses to do this (rule 1). This check
makes the guarantee permanent rather than dependent on that script staying
correct, and catches it if derived entries are ever added by hand.
"""
import json
import sys
from collections import defaultdict

bad = []
with open("symptom_data.json") as fh:
    data = json.load(fh)

for b in data.get("bacteria", []):
    seen = defaultdict(list)
    for direction in ("up", "down", "both"):
        for entry in b.get(direction, []):
            seen[entry.get("symptom")].append((direction, bool(entry.get("derived"))))
    for symptom, rows in seen.items():
        measured = [d for d, dv in rows if not dv]
        derived = [d for d, dv in rows if dv]
        if measured and derived:
            bad.append((b["name"], symptom, measured, derived))

if bad:
    for name, symptom, measured, derived in bad:
        print(
            f"{name} / {symptom}: measured={measured} but ALSO derived={derived}",
            file=sys.stderr,
        )
    print(
        f"\n{len(bad)} derived link(s) sitting on top of measured data. "
        "Measured data must always win - drop the derived entry.",
        file=sys.stderr,
    )
    sys.exit(1)

n = sum(
    1
    for b in data.get("bacteria", [])
    for d in ("up", "down", "both")
    for e in b.get(d, [])
    if e.get("derived")
)
print(f"Derived precedence OK: {n} derived links, none overriding measured data.")
