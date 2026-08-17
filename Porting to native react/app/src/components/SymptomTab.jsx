import { useEffect, useMemo, useRef, useState } from 'react'
import { theme } from '../theme'
import { symptomData, seedData } from '../data'
import { buildSymptomMap } from '../lib/buildSymptomMap'
import { buildOverlayMapData } from '../lib/symptomMapConditionOverlay'
import { useZoom } from '../lib/useZoom'
import { ZoomButtons } from './ZoomButtons'
import { isIntervention } from '../lib/interventions'
import { MapControls } from './MapControls'
import { PickerSection } from './PickerSection'
import { FilteredEmptyState } from './FilteredEmptyState'
import { filterSymptomData, filterConditions } from '../lib/studyFilters'

// Module-level, not per-render: a stable list AND a stable default value
// for useState below (symptomData is a static JSON import, so this never
// needs to change after the module loads).
const ALL_SYMPTOMS = [...(symptomData.symptoms || [])].sort((a, b) => a.localeCompare(b))

// The symptoms/interventions split is a UI-only grouping over the same
// symptomData.symptoms list - see lib/interventions.js for the reasoning
// and the canonical list, shared with CompareTab's multi-select panel.
const ALL_INTERVENTIONS = ALL_SYMPTOMS.filter((s) => isIntervention(s))
const ALL_SYMPTOMS_ONLY = ALL_SYMPTOMS.filter((s) => !isIntervention(s))

// Ported verbatim from `GFA_SymptomTab` in gut-flora-atlas.readable.html
// (~line 25998-26211) - the React wrapper that mounts buildSymptomMap into
// a plain <div> ref, used for both the global Bacteria->Symptom and
// Symptom->Bacteria maps (same engine, `pinType` swapped).
//
// The map-builder picker below is new in this port (no minified source
// equivalent) - trialed on Symptom->Bacteria only at first, now graduated
// to both directions after a positive verdict. Pick specific symptoms
// and/or conditions to narrow the map down to exactly that selection
// (leaving everything unpicked shows the full map, the original
// default); clicking the graph's background clears the picker back to
// that default too, without having to find the "clear all" button - see
// symptomMapConditionOverlay.js's header comment for the data-layer side,
// and buildSymptomMap.js's onBackgroundClick param for the engine side.
export function SymptomTab({ pinType = 'bact', initialSelection, filters }) {
  const hostRef = useRef(null)
  const tipRef = useRef(null)
  const hiddenNamesRef = useRef(new Set())
  const graphRef = useRef(null)
  const { zoom, zoomIn, zoomOut } = useZoom()
  const [mode, setMode] = useState('all')
  const [layoutState, setLayoutState] = useState({ key: 0, scramble: false })
  const [showPicker, setShowPicker] = useState(false)
  const [extraConditionIds, setExtraConditionIds] = useState([])
  // Defaults to nothing checked - so you never have to manually deselect
  // 44 pills just to get the useful default view. An empty selection
  // (of both symptoms AND conditions) means "show everything," handled by
  // buildOverlayMapData in symptomMapConditionOverlay.js; picking a
  // condition with zero symptoms checked still narrows for real (that
  // case is told apart from "nothing picked yet" there too).
  const [selectedSymptoms, setSelectedSymptoms] = useState([])

  // New (no minified-source equivalent): GlobalSearch.jsx jumping to a
  // specific symptom lands here with a fresh {symptoms: [name]} object -
  // applied as a real picker selection (and the picker opened, so the
  // selection is actually visible) rather than some separate highlight-only
  // path, since the picker IS the mechanism for "show me just this."
  useEffect(() => {
    if (initialSelection?.symptoms?.length) {
      setSelectedSymptoms(initialSelection.symptoms)
      setShowPicker(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires once per fresh initialSelection object from App.jsx, not on every render
  }, [initialSelection])

  // seedData is a static JSON import (always defined, stable reference) -
  // no need to memoize this itself, just avoid the `|| []` fallback
  // creating a fresh array literal every render, which would otherwise
  // defeat extraConditions' memoization below.
  const conditions = seedData.conditions
  const extraConditions = useMemo(
    () => filterConditions(conditions.filter((c) => extraConditionIds.includes(c.id)), filters),
    [conditions, extraConditionIds, filters]
  )
  const mapData = useMemo(
    () => buildOverlayMapData(symptomData, selectedSymptoms, extraConditions),
    [selectedSymptoms, extraConditions]
  )
  // The unfiltered universe (every real symptom + whatever conditions are
  // currently overlaid, regardless of which symptoms are actually
  // checked) passed to buildSymptomMap as its 10th arg, so a popup's
  // Related/Protective symptom cross-reference still has other symptoms
  // to compare against even when the VISIBLE map has been narrowed down
  // to one node - see buildSymptomMap.js's own fullData/xrefData comment.
  const fullData = useMemo(
    () => buildOverlayMapData(symptomData, ALL_SYMPTOMS, extraConditions),
    [extraConditions]
  )

  const clearPicker = () => {
    setSelectedSymptoms([]) // back to "nothing picked," the real default - shows everything
    setExtraConditionIds([])
  }

  const shownData = filterSymptomData(mapData, filters)
  // Count what the filters removed, so an empty map can explain itself rather
  // than looking broken - see FilteredEmptyState.
  const rawLinks = (mapData.bacteria || []).reduce(
    (a, b) => a + ['up', 'down', 'both'].reduce((x, k) => x + (b[k] || []).length, 0),
    0
  )
  const shownLinks = (shownData.bacteria || []).reduce(
    (a, b) => a + ['up', 'down', 'both'].reduce((x, k) => x + (b[k] || []).length, 0),
    0
  )
  const filteredEmpty = rawLinks > 0 && shownLinks === 0

  useEffect(() => {
    if (!hostRef.current || !tipRef.current) return
    let stop
    try {
      stop = buildSymptomMap(hostRef.current, tipRef.current, shownData, mode, pinType, true, layoutState.scramble, hiddenNamesRef, clearPicker, fullData)
      graphRef.current = stop
      // Nodes added/kept via the picker above aren't the result of a real
      // click, so they'd otherwise never end up in the graph's own
      // selectedNodes set - and Show Connections only ever looks at that
      // set. Pre-select them here so Show Connections works on whatever
      // you just picked without also having to click each node in the
      // graph itself. With only one item picked this is a no-op in
      // practice (the map's already narrowed to just that item and its
      // own neighbors, so there's nothing further to hide) - it starts
      // doing real work once 2+ items are picked, narrowing from "touches
      // EITHER selected item" down to "touches BOTH/ALL of them."
      const namesToSelect = [...selectedSymptoms, ...extraConditions.map((c) => c.name)]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- extends the original's own dependency array (mode, pinType, layoutState) with mapData/fullData, the overlay inputs
  }, [mode, pinType, layoutState, mapData, fullData, filters])

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

  const isCustomized = selectedSymptoms.length > 0 || extraConditionIds.length > 0

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
          {showPicker ? '▾ ' : '▸ '}Build this map from specific symptoms and conditions?
        </button>
        {showPicker && (
          <div>
            <p className="mb-2" style={{ color: theme.muted, fontSize: 12 }}>
              Leave everything unpicked to see the full map. Check specific symptoms, interventions, and/or
              conditions to narrow the map down to just those — conditions get overlaid as extra nodes wired to
              whichever bacteria they share, a focused way to see which conditions move the same bacteria as what
              you picked, from a gut-flora perspective. Click the map's background at any time to clear back to the
              full map.
            </p>
            <div className="mb-3">
              <PickerSection
                label="SYMPTOMS"
                accent="#2DD4BF"
                items={ALL_SYMPTOMS_ONLY.map((s) => ({ key: s, label: s }))}
                isSelected={(it) => selectedSymptoms.includes(it.key)}
                onToggle={(it) =>
                  setSelectedSymptoms(
                    selectedSymptoms.includes(it.key)
                      ? selectedSymptoms.filter((x) => x !== it.key)
                      : [...selectedSymptoms, it.key]
                  )
                }
              />
              <PickerSection
                label="INTERVENTIONS"
                accent="#F5A623"
                defaultOpen
                items={ALL_INTERVENTIONS.map((s) => ({ key: s, label: s }))}
                isSelected={(it) => selectedSymptoms.includes(it.key)}
                onToggle={(it) =>
                  setSelectedSymptoms(
                    selectedSymptoms.includes(it.key)
                      ? selectedSymptoms.filter((x) => x !== it.key)
                      : [...selectedSymptoms, it.key]
                  )
                }
              />
              <PickerSection
                label="CONDITIONS"
                accent="#8FD3F4"
                items={[...conditions]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => ({ key: c.id, label: c.name, color: c.color }))}
                colorFor={(it) => it.color}
                isSelected={(it) => extraConditionIds.includes(it.key)}
                onToggle={(it) =>
                  setExtraConditionIds(
                    extraConditionIds.includes(it.key)
                      ? extraConditionIds.filter((x) => x !== it.key)
                      : [...extraConditionIds, it.key]
                  )
                }
              />
            </div>
            {isCustomized && (
              <button
                onClick={clearPicker}
                className="rounded-lg px-2 py-1 text-xs"
                style={{ border: `1px solid ${theme.line}`, color: theme.muted }}
              >
                × clear all
              </button>
            )}
          </div>
        )}
      </div>

      {filteredEmpty && (
        <div className="mb-3" style={{ maxWidth: 700 }}>
          <FilteredEmptyState hiddenCount={rawLinks} filters={filters} />
        </div>
      )}

      <ZoomButtons onZoomIn={zoomIn} onZoomOut={zoomOut} />

      <div className="gfa-scroll-x" style={{ position: 'relative', width: '100%', background: theme.ink2, border: `1px solid ${theme.line}`, borderRadius: 16, overflow: 'auto' }}>
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
      />
    </div>
  )
}
