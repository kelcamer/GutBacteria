import { useEffect, useRef, useState } from 'react'
import { theme } from '../theme'
import { symptomData } from '../data'
import { buildSymptomMap } from '../lib/buildSymptomMap'

// Ported verbatim from `GFA_SymptomTab` in gut-flora-atlas.readable.html
// (~line 25998-26211) - the React wrapper that mounts buildSymptomMap into
// a plain <div> ref, used for both the global Bacteria->Symptom and
// Symptom->Bacteria maps (same engine, `pinType` swapped).
export function SymptomTab({ pinType = 'bact' }) {
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
      stop = buildSymptomMap(hostRef.current, tipRef.current, symptomData, mode, pinType, true, layoutState.scramble, hiddenNamesRef)
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
        // best-effort cleanup, matches the original's bare try/catch here
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ported 1:1 from
    // the original's own dependency array (mode, pinType, layoutState only)
  }, [mode, pinType, layoutState])

  const nBact = (symptomData.bacteria || []).length
  const nSym = (symptomData.symptoms || []).length
  const nEdge = (symptomData.bacteria || []).reduce((a, b) => a + (b.up || []).length + (b.down || []).length, 0)

  const Segment = ({ id, label }) => (
    <button
      onClick={() => setMode(id)}
      className="rounded-lg px-3 py-1.5 text-sm"
      style={{ background: mode === id ? theme.ink3 : 'transparent', border: `1px solid ${mode === id ? theme.line : 'transparent'}`, color: mode === id ? theme.text : theme.muted }}
    >
      {label}
    </button>
  )

  const heading = pinType === 'bact' ? 'Bacteria → symptom map' : 'Symptom → bacteria map'
  const lead =
    pinType === 'bact'
      ? 'Symptom clusters sit in the middle; every bacterium that moves them sits on the rim, pulled inward only by how many symptoms it touches — so genera linked across many symptom domains drift toward the center. '
      : "Symptoms sit on the rim; every bacterium is pulled inward toward the symptoms it's linked to, so bacteria touching multiple symptom domains drift toward the middle. "

  return (
    <div className="p-4 safe-bottom">
      <div className="flex items-center flex-wrap gap-2 mb-1">
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20 }}>{heading}</h2>
        <div className="ml-auto flex gap-1">
          <Segment id="all" label="All bacteria" />
          <Segment id="shared" label="Cross-symptom only" />
        </div>
      </div>

      <p className="mb-3" style={{ color: theme.muted, fontSize: 13, maxWidth: 700 }}>
        {lead}
        <span style={{ color: '#FF5C86', fontWeight: 600 }}>Pink</span> lines mark increase-linked symptoms,{' '}
        <span style={{ color: '#4FC3F7', fontWeight: 600 }}>blue</span> decrease-linked. Hover any node to see its
        full list of links and sources — {nBact} bacteria · {nSym} symptom clusters · {nEdge} links.
      </p>
      <p className="mb-3" style={{ color: theme.muted, fontSize: 11.5, maxWidth: 700, fontStyle: 'italic' }}>
        Built from bacteria_symptoms.json's taxa list, grounded with a targeted PubMed/ScienceDirect literature
        pass on the highest-yield genera; the rest are mapped by established functional class (SCFA producers,
        LPS-bearing pathobionts, mucin-degraders, etc). Treat single-source or 'general literature' links as
        exploratory, not diagnostic — hover a node for its citation.
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
    </div>
  )
}
