#!/usr/bin/env python3
"""Fail if any JSON object in seed_data.json / symptom_data.json has duplicate keys.

json.load() silently keeps only the LAST value for a duplicated key, so an
edit that inserts a second "down": [...] into a bacterium that already has one
drops an entire array without any parse error. That happened once while adding
Oscillospira/Phascolarctobacterium entries; this check makes it loud instead.
"""
import json
import sys

FILES = ["seed_data.json", "symptom_data.json"]
bad = []


def make_hook(path):
    def hook(pairs):
        seen = {}
        for k, v in pairs:
            if k in seen:
                bad.append((path, seen.get("name", "<unnamed object>"), k))
            seen[k] = v
        return seen

    return hook


for f in FILES:
    with open(f) as fh:
        json.load(fh, object_pairs_hook=make_hook(f))

if bad:
    for path, name, key in bad:
        print(f"{path}: duplicate key {key!r} in object {name!r}", file=sys.stderr)
    print(
        f"\n{len(bad)} duplicate key(s) found. json.load keeps only the last one, "
        "so data is being silently dropped. Merge the arrays instead.",
        file=sys.stderr,
    )
    sys.exit(1)

print("No duplicate JSON keys.")
