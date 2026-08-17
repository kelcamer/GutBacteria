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
// Alcohol and smoking now sit here too. They were briefly under SYMPTOMS
// on the grounds that the data describes the resulting dysbiosis pattern
// rather than the act - but by the does-versus-has test they are things a
// person does, and grouping them with the other exposures makes the
// "which intervention helps what" comparison below actually useful.
//
// "FUT2 (Non-secretor) status" is neither - it's a host genotype, not an
// action or a symptom. It currently sits under SYMPTOMS for lack of a
// better bucket; a third "host traits" grouping would be the honest fix
// if more genotype entries ever get added.
export const INTERVENTION_NAMES = [
  'Coffee / Stimulants',
  'Cannabis-related dysbiosis',
  'Exercise-associated microbiota changes',
  'Psilocybin / Psychedelics',
  "2'-Fucosyllactose (HMO) supplementation",
  // The LNT/LNB/GNB trio, added alongside 2'-FL. Only the first is really
  // something you TAKE: LNT is sold as a purified HMO (and as part of
  // multi-HMO blends). LNB and GNB are substrates rather than products - LNB
  // is what bifidobacterial lacto-N-biosidase cleaves LNT INTO, and GNB comes
  // off your own mucin via Akkermansia. They sit here anyway because what a
  // person wants to ask of them is the same question ("what does this feed?"),
  // and the alternative bucket - SYMPTOMS - would be a worse lie than this
  // one. Their labels say where they come from for exactly that reason.
  'Lacto-N-tetraose (LNT) supplementation',
  'Lacto-N-biose (LNB, from LNT breakdown)',
  'Galacto-N-biose (GNB, from host mucin)',
  'Oral iron supplementation',
  'Alcohol-related dysbiosis',
  'Smoking-related dysbiosis',
  'Green tea / catechins',
  'Antibiotics',
]

const INTERVENTION_SET = new Set(INTERVENTION_NAMES)

export function isIntervention(name) {
  return INTERVENTION_SET.has(name)
}
