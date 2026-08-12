import { symptomData } from '../data'
import { TAXON_CANON } from '../data/taxonCanon'

// Ported verbatim from `GFA_canonTaxon` in gut-flora-atlas.readable.html
// (~line 26869-26874).
export function canonTaxon(name) {
  if (TAXON_CANON[name]) return TAXON_CANON[name]
  const parts = String(name || '').split(' ')
  if (parts.length >= 2 && /^[a-z]/.test(parts[1]) && /^[A-Z]/.test(parts[0])) return parts[0]
  return name
}

// Ported verbatim from `GFA_conditionSymptomData` in
// gut-flora-atlas.readable.html (~line 26876-26914). Note `matchedCount` is
// the count of distinct CANONICAL genera matched (after dedup), not raw
// taxa entries matched - kept exactly as the original labels it rather than
// "fixed" to a more precise name, since that's a real behavior/label
// decision beyond what a port should change unasked.
export function conditionSymptomData(condition) {
  const symptomCounts = {}
  const byCanon = {}

  ;(condition.taxa || []).forEach((t) => {
    const canon = canonTaxon(t.name)
    const match = (symptomData.bacteria || []).find((b) => b.name === canon)
    if (!match) return
    const list = t.dir === 'up' ? match.up : match.down
    if (!list || !list.length) return
    if (!byCanon[canon]) byCanon[canon] = { name: canon, up: [], down: [] }
    byCanon[canon][t.dir] = list
    list.forEach((x) => {
      symptomCounts[x.symptom] = (symptomCounts[x.symptom] || 0) + 1
    })
  })

  const bacteriaOut = Object.values(byCanon)
  const rankedSymptoms = Object.keys(symptomCounts).sort((a, b) => symptomCounts[b] - symptomCounts[a])

  return {
    symptoms: rankedSymptoms,
    rankedSymptoms,
    bacteria: bacteriaOut,
    matchedCount: bacteriaOut.length,
    totalCount: (condition.taxa || []).length,
  }
}
