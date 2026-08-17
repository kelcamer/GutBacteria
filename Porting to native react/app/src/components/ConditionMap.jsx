import { useEffect, useMemo, useRef, useState } from 'react'
import { theme } from '../theme'
import { conditionSymptomData } from '../lib/conditionSymptomData'
import { buildSymptomMap } from '../lib/buildSymptomMap'
import { useZoom } from '../lib/useZoom'
import { ZoomButtons } from './ZoomButtons'
import { MapControls } from './MapControls'
import { stripDerived, stripDerivedConditions } from '../lib/crossFeedFilter'

// Ported verbatim from `GFA_ConditionMap` in gut-flora-atlas.readable.html
// (~line 26916-27095) - the per-condition scoped map that was placeholdered
// in ConditionDetail.jsx pending the graph engine, now real.
export function ConditionMap({ condition }) {
  const hostRef = useRef(null)
  const tipRef = useRef(null)
  const hiddenNamesRef = useRef(new Set())
  const graphRef = useRef(null)
  const { zoom, zoomIn, zoomOut } = useZoom()
  // Cross-feeding-derived links are inferred, not measured here - hidden
  // unless asked for. Filtering upstream of the engine, see crossFeedFilter.js
  const [showCrossFeed, setShowCrossFeed] = useState(false)
  const [layoutState, setLayoutState] = useState({ key: 0, scramble: false })

  const data = useMemo(
    () => conditionSymptomData(stripDerivedConditions(condition, showCrossFeed)),
    [condition, showCrossFeed]
  )

  const shownData = stripDerived(data, showCrossFeed)

  useEffect(() => {
    if (!hostRef.current || !tipRef.current || !data.bacteria.length) return
    let stop
    try {
      stop = buildSymptomMap(hostRef.current, tipRef.current, shownData, 'all', 'bact', true, layoutState.scramble, hiddenNamesRef)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ported 1:1 from the original's own deps
  }, [data, layoutState, showCrossFeed])

  if (!data.bacteria.length) return null

  return (
    <div className="mt-6" style={{ borderTop: `1px solid ${theme.line}`, paddingTop: 18 }}>
      <h3 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
        Taxa → symptom map
      </h3>
      <p className="mb-3" style={{ color: theme.muted, fontSize: 12.5, maxWidth: 680 }}>
        {data.matchedCount} of this condition's {data.totalCount} taxa entries have literature-backed symptom
        links (grouped by genus, so species-level duplicates collapse into one node), mapped the same way as the
        global Bacteria → symptom map — taxa on the rim, symptoms pulled toward the middle. Hover any node for
        its source.
      </p>
      <p className="mb-3" style={{ color: theme.muted, fontSize: 12.5, maxWidth: 680 }}>
        <b style={{ color: theme.text }}>Potentially Related Symptoms</b> (most to least connections):{' '}
        {data.rankedSymptoms.join(', ')}.
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

      <MapControls
        onSnapBack={() => {
            hiddenNamesRef.current?.clear()
            setLayoutState((s) => ({ key: s.key + 1, scramble: false }))
          }}
        onScramble={() => setLayoutState((s) => ({ key: s.key + 1, scramble: true }))}
        onHideIsolated={() => graphRef.current?.hideIsolatedNodes?.()}
        onIncreasedOnly={() => graphRef.current?.showIncreasedOnly?.()}
        onDecreasedOnly={() => graphRef.current?.showDecreasedOnly?.()}
        onConnections={() => graphRef.current?.showConnectionsOnly?.()}
        onToggleCrossFeed={setShowCrossFeed}
      />
    </div>
  )
}
