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
def genus_of(name):
    """First word of a taxon name. 'Bifidobacterium adolescentis' -> 'Bifidobacterium'."""
    return (name or "").split()[0] if name else ""


def resolve_source(measured, src):
    """Direction for a genus-level edge source against species-level data.

    Conditions frequently list species (Bifidobacterium adolescentis,
    B. pseudocatenulatum, B. bifidum) but never the bare genus, while
    cross_feeding.json's edges are genus-level. Without this, no match is
    found and propagation silently skips - which is exactly why FUT2 received
    zero derived taxa despite having three Bifidobacterium species, all down.

    Returns a direction only when every matching entry AGREES. Mixed
    directions across species are ambiguous, so nothing is inferred.
    """
    if src in measured:
        d = measured[src]
        return None if d == "both" else d
    dirs = {d for n, d in measured.items() if genus_of(n) == src}
    if len(dirs) == 1:
        only = dirs.pop()
        return None if only == "both" else only
    return None


def already_covered(measured, dst):
    """True if dst itself, or a measurement that genuinely speaks for it, exists.

    A genus-level measurement covers its species: if Faecalibacterium is measured,
    do not infer Faecalibacterium prausnitzii on top of it - that was the ADHD bug,
    where an inference asserted "up" next to a measured genus saying "down".

    A SIBLING species does not. Measuring Eubacterium xylanophilum says nothing
    about Eubacterium hallii; they are different organisms that happen to share a
    genus name. The old rule treated any same-genus name as coverage, which
    silently suppressed ~20 legitimate inferences (E. hallii and Anaerostipes
    across many conditions) for no defensible reason.
    """
    if dst in measured:
        return True
    g = genus_of(dst)
    if g in measured:
        return True                      # the genus node itself is measured
    if dst == g:
        # dst IS a genus, and a species of it is measured - that speaks for it.
        return any(genus_of(n) == g and n != g for n in measured)
    return False


def collapse_multi_edge(grouped, label_of):
    """Resolve several edges proposing the SAME target in the same place.

    Two edges can independently imply the same taxon - Bifidobacterium feeds
    Roseburia acetate AND Akkermansia feeds Roseburia mucin O-glycans, so any
    condition measuring both sources proposes Roseburia twice. Left unhandled
    that wrote the taxon in twice (and, when the two sources were measured in
    OPPOSITE directions, wrote it in as both up and down - a node contradicting
    itself). Neither was caught before because until now no two edges shared a
    target.

    Resolution follows the same principle as rule 1:
      - edges AGREE  -> one entry, crediting every contributing edge, so the
                        corroboration is visible rather than collapsed away
      - edges DISAGREE -> infer NOTHING and report it. Two real feeding
                        relationships pulling opposite ways is a finding about
                        the evidence, not something to resolve by picking the
                        edge that happens to sort first.

    Returns (resolved, ambiguous) where resolved values carry every edge that
    voted for them.
    """
    resolved, ambiguous = [], []
    for key, items in grouped.items():
        directions = {d for d, _e in items}
        if len(directions) > 1:
            ambiguous.append((label_of(key), sorted(directions), [e["id"] for _d, e in items]))
            continue
        direction = directions.pop()
        resolved.append((key, direction, [e for _d, e in items]))
    return resolved, ambiguous


def multi_edge_note(edges):
    """The 'and this second edge says the same thing' clause, or nothing."""
    if len(edges) < 2:
        return ""
    others = "; ".join(
        f"{e['from']} -> {e['to']} ({', '.join(e['metabolites'])}, {e['evidence']}, {e['id']})"
        for e in edges[1:]
    )
    return (f" INDEPENDENTLY CORROBORATED: {len(edges)} separate feeding routes imply "
            f"the same direction here - also {others}.")


def strip_derived_symptoms(sd):
    """Remove every derived entry, returning {(taxon, symptom): dir} of what was there.

    Derived data is a FUNCTION of (measurements x edges). It was previously written
    once and then skipped forever on re-runs ("already derived - must not
    duplicate"), which meant that correcting a measurement left every inference
    built on it frozen at the old direction. Real example: ADHD's Bifidobacterium
    was corrected to `down`, and the F. prausnitzii and E. hallii inferences under
    ADHD kept asserting "Bifidobacterium is up here" - stating the opposite of the
    measurement sitting next to them on the same node.

    So regeneration now starts from a clean slate every run. Nothing of value is
    lost: these entries are machine-written, and the note text says so.
    """
    old = {}
    for b in sd["bacteria"]:
        for d in ("up", "down", "both", "none"):
            keep = []
            for e in b.get(d, []):
                if e.get("derived"):
                    old[(b["name"], e["symptom"])] = d
                    b["count"] = max(0, b.get("count", 1) - 1)
                else:
                    keep.append(e)
            if d in b:
                b[d] = keep
    return old


def strip_derived_conditions(seed):
    """Same, for seed_data.json's conditions. See strip_derived_symptoms."""
    old = {}
    for c in seed["conditions"]:
        keep = []
        for t in c.get("taxa", []):
            if t.get("derived"):
                old[(c["name"], t["name"])] = t.get("dir")
            else:
                keep.append(t)
        c["taxa"] = keep
    return old


def report_diff(label, old, new):
    """Print only what actually moved - added, dropped, or flipped direction."""
    added = [k for k in new if k not in old]
    dropped = [k for k in old if k not in new]
    flipped = [(k, old[k], new[k]) for k in new if k in old and old[k] != new[k]]
    print(f"\n{label}: {len(new)} derived entries regenerated "
          f"({len(added)} new, {len(dropped)} no longer supported, {len(flipped)} DIRECTION CHANGED)")
    for k, o, n in flipped:
        print(f"  FLIPPED {k[0]} / {k[1]}: {o} -> {n}  (the measurement it depends on changed)")
    for k in dropped:
        print(f"  DROPPED {k[0]} / {k[1]}: its source is no longer measured, or is now ambiguous")


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
    # Clean slate, so a corrected measurement propagates instead of leaving a
    # stale inference behind it. See strip_derived_symptoms.
    prior_symptoms = strip_derived_symptoms(sd)
    names = {b["name"] for b in sd["bacteria"]}
    edges = usable_edges(cf, names)

    print(f"usable edges (both endpoints are taxa): {len(edges)} of {len(cf['edges'])}")
    for e in edges:
        print(f"  {e['from']} -> {e['to']}  ({e['product']}, {e['evidence']})")
    print()

    # index: taxon -> {symptom: direction} as OBSERVED today
    observed = collections.defaultdict(dict)
    for b in sd["bacteria"]:
        for d in ("up", "down", "both", "none"):
            for en in b.get(d, []):
                if not en.get("derived"):
                    observed[b["name"]][en["symptom"]] = d

    proposals, conflicts, skipped = [], [], 0
    for e in edges:
        src, dst = e["from"], e["to"]
        for symptom, direction in observed.get(src, {}).items():
            if direction == "both":
                continue  # ambiguous source, nothing to propagate
            if any(en.get("symptom") == symptom
                   for b in sd["bacteria"] if b["name"] == dst
                   for dd in ("up", "down", "both", "none") for en in b.get(dd, [])
                   if en.get("derived")):
                continue  # already derived - re-running must not duplicate
            existing = observed.get(dst, {}).get(symptom)
            if existing:
                skipped += 1
                if existing != direction:
                    conflicts.append((symptom, src, direction, dst, existing))
                continue
            proposals.append((symptom, src, dst, direction, e))

    # Collapse edges that propose the SAME taxon for the SAME symptom before
    # anything is written - see collapse_multi_edge.
    grouped = collections.OrderedDict()
    for symptom, src, dst, direction, e in proposals:
        grouped.setdefault((dst, symptom), []).append((direction, e))
    resolved, ambiguous = collapse_multi_edge(grouped, lambda k: f"{k[0]} / {k[1]}")
    proposals = [(symptom, dst, direction, edges_for)
                 for (dst, symptom), direction, edges_for in resolved]

    if ambiguous:
        print("AMBIGUOUS - two feeding routes imply OPPOSITE directions, so nothing")
        print("was inferred for these. Worth a look: both edges are real.")
        for label, dirs, ids in ambiguous:
            print(f"  {label}: {' vs '.join(dirs)} (edges: {', '.join(ids)})")
        print()

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
        print("\nDRY RUN - nothing written (symptoms).")
        propagate_conditions(cf, args)
        return

    added = 0
    for symptom, dst, direction, edges_for in proposals:
        e = edges_for[0]
        src = e["from"]
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
                 f"condition/symptom is an inference. Source edge: {e['id']}."
                 + multi_edge_note(edges_for)),
                ("ref", "Inferred source (evidence for the FEEDING RELATIONSHIP, not for this "
                       "symptom/condition - nobody measured this taxon here): "
                       + " | ".join(f"derived via {x['id']} - {x['ref']}" for x in edges_for)),
                ("url", e["url"]),
            ]))
            b["count"] = b.get("count", 0) + 1
            added += 1
    json.dump(sd, open(SYM, "w"), indent=1, ensure_ascii=False)
    open(SYM, "a").write("\n")
    now = {}
    for b in sd["bacteria"]:
        for d in ("up", "down", "both", "none"):
            for e in b.get(d, []):
                if e.get("derived"):
                    now[(b["name"], e["symptom"])] = d
    report_diff("SYMPTOMS", prior_symptoms, now)
    print(f"WROTE {added} derived entries to {SYM}.")
    propagate_conditions(json.load(open(CF)), args)
    print("Now verify: python3 scripts/check_duplicate_keys.py && python3 scripts/sync_embedded_data.py")


def propagate_conditions(cf, args):
    """Same three rules, applied to seed_data.json's conditions.

    Conditions were missed on the first pass - propagation only ever wrote to
    symptom_data.json, so all 41 conditions had zero derived links while the
    symptom side had 82. That made the toggle look broken to anyone testing on
    a condition, which is what people actually browse.
    """
    seed = json.load(open(SEED), object_pairs_hook=collections.OrderedDict)
    prior_conditions = strip_derived_conditions(seed)
    sd = json.load(open(SYM))
    names = {b["name"] for b in sd["bacteria"]}
    edges = usable_edges(cf, names)

    proposals, conflicts, skipped = [], [], 0
    for cond in seed["conditions"]:
        have = {t["name"]: t.get("dir") for t in cond.get("taxa", []) if not t.get("derived")}
        for e in edges:
            src, dst = e["from"], e["to"]
            direction = resolve_source(have, src)
            if not direction:
                continue
            if any(t.get("name") == dst and t.get("derived") for t in cond.get("taxa", [])):
                continue  # already derived - re-running must not duplicate
            if already_covered(have, dst):
                skipped += 1
                if have.get(dst) and have[dst] != direction:
                    conflicts.append((cond["name"], src, direction, dst, have[dst]))
                continue
            proposals.append((cond, dst, direction, e))

    # Same collapse as the symptom side: one condition can measure two sources
    # that both feed the same target.
    grouped = collections.OrderedDict()
    for cond, dst, direction, e in proposals:
        grouped.setdefault((cond["id"], dst), []).append((direction, e))
    cond_by_id = {c["id"]: c for c in seed["conditions"]}
    resolved, ambiguous = collapse_multi_edge(
        grouped, lambda k: f"{cond_by_id[k[0]]['name']} / {k[1]}")
    proposals = [(cond_by_id[cid], dst, direction, edges_for)
                 for (cid, dst), direction, edges_for in resolved]

    print(f"\n--- CONDITIONS ---")
    if ambiguous:
        print("AMBIGUOUS - opposite directions from two real edges, nothing inferred:")
        for label, dirs, ids in ambiguous:
            print(f"  {label}: {' vs '.join(dirs)} (edges: {', '.join(ids)})")
    print(f"proposed derived taxa      : {len(proposals)}")
    print(f"skipped (already measured) : {skipped}")
    print(f"  of which DISAGREE        : {len(conflicts)}")
    for c, src, sdir, dst, edir in conflicts[:15]:
        print(f"  {c}: {src} {sdir} implies {dst} {sdir}, but {dst} is measured {edir}")

    if not args.write:
        print("\nDRY RUN - no conditions written.")
        return

    n = 0
    for cond, dst, direction, edges_for in proposals:
        e = edges_for[0]
        conf = ("lower confidence - the reverse direction was not tested"
                if direction == "down" else "same direction as the demonstrated cross-feed")
        cond["taxa"].append(collections.OrderedDict([
            ("id", f"cf_{cond['id']}_{e['id']}_{dst.replace(' ', '_')}"),
            ("name", dst),
            ("dir", direction),
            ("derived", True),
            ("refs", "Inferred source (evidence for the FEEDING RELATIONSHIP, not for this "
                      "condition - nobody measured this taxon here): "
                      + " | ".join(f"derived via {x['id']} - {x['ref']}" for x in edges_for)),
            ("note",
             f"FROM CROSS-FEEDING - inferred, not measured in this condition. "
             f"{e['from']} is {direction} here, and it feeds {dst} "
             f"({', '.join(e['metabolites'])} -> {e['product']}), so {dst} is expected "
             f"to follow. {conf.capitalize()}. The feeding relationship itself is real "
             f"({e['evidence']}); its presence in THIS condition is an inference."
             + multi_edge_note(edges_for)),
            ("links", [{"id": f"cf_{cond['id']}_{x['id']}_l{i+1}", "label": "Inferred source: " + x["ref"], "url": x["url"]}
                       for i, x in enumerate(edges_for)]),
        ]))
        n += 1
    json.dump(seed, open(SEED, "w"), indent=1, ensure_ascii=False)
    open(SEED, "a").write("\n")
    now = {(c["name"], t["name"]): t.get("dir")
           for c in seed["conditions"] for t in c.get("taxa", []) if t.get("derived")}
    report_diff("CONDITIONS", prior_conditions, now)
    print(f"WROTE {n} derived taxa to {SEED}.")


if __name__ == "__main__":
    main()
