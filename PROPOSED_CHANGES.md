# Proposed Changes — queued for next time

Everything here was evaluated tonight but deliberately not applied — either too risky to do unsupervised,
evidence too thin to responsibly include, or lower priority than what's in FINISHED_CHANGES.md. Nothing here
is silently forgotten; pull items into FINISHED_CHANGES.md as they land.

## Conditions considered and left out
- **Celiac disease** — literature is too self-contradictory on directionality to responsibly include right now
  (e.g. Bacteroides reported both increased *and* decreased depending on the study/cohort). Worth revisiting if
  a strong meta-analysis turns up that resolves the conflict.
- **Obesity** — usually built on the Firmicutes/Bacteroidetes ratio, which large re-analyses (Sze & Schloss 2016)
  couldn't reproduce — the same claim already flagged as unreliable in the new Type 2 Diabetes entry. Could
  still be added with a narrower, better-grounded claim (e.g. specific genus-level findings instead of the
  phylum ratio), just needs a dedicated research pass.
- **PCOS, NAFLD, long COVID, colorectal cancer** — not researched yet tonight; flagged by the user's original
  ask as plausible candidates, ran out of scope before reaching them.

## Data sync gap
- **`bacteria_symptoms.json`** is now stale relative to the 5 new conditions / 2 new symptoms added tonight. Not
  fetched by the live app (confirmed — only `seed_data.json` and embedded `qf()` are), so nothing user-facing
  is broken, but it's the source scaffolding for regenerating `GFA_SYMPTOM_DATA` and should be resynced before
  anyone next runs `build_final.py` from it.

## Optimization ideas not applied (reasoning, so they're not silently dropped)
- **Skip the `seed_data.json` refetch when localStorage already has current data** — right now the app fetches
  the full ~220KB file on *every* load, even for a returning user whose local copy already has everything. The
  new merge-by-id logic depends on comparing against a fresh fetch to detect new conditions, so skipping the
  fetch would mean new conditions stop being discovered automatically — a real trade-off, not a free win. Could
  solve with a lightweight version/hash check instead of a full refetch-and-diff, but that's a more invasive
  change than felt appropriate to make unsupervised overnight.
- **Virtualize the condition-card grid** — noticed during testing that scrolling far down the Conditions list
  shows a brief blank gap before cards paint back in (looked like a real bug at first, turned out to be a
  render-timing artifact, not a data bug — content was always there in the DOM). Not broken, but if the app
  keeps growing past 28 conditions, an actual windowing library would keep that scroll perfectly smooth.
- **Minify/bundle step** — the file has zero build tooling by design (single-file, no dependencies to install).
  Could shave some KB by hand-minifying the GFA_-prefixed hand-written section to match the rest of the bundle's
  density, but that trades away the readability that makes this file maintainable without tooling — not
  recommended.

## New section ideas not built
- **In-app "What's new" panel** surfacing recent changes (like this file, but inside the app itself) — genuinely
  useful longer-term, held off tonight since the external .md changelog approach was already requested.
- **Evidence-strength legend/filter** — a visual key distinguishing "single-study" vs "meta-analysis" vs
  "Mendelian randomization" citations, letting users filter by confidence tier. The Glossary added tonight
  explains what these terms mean, but doesn't yet let you filter by them.
- **Export a condition's citations as a formatted bibliography** (for someone wanting to bring this into their
  own notes/research) — the "Sources" tab lists them, but not in a copy-paste-a-bibliography format.

## Symptoms considered and left out (grounding discipline — see project memory)
- **Bad breath / halitosis** — evidence is almost entirely about *oral*, not gut, microbiome. Wrong axis for
  this app's model.
- **Food cravings** — nothing beyond speculative/rodent-only mechanism papers turned up.
