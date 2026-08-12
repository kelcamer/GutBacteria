import { useEffect, useState } from 'react'

const KEY = 'gfa_recent_conditions'

// Ported from the GFA_recentIds/GFA_setRecentIds state + effect inside `$u`
// (gut-flora-atlas.readable.html ~line 16751, 16759). Session-scoped (not
// localStorage) - the "last 5 viewed" list resets each browser session,
// deliberately, matching the original.
export function useRecentConditions(activeConditionId) {
  const [recentIds, setRecentIds] = useState(() => {
    try {
      const raw = sessionStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!activeConditionId) return
    setRecentIds((prev) => {
      const next = [activeConditionId, ...prev.filter((id) => id !== activeConditionId)].slice(0, 5)
      try {
        sessionStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        // storage disabled - session-scoped "recent" list just won't persist, non-critical
      }
      return next
    })
  }, [activeConditionId])

  return recentIds
}
