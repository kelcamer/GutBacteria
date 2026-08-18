#!/usr/bin/env python3
"""Does each claim's citation actually support THAT claim?

Coverage asks "is there a source?". This asks the harder question, and it is
the one that has found every real error so far. 57 entries cited a 2019 SCFA
review that never measured any of them; that was found by hand, by luck. These
are the signatures it left behind, turned into detectors.

Reports suspects for a human to read. It cannot know whether a paper supports a
claim - only a person reading the abstract can (RULES.MD Rule 4). What it can do
is rank 1,500 entries so the 50 worth reading float to the top.

DETECTORS, each named for the real bug that motivated it:

1. BOILERPLATE  One note text repeated across many entries. Template-generated
   claims, not measurements. The 19 SCFA genera shared three notes between 57
   entries: "Short-chain-fatty-acid-producing taxon; depletion impairs fiber
   fermentation..." said about Agathobacter and Odoribacter alike.

2. NAMES OTHERS, NOT THIS ONE  The citation enumerates taxa - just not this
   one. Plain "taxon unnamed" is useless here: most refs are a bare PMID and
   name nothing, which flagged 956 of 1,530 entries and told nobody anything.
   The real signal is a ref that lists Roseburia and Blautia while sitting on
   the Agathobacter entry.

2b. TEMPLATE BLOCK  The exact signature of the 57: five or more entries sharing
   one source AND a boilerplate note AND never naming their own taxon. This is
   what should have caught them automatically.

3. SITE MISMATCH  The citation describes breast milk, vagina, mouth, skin or
   nasopharynx while the claim is about the gut. FUT2/Enterobacteriaceae rests
   on a MILK microbiota study; that was caught by hand.

4. RANK MISMATCH  A species-level claim whose citation only ever names the
   genus. A genus result does not corroborate a species claim (Rule 3).

5. ANIMAL ONLY  The citation is a mouse/rat/in-vitro study but the entry does
   not say so. Fine as evidence, not fine as a silent one.

    python3 scripts/check_claim_source_match.py            # ranked report
    python3 scripts/check_claim_source_match.py --detector boilerplate
    python3 scripts/check_claim_source_match.py --json suspects.json
"""
import argparse
import json
import os
import re
import sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_citation_coverage import load_claims  # noqa: E402

SITE_WORDS = re.compile(
    r"\b(breast ?milk|human milk|milk microbiota|milk samples|vaginal|cervic|"
    r"oral microbio|saliva|dental|nasopharyn|skin microbio|sputum|lung)\b", re.I)
GUT_WORDS = re.compile(r"\b(gut|fecal|faecal|stool|intestin|colon|mucosa|colonic)\b", re.I)
ANIMAL_WORDS = re.compile(r"\b(mice|mouse|murine|rats?|germ-free|piglets?|in vitro|in-vitro|"
                          r"co-culture|fermentation model|SHIME)\b", re.I)
ANIMAL_DECLARED = re.compile(r"\b(mouse|mice|rat|animal|in vitro|in-vitro|germ-free|MODEL)\b", re.I)
# "Bifidobacterium adolescentis" -> the genus half is "Bifidobacterium"
SPECIES = re.compile(r"^([A-Z][a-z]+)\s+([a-z][a-z-]+)$")
# Genera whose dominant species is effectively the genus in practice, so
# "Akkermansia" in a paper means A. muciniphila and is not an over-claim.
DOMINANT_SPECIES_GENERA = {"Akkermansia", "Faecalibacterium"}


def citation_text(claim):
    return " \n".join([claim.ref_text] + [t for t in claim.other_text if t])


def taxon_vocabulary(claims):
    """Every taxon name in the dataset, longest first so 'Bacteroides vulgatus'
    is matched before 'Bacteroides'."""
    names = {c.taxon for c in claims}
    words = set()
    for n in names:
        for part in re.split(r"[/\s]+", n):
            if len(part) > 4 and part[0].isupper():
                words.add(part)
    return sorted(words, key=len, reverse=True)


def detect(claims):
    """Return {detector: [(claim, detail), ...]}."""
    out = defaultdict(list)
    vocab = taxon_vocabulary(claims)

    notes = Counter()
    for c in claims:
        note = (c.other_text[-1] if c.other_text else "") or ""
        if len(note.strip()) > 40:
            notes[note.strip()] += 1
    for c in claims:
        note = ((c.other_text[-1] if c.other_text else "") or "").strip()
        n = notes.get(note, 0)
        if n >= 5:
            out["boilerplate"].append((c, f"note shared by {n} entries: {note[:70]}..."))

    for c in claims:
        text = citation_text(c)
        if not text.strip():
            continue
        name = c.taxon
        # Match on the most distinctive word so "Escherichia/Shigella" and
        # "Roseburia / Eubacterium rectale" still match on a part.
        parts = [p for p in re.split(r"[/\s]+", name) if len(p) > 3]
        names_self = any(re.search(re.escape(p), text, re.I) for p in parts)
        others = [w for w in vocab
                  if w.lower() not in name.lower() and re.search(rf"\b{re.escape(w)}\b", text)]
        if parts and not names_self and others:
            out["names-others-not-this"].append(
                (c, f"citation names {', '.join(others[:3])} but never {name}"))

        if SITE_WORDS.search(text) and not GUT_WORDS.search(text):
            hit = SITE_WORDS.search(text).group(0)
            out["site-mismatch"].append((c, f"citation is about '{hit}', claim is gut"))

        m = SPECIES.match(name)
        if m:
            genus, epithet = m.group(1), m.group(2)
            epithet_present = re.search(re.escape(epithet), text, re.I)
            genus_present = re.search(rf"\b{re.escape(genus)}\b", text)
            # Only a real over-claim when the paper NAMED the genus but not the
            # species, AND the genus is not one whose dominant species is
            # effectively synonymous with it (a paper saying "Akkermansia" means
            # A. muciniphila). Firing on every terse PMID-only citation - 142 of
            # them, mostly correct - was noise, not signal (Rule 3).
            if genus not in DOMINANT_SPECIES_GENERA and genus_present and not epithet_present:
                out["rank-mismatch"].append(
                    (c, f"species claim '{name}', but the citation names only the genus '{genus}'"))

        if ANIMAL_WORDS.search(text) and not ANIMAL_DECLARED.search(c.ref_text):
            hit = ANIMAL_WORDS.search(text).group(0)
            out["animal-only"].append((c, f"citation mentions '{hit}', ref line does not say so"))

    # The 57's exact signature: one shared source + boilerplate + never named.
    by_source = defaultdict(list)
    for c in claims:
        if len(c.ids) == 1:
            by_source[next(iter(c.ids))].append(c)
    boiler = {c.label for c, _ in out["boilerplate"]}
    unnamed = {c.label for c, _ in out["names-others-not-this"]}
    for ident, group in by_source.items():
        block = [c for c in group if c.label in boiler]
        if len(block) >= 5:
            for c in block:
                extra = " and never names its taxon" if c.label in unnamed else ""
                out["template-block"].append(
                    (c, f"{len(block)} entries share {ident} with one boilerplate note{extra}"))

    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--seed", default="seed_data.json")
    ap.add_argument("--symptom", default="symptom_data.json")
    ap.add_argument("--detector", help="print every hit for one detector")
    ap.add_argument("--limit", type=int, default=12)
    ap.add_argument("--json", metavar="PATH")
    ap.add_argument("--counts", action="store_true", help="print just the per-detector counts (for the pre-commit report)")
    args = ap.parse_args()

    claims, _ = load_claims(args.seed, args.symptom)
    found = detect(claims)

    flagged = {c.label for hits in found.values() for c, _ in hits}
    print(f"CLAIM/SOURCE MATCH - {len(claims)} measured claims, "
          f"{len(flagged)} flagged by at least one detector\n")
    for name in ("template-block", "names-others-not-this", "boilerplate",
                 "site-mismatch", "rank-mismatch", "animal-only"):
        print(f"  {name:<16} {len(found.get(name, [])):>5}")
    print()

    if args.counts:
        # The two accuracy-critical detectors, spelled out for the committer.
        tb = len(found.get("template-block", []))
        rm = len(found.get("rank-mismatch", []))
        if tb:
            print(f"  ! {tb} template-block entries (citation may not measure the claim) - "
                  f"run: python3 scripts/check_claim_source_match.py --detector template-block")
        if rm:
            print(f"  ! {rm} rank-mismatch entries (species claim cited at genus) - "
                  f"run: python3 scripts/check_claim_source_match.py --detector rank-mismatch")
        return

    if args.detector:
        hits = found.get(args.detector, [])
        print(f"  --- {len(hits)} hit(s) for '{args.detector}' ---")
        for c, detail in hits:
            print(f"    {c.label}")
            print(f"      {detail}")
    else:
        for name, hits in found.items():
            if not hits:
                continue
            print(f"  {name} (showing {min(args.limit, len(hits))} of {len(hits)}):")
            for c, detail in hits[:args.limit]:
                print(f"    {c.label:<58} {detail[:64]}")
            print()

    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump({k: [{"claim": c.label, "detail": d} for c, d in v]
                       for k, v in found.items()}, fh, indent=1)
        print(f"  wrote {args.json}")


if __name__ == "__main__":
    main()
