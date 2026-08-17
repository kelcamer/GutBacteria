// Global study filters: evidence tier and study population.
//
// SEMANTICS - this is the important design decision.
//
// Filters EXCLUDE what is confidently wrong, they do not include only what is
// confidently right. ~30% of entries are `unclassified` because the tier was
// inferred from free text and the classifier refuses to guess. If "Human only"
// meant "show only entries tagged human", it would silently hide a third of the
// real human data along with the animal studies. So instead:
//
//   "Human only"  =  hide entries tagged animal or in-vitro
//   "Women only"  =  hide entries from male-only studies
//
// Unclassified always survives, and the Settings tab says so plainly. An
// aggressive filter that quietly deletes evidence would be worse than no filter,
// because the map would look authoritative while missing things.
//
// The sex toggles are mutually exclusive - turning one on turns the other off -
// because "only women" and "only men" cannot both be true.
export const DEFAULT_FILTERS = {
  hideAnimal: false,
  hideInVitro: false,
  hideDerived: true, // cross-feeding inference stays off by default, as before
  hideMeta: false,
  hideMendelian: false,
  hideReview: false,
  womenOnly: false,
  menOnly: false,
  // Display, not evidence: it changes which NODES exist, never which entries
  // pass entryPasses() below. Lives here anyway because it belongs with the
  // other things you set once for the whole atlas, and because it has to
  // persist - having to re-group every visit was the point of moving it.
  groupGenus: true,
}

export const FILTER_LABELS = {
  hideAnimal: ['Human studies only', 'Hides entries from mice, rats, pigs and primates'],
  hideInVitro: ['Exclude lab-dish studies', 'Hides co-culture and fermentation-model results (no host involved)'],
  hideDerived: ['Hide crossfeeding', 'Hides inferred links generated from metabolic relationships'],
  hideMeta: ['Exclude meta-analyses', 'Rarely wanted — meta-analyses are usually the strongest evidence here'],
  hideMendelian: ['Exclude Mendelian randomisation', 'Genetic-instrument studies; human, but inferential rather than observed'],
  hideReview: ['Exclude narrative reviews', 'Secondary sources that summarise other studies rather than reporting new data'],
  womenOnly: ['Women only', 'Hides studies conducted in male-only populations'],
  menOnly: ['Men only', 'Hides studies conducted in female-only populations'],
  groupGenus: ['Genus grouping?', 'Shows one node per genus instead of separate genus and species nodes (Faecalibacterium and F. prausnitzii become one). Where members disagree the claim shows as contested rather than picking a side'],
}

// True when an entry survives the current filters.
export function entryPasses(entry, f) {
  if (!entry) return true
  // Defensive: a component rendered without the prop would otherwise crash the
  // whole map on `f.hideDerived`. Falling back to defaults degrades to "show
  // everything except crossfeeding" rather than a blank screen.
  if (!f) f = DEFAULT_FILTERS
  const ev = entry.evidence
  const pop = entry.population

  if (entry.derived && f.hideDerived) return false
  if (f.hideAnimal && ev === 'animal') return false
  if (f.hideInVitro && ev === 'in-vitro') return false
  if (f.hideMeta && ev === 'meta-analysis') return false
  if (f.hideMendelian && ev === 'mendelian') return false
  if (f.hideReview && ev === 'review') return false
  if (f.womenOnly && pop === 'male') return false
  if (f.menOnly && pop === 'female') return false
  return true
}

// symptom_data shape: { bacteria: [{ up[], down[], both[] }] }
export function filterSymptomData(data, f) {
  if (!data || !Array.isArray(data.bacteria)) return data
  let removed = 0
  const bacteria = data.bacteria.map((b) => {
    const next = { ...b }
    for (const dir of ['up', 'down', 'both', 'none']) {
      if (!Array.isArray(b[dir])) continue
      const kept = b[dir].filter((e) => entryPasses(e, f))
      if (kept.length !== b[dir].length) {
        removed += b[dir].length - kept.length
        next[dir] = kept
      }
    }
    return next
  })
  return removed === 0 ? data : { ...data, bacteria }
}

// seed_data shape: condition(s) carrying `taxa`. Accepts one or an array.
export function filterConditions(input, f) {
  if (!input) return input
  const one = (c) => {
    if (!c || !Array.isArray(c.taxa)) return c
    const kept = c.taxa.filter((t) => entryPasses(t, f))
    return kept.length === c.taxa.length ? c : { ...c, taxa: kept }
  }
  if (!Array.isArray(input)) return one(input)
  let changed = false
  const out = input.map((c) => {
    const n = one(c)
    if (n !== c) changed = true
    return n
  })
  return changed ? out : input
}

// How much is currently being hidden - shown in Settings so the effect of a
// toggle is visible rather than something you have to infer from the map.
export function filterStats(seedConditions, symptomData, f) {
  let total = 0
  let hidden = 0
  const count = (e) => {
    total += 1
    if (!entryPasses(e, f)) hidden += 1
  }
  ;(seedConditions || []).forEach((c) => (c.taxa || []).forEach(count))
  ;(symptomData?.bacteria || []).forEach((b) =>
    ['up', 'down', 'both', 'none'].forEach((d) => (b[d] || []).forEach(count))
  )
  return { total, hidden, shown: total - hidden }
}
