#!/usr/bin/env python3
"""
Single source of truth for keeping gut-flora-atlas.html's embedded data
fallbacks in sync with seed_data.json and symptom_data.json.

WHY THIS EXISTS
----------------
The app fetches seed_data.json / symptom_data.json over HTTP on load, but
falls back to two copies baked directly into the HTML when that fetch is
blocked (e.g. opened via file://, which is the common case for someone
just double-clicking the file):

  - `qf()`                    <- mirrors seed_data.json's `conditions` array
  - `GFA_SYMPTOM_DATA_SHIPPED` <- mirrors symptom_data.json's `symptoms` +
                                   `bacteria` fields

For most of this project's history these two copies were resynced BY HAND
after every data edit, using one-off scripts rewritten fresh most sessions.
They drifted more than once as a result (see ARCHITECTURE.md / git log for
the incidents) - stale conditions, a stale symptom map, etc., invisible to
anyone testing over a local server since only the file:// path exercises
the fallback. This script is the fix: one canonical implementation, and a
pre-commit hook (.githooks/pre-commit) that makes staying in sync
mandatory rather than a step you can forget.

USAGE
-----
    python3 scripts/sync_embedded_data.py            # sync + write, if needed
    python3 scripts/sync_embedded_data.py --check     # exit 1 if out of sync, write nothing
    python3 scripts/sync_embedded_data.py --check --html X --seed Y --symptom Z
                                                       # check specific files (used by the git hook
                                                       # to check *staged* content via temp copies)

Run this after any edit to seed_data.json or symptom_data.json, or just
let the pre-commit hook catch it for you.
"""
import argparse
import json
import sys


def find_bracket_span(text, open_idx, open_ch, close_ch):
    """Return (open_idx, close_idx) for the balanced open_ch/close_ch pair
    starting at open_idx, skipping over string/template-literal contents
    (so a stray '{' or '[' inside a citation note doesn't confuse it)."""
    depth = 0
    i = open_idx
    in_str = None
    n = len(text)
    while i < n:
        c = text[i]
        if in_str:
            if c == "\\":
                i += 2
                continue
            if c == in_str:
                in_str = None
            i += 1
            continue
        if c in ("\"", "'", "`"):
            in_str = c
            i += 1
            continue
        if c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                return open_idx, i
        i += 1
    raise RuntimeError(
        f"unbalanced {open_ch!r}/{close_ch!r} starting at offset {open_idx} "
        "- has gut-flora-atlas.html's structure around this marker changed?"
    )


def qf_span(html):
    marker = html.find("qf=()=>({version:2,conditions:[")
    if marker == -1:
        marker = html.find("qf = () => ({")  # tolerate a beautified/reformatted copy
    if marker == -1:
        raise RuntimeError("qf() marker not found in the HTML - has this changed shape?")
    arr_start = html.find("[", marker)
    return find_bracket_span(html, arr_start, "[", "]")


def symptom_span(html):
    marker = html.find("GFA_SYMPTOM_DATA_SHIPPED")
    if marker == -1:
        raise RuntimeError("GFA_SYMPTOM_DATA_SHIPPED marker not found in the HTML")
    eq = html.find("=", marker)
    obj_start = html.find("{", eq)
    return find_bracket_span(html, obj_start, "{", "}")


def sync(html_path, seed_path, symptom_path, check=False):
    """Returns (in_sync_before, new_html). Does not write to disk."""
    html = open(html_path, encoding="utf-8").read()
    seed = json.load(open(seed_path, encoding="utf-8"))
    sym = json.load(open(symptom_path, encoding="utf-8"))

    in_sync = True

    a0, a1 = qf_span(html)
    current_conditions = json.loads(html[a0 : a1 + 1])
    target_conditions = seed["conditions"]
    if current_conditions != target_conditions:
        in_sync = False
        new_arr = json.dumps(target_conditions, ensure_ascii=False, separators=(",", ":"))
        html = html[:a0] + new_arr + html[a1 + 1 :]

    o0, o1 = symptom_span(html)  # re-find: offsets may have shifted after the qf() edit above
    current_sym = json.loads(html[o0 : o1 + 1])
    target_sym = {"symptoms": sym["symptoms"], "bacteria": sym["bacteria"]}
    if current_sym.get("symptoms") != target_sym["symptoms"] or current_sym.get("bacteria") != target_sym["bacteria"]:
        in_sync = False
        new_obj = json.dumps(target_sym, ensure_ascii=False, separators=(",", ":"))
        html = html[:o0] + new_obj + html[o1 + 1 :]

    return in_sync, html


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="exit 1 if out of sync; don't write")
    ap.add_argument("--html", default="gut-flora-atlas.html")
    ap.add_argument("--seed", default="seed_data.json")
    ap.add_argument("--symptom", default="symptom_data.json")
    args = ap.parse_args()

    try:
        in_sync, new_html = sync(args.html, args.seed, args.symptom, check=args.check)
    except Exception as e:
        print(f"sync_embedded_data.py: ERROR - {e}", file=sys.stderr)
        sys.exit(2)

    if args.check:
        if in_sync:
            print(f"{args.html}: embedded data is in sync.")
            sys.exit(0)
        else:
            print(f"{args.html}: OUT OF SYNC with {args.seed} / {args.symptom}.", file=sys.stderr)
            print("Run: python3 scripts/sync_embedded_data.py", file=sys.stderr)
            sys.exit(1)

    if in_sync:
        print(f"{args.html}: already in sync, nothing to do.")
    else:
        open(args.html, "w", encoding="utf-8").write(new_html)
        print(f"{args.html}: resynced.")


if __name__ == "__main__":
    main()
