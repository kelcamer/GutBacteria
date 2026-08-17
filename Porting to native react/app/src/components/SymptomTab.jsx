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
import { groupByGenus } from '../lib/groupByGenus'
import { TAXON_CANON } from '../data/taxonCanon'

// Module-level, not per-render: a stable list AND a stable default value
// for useState below (symptomData is a static JSON import, so this never
// needs to change after the module loads).
const ALL_SYMPTOMS = [...(symptomData.symptoms || [])].sort((a, b) => a.localeCompare(b))

// The symptoms/interventions split is a UI-only grouping over the same
// symptomData.symptoms list - see lib/interventions.js for the reasoning
// and the canonical list, shared with CompareTab's multi-select panel.
const ALL_INTERVENTIONS = ALL_SYMPTOMS.filter((s) => isIntervention(s))
const ALL_SYMPTOMS_ONLY = ALL_SYMPTOMS.filter((s) => !isIntervention(s))

// The default Symptom -> Bacteria selection (see useState below for why).
// Names must match symptom_data.json exactly - a typo here fails silently as
// "that pill just never turns on", so they are asserted against ALL_SYMPTOMS
// in dev rather than trusted.
const DEFAULT_SYMPTOM_SELECTION = [
  'FUT2 (Non-secretor) status',
  // 2'-FL only: the other three HMOs stay one tap away in the picker, but the
  // default view is quieter with a single intervention than with four fanning
  // into the same taxa.
  "2'-Fucosyllactose (HMO) supplementation",
]
// Conditions included in the default Symptom -> Bacteria view, by request.
const DEFAULT_CONDITION_IDS = ['seed_76', 'seed_ida_state'] // ADHD, Iron deficiency (state)

if (import.meta.env?.DEV) {
  const missing = DEFAULT_SYMPTOM_SELECTION.filter((s) => !ALL_SYMPTOMS.includes(s))
  if (missing.length) console.warn('[SymptomTab] default selection names not in symptom data:', missing)
}

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
// default). Clearing the picker is the reset button's job and only the
// reset button's job - clicking the graph's background used to do it too,
// which meant one stray click on empty canvas threw away a hand-built map
// (and jumped the page, since rebuilding the full map changes the document
// height). See symptomMapConditionOverlay.js's header comment for the
// data-layer side, and buildSymptomMap.js's onPointerUp for the engine side.
export function SymptomTab({ pinType = 'bact', initialSelection, filters, onFiltersChange }) {
  const hostRef = useRef(null)
  const tipRef = useRef(null)
  const hiddenNamesRef = useRef(new Set())
  const graphRef = useRef(null)
  const { zoom, zoomIn, zoomOut } = useZoom()
  const [mode, setMode] = useState('all')
  // Genus grouping now lives in Settings (studyFilters.js), not in local state, so
  // it persists and applies to every map at once - the map control below just
  // writes to the same setting. Falls back to true when the stored filters predate
  // the setting existing.
  //
  // ON by default, by explicit request: seeing Faecalibacterium and F. prausnitzii
  // as two unrelated dots, when they are the same organism at two ranks, was the
  // most persistent complaint about these maps. What makes that safe is the
  // contested rendering, not the merge being lossless - where members disagree an
  // arrow is never invented, and the banner names those genera.
  const groupGenus = filters?.groupGenus !== false
  const setGroupGenus = (next) => onFiltersChange?.((f) => ({ ...f, groupGenus: next }))
  const [layoutState, setLayoutState] = useState({ key: 0, scramble: false })
  const [showPicker, setShowPicker] = useState(false)
  // Default view for the Symptom -> Bacteria direction, by request: the FUT2
  // picture with every HMO intervention on screen next to it, plus ADHD. That
  // is the comparison this map keeps getting opened for, and rebuilding it by
  // hand meant nine taps through three collapsed picker groups every time.
  //
  // Only for the Symptom -> Bacteria direction, which is pinType 'symptom'
  // (the pin type names which node type sits pinned on the rim, so it reads
  // backwards from the tab name - App.jsx renders 's2b' with pinType="symptom"
  // and 'b2s' with pinType="bact"). Getting that backwards silently applies the
  // default to the OTHER map, which is exactly what happened first time.
  // The Bacteria -> Symptom map is a general browsing view; opening it
  // pre-narrowed to one person's genotype question would be wrong there.
  //
  // Not a lock: open the picker and these pills are already lit, so one tap
  // drops any of them, and "x clear all" returns to the full map.
  const [extraConditionIds, setExtraConditionIds] = useState(
    pinType === 'symptom' ? [...DEFAULT_CONDITION_IDS] : []
  )
  // Defaults to nothing checked - so you never have to manually deselect
  // 44 pills just to get the useful default view. An empty selection
  // (of both symptoms AND conditions) means "show everything," handled by
  // buildOverlayMapData in symptomMapConditionOverlay.js; picking a
  // condition with zero symptoms checked still narrows for real (that
  // case is told apart from "nothing picked yet" there too).
  const [selectedSymptoms, setSelectedSymptoms] = useState(
    pinType === 'symptom' ? [...DEFAULT_SYMPTOM_SELECTION] : []
  )

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

  // "Conditions which increase / decrease it", for the bacteria popups. Built from
  // seed_data rather than from what is on the map, so the answer is the same
  // whether or not you happen to have those conditions selected - the question
  // ("what raises this organism?") is about the app's whole dataset.
  //
  // Condition taxa use raw research names; TAXON_CANON maps them onto the
  // canonical names the symptom maps use, which is the same mapping
  // conditionSymptomData.js relies on. Study filters are applied first, so a
  // condition hidden by a filter cannot reappear here.
  const conditionIndex = useMemo(() => {
    const idx = {}
    const put = (key, dir, condName) => {
      if (!key) return
      const slot = (idx[key] = idx[key] || { up: [], down: [], both: [] })
      if (slot[dir] && !slot[dir].includes(condName)) slot[dir].push(condName)
    }
    for (const c of filterConditions(conditions, filters)) {
      for (const t of c.taxa || []) {
        if (t.derived) continue // inferences are not evidence that a condition raises this
        const canon = TAXON_CANON[t.name] || t.name
        put(canon, t.dir, c.name)
        // With grouping on, the popup's node is a genus, so file species results
        // under the genus too - otherwise a merged node would list nothing.
        if (groupGenus) {
          const genus = String(canon).split(' ')[0]
          if (genus !== canon) put(genus, t.dir, c.name)
        }
      }
    }
    for (const k of Object.keys(idx)) {
      idx[k].up.sort(); idx[k].down.sort(); idx[k].both.sort()
    }
    return idx
  }, [conditions, filters, groupGenus])

  const clearPicker = () => {
    setSelectedSymptoms([]) // back to "nothing picked," the real default - shows everything
    setExtraConditionIds([])
  }

  const filteredData = filterSymptomData(mapData, filters)
  // Grouping runs AFTER the study filters, so a merged claim can only ever be built
  // from evidence that survived them - otherwise a hidden animal study could
  // reappear inside a genus node.
  const grouped = groupGenus ? groupByGenus(filteredData) : null
  const shownData = grouped ? grouped.data : filteredData
  // Count what the filters removed, so an empty map can explain itself rather
  // than looking broken - see FilteredEmptyState.
  const rawLinks = (mapData.bacteria || []).reduce(
    (a, b) => a + ['up', 'down', 'both', 'none'].reduce((x, k) => x + (b[k] || []).length, 0),
    0
  )
  const shownLinks = (shownData.bacteria || []).reduce(
    (a, b) => a + ['up', 'down', 'both', 'none'].reduce((x, k) => x + (b[k] || []).length, 0),
    0
  )
  const filteredEmpty = rawLinks > 0 && shownLinks === 0

  useEffect(() => {
    if (!hostRef.current || !tipRef.current) return
    let stop
    try {
      stop = buildSymptomMap(hostRef.current, tipRef.current, shownData, mode, pinType, true, layoutState.scramble, hiddenNamesRef, fullData, conditionIndex)
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
  }, [mode, pinType, layoutState, mapData, fullData, filters, groupGenus, conditionIndex])

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

      {/* Grouping is lossy in one specific way - members can disagree - so the map
          says so out loud rather than letting a merged arrow look unanimous. */}
      {grouped && (
        <div
          className="rounded-xl mb-3 px-3 py-2"
          style={{ background: theme.ink2, border: `1px solid ${grouped.summary.conflicts ? '#FFC857' : theme.line}`, fontSize: 12.5, color: theme.muted, maxWidth: 700 }}
        >
          <b style={{ color: theme.text }}>Grouped by genus</b> — {grouped.summary.merged} genera absorbed their species.{' '}
          {grouped.summary.conflicts > 0 ? (
            <>
              <b style={{ color: '#FFC857' }}>
                {grouped.summary.conflicts === 1
                  ? 'one of them contains members that disagree'
                  : `${grouped.summary.conflicts} of them contain members that disagree`}
              </b>{' '}({grouped.summary.conflictNames.join(', ')}).
              Those claims render as contested (↔) rather than picking a winner — open the node to see each member's own evidence. Ungroup to see them as separate nodes, which is how the data is actually stored.
            </>
          ) : (
            <>No member disagreements in the current selection.</>
          )}
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
        groupGenus={groupGenus}
        onToggleGroupGenus={(next) => {
          // Hidden-node memory is keyed by NAME, and grouping changes which names
          // exist ("Faecalibacterium prausnitzii" becomes part of "Faecalibacterium").
          // Carrying the old set across would hide the wrong things.
          hiddenNamesRef.current?.clear()
          setGroupGenus(next)
        }}
        onSnapBack={() => {
            // Snap back means EVERYTHING back, by request: hidden nodes restored,
            // the picker cleared to the full map, and the layout relaid. It is the
            // one button that always returns you to a known state.
            hiddenNamesRef.current?.clear()
            clearPicker()
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
