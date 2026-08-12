import { useEffect, useState, useCallback } from 'react'
import { seedData } from '../data'
import { getJSON, setJSON } from '../lib/storage'

const DATA_KEY = 'gutflora:v1'
const BASELINE_KEY = 'gutflora:shipped-baseline:v1'

/**
 * Ported from the data-loading half of `$u` (gut-flora-atlas.readable.html
 * ~line 16769-16822) - this is the "critical bug fix" logic documented in
 * ARCHITECTURE.md's history: a naive "prefer localStorage if it exists"
 * approach means any edit to the shipped data (new conditions, fixed
 * citations) becomes permanently invisible to a returning browser. Instead,
 * every load diffs each locally-saved condition against a *baseline*
 * snapshot of what was shipped last time:
 *   - no local copy of a condition at all -> use the fresh shipped version
 *   - local copy is byte-identical to the old baseline -> the user never
 *     touched it, safe to replace with the fresh shipped version (picks up
 *     upstream fixes/new citations)
 *   - local copy differs from the old baseline -> the user has real edits,
 *     keep them, never silently overwrite
 *   - a condition exists locally but isn't in the shipped data at all -> a
 *     condition the user added themselves; always kept
 * The baseline is then updated to this load's shipped snapshot, so the next
 * load's diff is against what was *actually* shipped last time, not
 * whatever the user's local copy drifted to.
 *
 * Simplified from the original: no fetch()/embedded-fallback duality (see
 * src/data/index.js for why that's not needed in a real deployed app), so
 * this hook doesn't need to be async at all - the shipped data is already
 * available synchronously as a bundled import.
 */
export function useConditionsData() {
  const [data, setData] = useState(null)
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    const local = getJSON(DATA_KEY)
    let merged

    if (local) {
      const baseline = getJSON(BASELINE_KEY)
      const localById = Object.fromEntries(local.conditions.map((c) => [c.id, c]))
      const baselineById = Object.fromEntries((baseline?.conditions ?? []).map((c) => [c.id, c]))

      const reconciled = seedData.conditions.map((shippedCondition) => {
        const localCondition = localById[shippedCondition.id]
        if (!localCondition) return shippedCondition
        const baselineCondition = baselineById[shippedCondition.id]
        if (!baselineCondition) return shippedCondition
        if (JSON.stringify(localCondition) === JSON.stringify(baselineCondition)) return shippedCondition
        return localCondition
      })

      const shippedIds = new Set(seedData.conditions.map((c) => c.id))
      const localOnly = local.conditions.filter((c) => !shippedIds.has(c.id))

      merged = { ...local, conditions: [...reconciled, ...localOnly] }
    } else {
      merged = seedData
    }

    setJSON(DATA_KEY, merged)
    setJSON(BASELINE_KEY, seedData)
    setData(merged)
  }, [])

  const commit = useCallback((next) => {
    setData(next)
    const ok = setJSON(DATA_KEY, next)
    setSaveFailed(!ok)
  }, [])

  return { data, commit, saveFailed }
}
