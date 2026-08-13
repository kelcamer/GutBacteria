import { groupTaxa } from './looseMatch'

// Extracted out of BacteriaIndex.jsx's own `grouped` useMemo (word for
// word - same computation, just given a name so GlobalSearch.jsx can
// reuse it) so both stay in sync automatically instead of two copies of
// "how do we cluster raw condition taxa into one bacterium entry"
// silently drifting apart over time. See BacteriaIndex.jsx for the
// original context/history of this grouping.
export function groupBacteriaFromConditions(conditions, loose) {
  const pairs = []
  conditions.forEach((c) => c.taxa.forEach((t) => pairs.push({ c, t })))
  return groupTaxa(
    pairs.map((p) => p.t.name),
    loose
  )
    .map((g) => {
      const hits = pairs.filter((p) => g.names.includes(p.t.name))
      const up = hits.filter((p) => p.t.dir === 'up')
      const down = hits.filter((p) => p.t.dir === 'down')
      return { label: g.label, names: g.names, hits, up, down, split: up.length > 0 && down.length > 0 }
    })
    .sort((x, y) => y.hits.length - x.hits.length || x.label.localeCompare(y.label))
}
