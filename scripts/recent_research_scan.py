#!/usr/bin/env python3
"""Scan for very recent microbiome research across this app's conditions.

WHY THIS EXISTS
---------------
On 2026-08-16 a paper published four days earlier (Salgaco et al.,
"Exploring the In Vitro Effect of Psilocybin on the Composition and
Metabolic Activity of Gut Microbiota in Individuals with Severe Anxiety",
DOI 10.3390/ddc5030046) was missed because the search relied on Europe
PMC, which returned zero hits. The conclusion drawn was "no such study
exists" - which was wrong, and stated confidently.

The lesson is about INDEX LAG, not about the literature:

  Crossref      ~0 days   registers a DOI at publication
  Europe PMC    days-weeks  mirrors PubMed; MDPI and similar lag
  Web search    days        crawl/rank delay

So "absent from Europe PMC" NEVER means "does not exist". For anything
that might be recent, Crossref is the authority on existence, and Europe
PMC is the authority on abstracts/PMIDs once indexed.

USAGE
-----
    python3 scripts/recent_research_scan.py            # last 7 days
    python3 scripts/recent_research_scan.py --days 14
    python3 scripts/recent_research_scan.py --days 7 --condition "Endometriosis"

Output is deliberately terse: date, journal, DOI, title. Verify anything
interesting before it goes near the app - this only tells you a paper
EXISTS, not what it found.
"""
import argparse
import datetime
import json
import re
import sys
import time
import urllib.parse
import urllib.request

API = "https://api.crossref.org/works"
SEEN = set()  # dedupe across conditions

# Noise that dominates a raw microbiome query: peer-review artefacts,
# corrections, and non-human work.
NOISE = re.compile(
    r"(peer review|reviewer #|eLife assessment|correction to|retraction|"
    r"editorial|erratum|author response|review for)",
    re.I,
)
NON_HUMAN = re.compile(r"(pig|poultry|laying hen|broiler|baboon|insect|fish|shrimp|calv|bovine|murine model of)", re.I)

# The title must actually be about the microbiome. Crossref relevance alone
# returned things like "Geopolitics of energy transition" for the condition
# "Menopause (transition)".
ON_TOPIC = re.compile(r"(microbio|microbiota|gut|intestin|bacteri|probiotic|prebiotic|dysbiosis|SCFA|short-chain|faecal|fecal)", re.I)


def conditions_from_seed(path="seed_data.json"):
    with open(path) as fh:
        return [c["name"] for c in json.load(fh)["conditions"]]


def query(term, since, rows=20):
    # from-created-date, NOT from-pub-date. A Crossref record carries several
    # dates and from-pub-date matches if ANY of them falls in range - which
    # pulls in print issues dated 2027 and later. created = when the DOI was
    # actually registered, which is the real "this is new" signal.
    params = urllib.parse.urlencode({
        "filter": f"from-created-date:{since}",
        "query.bibliographic": term,
        "rows": rows,
        "select": "DOI,title,container-title,published,created",
        "sort": "created",
        "order": "desc",
    })
    req = urllib.request.Request(
        f"{API}?{params}",
        headers={"User-Agent": "GutBacteria-research-scan/1.0 (mailto:kelcamer@gmail.com)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)["message"]["items"]
    except Exception as exc:  # network/ratelimit - keep scanning the rest
        print(f"    ! query failed for {term!r}: {exc}", file=sys.stderr)
        return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=7)
    ap.add_argument("--condition", action="append", help="limit to specific condition(s)")
    ap.add_argument("--rows", type=int, default=15, help="results per condition")
    args = ap.parse_args()

    since = (datetime.date.today() - datetime.timedelta(days=args.days)).isoformat()
    conds = args.condition or conditions_from_seed()

    print(f"Crossref scan: published since {since} ({args.days} days)")
    print(f"Conditions: {len(conds)}\n")

    total = 0
    for cond in conds:
        items = query(f"{cond} gut microbiota", since, args.rows)
        hits = []
        # Crossref relevance ranking is loose - without this, the same generic
        # "gut microbiota" papers come back for all 41 conditions. Require the
        # condition to actually be named in the title.
        # Strip parenthetical qualifiers first: "Menopause (transition)" was
        # matching on "transition" and pulling in energy/payment/metallurgy
        # papers. Then require EVERY remaining key word, not any.
        base = re.sub(r"\([^)]*\)", " ", cond)
        keys = [k for k in re.split(r"[^A-Za-z0-9\']+", base) if len(k) > 3]
        keys = [k for k in keys if k.lower() not in {"disease", "disorder", "syndrome", "state", "effect"}]
        for it in items:
            title = (it.get("title") or [""])[0]
            if not title or NOISE.search(title) or NON_HUMAN.search(title):
                continue
            if not ON_TOPIC.search(title):
                continue
            if keys and not all(re.search(re.escape(k), title, re.I) for k in keys):
                continue
            doi = it.get("DOI")
            if doi in SEEN:
                continue
            SEEN.add(doi)
            journal = (it.get("container-title") or [""])[0]
            dt = "-".join(str(x) for x in it.get("created", {}).get("date-parts", [["?"]])[0])
            hits.append((dt, journal, doi, title))
        if hits:
            print(f"=== {cond} ({len(hits)})")
            for dt, journal, doi, title in hits:
                print(f"  {dt:10} {title[:88]}")
                print(f"  {'':10} {journal[:55]} | {doi}")
            print()
            total += len(hits)
        time.sleep(0.4)  # be polite to the API

    print(f"Total candidate papers: {total}")
    print("\nNothing here is verified. Confirm design, direction and sample size")
    print("before adding anything to seed_data.json / symptom_data.json.")


if __name__ == "__main__":
    main()
