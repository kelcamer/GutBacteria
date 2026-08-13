import { canonTaxon } from './conditionSymptomData'

// New helpers (no minified-source equivalent - this UI didn't exist in the
// original app). Power SymptomTab.jsx's map-builder picker, used on both
// the Bacteria->Symptom and Symptom->Bacteria directions (trialed on the
// latter alone first, graduated to both after a positive verdict): lets a
// user pick exactly which symptoms to include AND overlay one or more
// real Conditions on top, to build a focused map from exactly their
// selections rather than always starting from "everything."
//
// Deliberately does NOT touch buildSymptomMap.js's engine at all (that
// file has a well-documented history of fragility - see its own header
// comment). withExtraConditions() reuses the exact same trick CompareTab/
// compareConditions.js already uses in the opposite direction
// (buildSymptomPseudoConditions turns symptoms into condition-shaped
// objects; this turns conditions into symptom-shaped entries) - a
// selected condition becomes one more "symptom" name, and every bacterium
// it shares (matched via the same canonTaxon genus-canonicalization
// conditionSymptomData.js already uses) gets one more up/down/both entry
// pointing at it. filterToSymptoms() just narrows the existing
// {symptoms, bacteria} shape down to a chosen subset. Either way, the
// resulting object is handed to the SAME buildSymptomMap call
// SymptomTab.jsx already makes, so every existing behavior (physics,
// click/pin tooltips, mode filter, Hide Isolated Nodes, etc.) works on
// the customized map for free.
export function withExtraConditions(data, extraConditions) {
  if (!extraConditions || !extraConditions.length) return data

  const symptoms = [...(data.symptoms || [])]
  const bacteria = (data.bacteria || []).map((b) => ({ ...b }))
  const bacteriaIndex = {}
  bacteria.forEach((b, i) => {
    bacteriaIndex[b.name] = i
  })

  extraConditions.forEach((cond) => {
    if (symptoms.includes(cond.name)) return // name collision with a real symptom - skip rather than silently merge
    let matchedAny = false
    ;(cond.taxa || []).forEach((t) => {
      const canon = canonTaxon(t.name)
      const idx = bacteriaIndex[canon]
      if (idx == null) return // this condition's taxon isn't tracked in the symptom map at all - nothing to attach to
      matchedAny = true
      const dirKey = t.dir === 'up' ? 'up' : t.dir === 'down' ? 'down' : 'both'
      const b = bacteria[idx]
      b[dirKey] = [
        ...(b[dirKey] || []),
        {
          symptom: cond.name,
          note: t.note || `From this app's ${cond.name} condition data.`,
          ref: t.refs || '',
          url: (t.links && t.links[0] && t.links[0].url) || '',
        },
      ]
    })
    if (matchedAny) symptoms.push(cond.name)
  })

  return { ...data, symptoms, bacteria }
}

// Narrows the map down to only the given symptom names (an empty/omitted
// list means "no filter, show everything" - the pre-existing default).
// Doesn't need to separately drop bacteria left with empty up/down/both
// arrays after filtering - buildSymptomMap already computes each node's
// `deg` from these arrays and its own `vis` filter already excludes
// zero-degree bacteria, so leaning on that existing behavior instead of
// re-implementing it here keeps this function simpler and keeps the
// engine itself untouched. Not currently called by buildOverlayMapData
// below (which needed different empty-list semantics once conditions
// entered the picture - see its own comment) - kept exported as its own
// tested, correct utility for "just filter to symptoms" in case anything
// else wants that in isolation.
export function filterToSymptoms(data, selectedSymptomNames) {
  if (!selectedSymptomNames || !selectedSymptomNames.length) return data
  const keep = new Set(selectedSymptomNames)
  const symptoms = (data.symptoms || []).filter((s) => keep.has(s))
  const bacteria = (data.bacteria || []).map((b) => ({
    ...b,
    up: (b.up || []).filter((e) => keep.has(e.symptom)),
    down: (b.down || []).filter((e) => keep.has(e.symptom)),
    both: (b.both || []).filter((e) => keep.has(e.symptom)),
  }))
  return { ...data, symptoms, bacteria }
}

// Combines both customizations for SymptomTab.jsx's map-builder picker:
// filters {symptoms, bacteria} down to EXACTLY the given symptom names,
// then overlays the given conditions on top of that (already-narrowed)
// set. Purely literal - no "empty means show everything" magic here.
//
// HISTORY: an earlier version of this function DID special-case an empty
// selectedSymptomNames as "no filter, show all," to match the picker's
// original default (nothing checked = show everything). That caused two
// separate real bugs: picking only conditions with zero symptoms checked
// silently fell back to the full 44-symptom map instead of narrowing (an
// empty symptom list looked identical to "nothing picked yet" even though
// conditions WERE picked); and once the picker itself was changed to
// default every symptom to CHECKED (so pills honestly show what's
// included, instead of "nothing highlighted" secretly meaning "show
// everything" - see SymptomTab.jsx), a real fully-empty selection became
// a deliberate user action ("I unchecked every symptom") that deserves to
// actually show nothing, not be silently overridden back to "show
// everything." The "default to everything" behavior now lives entirely
// in SymptomTab.jsx's initial state (selectedSymptoms starts as every
// symptom name) - this function no longer needs, or should have, its own
// opinion about what an empty list means.
export function buildOverlayMapData(data, selectedSymptomNames, extraConditions) {
  const keep = new Set(selectedSymptomNames || [])
  const symptoms = (data.symptoms || []).filter((s) => keep.has(s))
  const bacteria = (data.bacteria || []).map((b) => ({
    ...b,
    up: (b.up || []).filter((e) => keep.has(e.symptom)),
    down: (b.down || []).filter((e) => keep.has(e.symptom)),
    both: (b.both || []).filter((e) => keep.has(e.symptom)),
  }))
  // Bacteria are kept around (by name) even with every link stripped, so
  // withExtraConditions below can still find and attach to them - a
  // condition should be able to surface a bacterium even when zero
  // symptoms were checked, which is the whole point of picking only
  // conditions.
  return withExtraConditions({ ...data, symptoms, bacteria }, extraConditions)
}
