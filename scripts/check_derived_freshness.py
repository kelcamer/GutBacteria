#!/usr/bin/env python3
"""Fail if any derived (cross-feeding) entry disagrees with the measurement it was derived from.

WHY THIS EXISTS
---------------
Reported from the app: the ADHD popup said "Bifidobacterium is up here, and it
feeds Faecalibacterium prausnitzii..." while ADHD's measured Bifidobacterium sat
right next to it saying DOWN. The edge colour was right; the inference was stale.

Root cause: derived entries were written once and then skipped forever on
re-runs ("already derived - must not duplicate"), so correcting a measurement
left every inference built on it frozen at the old direction. Four such entries
had accumulated. propagate_cross_feeding.py now regenerates derived data from
scratch on every run, which makes it a pure function of (measurements x edges) -
this script is the guard that keeps it that way.

Run: python3 scripts/check_derived_freshness.py   (exit 1 on any disagreement)
"""
import json
import os
import re
import sys

# The pre-commit hook runs checks from a temp dir containing only the STAGED
# copies of the data files, so neither "scripts" nor unstaged files are reachable
# by a relative path. Resolve those against this file's own location instead.
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from propagate_cross_feeding import resolve_source  # noqa: E402


def load(name):
    """Prefer the staged copy in cwd; fall back to the repo checkout."""
    path = name if os.path.exists(name) else os.path.join(ROOT, name)
    with open(path) as fh:
        return json.load(fh)

CLAIM = re.compile(r"is (up|down) here")
VIA = re.compile(r"derived via (cf_[A-Za-z0-9_]+)")


def main():
    edges = {e["id"]: e for e in load("cross_feeding.json")["edges"]}
    seed = load("seed_data.json")
    sym = load("symptom_data.json")
    problems = []

    for c in seed["conditions"]:
        measured = {t["name"]: t.get("dir") for t in c.get("taxa", []) if not t.get("derived")}
        for t in c.get("taxa", []):
            if not t.get("derived"):
                continue
            ids = VIA.findall(t.get("refs") or "")
            if not ids:
                problems.append(f"{c['name']} / {t['name']}: derived but names no source edge")
                continue
            e = edges.get(ids[0])
            if e is None:
                problems.append(f"{c['name']} / {t['name']}: cites edge {ids[0]}, which no longer exists")
                continue
            now = resolve_source(measured, e["from"])
            if now != t.get("dir"):
                problems.append(
                    f"{c['name']} / {t['name']}: stored {t.get('dir')}, but its source "
                    f"{e['from']} is now {now}")
            claim = CLAIM.search(t.get("note") or "")
            if claim and claim.group(1) != t.get("dir"):
                problems.append(
                    f"{c['name']} / {t['name']}: note says '{claim.group(1)}' but dir is {t.get('dir')}")

    observed = {}
    for b in sym["bacteria"]:
        for d in ("up", "down", "both"):
            for l in b.get(d, []):
                if not l.get("derived"):
                    observed.setdefault(b["name"], {})[l["symptom"]] = d
    for b in sym["bacteria"]:
        for d in ("up", "down", "both"):
            for l in b.get(d, []):
                if not l.get("derived"):
                    continue
                ids = VIA.findall(l.get("ref") or "")
                if not ids:
                    problems.append(f"{b['name']} x {l['symptom']}: derived but names no source edge")
                    continue
                e = edges.get(ids[0])
                if e is None:
                    problems.append(f"{b['name']} x {l['symptom']}: cites edge {ids[0]}, which no longer exists")
                    continue
                now = observed.get(e["from"], {}).get(l["symptom"])
                if now != d:
                    problems.append(
                        f"{b['name']} x {l['symptom']}: stored {d}, but its source {e['from']} is now {now}")
                claim = CLAIM.search(l.get("note") or "")
                if claim and claim.group(1) != d:
                    problems.append(
                        f"{b['name']} x {l['symptom']}: note says '{claim.group(1)}' but direction is {d}")

    if problems:
        for p in problems:
            print(f"STALE DERIVED: {p}", file=sys.stderr)
        print(
            f"\n{len(problems)} derived entrie(s) disagree with their source. "
            "Fix with: python3 scripts/propagate_cross_feeding.py --write",
            file=sys.stderr)
        return 1
    print("Derived freshness OK: every inference agrees with the measurement it came from.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
