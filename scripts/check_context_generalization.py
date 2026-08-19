#!/usr/bin/env python3
"""Flag condition→taxon findings whose measurement context is narrower than the
condition's intended scope, and inferences cascading from context-locked sources.

WHY THIS EXISTS
---------------
Siddiqui 2022 review on progesterone says Bacteroides and Prevotella grow better
in ORAL cavity when progesterone is present (Kornman & Loesche 1982 in-vitro
study). The Bifidobacterium abundance was measured in LATE PREGNANCY. But if
these entries are loaded as general "Progesterone" effects without machine-
readable context flags, an app user might read them as applying to any
progesterone level, not just pregnancy/oral/animal contexts.

This check reports (never blocks) findings that have narrow measurement contexts
but live in general conditions, so they stay visible in the data review.

CONTEXT SCOPES (hierarchy - narrower = more specific)
-----------------------------------------------------
animal > human > [no context] - general
pregnancy/postpartum/premenstrual > [no context] - general
oral/gingival/saliva > gut > [no context] - general
in-vitro/in-vivo > [no context] - general
mouse/ovariectomized/LPS-treated > untreated > [no context] - general

Run: python3 scripts/check_context_generalization.py
     (report-only, exit 0 always)
"""
import json
import sys

SEED = "seed_data.json"
CF = "cross_feeding.json"

seed = json.load(open(SEED))
cf = json.load(open(CF))

# Map edge ID -> edge data for source lookup
edge_by_id = {e["id"]: e for e in cf.get("edges", [])}

# Condition-scoped findings with narrow measurement context
scoped_findings = []

for cond in seed.get("conditions", []):
    cond_name = cond.get("name", "?")

    for taxon in cond.get("taxa", []):
        if taxon.get("derived"):
            continue  # Skip derived for now; handle separately below

        context = taxon.get("context")
        if not context:
            continue  # No context tag = general

        # Narrow contexts: list known problematic ones
        narrow = {
            "pregnancy", "late pregnancy", "late gestation",
            "postpartum", "premenstrual", "perimenopausal",
            "oral cavity", "oral", "gingival", "saliva",
            "mouse", "ovariectomized", "LPS-treated", "animal model"
        }

        if context.lower() in narrow or any(n in context.lower() for n in narrow):
            scoped_findings.append({
                "type": "scope-mismatch",
                "condition": cond_name,
                "taxon": taxon.get("name"),
                "context": context,
                "measurement": taxon.get("evidence"),
                "message": (f"Measured in NARROW CONTEXT ({context}) but loaded "
                            f"as general {cond_name} finding"),
            })

# Derived entries inheriting narrow context from their source
for cond in seed.get("conditions", []):
    cond_name = cond.get("name", "?")

    for taxon in cond.get("taxa", []):
        if not taxon.get("derived"):
            continue

        # Try to find the source measurement by reading the note
        # Format: "derived via cf_XXX_..." or "Source edge: cf_XXX"
        note = taxon.get("note", "")
        edge_id = None
        if "derived via " in note:
            # Parse "derived via cf_XXX_..." pattern
            parts = note.split("derived via ")
            if len(parts) > 1:
                edge_part = parts[1].split()[0]
                edge_id = edge_part

        if not edge_id or edge_id not in edge_by_id:
            continue

        edge = edge_by_id[edge_id]
        src = edge.get("from")

        # Find the source taxon in this condition
        src_taxon = None
        for t in cond.get("taxa", []):
            if not t.get("derived") and t.get("name") == src:
                src_taxon = t
                break

        if not src_taxon:
            continue

        src_context = src_taxon.get("context")
        if not src_context:
            continue

        narrow = {
            "pregnancy", "late pregnancy", "late gestation",
            "postpartum", "premenstrual", "perimenopausal",
            "oral cavity", "oral", "gingival", "saliva",
            "mouse", "ovariectomized", "LPS-treated", "animal model"
        }

        if src_context.lower() in narrow or any(n in src_context.lower() for n in narrow):
            scoped_findings.append({
                "type": "cascading-context",
                "condition": cond_name,
                "taxon": taxon.get("name"),
                "source_taxon": src,
                "source_context": src_context,
                "via_edge": edge_id,
                "message": (f"Inferred from {src} measured in NARROW CONTEXT "
                           f"({src_context}); inherits that scope limit"),
            })

if scoped_findings:
    print(f"\nCONTEXT GENERALIZATION CHECK - {len(scoped_findings)} findings with scope concerns:\n")
    for i, f in enumerate(scoped_findings, 1):
        if f["type"] == "scope-mismatch":
            print(f"  {i}. MEASURED IN NARROW CONTEXT")
            print(f"     Condition: {f['condition']}")
            print(f"     Taxon: {f['taxon']}")
            print(f"     Context: {f['context']}")
            print(f"     Evidence type: {f['measurement']}")
            print(f"     {f['message']}\n")
        elif f["type"] == "cascading-context":
            print(f"  {i}. DERIVED INHERITS NARROW CONTEXT")
            print(f"     Condition: {f['condition']}")
            print(f"     Inferred taxon: {f['taxon']}")
            print(f"     Source: {f['source_taxon']} (context: {f['source_context']})")
            print(f"     Via edge: {f['via_edge']}")
            print(f"     {f['message']}\n")
else:
    print("\nCONTEXT GENERALIZATION CHECK - No scope concerns found.")

sys.exit(0)
