#!/usr/bin/env python3
"""How well-sourced is every measured claim in the atlas?

Reports, never blocks. Thin sourcing is a fact about the literature, not an
error in this repo - a claim resting on one small study is still the best
answer available for most taxa. The point is to make that visible so the
fragile claims can be prioritised, not to fail a commit.

WHAT COUNTS AS A CLAIM
  seed_data.json    conditions[].taxa[]                  (one taxon in one condition)
  symptom_data.json bacteria[].{up,down,both,none}[]     (one taxon on one symptom)
Derived entries are excluded: they are regenerated wholesale by
propagate_cross_feeding.py and inherit their evidence from the entry they were
derived from, so counting their citations would double-count the parent's.

WHERE IT LOOKS FOR IDENTIFIERS
  seed taxa      refs, note, links[].label, links[].url
  symptom links  ref, note, url
A pubmed.ncbi.nlm.nih.gov/12345 URL *is* an identifier, so URLs are read as
citation-bearing text and not merely as decoration. Reading only `refs` (as an
earlier ad-hoc pass did) undercounts coverage badly: hundreds of entries state
the identifier only in the URL. Both numbers are reported - the second one,
"stated in the ref field", is a hygiene metric, not a coverage metric.

`note` counts too, and missing it was a real bug: the Endometriosis/Dialister
note named the two PMIDs behind a contested direction while the ref field named
neither, so the entry was reported as single-sourced when it was not. 30 claims
carry an identifier only in their note, and 26 of them are not single-sourced
at all. A citation a reader can see in the popup is a citation.

THE BUG THIS SCRIPT EXISTS TO NOT REPEAT
  An earlier version captured the digits out of `PMC6421268` and looked them up
  as a PMID. 6421268 is a real PMID - an unrelated 1984 nursing newsletter - so
  a perfectly good citation was reported as fabricated. PMC IDs and PMIDs are
  DIFFERENT NAMESPACES that happen to share a digit width. They are counted
  separately here, PMC spans are masked out of the text before PMIDs are
  scanned, and --verify queries db=pmc for one and db=pubmed for the other.
  `--selftest` pins that behaviour.

USAGE
  python3 scripts/check_citation_coverage.py                 # the report
  python3 scripts/check_citation_coverage.py --list named    # claims in a bucket
  python3 scripts/check_citation_coverage.py --json out.json # machine-readable
  python3 scripts/check_citation_coverage.py --verify        # resolve IDs at NCBI/Crossref
  python3 scripts/check_citation_coverage.py --selftest      # regression tests
"""
import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict

DIRECTIONS = ("up", "down", "both", "none")

# --- identifier patterns -----------------------------------------------------
# Order matters. DOIs and PMC IDs are extracted and MASKED first so that their
# digits can never be re-read as a bare PMID.
DOI_URL = re.compile(r"(?:doi\.org/|dx\.doi\.org/)(10\.\d{4,9}/[^\s\"'<>)\]]+)", re.I)
DOI_TEXT = re.compile(r"\b(10\.\d{4,9}/[^\s\"'<>,;)\]]+)")
PMC_ANY = re.compile(r"\bPMC\s*(\d{5,9})\b", re.I)
PMID_LABELLED = re.compile(r"\bPMID\s*[:#]?\s*(\d{4,9})\b", re.I)
PMID_URL = re.compile(r"pubmed\.ncbi\.nlm\.nih\.gov/(\d{4,9})")
# A bare 7-9 digit token in a citation field is a PMID stated without its
# prefix - 23 entries do this. Anything shorter is an orphaned bibliography
# number ("115", "20-22") pointing at a reference list that no longer exists,
# which is NOT an identifier no matter how much it looks like provenance.
PMID_BARE = re.compile(r"(?<![\w/.-])(\d{7,9})(?![\w/.-])")
BIB_NUMBER = re.compile(r"^[\d\s,;&–—-]+$")
URL_SPAN = re.compile(r"\bhttps?://\S+|\bwww\.\S+")

# "Valles-Colomer 2019", "Chen et al. 2026" - enough to re-find the paper.
AUTHOR_YEAR = re.compile(r"\b[A-Z][A-Za-z'’-]{2,}\s*(?:et al\.?,?\s*)?\(?((?:19|20)\d{2})\)?")


# Most DOIs here are lifted out of a publisher URL, which appends view suffixes
# that are not part of the DOI: frontiersin.org/articles/10.3389/x/full, and
# medRxiv's /10.1101/2025.09.08.25335213v1 version tag. Left on, they make a
# real DOI fail to resolve and look fabricated.
DOI_VIEW_SUFFIX = re.compile(r"(?:/(?:full|abstract|pdf|html?|text|meta|citation|epub|download))+$", re.I)
DOI_PREPRINT_VERSION = re.compile(r"^(10\.1101/.+?)v\d+$", re.I)


def normalise_doi(raw):
    doi = raw.rstrip(".,;)")
    doi = DOI_VIEW_SUFFIX.sub("", doi)
    doi = DOI_PREPRINT_VERSION.sub(r"\1", doi)
    return "DOI:" + doi.lower()


def _mask(text, pattern):
    """Blank out every match so later patterns cannot see its digits."""
    return pattern.sub(lambda m: " " * len(m.group(0)), text)


def extract_ids(text):
    """Return {'PMID:123', 'PMC456', 'DOI:10.x/y'} found in one string."""
    if not text:
        return set()
    found = set()

    for m in DOI_URL.finditer(text):
        found.add(normalise_doi(m.group(1)))
    masked = _mask(text, DOI_URL)
    for m in DOI_TEXT.finditer(masked):
        found.add(normalise_doi(m.group(1)))
    masked = _mask(masked, DOI_TEXT)

    for m in PMC_ANY.finditer(masked):
        found.add("PMC" + m.group(1))
    masked = _mask(masked, PMC_ANY)
    # /articles/PMC123 in a URL is caught by PMC_ANY above; nothing else needed.

    for m in PMID_LABELLED.finditer(masked):
        found.add("PMID:" + m.group(1))
    masked = _mask(masked, PMID_LABELLED)
    for m in PMID_URL.finditer(masked):
        found.add("PMID:" + m.group(1))
    masked = _mask(masked, PMID_URL)
    # Bare digits only count OUTSIDE a URL. Every identifier a URL can carry has
    # already been taken above, and what is left is other people's numbering -
    # `papers.ssrn.com/...?abstract_id=5101530` is not PMID 5101530.
    masked = _mask(masked, URL_SPAN)
    for m in PMID_BARE.finditer(masked):
        found.add("PMID:" + m.group(1))
    return found


def id_kind(ident):
    return "DOI" if ident.startswith("DOI:") else "PMC" if ident.startswith("PMC") else "PMID"


# --- claim collection --------------------------------------------------------
class Claim:
    """One measured assertion plus every scrap of citation attached to it."""

    def __init__(self, source, group, taxon, direction, ref_text, other_text):
        self.source = source              # "conditions" | "symptoms"
        self.group = group                # condition name | symptom name
        self.taxon = taxon
        self.direction = direction
        self.ref_text = ref_text or ""    # the human-readable ref/refs field
        self.other_text = other_text      # urls, link labels
        self.ids = extract_ids(" \n".join([self.ref_text] + [t for t in other_text if t]))
        self.ref_ids = extract_ids(self.ref_text)

    @property
    def label(self):
        return f"{self.group} / {self.taxon} [{self.direction}]"

    @property
    def has_text(self):
        return bool(self.ref_text.strip() or any((t or "").strip() for t in self.other_text))

    @property
    def orphan_bib_ref(self):
        """ref field is a bare bibliography number - looks sourced, isn't."""
        r = self.ref_text.strip()
        return bool(r) and bool(BIB_NUMBER.fullmatch(r)) and not self.ref_ids

    @property
    def traceable_text(self):
        """No identifier, but an author-year that a person could resolve."""
        return bool(AUTHOR_YEAR.search(self.ref_text))

    def works(self, canon=None):
        """Identifiers collapsed to distinct papers. A PMC id and the same
        paper's PMID are ONE source, not two - counting them separately is how
        an entry looks corroborated when it cites one review twice."""
        return {(canon or {}).get(i, i) for i in self.ids}

    def bucket(self, canon=None):
        if not self.ids:
            return "none" if not self.has_text else "named"
        return "one" if len(self.works(canon)) == 1 else "multi"


def load_claims(seed_path, symptom_path):
    claims = []
    derived = 0

    seed = json.load(open(seed_path, encoding="utf-8"))
    for cond in seed["conditions"]:
        for taxon in cond.get("taxa", []):
            if taxon.get("derived"):
                derived += 1
                continue
            links = taxon.get("links") or []
            other = [l.get("label") for l in links] + [l.get("url") for l in links]
            claims.append(Claim("conditions", cond["name"], taxon["name"],
                                taxon.get("dir", "?"), taxon.get("refs"),
                                other + [taxon.get("note")]))

    sd = json.load(open(symptom_path, encoding="utf-8"))
    for bact in sd["bacteria"]:
        for direction in DIRECTIONS:
            for entry in bact.get(direction, []):
                if entry.get("derived"):
                    derived += 1
                    continue
                claims.append(Claim("symptoms", entry.get("symptom", "?"), bact["name"],
                                    direction, entry.get("ref"),
                                    [entry.get("url"), entry.get("note")]))
    return claims, derived


# --- verification ------------------------------------------------------------
EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
CROSSREF = "https://api.crossref.org/works/"
UA = "GutBacteria-citation-audit/1.0 (https://github.com/kelcamer/GutBacteria)"


def _get(url, pause=0.4):
    time.sleep(pause)  # NCBI allows 3 req/s unauthenticated; stay under it.
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def verify(ids, cache_path, limit=None):
    """Resolve identifiers against their OWN namespace. Returns {id: record}.

    Each record: {"ok": bool, "title": str|None, "crosswalk": [other ids]}.
    The crosswalk is what lets the report collapse a PMID and the same paper's
    DOI into one work instead of scoring the claim as doubly-sourced.
    """
    try:
        cache = json.load(open(cache_path, encoding="utf-8"))
    except (OSError, ValueError):
        cache = {}

    todo = [i for i in sorted(ids) if i not in cache]
    if limit:
        todo = todo[:limit]

    def batch(kind, prefix_strip):
        pending = [i for i in todo if id_kind(i) == kind]
        db = "pubmed" if kind == "PMID" else "pmc"
        for start in range(0, len(pending), 100):
            chunk = pending[start:start + 100]
            raw = [i[prefix_strip:] for i in chunk]
            url = f"{EUTILS}?db={db}&retmode=json&id=" + ",".join(raw)
            try:
                data = _get(url).get("result", {})
            except (urllib.error.URLError, ValueError, TimeoutError) as e:
                print(f"  ! {db} lookup failed for {len(chunk)} ids: {e}", file=sys.stderr)
                continue
            for ident, rawid in zip(chunk, raw):
                rec = data.get(rawid) or {}
                if not rec or "error" in rec:
                    cache[ident] = {"ok": False, "title": None, "crosswalk": []}
                    continue
                cross = []
                for aid in rec.get("articleids", []):
                    t, v = aid.get("idtype"), (aid.get("value") or "").strip()
                    if t == "pmid" and v.isdigit():
                        cross.append("PMID:" + v)
                    elif t == "pmcid" and v.upper().startswith("PMC"):
                        cross.append(re.sub(r"[^A-Z0-9]", "", v.upper()))
                    elif t == "doi" and v:
                        cross.append("DOI:" + v.lower())
                cache[ident] = {"ok": True,
                                "title": rec.get("title") or rec.get("sorttitle"),
                                "crosswalk": [c for c in cross if c != ident]}
            print(f"  resolved {min(start + 100, len(pending))}/{len(pending)} {kind}s")

    batch("PMID", len("PMID:"))
    batch("PMC", len("PMC"))  # db=pmc takes bare digits: "PMC10001679" is an invalid uid

    dois = [i for i in todo if id_kind(i) == "DOI"]
    for n, ident in enumerate(dois, 1):
        # Crossref, not PubMed: PubMed lags publication by days to weeks, so a
        # recent DOI missing there proves nothing.
        try:
            msg = _get(CROSSREF + urllib.parse.quote(ident[4:], safe=""), pause=0.2)["message"]
            title = (msg.get("title") or [None])[0]
            cache[ident] = {"ok": True, "title": title, "crosswalk": []}
        except urllib.error.HTTPError as e:
            cache[ident] = {"ok": e.code != 404, "title": None, "crosswalk": []}
        except (urllib.error.URLError, ValueError, KeyError, TimeoutError) as e:
            print(f"  ! crossref {ident}: {e}", file=sys.stderr)
        if n % 25 == 0:
            print(f"  resolved {n}/{len(dois)} DOIs")

    with open(cache_path, "w", encoding="utf-8") as fh:
        json.dump(cache, fh, indent=1, sort_keys=True)
    return cache


def canonical_map(cache):
    """id -> work key, so DOI/PMC/PMID of one paper collapse to one work."""
    parent = {}

    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            # Prefer a PMID as the representative - it is the id the rest of
            # the dataset speaks in.
            keep, drop = sorted((ra, rb), key=lambda i: (id_kind(i) != "PMID", i))
            parent[drop] = keep

    for ident, rec in cache.items():
        find(ident)
        for other in rec.get("crosswalk", []):
            union(ident, other)
    return {i: find(i) for i in parent}


# --- reporting ---------------------------------------------------------------
BUCKET_LABEL = {
    "none": "No citation of any kind",
    "named": "Named paper, no identifier",
    "one": "Exactly one source",
    "multi": "Two or more sources",
}


def pct(n, total):
    return f"{100.0 * n / total:.1f}%" if total else "-"


def report(claims, derived, cache=None, top=10):
    total = len(claims)
    canon = canonical_map(cache) if cache else {}
    buckets = Counter(c.bucket(canon) for c in claims)
    single = buckets["none"] + buckets["named"] + buckets["one"]

    print(f"CITATION COVERAGE - {total} measured claims "
          f"({derived} derived entries excluded)")
    print(f"  {sum(1 for c in claims if c.source == 'conditions')} condition taxa, "
          f"{sum(1 for c in claims if c.source == 'symptoms')} symptom links")
    print()
    print(f"  {'Bucket':<34}{'Count':>7}{'Share':>9}")
    for key in ("none", "named", "one", "multi"):
        print(f"  {BUCKET_LABEL[key]:<34}{buckets[key]:>7}{pct(buckets[key], total):>9}")
    print(f"  {'-' * 50}")
    print(f"  {'SINGLE-SOURCED (first three rows)':<34}{single:>7}{pct(single, total):>9}")
    print()

    all_ids = Counter()
    for c in claims:
        all_ids.update(c.ids)
    kinds = Counter(id_kind(i) for i in all_ids)
    print(f"  {len(all_ids)} distinct identifiers back the whole dataset "
          f"({kinds['PMID']} PMID, {kinds['PMC']} PMC, {kinds['DOI']} DOI)")
    if all_ids:
        hardest = all_ids.most_common(3)
        print("  most-reused: " + ", ".join(f"{i} x{n}" for i, n in hardest))
    print()

    # Hygiene, not coverage: is the identifier stated where a human reads it?
    url_only = sum(1 for c in claims if c.ids and not c.ref_ids)
    orphan = [c for c in claims if c.orphan_bib_ref]
    traceable = [c for c in claims if c.bucket(canon) == "named" and c.traceable_text]
    print("  Ref-field hygiene")
    print(f"    identifier only in the URL, not the ref text : {url_only} ({pct(url_only, total)})")
    print(f"    ref text is an orphaned bibliography number  : {len(orphan)}")
    print(f"    no identifier but an author-year to chase    : {len(traceable)}"
          f" of {buckets['named']} 'named' claims")
    print()

    print(f"  Thinnest coverage by condition/symptom (top {top} by single-sourced count)")
    by_group = defaultdict(lambda: [0, 0])
    for c in claims:
        by_group[(c.source, c.group)][1] += 1
        if c.bucket(canon) != "multi":
            by_group[(c.source, c.group)][0] += 1
    rows = sorted(by_group.items(), key=lambda kv: (-kv[1][0], kv[0][1]))[:top]
    for (source, group), (thin, n) in rows:
        tag = "cond" if source == "conditions" else "symp"
        print(f"    {tag}  {group[:42]:<42} {thin:>4}/{n:<4} {pct(thin, n):>7}")
    print()

    if cache is not None:
        unresolved = sorted(i for i in all_ids if i in cache and not cache[i]["ok"])
        unchecked = sorted(i for i in all_ids if i not in cache)
        works = {canon.get(i, i) for i in all_ids}
        inflated = [c for c in claims if len(c.ids) > 1 and len(c.works(canon)) == 1]
        print("  Verification")
        print(f"    identifiers checked                : {len(all_ids) - len(unchecked)}")
        print(f"    DID NOT RESOLVE                    : {len(unresolved)}")
        for i in unresolved[:20]:
            holders = [c.label for c in claims if i in c.ids][:3]
            print(f"      {i}  <- {'; '.join(holders)}")
        print(f"    distinct WORKS after crosswalk     : {len(works)}"
              f" (from {len(all_ids)} identifiers)")
        print(f"    claims that look 2+ but cite one work: {len(inflated)}")
        if inflated:
            print(f"    claims citing one paper under 2 ids: {len(inflated)} (already excluded above)")
            for c in inflated[:10]:
                print(f"      {c.label}: {', '.join(sorted(c.ids))}")
        if unchecked:
            print(f"    not yet checked (rerun --verify)   : {len(unchecked)}")
        print()

    verification = None
    if cache is not None:
        verification = {
            "checked": len(all_ids) - len(unchecked),
            "unresolved": unresolved,
            "unchecked": unchecked,
            "distinct_works": len(works),
            "claims_citing_one_work_twice": [c.label for c in inflated],
        }

    return {
        "verification": verification,
        "total_claims": total,
        "derived_excluded": derived,
        "buckets": {k: buckets[k] for k in ("none", "named", "one", "multi")},
        "single_sourced": single,
        "distinct_identifiers": len(all_ids),
        "identifiers_by_kind": dict(kinds),
        "identifier_only_in_url": url_only,
        "orphan_bibliography_refs": [c.label for c in orphan],
        "by_group": {f"{s}:{g}": {"thin": t, "total": n} for (s, g), (t, n) in by_group.items()},
    }


def selftest():
    """Pins the PMC/PMID namespace bug and the bibliography-number rule."""
    cases = [
        ("PMC6421268", {"PMC6421268"}),
        ("https://pmc.ncbi.nlm.nih.gov/articles/PMC6421268/", {"PMC6421268"}),
        ("PMID 22068912", {"PMID:22068912"}),
        ("https://pubmed.ncbi.nlm.nih.gov/37199608/", {"PMID:37199608"}),
        ("37559119", {"PMID:37559119"}),
        ("115", set()),
        ("150,153", set()),
        ("20–22", set()),
        ("Minerbi 2019", set()),
        ("https://doi.org/10.1038/s41564-018-0337-x", {"DOI:10.1038/s41564-018-0337-x"}),
        # A publisher URL with no identifier in it is not a citation.
        ("https://www.nature.com/articles/s41380-022-01456-3", set()),
        # Someone else's numbering inside a URL is not a PMID.
        ("https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5101530", set()),
        # Publisher view suffixes and preprint version tags are not part of the DOI.
        ("https://www.frontiersin.org/articles/10.3389/fcimb.2019.00470/full",
         {"DOI:10.3389/fcimb.2019.00470"}),
        ("https://www.medrxiv.org/content/10.1101/2025.09.08.25335213v1",
         {"DOI:10.1101/2025.09.08.25335213"}),
        ("Rausch 2011 (PMID 22068912); see also PMC3252838",
         {"PMID:22068912", "PMC3252838"}),
    ]
    failures = []
    for text, expected in cases:
        got = extract_ids(text)
        if got != expected:
            failures.append(f"  {text!r}\n    expected {sorted(expected)}\n    got      {sorted(got)}")
    # The exact bug: PMC digits must never become a PMID.
    if any(i.startswith("PMID") for i in extract_ids("PMC6421268")):
        failures.append("  PMC id was read as a PMID - the 1984-nursing-newsletter bug is back")
    if failures:
        print("SELFTEST FAILED:", file=sys.stderr)
        print("\n".join(failures), file=sys.stderr)
        return 1
    print(f"selftest OK ({len(cases)} cases)")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--seed", default="seed_data.json")
    ap.add_argument("--symptom", default="symptom_data.json")
    ap.add_argument("--list", choices=["none", "named", "one", "multi", "orphan", "traceable"],
                    help="print the claims in a bucket instead of just counting them")
    ap.add_argument("--group", help="restrict --list to one condition/symptom name")
    ap.add_argument("--json", metavar="PATH", help="also write the summary as JSON")
    ap.add_argument("--verify", action="store_true",
                    help="resolve every identifier at NCBI (db=pubmed / db=pmc) and Crossref")
    ap.add_argument("--limit", type=int, help="with --verify, only look up N new identifiers")
    ap.add_argument("--cache", default=".citation_cache.json")
    ap.add_argument("--top", type=int, default=10)
    ap.add_argument("--strict", action="store_true",
                    help="exit 1 if any claim has no citation at all (default: always exit 0)")
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()

    if args.selftest:
        sys.exit(selftest())

    claims, derived = load_claims(args.seed, args.symptom)

    cache = None
    try:
        cache = json.load(open(args.cache, encoding="utf-8"))
        print(f"(using {args.cache} to collapse ids of the same paper; "
              f"--verify refreshes it)")
    except (OSError, ValueError):
        pass
    if args.verify:
        ids = set()
        for c in claims:
            ids |= c.ids
        print(f"Verifying {len(ids)} identifiers (cache: {args.cache}) ...")
        cache = verify(ids, args.cache, limit=args.limit)

    summary = report(claims, derived, cache=cache, top=args.top)

    if args.list:
        wanted = [c for c in claims
                  if (c.orphan_bib_ref if args.list == "orphan"
                      else (c.bucket == "named" and c.traceable_text) if args.list == "traceable"
                      else c.bucket(canonical_map(cache) if cache else {}) == args.list)]
        if args.group:
            wanted = [c for c in wanted if c.group.lower() == args.group.lower()]
        print(f"  --- {len(wanted)} claim(s) in '{args.list}' ---")
        for c in sorted(wanted, key=lambda c: (c.source, c.group, c.taxon)):
            ids = ", ".join(sorted(c.ids)) or "-"
            print(f"    {c.label:<62} {ids}")
            if c.ref_text.strip():
                print(f"      ref: {c.ref_text.strip()[:110]}")

    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(summary, fh, indent=1)
        print(f"  wrote {args.json}")

    # Reports, never blocks - unless explicitly asked to be strict.
    if args.strict and summary["buckets"]["none"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
