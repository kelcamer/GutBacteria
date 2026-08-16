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

// Small helper for the 'both'-direction fallback below - a symptom could
// in principle appear in both a bacterium's up and down lists (distinct
// studies disagreeing), which would otherwise duplicate it in the merged
// list.
function dedupeBySymptom(list) {
  const seen = new Set()
  return list.filter((x) => {
    if (seen.has(x.symptom)) return false
    seen.add(x.symptom)
    return true
  })
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
    // Bug fix: a "both"/yellow-direction taxon (t.dir === 'both') used to
    // fall through this ternary straight to match.down, silently treating
    // it as a plain decrease and losing its "both" edges (and color)
    // entirely - `t.dir === 'up' ? match.up : match.down` has no branch
    // for anything else. Now uses the bacterium's own match.both list
    // when this app tracks one for it, falling back to the union of
    // match.up/match.down (deduped by symptom) when it doesn't - either
    // way a "both" taxon now actually surfaces symptom links, instead of
    // silently reusing the wrong direction's list.
    const list =
      t.dir === 'up'
        ? match.up
        : t.dir === 'down'
          ? match.down
          : match.both && match.both.length
            ? match.both
            : dedupeBySymptom([...(match.up || []), ...(match.down || [])])
    if (!list || !list.length) return
    if (!byCanon[canon]) {
      // Bug fix: this node used to be LABELED with the canonical bucket
      // name (e.g. "Escherichia/Shigella") even when this condition's own
      // taxa only ever reported one specific member of that bucket (e.g.
      // "Escherichia coli") - genuinely confusing ("ADHD's research
      // doesn't mention Shigella at all, why does it show in the map").
      // The canon bucket is still what's used to MATCH real symptom
      // links below (many studies can't distinguish E. coli from Shigella
      // at the 16S rRNA genus level, which is why this app tracks them as
      // one combined bucket in the first place) - but the node's LABEL
      // now shows what THIS condition's own data actually reported,
      // falling back to the canonical/combined name only if this
      // condition reported more than one distinct original name into the
      // same bucket (genuinely ambiguous at that point, not a labeling
      // bug - e.g. a condition that separately lists both "Escherichia
      // coli" and "Shigella").
      byCanon[canon] = { name: canon, label: t.name, up: [], down: [], both: [] }
    } else if (byCanon[canon].label !== t.name) {
      byCanon[canon].label = canon
    }
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
