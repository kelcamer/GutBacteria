#!/usr/bin/env python3
"""Build crossfeeding_inferences.json - the auditable manifest of EVERY
cross-feeding inference the atlas applies, computed by one rule for every node.

WHY THIS FILE EXISTS
--------------------
cross_feeding.json holds the biology (who feeds whom). The inferences it
implies are materialized as `derived: true` taxa inside seed_data.json
(conditions) and symptom_data.json (symptoms) - but scattered across ~1000
nodes they cannot be read as a set, so it was impossible to see at a glance
that (say) FUT2 got the Faecalibacterium->Desulfovibrio inference while ADHD
did not. This manifest is the flat, queryable projection of that layer:
one row per inference, plus the conflicts where measurement overrides an
inference and the ambiguous cases where two edges disagree.

It is GENERATED, not hand-maintained - regenerate after any data edit:
    python3 scripts/build_crossfeeding_inferences.py
so it can never drift from the nodes it describes.

THE RULES (same three the propagation engine enforces)
------------------------------------------------------
1. Measured data always wins. An inference is never written over a measured
   taxon; where they disagree it is reported as a conflict, not resolved.
2. Down-direction is weaker than up (the cocultures showed more feeder ->
   more product; the reverse is plausible but untested).
3. A genus measurement can stand in for its species and vice versa. Flagged
   per row as `genus_level_source` so the weaker genus->species inferences
   (e.g. a polyphyletic genus like Eubacterium) stay visible.
"""
import json
import collections
import importlib.util

spec = importlib.util.spec_from_file_location("p", "scripts/propagate_cross_feeding.py")
p = importlib.util.module_from_spec(spec); spec.loader.exec_module(p)

CF, SEED, SYM = "cross_feeding.json", "seed_data.json", "symptom_data.json"
OUT = "crossfeeding_inferences.json"

cf = json.load(open(CF))
seed = json.load(open(SEED))
sd = json.load(open(SYM))
names = {b["name"] for b in sd["bacteria"]}
edges = p.usable_edges(cf, names)
edge_by_id = {e["id"]: e for e in cf["edges"]}


def source_rank(have, src):
    """'species' if the feeder was matched at its own rank, 'genus' if a genus
    measurement stood in for a species feeder (or a species stood in for a genus)."""
    if src in have:
        return "exact"
    g = p.genus_of(src)
    if g != src and g in have:
        return "genus->species"
    return "species->genus"


# ---- condition inferences (recomputed by the same engine that writes them) ----
cond_inferences, cond_conflicts, cond_ambiguous = [], [], []
node_id_by_key = {(c["id"], t["name"]): t.get("id")
                  for c in seed["conditions"] for t in c["taxa"] if t.get("derived")}

for cond in seed["conditions"]:
    have = {t["name"]: t.get("dir") for t in cond["taxa"] if not t.get("derived")}
    byd = collections.defaultdict(list)
    for e in edges:
        direction = p.resolve_source(have, e["from"])
        if not direction:
            continue
        if p.already_covered(have, e["to"]):
            if have.get(e["to"]) and have[e["to"]] != direction:
                cond_conflicts.append(collections.OrderedDict([
                    ("scope", "condition"), ("target", cond["name"]), ("taxon", e["to"]),
                    ("inference_would_be", direction), ("measured_as", have[e["to"]]),
                    ("via_edge", e["id"]), ("feeder", e["from"]),
                    ("reading", "measured data wins - inference suppressed"),
                ]))
            continue
        byd[e["to"]].append((direction, e))
    for dst, items in byd.items():
        dirs = {d for d, _ in items}
        if len(dirs) > 1:
            cond_ambiguous.append(collections.OrderedDict([
                ("scope", "condition"), ("target", cond["name"]), ("taxon", dst),
                ("directions", sorted(dirs)), ("edges", [e["id"] for _, e in items]),
                ("reading", "two real feeding routes imply opposite directions - nothing inferred"),
            ]))
            continue
        direction = dirs.pop()
        edges_for = [e for _, e in items]
        e0 = edges_for[0]
        rank = source_rank(have, e0["from"])
        cond_inferences.append(collections.OrderedDict([
            ("scope", "condition"),
            ("target", cond["name"]),
            ("target_id", cond["id"]),
            ("taxon", dst),
            ("dir", direction),
            ("via_edge", e0["id"]),
            ("feeder", e0["from"]),
            ("feeder_measured_as", e0["from"] if rank == "exact"
             else f"{p.genus_of(e0['from'])} (genus)" if rank == "genus->species"
             else f"species of {e0['from']}"),
            ("genus_level_source", rank != "exact"),
            ("confidence", "lower - reverse direction not tested" if direction == "down"
             else "same direction as demonstrated cross-feed"),
            ("corroborating_edges", [e["id"] for _, e in items[1:]]),
            ("node_id", node_id_by_key.get((cond["id"], dst))),
        ]))

# ---- symptom inferences (read from the materialized derived entries) ----
sym_inferences = []
for b in sd["bacteria"]:
    for d in ("up", "down", "both", "none"):
        for en in b.get(d, []):
            if not en.get("derived"):
                continue
            note = en.get("note", "")
            eid = None
            if "Source edge:" in note:
                eid = note.split("Source edge:")[1].split(".")[0].strip()
            e0 = edge_by_id.get(eid)
            sym_inferences.append(collections.OrderedDict([
                ("scope", "symptom"),
                ("target", en.get("symptom")),
                ("taxon", b["name"]),
                ("dir", d),
                ("via_edge", eid),
                ("feeder", e0["from"] if e0 else None),
                ("confidence", "lower - reverse direction not tested" if d == "down"
                 else "same direction as demonstrated cross-feed"),
            ]))

manifest = collections.OrderedDict([
    ("_about", [
        "Auditable manifest of every cross-feeding inference the atlas applies.",
        "GENERATED by scripts/build_crossfeeding_inferences.py - do not hand-edit;",
        "regenerate after any change to cross_feeding.json, seed_data.json or",
        "symptom_data.json so it never drifts from the derived nodes it mirrors.",
        "Biology lives in cross_feeding.json; the derived nodes live inline in",
        "seed_data.json / symptom_data.json marked `derived: true`. This is the",
        "flat projection that makes the whole inference layer readable at once.",
    ]),
    ("rules", [
        "1. Measured data always wins - an inference is never written over a "
        "measured taxon; disagreements are listed under `conflicts`.",
        "2. Down-direction is weaker than up - the reverse of the demonstrated "
        "cross-feed was not tested (`confidence` reflects this).",
        "3. A genus measurement can stand in for its species and vice versa; "
        "rows where that happened carry `genus_level_source: true`.",
    ]),
    ("counts", collections.OrderedDict([
        ("condition_inferences", len(cond_inferences)),
        ("symptom_inferences", len(sym_inferences)),
        ("condition_conflicts", len(cond_conflicts)),
        ("condition_ambiguous", len(cond_ambiguous)),
        ("genus_level_source_inferences",
         sum(1 for r in cond_inferences if r["genus_level_source"])),
    ])),
    ("edges_used", [collections.OrderedDict([
        ("id", e["id"]), ("from", e["from"]), ("to", e["to"]),
        ("metabolites", e["metabolites"]), ("product", e["product"]),
        ("evidence", e["evidence"]), ("ref", e["ref"]),
    ]) for e in edges]),
    ("condition_inferences", cond_inferences),
    ("symptom_inferences", sym_inferences),
    ("conflicts", cond_conflicts),
    ("ambiguous", cond_ambiguous),
])

json.dump(manifest, open(OUT, "w"), indent=1, ensure_ascii=False)
open(OUT, "a").write("\n")
print(f"Wrote {OUT}")
for k, v in manifest["counts"].items():
    print(f"  {k}: {v}")
