import { symptomData, seedData } from '../data'
import { canonTaxon } from './conditionSymptomData'
import { withExtraConditions } from './symptomMapConditionOverlay'

// New helper (no minified-source equivalent). Powers BacteriaIndex.jsx's
// "click a bacterium's name to see everything it touches" feature: given
// the raw taxon names behind one BacteriaIndex card (a `groupTaxa` result
// can span several loosely-related raw names, e.g. "Escherichia coli" +
// "Escherichia/Shigella"), builds a focused {symptoms, bacteria} map of
// every symptom AND condition connected to that bacterium.
//
// Reuses the exact same matching this app already relies on elsewhere
// rather than inventing new logic: canonTaxon() (conditionSymptomData.js,
// already used to match a condition's taxa against symptomData.bacteria)
// finds which symptomData.bacteria entries this group corresponds to,
// and withExtraConditions() (symptomMapConditionOverlay.js, already used
// by SymptomTab's map-builder picker) finds and overlays every condition
// whose own taxa canonically match those same bacteria - so a single
// bacterium's focus map shows both its symptom_data.json links and its
// seed_data.json (condition) links on one graph, same shape the rest of
// this app's maps already expect.
export function buildBacteriumFocusData(namesInGroup) {
  const canonSet = new Set((namesInGroup || []).map((n) => canonTaxon(n)))
  const matchedBacteria = (symptomData.bacteria || []).filter((b) => canonSet.has(b.name))
  if (!matchedBacteria.length) return { symptoms: [], bacteria: [] }

  const matchedNames = new Set(matchedBacteria.map((b) => b.name))
  const symptomSet = new Set()
  matchedBacteria.forEach((b) => {
    ;[...(b.up || []), ...(b.down || []), ...(b.both || [])].forEach((e) => symptomSet.add(e.symptom))
  })

  const matchingConditions = (seedData.conditions || []).filter((cond) =>
    (cond.taxa || []).some((t) => matchedNames.has(canonTaxon(t.name)))
  )

  return withExtraConditions({ symptoms: [...symptomSet], bacteria: matchedBacteria }, matchingConditions)
}
