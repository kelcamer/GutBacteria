import { useEffect, useMemo, useRef, useState } from 'react'
import { theme } from '../theme'
import { buildMap } from '../lib/buildMap'
import { BRAIN_DATA } from '../data/brainData'

// Ported from `GFA_BrainTab` in gut-flora-atlas.readable.html (~line
// 26213-26743, 531 lines) - powers both "Condition to Brain Region" and
// "Brain Region to Condition" nav tabs (same component, pinType prop
// flips the rim). BRAIN_DATA reuses the Condition{taxa[]} shape (each
// "taxon" is a brain region name), so it plugs into the same `buildMap`
// engine used by ConditionsMap - buildMap's brain-tooltip branch keys off
// BRAIN_REGION_INFO matching a taxon's name, which only brain-region names
// do.
export function BrainTab({ pinType }) {
  pinType = pinType || 'cond'
  const conds = BRAIN_DATA
  const hostRef = useRef(null)
  const tipRef = useRef(null)
  const hiddenNamesRef = useRef(new Set())
  const graphRef = useRef(null)
  const [mode, setMode] = useState('all')
  const [layoutState, setLayoutState] = useState({ key: 0, scramble: false })

  useEffect(() => {
    if (!hostRef.current || !tipRef.current) return
    let stop
    try {
      stop = buildMap(hostRef.current, tipRef.current, conds, mode, layoutState.scramble, false, pinType, hiddenNamesRef)
      graphRef.current = stop
    } catch {
      if (hostRef.current) {
        hostRef.current.innerHTML = '<div style="color:#A08FC7;font-size:13px;padding:24px">Map unavailable.</div>'
      }
    }
    return () => {
      try {
        stop?.()
      } catch {
        // best-effort cleanup, matches the original
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ported 1:1 from the original's own deps ([mode, pinType, layoutState])
  }, [mode, pinType, layoutState])

  const nRegion = useMemo(() => {
    const set = {}
    let k = 0
    conds.forEach((c) => {
      ;(c.taxa || []).forEach((t) => {
        const n = ((t && t.name) || '').trim()
        if (n && !set[n]) {
          set[n] = 1
          k++
        }
      })
    })
    return k
    // eslint-disable-next-line react-hooks/exhaustive-deps -- BRAIN_DATA is static, matching the original's empty dep array
  }, [])

  const nEdge = useMemo(
    () => conds.reduce((a, c) => a + (c.taxa || []).length, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- BRAIN_DATA is static, matching the original's empty dep array
    []
  )

  const [expandedNb, setExpandedNb] = useState(null)

  const regionOverlap = (aName, bName) => {
    const A = conds.find((c) => c.name === aName)
    const B = conds.find((c) => c.name === bName)
    if (!A || !B) return { same: [], opp: [] }
    const bMap = {}
    ;(B.taxa || []).forEach((t) => { bMap[t.name] = t.dir })
    const same = [], opp = []
    ;(A.taxa || []).forEach((t) => {
      if (Object.prototype.hasOwnProperty.call(bMap, t.name)) {
        if (bMap[t.name] === t.dir) same.push({ region: t.name, dir: t.dir })
        else opp.push({ region: t.name, dirA: t.dir, dirB: bMap[t.name] })
      }
    })
    return { same, opp }
  }

  const neighborRows = useMemo(
    () =>
      conds.map((c) => {
        const regionMap = {}
        ;(c.taxa || []).forEach((t) => { regionMap[t.name] = t.dir })
        const scored = conds
          .filter((o) => o.id !== c.id)
          .map((o) => {
            let same = 0, opp = 0
            ;(o.taxa || []).forEach((t) => {
              if (Object.prototype.hasOwnProperty.call(regionMap, t.name)) {
                if (regionMap[t.name] === t.dir) same++
                else opp++
              }
            })
            return { name: o.name, color: o.color, same, opp }
          })
        // Rank by regions that move the SAME direction in both conditions —
        // an opposite-direction match (e.g. amygdala up in one, down in the
        // other) is a point of divergence, not similarity, so it must not
        // inflate "closeness" just because both conditions study that region.
        scored.sort((a, b) => b.same - a.same || a.name.localeCompare(b.name))
        return { name: c.name, color: c.color, neighbors: scored.slice(0, 3) }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- BRAIN_DATA is static, matching the original's empty dep array
    []
  )

  const seg = (id, label) => (
    <button
      key={id}
      onClick={() => setMode(id)}
      className="rounded-lg px-3 py-1.5 text-sm"
      style={{
        background: mode === id ? theme.ink3 : 'transparent',
        border: `1px solid ${mode === id ? theme.line : 'transparent'}`,
        color: mode === id ? theme.text : theme.muted,
      }}
    >
      {label}
    </button>
  )

  const heading = pinType === 'bact' ? 'Brain region → condition map' : 'Condition → brain region map'
  const lead =
    pinType === 'bact'
      ? 'Every brain region sits on the rim; each condition that implicates it is pulled inward toward it, so brain regions implicated across multiple conditions settle in the middle. '
      : "Each condition sits on the rim; every brain region reported as altered for it is pulled inward toward it, so regions implicated across multiple conditions settle in between — a literal map of where these conditions' neuroimaging findings overlap and diverge. "

  return (
    <div className="px-4 pb-10" style={{ borderTop: `1px solid ${theme.line}`, marginTop: 8, paddingTop: 18 }}>
      <div className="flex items-center flex-wrap gap-2 mb-1">
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20 }}>{heading}</h2>
        <div className="ml-auto flex gap-1">
          {seg('all', 'All regions')}
          {seg('shared', 'Shared only')}
        </div>
      </div>
      <p className="mb-3" style={{ color: theme.muted, fontSize: 13, maxWidth: 680 }}>
        {lead}
        <span style={{ color: '#FF5C86', fontWeight: 600 }}>Pink</span> lines mark increased activity,{' '}
        <span style={{ color: '#4FC3F7', fontWeight: 600 }}>blue</span> decreased; bigger dots sit in more
        conditions. Hover or click any node to trace its links — {nRegion} brain regions · {nEdge} links across{' '}
        {conds.length} conditions. Sourced from fMRI/connectivity meta-analyses and reviews (PubMed) — see each
        node's citation.
      </p>

      <div style={{ position: 'relative', width: '100%', background: theme.ink2, border: `1px solid ${theme.line}`, borderRadius: 16, overflow: 'hidden' }}>
        <div ref={hostRef} style={{ width: '100%' }} />
        <div
          ref={tipRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0,
            pointerEvents: 'none',
            maxWidth: 280,
            boxSizing: 'border-box',
            touchAction: 'none',
            background: 'rgba(22,14,43,.96)',
            border: `1px solid ${theme.line}`,
            borderRadius: 10,
            padding: '8px 10px',
            boxShadow: '0 8px 30px rgba(0,0,0,.5)',
            transition: 'opacity .12s',
            zIndex: 5,
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => {
            hiddenNamesRef.current?.clear()
            setLayoutState((s) => ({ key: s.key + 1, scramble: false }))
          }}
          className="rounded-lg px-3 py-1.5 text-sm"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          ↻ Snap back into position
        </button>
        <button
          onClick={() => setLayoutState((s) => ({ key: s.key + 1, scramble: true }))}
          className="rounded-lg px-3 py-1.5 text-sm"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          🔀 Scramble me
        </button>
        <button
          onClick={() => graphRef.current?.hideIsolatedNodes?.()}
          className="rounded-lg px-3 py-1.5 text-sm"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          🕸️ Hide Isolated Nodes
        </button>
        <button
          onClick={() => graphRef.current?.showConnectionsOnly?.()}
          className="rounded-lg px-3 py-1.5 text-sm ml-auto"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          🔗 Show Connections
        </button>
      </div>

      <h3 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15, marginTop: 22, marginBottom: 4 }}>
        Closest neighbors by shared brain regions
      </h3>
      <p className="mb-2" style={{ color: theme.muted, fontSize: 12, maxWidth: 680 }}>
        Ranked by regions that move the &#8220;same direction&#8221; in both conditions (both increased, or both
        decreased) — a region studied by both but moving opposite ways (e.g. amygdala up in one, down in the other)
        is a difference, not a similarity, and does not count toward closeness. Opposite-direction overlaps are
        shown separately as "diverges on".
      </p>

      <div style={{ overflowX: 'auto', border: `1px solid ${theme.line}`, borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: theme.ink3 }}>
              <th style={{ textAlign: 'left', padding: '7px 10px', color: theme.text, fontWeight: 700 }}>Condition</th>
              <th style={{ textAlign: 'left', padding: '7px 10px', color: theme.text, fontWeight: 700 }}>#1 neighbor</th>
              <th style={{ textAlign: 'left', padding: '7px 10px', color: theme.text, fontWeight: 700 }}>#2 neighbor</th>
              <th style={{ textAlign: 'left', padding: '7px 10px', color: theme.text, fontWeight: 700 }}>#3 neighbor</th>
            </tr>
          </thead>
          <tbody>
            {neighborRows.map((row, ri) => (
              <tr key={row.name} style={{ borderTop: `1px solid ${theme.line}`, background: ri % 2 ? 'transparent' : theme.ink2 }}>
                <td style={{ padding: '7px 10px', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 8, background: row.color, display: 'inline-block', flexShrink: 0 }} />
                    {row.name}
                  </span>
                </td>
                {row.neighbors
                  .concat([null, null, null])
                  .slice(0, 3)
                  .map((n, ni) => {
                    const nbKey = n ? row.name + '→' + n.name : null
                    const isOpen = !!(n && expandedNb === nbKey)
                    return (
                      <td key={ni} style={{ padding: '7px 10px', color: theme.muted, verticalAlign: 'top' }}>
                        {n ? (
                          <div>
                            <span
                              onClick={() => setExpandedNb(isOpen ? null : nbKey)}
                              role="button"
                              tabIndex={0}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', textDecoration: isOpen ? 'underline' : 'none' }}
                            >
                              <span style={{ width: 7, height: 7, borderRadius: 7, background: n.color, display: 'inline-block', flexShrink: 0 }} />
                              <span>
                                {n.name}{' '}
                                <span style={{ color: theme.muted, fontSize: 11 }}>
                                  ({n.same} same-dir{n.opp ? `, ${n.opp} diverges on` : ''})
                                </span>
                              </span>
                            </span>
                            {isOpen &&
                              (() => {
                                const d = regionOverlap(row.name, n.name)
                                return (
                                  <div style={{ marginTop: 6, padding: '8px 10px', background: theme.ink3, border: `1px solid ${theme.line}`, borderRadius: 8, fontSize: 11.5, maxWidth: 260 }}>
                                    {d.same.length > 0 && (
                                      <div style={{ marginBottom: d.opp.length > 0 ? 6 : 0 }}>
                                        <div style={{ fontWeight: 700, color: theme.text, marginBottom: 2 }}>Same direction ({d.same.length})</div>
                                        {d.same.map((r, i) => (
                                          <div key={i} style={{ color: theme.muted }}>{r.region} ({r.dir})</div>
                                        ))}
                                      </div>
                                    )}
                                    {d.opp.length > 0 && (
                                      <div>
                                        <div style={{ fontWeight: 700, color: theme.text, marginBottom: 2 }}>Diverges on ({d.opp.length})</div>
                                        {d.opp.map((r, i) => (
                                          <div key={i} style={{ color: theme.muted }}>
                                            {r.region} ({row.name}: {r.dirA}, {n.name}: {r.dirB})
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {d.same.length === 0 && d.opp.length === 0 && (
                                      <div style={{ color: theme.muted }}>No shared regions.</div>
                                    )}
                                  </div>
                                )
                              })()}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    )
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
