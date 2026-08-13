import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { theme } from '../theme'
import { buildBacteriumFocusData } from '../lib/bacteriumFocusMap'
import { buildSymptomMap } from '../lib/buildSymptomMap'
import { Italic } from './Italic'

// New component (no minified-source equivalent), same shape as
// ConditionMap.jsx (the per-condition scoped map) but inverted: given the
// raw taxon names behind one BacteriaIndex card, shows every symptom AND
// condition connected to that bacterium on one graph. Rendered at the
// bottom of BacteriaIndex.jsx, which scrolls to it when a bacterium's
// name is clicked - see that file for the click/scroll wiring, and
// bacteriumFocusMap.js for the matching logic.
export function BacteriumFocusMap({ label, names, onClose }) {
  const hostRef = useRef(null)
  const tipRef = useRef(null)
  const hiddenNamesRef = useRef(new Set())
  const graphRef = useRef(null)
  const [layoutState, setLayoutState] = useState({ key: 0, scramble: false })

  const data = useMemo(() => buildBacteriumFocusData(names), [names])

  useEffect(() => {
    if (!hostRef.current || !tipRef.current || !data.bacteria.length) return
    let stop
    try {
      // pinType 'symptom' (not 'bact'): pins the symptom/condition nodes to
      // the rim and leaves the bacterium node(s) free, pulled inward by
      // every connection - so the bacterium this map is about ends up in
      // the middle, not fixed at a rim position (which, with only one or
      // two bacteria nodes, tended to land at the top instead of center).
      stop = buildSymptomMap(hostRef.current, tipRef.current, data, 'all', 'symptom', true, layoutState.scramble, hiddenNamesRef)
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
        // best-effort cleanup, matches ConditionMap.jsx's own
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matches ConditionMap.jsx's own deps ([data, layoutState])
  }, [data, layoutState])

  const nSym = data.bacteria.reduce((a, b) => a + (b.up || []).length + (b.down || []).length + (b.both || []).length, 0)

  return (
    <div className="mt-6" style={{ borderTop: `1px solid ${theme.line}`, paddingTop: 18 }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16 }}>
          <Italic>{label}</Italic> → everything it touches
        </h3>
        <button onClick={onClose} style={{ color: theme.muted, flexShrink: 0 }} aria-label="Close this map">
          <X size={16} />
        </button>
      </div>

      {!data.bacteria.length ? (
        <p className="py-6 text-center text-sm" style={{ color: theme.muted }}>
          No literature-backed symptom links tracked for this bacterium yet.
        </p>
      ) : (
        <>
          <p className="mb-3" style={{ color: theme.muted, fontSize: 12.5, maxWidth: 680 }}>
            {data.symptoms.length} symptom cluster{data.symptoms.length === 1 ? '' : 's'} and {nSym} total links,
            including every real condition (Conditions tab) whose own tracked taxa canonically match this
            bacterium — the same mapping this app's Symptom↔Bacteria map-builder picker uses. Hover any node for
            its source.
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
              onClick={() => graphRef.current?.showIncreasedOnly?.()}
              className="rounded-lg px-3 py-1.5 text-sm"
              style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
            >
              ▲ Show Increased Only
            </button>
            <button
              onClick={() => graphRef.current?.showDecreasedOnly?.()}
              className="rounded-lg px-3 py-1.5 text-sm"
              style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
            >
              ▼ Show Decreased Only
            </button>
            <button
              onClick={() => graphRef.current?.showConnectionsOnly?.()}
              className="rounded-lg px-3 py-1.5 text-sm ml-auto"
              style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
            >
              🔗 Show Connections
            </button>
          </div>
        </>
      )}
    </div>
  )
}
