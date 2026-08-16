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


STATE_PATH = "research_scan_state.json"


def scan_targets():
    """Every condition AND every symptom/intervention - the app's full surface.

    Previously this only read seed_data.json's conditions, so all 49 entries
    in symptom_data.json (including every intervention) were never swept.
    """
    with open("seed_data.json") as fh:
        conds = [c["name"] for c in json.load(fh)["conditions"]]
    with open("symptom_data.json") as fh:
        syms = list(json.load(fh).get("symptoms", []))
    return [("condition", c) for c in conds] + [("symptom", s) for s in syms]


def load_state():
    try:
        with open(STATE_PATH) as fh:
            return json.load(fh)
    except FileNotFoundError:
        return {"last_scanned": {}, "reviewed_dois": {}}


def save_state(st):
    with open(STATE_PATH, "w") as fh:
        json.dump(st, fh, indent=1, sort_keys=True)
        fh.write("\n")


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
    ap.add_argument("--rows", type=int, default=15, help="results per target")
    ap.add_argument("--since-last", action="store_true",
                    help="use each target's own last-scanned date instead of --days")
    ap.add_argument("--fresh", action="store_true", help="ignore stored state")
    ap.add_argument("--mark-reviewed", action="store_true",
                    help="record every DOI shown so it never resurfaces")
    args = ap.parse_args()

    today = datetime.date.today().isoformat()
    default_since = (datetime.date.today() - datetime.timedelta(days=args.days)).isoformat()
    state = load_state()
    reviewed = set(state.get("reviewed_dois", {}))

    targets = scan_targets()
    if args.condition:
        want = {c.lower() for c in args.condition}
        targets = [t for t in targets if t[1].lower() in want]

    print(f"Crossref scan across {len(targets)} targets (conditions + symptoms)")
    print(f"Window: {args.days} days unless a target has been scanned before")
    print(f"Already-reviewed DOIs on file: {len(reviewed)}\n")

    total = 0
    for kind, cond in targets:
        # Per-target incremental window: only look at what is new since this
        # target was last swept, so repeat runs surface a genuine delta rather
        # than the same papers every time.
        since = state["last_scanned"].get(cond, default_since)
        if not args.fresh:
            since = max(since, default_since) if args.since_last else default_since
        state["last_scanned"][cond] = today
        items = query(f"{cond} gut microbiota", since, args.rows)
        hits = []
        # Crossref relevance ranking is loose - without this, the same generic
        # "gut microbiota" papers come back for all 41 conditions. Require the
        # condition to actually be named in the title.
        # Strip parenthetical qualifiers first: "Menopause (transition)" was
        # matching on "transition" and pulling in energy/payment/metallurgy
        # papers. Then require EVERY remaining key word, not any.
        base = re.sub(r"\([^)]*\)", " ", cond)
        # len>3 silently emptied `keys` for short names like "OCD", which
        # then matched everything. Keep acronyms; only drop 1-2 char noise.
        keys = [k for k in re.split(r"[^A-Za-z0-9\']+", base) if len(k) > 2]
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
            if doi in SEEN or doi in reviewed:
                continue
            SEEN.add(doi)
            journal = (it.get("container-title") or [""])[0]
            dt = "-".join(str(x) for x in it.get("created", {}).get("date-parts", [["?"]])[0])
            hits.append((dt, journal, doi, title))
        if hits:
            print(f"=== [{kind}] {cond} ({len(hits)})")
            for dt, journal, doi, title in hits:
                print(f"  {dt:10} {title[:88]}")
                print(f"  {'':10} {journal[:55]} | {doi}")
            print()
            total += len(hits)
        time.sleep(0.4)  # be polite to the API

    if args.mark_reviewed:
        for doi in SEEN:
            state["reviewed_dois"][doi] = today
        print(f"Marked {len(SEEN)} DOIs reviewed.")
    save_state(state)

    stale = sorted(state["last_scanned"].items(), key=lambda kv: kv[1])[:5]
    print(f"\nTotal candidate papers: {total}")
    print("Least recently scanned targets: " + ", ".join(f"{k} ({v})" for k, v in stale))
    print("\nNothing here is verified. Confirm design, direction and sample size")
    print("before adding anything to seed_data.json / symptom_data.json.")


if __name__ == "__main__":
    main()
