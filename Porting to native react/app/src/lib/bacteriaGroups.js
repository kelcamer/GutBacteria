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
      const rawHits = pairs.filter((p) => g.names.includes(p.t.name))
      // Bug fix: loose matching legitimately collapses several SPECIES of
      // one genus into a single card (e.g. Bifidobacterium adolescentis +
      // pseudocatenulatum + bifidum all group under "Bifidobacterium") -
      // but when one source paper reported the same direction for several
      // species at once, that meant the same condition showed up several
      // times in a row, citing the identical link, reading as duplicate
      // spam ("FUT2 listed many times with the same link"). Deduped here
      // by (condition, direction, link-or-refs) so one real citation only
      // ever produces one row, no matter how many species it covered.
      const seen = new Set()
      const hits = rawHits.filter((p) => {
        const key = p.c.id + '|' + p.t.dir + '|' + (p.t.links?.[0]?.url || p.t.refs || '')
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      const up = hits.filter((p) => p.t.dir === 'up')
      const down = hits.filter((p) => p.t.dir === 'down')
      return { label: g.label, names: g.names, hits, up, down, split: up.length > 0 && down.length > 0 }
    })
    .sort((x, y) => x.label.localeCompare(y.label))
}
