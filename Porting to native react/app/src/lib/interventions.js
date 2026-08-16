// Substance/lifestyle-factor entries live in symptomData.symptoms alongside
// real symptoms - the data layer (buildOverlayMapData, buildSymptomMap,
// buildSymptomPseudoConditions) doesn't distinguish them, they're all just
// "symptom" nodes. But they read as a different kind of thing to a person
// scanning a picker: things you DO, versus things you HAVE.
//
// This is the single source of truth for that UI-only split. It lives here
// rather than inside any one component because two separate screens need
// the same grouping - SymptomTab's map-builder picker and CompareTab's
// multi-select panel - and when the list only existed in SymptomTab, adding
// 2'-FL there left it silently mis-filed under SYMPTOMS in Compare.
//
// Adding a new intervention: add its exact symptom name here and both
// screens pick it up. No schema change, no data migration.
export const INTERVENTION_NAMES = [
  'Coffee / Stimulants',
  'Cannabis-related dysbiosis',
  'Exercise-associated microbiota changes',
  'Psilocybin / Psychedelics',
  "2'-Fucosyllactose (HMO) supplementation",
]

const INTERVENTION_SET = new Set(INTERVENTION_NAMES)

export function isIntervention(name) {
  return INTERVENTION_SET.has(name)
}
