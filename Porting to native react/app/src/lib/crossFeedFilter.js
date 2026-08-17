// Strips cross-feeding-derived links before the graph engines ever see them.
//
// Deliberately done at the DATA layer rather than inside buildSymptomMap.js /
// buildMap.js. Those two engines are responsible for most of this project's
// historical bugs (pointercancel clearing selection, scroll-vs-drag pointer
// capture, phantom stacked nodes), and adding a filter pass inside their
// render logic risks all of that for no benefit. The components already
// rebuild the graph when their data changes, so removing the links upstream
// achieves exactly the same thing with none of the risk.
//
// Derived links carry `derived: true`, written by
// scripts/propagate_cross_feeding.py. They are INFERRED from metabolic
// cross-feeding relationships, not measured in the condition or symptom they
// appear under - so they are hidden unless explicitly requested.
export function stripDerived(data, showCrossFeed) {
  if (showCrossFeed || !data || !Array.isArray(data.bacteria)) return data

  let removed = 0
  const bacteria = data.bacteria.map((b) => {
    const next = { ...b }
    for (const dir of ['up', 'down', 'both']) {
      if (!Array.isArray(b[dir])) continue
      const kept = b[dir].filter((e) => !e.derived)
      if (kept.length !== b[dir].length) {
        removed += b[dir].length - kept.length
        next[dir] = kept
      }
    }
    return next
  })

  // Nothing derived present - hand back the original object so React's
  // reference equality still holds and no needless rebuild is triggered.
  if (removed === 0) return data
  return { ...data, bacteria }
}

// Condition-side equivalent. seed_data.json conditions carry `taxa` rather
// than the `bacteria` + up/down/both shape symptom_data.json uses, so it
// needs its own pass. Accepts either a single condition or an array.
export function stripDerivedConditions(input, showCrossFeed) {
  if (showCrossFeed || !input) return input

  const one = (c) => {
    if (!c || !Array.isArray(c.taxa)) return c
    const kept = c.taxa.filter((t) => !t.derived)
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
