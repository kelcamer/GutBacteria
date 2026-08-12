import { canonTaxon } from './conditionSymptomData'

// New helper (no minified-source equivalent - this UI didn't exist in the
// original app). Powers the Symptom<->Bacteria maps' "Add additional
// conditions?" picker: lets a user overlay one or more real Conditions
// onto the global bacteria<->symptom graph, to see which of the bacteria
// already implicated in symptoms are ALSO moved by those conditions.
//
// Deliberately does NOT touch buildSymptomMap.js's engine at all (that
// file has a well-documented history of fragility - see its own header
// comment). Instead it reuses the exact same trick CompareTab/
// compareConditions.js already uses in the opposite direction
// (buildSymptomPseudoConditions turns symptoms into condition-shaped
// objects; this turns conditions into symptom-shaped entries) - a
// selected condition becomes one more "symptom" name, and every bacterium
// it shares (matched via the same canonTaxon genus-canonicalization
// conditionSymptomData.js already uses) gets one more up/down/both entry
// pointing at it. The augmented {symptoms, bacteria} object is handed to
// the SAME buildSymptomMap call SymptomTab.jsx already makes, so every
// existing behavior (physics, click/pin tooltips, mode filter, Hide
// Isolated Nodes, etc.) works on the overlay for free.
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
