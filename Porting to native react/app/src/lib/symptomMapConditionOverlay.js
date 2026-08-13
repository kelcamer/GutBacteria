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

// Combines both customizations for SymptomTab.jsx's map-builder picker.
//
// BUG FIX: this used to just be
// `withExtraConditions(filterToSymptoms(data, selectedSymptomNames), extraConditions)`
// - correct when symptoms were picked, but wrong when only conditions were:
// filterToSymptoms treats an empty symptom list as "no filter" (its own
// pre-existing, correct default for when NOTHING has been picked at all),
// so picking e.g. only PCOS and OCD with zero symptoms selected still
// overlaid them onto the full 44-symptom map instead of narrowing to just
// those two - reported as "it correctly selects those 2 but does not
// dynamically recreate the map."
//
// Fix: once ANY picker selection is active (symptoms and/or conditions),
// the map is built EXCLUSIVELY from it - no silent "all symptoms"
// fallback just because the symptom half of the selection happens to be
// empty. Only bypass entirely (return `data` untouched) when NEITHER
// symptoms nor conditions have been picked, matching the original
// "everything" default.
export function buildOverlayMapData(data, selectedSymptomNames, extraConditions) {
  const hasSymptomSelection = !!(selectedSymptomNames && selectedSymptomNames.length)
  const hasConditionSelection = !!(extraConditions && extraConditions.length)
  if (!hasSymptomSelection && !hasConditionSelection) return data

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
  // symptoms were picked, which is the whole point of picking only
  // conditions.
  return withExtraConditions({ ...data, symptoms, bacteria }, extraConditions)
}
