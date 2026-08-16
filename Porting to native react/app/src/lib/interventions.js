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
// Ordering note: these are things a person DOES or TAKES, as opposed to
// things they HAVE. That's the whole test for belonging on this list.
//
// Two deliberate exclusions, both requested explicitly: "Alcohol-related
// dysbiosis" and "Smoking-related dysbiosis" stay under SYMPTOMS. By the
// does-versus-has test they'd arguably qualify, but they're framed in the
// data as the resulting dysbiosis pattern rather than the act, and they
// read better alongside the other states.
//
// "Non-secretor status (FUT2)" is neither - it's a host genotype, not an
// action or a symptom. It currently sits under SYMPTOMS for lack of a
// better bucket; a third "host traits" grouping would be the honest fix
// if more genotype entries ever get added.
export const INTERVENTION_NAMES = [
  'Coffee / Stimulants',
  'Cannabis-related dysbiosis',
  'Exercise-associated microbiota changes',
  'Psilocybin / Psychedelics',
  "2'-Fucosyllactose (HMO) supplementation",
  'Oral iron supplementation',
]

const INTERVENTION_SET = new Set(INTERVENTION_NAMES)

export function isIntervention(name) {
  return INTERVENTION_SET.has(name)
}
