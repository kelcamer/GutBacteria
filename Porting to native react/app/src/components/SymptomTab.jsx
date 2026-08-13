import { useEffect, useMemo, useRef, useState } from 'react'
import { theme } from '../theme'
import { symptomData, seedData } from '../data'
import { buildSymptomMap } from '../lib/buildSymptomMap'
import { withExtraConditions, buildOverlayMapData } from '../lib/symptomMapConditionOverlay'

// Ported verbatim from `GFA_SymptomTab` in gut-flora-atlas.readable.html
// (~line 25998-26211) - the React wrapper that mounts buildSymptomMap into
// a plain <div> ref, used for both the global Bacteria->Symptom and
// Symptom->Bacteria maps (same engine, `pinType` swapped).
//
// The picker below is new in this port (no minified source equivalent),
// and currently diverges by direction on purpose, as a trial: on
// Symptom->Bacteria (pinType="symptom") it's the newer "build this map"
// picker - pick exactly which symptoms AND which conditions to include,
// and the map is constructed from just that selection (an empty
// selection means "no filter, show everything," the original default).
// On Bacteria->Symptom (pinType="bact") it's still the earlier,
// simpler "add conditions on top of everything" overlay. Once there's a
// verdict on the newer picker, both directions should converge on
// whichever one wins rather than staying permanently split - see
// symptomMapConditionOverlay.js's header comment for the data-layer side
// of this.
export function SymptomTab({ pinType = 'bact' }) {
  const hostRef = useRef(null)
  const tipRef = useRef(null)
  const hiddenNamesRef = useRef(new Set())
  const graphRef = useRef(null)
  const [mode, setMode] = useState('all')
  const [layoutState, setLayoutState] = useState({ key: 0, scramble: false })
  const [showPicker, setShowPicker] = useState(false)
  const [extraConditionIds, setExtraConditionIds] = useState([])
  const [selectedSymptoms, setSelectedSymptoms] = useState([])

  const isBuilderMode = pinType === 'symptom'

  // seedData is a static JSON import (always defined, stable reference) -
  // no need to memoize this itself, just avoid the `|| []` fallback
  // creating a fresh array literal every render, which would otherwise
  // defeat extraConditions' memoization below.
  const conditions = seedData.conditions
  const extraConditions = useMemo(
    () => conditions.filter((c) => extraConditionIds.includes(c.id)),
    [conditions, extraConditionIds]
  )
  const mapData = useMemo(
    () =>
      isBuilderMode
        ? buildOverlayMapData(symptomData, selectedSymptoms, extraConditions)
        : withExtraConditions(symptomData, extraConditions),
    [isBuilderMode, selectedSymptoms, extraConditions]
  )

  useEffect(() => {
    if (!hostRef.current || !tipRef.current) return
    let stop
    try {
      stop = buildSymptomMap(hostRef.current, tipRef.current, mapData, mode, pinType, true, layoutState.scramble, hiddenNamesRef)
      graphRef.current = stop
      // Nodes added/kept via the picker(s) above aren't the result of a
      // real click, so they'd otherwise never end up in the graph's own
      // selectedNodes set - and Show Connections only ever looks at that
      // set. Pre-select them here so Show Connections works on whatever
      // you just picked without also having to click each node in the
      // graph itself.
      //
      // BUG FIX: this originally only included extraConditions (picked
      // conditions), not selectedSymptoms - so picking ONLY a symptom
      // (e.g. just "Headache / migraine", no conditions) correctly
      // narrowed the map via buildOverlayMapData, but left selectedNodes
      // empty, so Show Connections had nothing to work from and silently
      // did nothing - reported as "select headache and migraine and then
      // show connections" not doing anything. Picked symptoms are now
      // included too (builder mode only - selectedSymptoms is always []
      // in the older bact-mode overlay, so this is a no-op there).
      const namesToSelect = [...(isBuilderMode ? selectedSymptoms : []), ...extraConditions.map((c) => c.name)]
      if (namesToSelect.length) stop?.selectByNames?.(namesToSelect)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- extends the original's own dependency array (mode, pinType, layoutState) with mapData, the new overlay input
  }, [mode, pinType, layoutState, mapData])

  const nBact = (mapData.bacteria || []).length
  const nSym = (mapData.symptoms || []).length
  const nEdge = (mapData.bacteria || []).reduce((a, b) => a + (b.up || []).length + (b.down || []).length, 0)

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

  const allSymptoms = useMemo(() => [...(symptomData.symptoms || [])].sort((a, b) => a.localeCompare(b)), [])

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

      <div className="mb-4" style={{ maxWidth: 700 }}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-sm mb-2"
          style={{ color: theme.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {showPicker ? '▾ ' : '▸ '}
          {isBuilderMode ? 'Build this map from specific symptoms and conditions?' : 'Add additional conditions?'}
        </button>
        {showPicker && isBuilderMode && (
          <div>
            <p className="mb-2" style={{ color: theme.muted, fontSize: 12 }}>
              Pick specific symptoms to narrow the map to just those (leave none picked to show every symptom, the
              default). Add conditions on top to overlay them as extra nodes wired to whichever bacteria are
              currently shown — a focused way to see which conditions move the same bacteria as the symptoms you
              picked, from a gut-flora perspective.
            </p>
            <div className="mb-3">
              <div className="font-mono mb-1" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.1em' }}>
                SYMPTOMS
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {allSymptoms.map((s) => {
                  const on = selectedSymptoms.includes(s)
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSymptoms(on ? selectedSymptoms.filter((x) => x !== s) : [...selectedSymptoms, s])}
                      className="rounded-full px-2.5 py-1 text-xs"
                      style={{
                        background: on ? '#2DD4BF33' : theme.ink2,
                        border: `1px solid ${on ? '#2DD4BF' : theme.line}`,
                        color: on ? theme.text : theme.muted,
                      }}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
              <div className="font-mono mb-1" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.1em' }}>
                CONDITIONS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...conditions]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => {
                    const on = extraConditionIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        onClick={() =>
                          setExtraConditionIds(on ? extraConditionIds.filter((x) => x !== c.id) : [...extraConditionIds, c.id])
                        }
                        className="rounded-full px-2.5 py-1 text-xs"
                        style={{
                          background: on ? c.color + '33' : theme.ink2,
                          border: `1px solid ${on ? c.color : theme.line}`,
                          color: on ? theme.text : theme.muted,
                        }}
                      >
                        {c.name}
                      </button>
                    )
                  })}
              </div>
            </div>
            {(selectedSymptoms.length > 0 || extraConditionIds.length > 0) && (
              <button
                onClick={() => {
                  setSelectedSymptoms([])
                  setExtraConditionIds([])
                }}
                className="rounded-lg px-2 py-1 text-xs"
                style={{ border: `1px solid ${theme.line}`, color: theme.muted }}
              >
                × clear all
              </button>
            )}
          </div>
        )}
        {showPicker && !isBuilderMode && (
          <div>
            <p className="mb-2" style={{ color: theme.muted, fontSize: 12 }}>
              Overlays each selected condition onto this map as an extra node, wired to whichever bacteria here it
              shares — so you can see which conditions move the same bacteria already linked to these symptoms.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[...conditions]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => {
                  const on = extraConditionIds.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        setExtraConditionIds(on ? extraConditionIds.filter((x) => x !== c.id) : [...extraConditionIds, c.id])
                      }
                      className="rounded-full px-2.5 py-1 text-xs"
                      style={{
                        background: on ? c.color + '33' : theme.ink2,
                        border: `1px solid ${on ? c.color : theme.line}`,
                        color: on ? theme.text : theme.muted,
                      }}
                    >
                      {c.name}
                    </button>
                  )
                })}
            </div>
            {extraConditionIds.length > 0 && (
              <button
                onClick={() => setExtraConditionIds([])}
                className="mt-2 rounded-lg px-2 py-1 text-xs"
                style={{ border: `1px solid ${theme.line}`, color: theme.muted }}
              >
                × clear all
              </button>
            )}
          </div>
        )}
      </div>

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
