import { useEffect, useMemo, useRef, useState } from 'react'
import { theme } from '../theme'
import { symptomData } from '../data'
import { buildMap } from '../lib/buildMap'
import { useZoom } from '../lib/useZoom'
import { ZoomButtons } from './ZoomButtons'

// Ported from `Gfx` in gut-flora-atlas.readable.html (~line 28119-28372) -
// the all-conditions "Condition <-> bacteria map", rendered directly below
// the ConditionsGrid on the Conditions tab's list view (not its own nav
// item). Reuses `buildMap`/`GFA_buildMap` with pinType left undefined,
// which the engine defaults to "cond" (conditions on the rim).
export function ConditionsMap({ conditions, focusNames, onBackgroundClick }) {
  const hostRef = useRef(null)
  const tipRef = useRef(null)
  const hiddenNamesRef = useRef(new Set())
  const graphRef = useRef(null)
  const { zoom, zoomIn, zoomOut } = useZoom()
  const [mode, setMode] = useState('all')
  const [layoutState, setLayoutState] = useState({ key: 0, scramble: false })

  // Original recomputes off a `sig` string (name+taxa-count join) rather
  // than the conditions array reference, so an in-place taxa edit that
  // doesn't change the array identity still triggers a rebuild.
  const sig = useMemo(() => (conditions || []).map((c) => c.name + ':' + (c.taxa || []).length).join('|'), [conditions])

  useEffect(() => {
    if (!hostRef.current || !tipRef.current) return
    let stop
    try {
      stop = buildMap(hostRef.current, tipRef.current, conditions, mode, layoutState.scramble, undefined, undefined, hiddenNamesRef, onBackgroundClick, symptomData)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- extends the original's own deps ([sig, mode, layoutState]) with onBackgroundClick, the new callback input
  }, [sig, mode, layoutState, onBackgroundClick])

  // New (no minified-source equivalent): typing a condition name in
  // ConditionsGrid above (its sibling on this same tab) highlights it -
  // and its connections - right here, via buildMap.js's selectByNames
  // (added alongside this feature). Separate effect from the rebuild
  // above since a new search match doesn't need the whole graph rebuilt,
  // just the already-live graphRef told about it.
  useEffect(() => {
    // Always called, even with an empty list - selectByNames clears the
    // prior selection first, so clearing the search box above properly
    // clears the highlight here too instead of leaving it stuck on the
    // last match.
    graphRef.current?.selectByNames?.(focusNames || [])
  }, [focusNames])

  const nBact = useMemo(() => {
    const set = {}
    let k = 0
    ;(conditions || []).forEach((c) => {
      ;(c.taxa || []).forEach((t) => {
        const n = ((t && t.name) || '').trim()
        if (n && !set[n]) {
          set[n] = 1
          k++
        }
      })
    })
    return k
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on sig, matching the original
  }, [sig])

  const nEdge = useMemo(
    () => (conditions || []).reduce((a, c) => a + (c.taxa || []).length, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on sig, matching the original
    [sig]
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

  return (
    <div className="px-4 pb-10" style={{ borderTop: `1px solid ${theme.line}`, marginTop: 8, paddingTop: 18 }}>
      <div className="flex items-center flex-wrap gap-2 mb-1">
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20 }}>Condition ↔ bacteria map</h2>
        <div className="ml-auto flex gap-1">
          {seg('all', 'All bacteria')}
          {seg('shared', 'Shared only')}
        </div>
      </div>
      <p className="mb-3" style={{ color: theme.muted, fontSize: 13, maxWidth: 680 }}>
        Each condition sits on the rim; every taxon it moves is pulled inward toward it, so bacteria shared across
        conditions settle in between. <span style={{ color: '#FF5C86', fontWeight: 600 }}>Pink</span> lines mark
        increased, <span style={{ color: '#4FC3F7', fontWeight: 600 }}>blue</span> decreased; bigger dots sit in
        more conditions. Hover any node to trace its links — {nBact} bacteria · {nEdge} links.
      </p>

      <ZoomButtons onZoomIn={zoomIn} onZoomOut={zoomOut} />

      <div style={{ position: 'relative', width: '100%', background: theme.ink2, border: `1px solid ${theme.line}`, borderRadius: 16, overflow: 'auto' }}>
        <div ref={hostRef} style={{ width: '100%', transform: `scale(${zoom})`, transformOrigin: 'top center' }} />
        <div
          className="gfa-tip"
          ref={tipRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0,
            pointerEvents: 'none',
            maxWidth: 260,
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
          ↻ Snap back
        </button>
        <button
          onClick={() => setLayoutState((s) => ({ key: s.key + 1, scramble: true }))}
          className="rounded-lg px-3 py-1.5 text-sm"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          🔀 Scramble
        </button>
        <button
          onClick={() => graphRef.current?.hideIsolatedNodes?.()}
          className="rounded-lg px-3 py-1.5 text-sm"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          🕸️ Hide Isolated
        </button>
        <button
          onClick={() => graphRef.current?.showIncreasedOnly?.()}
          className="rounded-lg px-3 py-1.5 text-sm"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          ▲ Increased Only
        </button>
        <button
          onClick={() => graphRef.current?.showDecreasedOnly?.()}
          className="rounded-lg px-3 py-1.5 text-sm"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          ▼ Decreased Only
        </button>
        <button
          onClick={() => graphRef.current?.showConnectionsOnly?.()}
          className="rounded-lg px-3 py-1.5 text-sm ml-auto"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          🔗 Connections
        </button>
      </div>
    </div>
  )
}
