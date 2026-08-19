import { useEffect, useMemo, useRef, useState } from 'react'
import { Menu, X, TriangleAlert, Search } from 'lucide-react'
import { theme } from './theme'
import { NAV_ITEMS } from './navItems'
import { useConditionsData } from './hooks/useConditionsData'
import { useRecentConditions } from './hooks/useRecentConditions'
import { useSwipeGestures } from './hooks/useSwipeGestures'
import { ConditionsGrid } from './components/ConditionsGrid'
import { ConditionsMap } from './components/ConditionsMap'
import { ConditionDetail } from './components/ConditionDetail'
import { Glossary } from './components/Glossary'
import { SymptomTab } from './components/SymptomTab'
import { BrainTab } from './components/BrainTab'
import { CompareTab } from './components/CompareTab'
import { CrossFeedingTab } from './components/CrossFeedingTab'
import { HormoneTab } from './components/HormoneTab'
import { SettingsTab } from './components/SettingsTab'
import { DEFAULT_FILTERS, filterConditions } from './lib/studyFilters'
import { BacteriaIndex } from './components/BacteriaIndex'
import { SourcesTab } from './components/SourcesTab'
import { BackupTab } from './components/BackupTab'
import { FindInPapersTab } from './components/FindInPapersTab'
import { GlobalSearch } from './components/GlobalSearch'
import { JumpToTop } from './components/JumpToTop'

// Module-level, not a `?? []` inline fallback: a stable reference so
// `conditions` below doesn't look like a fresh array every render to
// conditionsQueryMatches' own useMemo (the exact footgun SymptomTab.jsx's
// ALL_SYMPTOMS comment already documents for the same reason).
const EMPTY_CONDITIONS = []

// Ported from `$u` in gut-flora-atlas.readable.html (~line 16750-17219) -
// the root app shell: data loading, the nav drawer, header, and tab
// dispatch. Per PORTING_PLAN.md's porting order, "conditions" (Wm/Gm/Gfx),
// "glossary" (GFA_Glossary), both symptom-map tabs (GFA_SymptomTab), both
// brain-map tabs (GFA_BrainTab), and "compare" (jm) are now real; only
// index/research/sources/data remain placeholders (Xm/Zm/Km/Qm haven't
// been ported yet).
export default function App() {
  const { data, commit, saveFailed } = useConditionsData()
  const [activeTab, setActiveTab] = useState('conditions')
  const [activeConditionId, setActiveConditionId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [looseMatching, setLooseMatching] = useState(true)
  // Compare-two's picker state, ported from `h`/`L`/`y`/`C` inside `$u`.
  const [compareAId, setCompareAId] = useState(null)
  const [compareBId, setCompareBId] = useState(null)
  // Set by ConditionDetail's "Find taxa in papers" button (was `m` inside
  // $u); consumed once the Find-in-Papers tab (Zm) is ported.
  const [researchTargetId, setResearchTargetId] = useState(null)
  // New (no minified-source equivalent): ConditionsGrid's search box, lifted
  // up so its sibling ConditionsMap can highlight whatever's typed there -
  // see ConditionsMap.jsx's own focusNames effect.
  const [conditionsQuery, setConditionsQuery] = useState('')
  // New (no minified-source equivalent): a single click on a ConditionsGrid
  // card (as opposed to a double click, which still opens it) highlights
  // it here instead - see ConditionsGrid.jsx's own click/double-click
  // handling and the focusNames useMemo below for how this and the search
  // box above combine.
  const [clickedConditionName, setClickedConditionName] = useState(null)
  // Wraps ConditionsMap so a single-clicked condition card can scroll its
  // map into view - see the effect below.
  const conditionsMapRef = useRef(null)

  // Global study filters (Settings tab). Persisted so a chosen evidence
  // standard survives a reload - it is a stance about what you trust, not a
  // transient view toggle. Passed down to every map rather than held per-map,
  // so "human only" means human only everywhere.
  const [filters, setFilters] = useState(() => {
    try {
      const raw = localStorage.getItem('gfa_study_filters')
      return raw ? { ...DEFAULT_FILTERS, ...JSON.parse(raw) } : DEFAULT_FILTERS
    } catch {
      return DEFAULT_FILTERS
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('gfa_study_filters', JSON.stringify(filters))
    } catch {
      // private mode / quota - filters still work for this session
    }
  }, [filters])

  // New (no minified-source equivalent): GlobalSearch's own open/close
  // state, plus one "jump request" slot per destination tab that has its
  // own internal focus concept (Bacteria index, both symptom maps, both
  // brain maps). Each is a fresh object every time a result is chosen
  // (never reused/mutated), so the destination's own effect - keyed on
  // that object identity - always re-fires even for a repeat search of the
  // same thing. See GlobalSearch.jsx's header comment for the full picture.
  const [searchOpen, setSearchOpen] = useState(false)
  const [bacteriaFocusRequest, setBacteriaFocusRequest] = useState(null)
  const [symptomSelectionRequest, setSymptomSelectionRequest] = useState(null)
  const [brainRegionFocusRequest, setBrainRegionFocusRequest] = useState(null)

  const recentIds = useRecentConditions(activeConditionId)
  useSwipeGestures()

  // Cmd/Ctrl+K opens the search palette from anywhere in the app - the
  // header's search icon covers the same action for touch/no-keyboard use.
  useEffect(() => {
    const onKeyDown = (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
        ev.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const conditions = data?.conditions ?? EMPTY_CONDITIONS
  // Display-only view of the conditions, with study filters applied. Handed to
  // the read-only screens (card grid, sources list) so a filter set in Settings
  // is reflected everywhere, not just on the node maps. Editing paths keep the
  // raw `conditions` - a filter must never be able to delete data by hiding it.
  const shownConditions = useMemo(() => filterConditions(conditions, filters), [conditions, filters])
  const activeCondition = conditions.find((c) => c.id === activeConditionId) ?? null

  // Memoized so ConditionsMap's own focusNames effect only re-fires when
  // the query or the condition list actually changes, not on every
  // unrelated App re-render (a fresh array literal here every render
  // would otherwise look like "a new search" to that effect each time).
  // The search box wins over a single-clicked card when both are active
  // (typing is the more deliberate, more recent-feeling action) - falls
  // back to the click highlight only when the search box is empty.
  const conditionsQueryMatches = useMemo(() => {
    const q = conditionsQuery.trim().toLowerCase()
    if (q) return conditions.filter((c) => c.name.toLowerCase().includes(q)).map((c) => c.name)
    return clickedConditionName ? [clickedConditionName] : []
  }, [conditionsQuery, conditions, clickedConditionName])

  // Single-clicking a condition card hides the other cards and highlights
  // that condition down in the map below - but on a phone the map is well
  // past the fold, so the useful half of the interaction was invisible
  // until you scrolled. Bring it into view automatically. Same pattern as
  // BacteriaIndex.jsx's focusMapRef scroll.
  //
  // Only fires on SELECTING a condition, not on clearing: scrolling the
  // page on your way back to the full grid would fight the user.
  useEffect(() => {
    if (!clickedConditionName) return
    let cancelled = false
    // Two rAFs before measuring, deliberately. Selecting a condition also
    // collapses the grid above from ~41 cards down to 1, which changes the
    // page height dramatically. Measuring in the effect body races that
    // reflow: scrollIntoView resolves against a layout that is still
    // mid-collapse, so it lands somewhere arbitrary.
    //
    // That is why this appeared to work for some conditions and not others
    // - cards low in the list (ME/CFS, Menopause) were clicked from a
    // scrolled-down position where the miscalculation still happened to
    // leave the map on screen, while cards at the top (ADHD, Autism) were
    // clicked at scroll 0 where it did not.
    //
    // Measuring manually rather than via scrollIntoView because we want an
    // explicit window scroll to an absolute position, not "nearest
    // scrollable ancestor, best effort".
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return
        const el = conditionsMapRef.current
        if (!el) return
        const top = window.scrollY + el.getBoundingClientRect().top - 8
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
      })
    })
    return () => {
      cancelled = true
    }
  }, [clickedConditionName])

  // CRUD helpers, ported from D/M/Q/S/z inside $u (~line 16832-16861).
  const updateCondition = (id, patch) =>
    commit({ ...data, conditions: conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  const addCondition = (condition) => commit({ ...data, conditions: [...conditions, condition] })
  const deleteCondition = (id) => {
    commit({ ...data, conditions: conditions.filter((c) => c.id !== id) })
    setActiveConditionId(null)
    setActiveTab('conditions')
  }
  const upsertTaxon = (conditionId, taxon) => {
    const condition = conditions.find((c) => c.id === conditionId)
    const exists = condition.taxa.some((t) => t.id === taxon.id)
    updateCondition(conditionId, {
      taxa: exists ? condition.taxa.map((t) => (t.id === taxon.id ? taxon : t)) : [...condition.taxa, taxon],
    })
  }
  const removeTaxon = (conditionId, taxonId) => {
    const condition = conditions.find((c) => c.id === conditionId)
    updateCondition(conditionId, { taxa: condition.taxa.filter((t) => t.id !== taxonId) })
  }

  // Swipe-to-open/close drawer, ported from Be/re inside $u (~line
  // 16862-16880): swipe right starting near the left edge (or anywhere
  // while already open) opens/closes it.
  const touchStart = useRef({ x: 0, y: 0, live: false })
  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, live: t.clientX < 32 || drawerOpen }
  }
  const onTouchEnd = (e) => {
    if (!touchStart.current.live) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    if (Math.abs(t.clientY - touchStart.current.y) > 60) return
    if (dx > 55 && !drawerOpen) setDrawerOpen(true)
    if (dx < -55 && drawerOpen) setDrawerOpen(false)
    touchStart.current.live = false
  }

  const goToTab = (id) => {
    setActiveTab(id)
    setActiveConditionId(null)
    setDrawerOpen(false)
  }

  // GlobalSearch's single dispatch point: every result type lands on
  // whichever tab already knows how to focus one specific item, using that
  // tab's existing mechanism (see the state comment above).
  const handleSearchSelect = (result) => {
    setSearchOpen(false)
    if (result.type === 'condition') {
      setActiveTab('conditions')
      setActiveConditionId(result.id)
    } else if (result.type === 'bacteria') {
      setActiveTab('index')
      setBacteriaFocusRequest({ label: result.label, names: result.names })
    } else if (result.type === 'symptom') {
      setActiveTab('s2b')
      setSymptomSelectionRequest({ symptoms: [result.name] })
    } else if (result.type === 'brainRegion') {
      setActiveTab('brain')
      setBrainRegionFocusRequest({ name: result.name })
    }
  }

  if (!data) {
    return (
      <div
        className="flex items-center justify-center font-mono text-sm"
        style={{ background: theme.ink, color: theme.muted, minHeight: '100vh' }}
      >
        plating cultures…
      </div>
    )
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        background: theme.ink,
        color: theme.text,
        minHeight: '100vh',
        fontFamily: 'var(--body)',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <header
        className="sticky top-0 z-30 flex items-center gap-3 pb-3 safe-top safe-x"
        style={{ background: 'rgba(22,14,43,.92)', borderBottom: `1px solid ${theme.line}`, backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2"
          style={{ border: `1px solid ${theme.line}` }}
        >
          <Menu size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16, letterSpacing: '-.01em' }}>
            Gut Flora Atlas
          </div>
          <div
            className="font-mono truncate"
            style={{ fontSize: 10, color: theme.muted, letterSpacing: '.1em', textTransform: 'uppercase' }}
          >
            {activeCondition ? activeCondition.name : NAV_ITEMS.find((t) => t.id === activeTab)?.label}
          </div>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search everything"
          title="Search everything (Ctrl/Cmd+K)"
          className="rounded-lg p-2"
          style={{ border: `1px solid ${theme.line}`, color: theme.muted }}
        >
          <Search size={16} />
        </button>
        <button
          onClick={() => setLooseMatching((v) => !v)}
          title="Loose matching treats Prevotella, Prevotellaceae and Prevotella 9 as the same lineage."
          className="rounded-full px-3 py-1.5 font-mono"
          style={{
            fontSize: 10,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            border: `1px solid ${looseMatching ? theme.up : theme.line}`,
            color: looseMatching ? theme.up : theme.muted,
            background: looseMatching ? 'rgba(255,92,134,.08)' : 'transparent',
          }}
        >
          {looseMatching ? 'loose taxa' : 'exact taxa'}
        </button>
      </header>

      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        conditions={conditions}
        loose={looseMatching}
        onSelect={handleSearchSelect}
      />

      {saveFailed && (
        <div
          className="flex items-start gap-2 px-4 py-2.5"
          style={{ background: '#3A1220', borderBottom: '1px solid #7A2E45', color: '#FFC1CE', fontSize: 13 }}
        >
          <TriangleAlert size={15} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>Edits aren't saving to this device. Export a JSON backup from Backup before you close the tab.</span>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-40" style={{ background: 'rgba(8,4,20,.6)' }} onClick={() => setDrawerOpen(false)} />
      )}

      <nav
        className="fixed top-0 left-0 z-50 h-full w-72 flex flex-col dish safe-drawer"
        style={{
          background: theme.ink2,
          borderRight: `1px solid ${theme.line}`,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          visibility: drawerOpen ? 'visible' : 'hidden',
          transition: 'transform .24s cubic-bezier(.2,.8,.2,1), visibility .24s',
        }}
      >
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: `1px solid ${theme.line}` }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 19 }}>Gut Flora Atlas</div>
            <div className="font-mono" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.1em' }}>
              {conditions.length} CONDITIONS &middot; {conditions.reduce((n, c) => n + c.taxa.length, 0)} ENTRIES
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ color: theme.muted }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => goToTab(id)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm mb-1"
              style={{
                background: activeTab === id ? theme.ink3 : 'transparent',
                color: activeTab === id ? theme.text : theme.muted,
                border: `1px solid ${activeTab === id ? theme.line : 'transparent'}`,
              }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <div className="px-2 pb-2 mt-2 flex-1 overflow-y-auto">
          <div className="font-mono px-3 pb-2" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.12em' }}>
            JUMP TO
          </div>
          {(() => {
            const recent = recentIds.map((id) => conditions.find((c) => c.id === id)).filter(Boolean)
            const rest = conditions.filter((c) => !recentIds.includes(c.id)).sort((a, b) => a.name.localeCompare(b.name))
            return recent
              .concat(rest)
              .slice(0, 5)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveTab('conditions')
                    setActiveConditionId(c.id)
                    setDrawerOpen(false)
                  }}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm mb-0.5"
                  style={{ color: theme.text }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: c.color, flexShrink: 0 }} />
                  <span className="truncate">{c.name}</span>
                </button>
              ))
          })()}
        </div>

        <div className="px-4 py-3 font-mono" style={{ fontSize: 10, color: theme.muted, borderTop: `1px solid ${theme.line}` }}>
          Swipe from the left edge to reopen.
        </div>
      </nav>

      <main className="dish" style={{ minHeight: 'calc(100vh - 61px)' }}>
        {activeTab === 'conditions' && !activeCondition && (
          <>
            <ConditionsGrid
              conditions={shownConditions}
              onOpen={setActiveConditionId}
              onAdd={addCondition}
              onHighlight={setClickedConditionName}
              highlightedName={clickedConditionName}
              query={conditionsQuery}
              onQueryChange={(v) => {
                // Typing supersedes a prior single-click highlight - without
                // this, clearing the search box afterward would resurrect
                // whatever card was clicked before typing even started.
                setConditionsQuery(v)
                setClickedConditionName(null)
              }}
            />
            <div ref={conditionsMapRef}>
              <ConditionsMap conditions={conditions} focusNames={conditionsQueryMatches} filters={filters} />
            </div>
          </>
        )}
        {activeTab === 'conditions' && activeCondition && (
          <ConditionDetail
            filters={filters}
            condition={activeCondition}
            onBack={() => setActiveConditionId(null)}
            onUpdate={updateCondition}
            onUpsertTaxon={upsertTaxon}
            onRemoveTaxon={removeTaxon}
            onDelete={deleteCondition}
            onResearch={(id) => {
              setResearchTargetId(id)
              setActiveTab('research')
              setActiveConditionId(null)
            }}
            onCompare={(id) => {
              setCompareAId(id)
              setActiveTab('compare')
              setActiveConditionId(null)
            }}
          />
        )}
        {activeTab === 'crossfeed' && <CrossFeedingTab />}
        {activeTab === 'settings' && <SettingsTab filters={filters} setFilters={setFilters} />}
        {activeTab === 'glossary' && <Glossary />}
        {activeTab === 'b2s' && <SymptomTab pinType="bact" initialSelection={symptomSelectionRequest} filters={filters} onFiltersChange={setFilters} />}
        {activeTab === 's2b' && <SymptomTab pinType="symptom" initialSelection={symptomSelectionRequest} filters={filters} onFiltersChange={setFilters} />}
        {activeTab === 'brain' && <BrainTab pinType="cond" focusRegion={brainRegionFocusRequest} filters={filters} />}
        {activeTab === 'brain_r2c' && <BrainTab pinType="bact" />}
        {activeTab === 'hormones' && <HormoneTab />}
        {activeTab === 'compare' && (
          <CompareTab
            filters={filters}
            conditions={conditions}
            loose={looseMatching}
            aId={compareAId}
            bId={compareBId}
            setAId={setCompareAId}
            setBId={setCompareBId}
          />
        )}
        {activeTab === 'index' && (
          <BacteriaIndex filters={filters}
            conditions={conditions}
            loose={looseMatching}
            focusRequest={bacteriaFocusRequest}
            onOpen={(id) => {
              setActiveTab('conditions')
              setActiveConditionId(id)
            }}
          />
        )}
        {activeTab === 'sources' && <SourcesTab conditions={shownConditions} />}
        {activeTab === 'data' && <BackupTab data={data} commit={commit} />}
        {activeTab === 'research' && (
          <FindInPapersTab
            conditions={conditions}
            loose={looseMatching}
            targetId={researchTargetId || conditions[0]?.id}
            setTargetId={setResearchTargetId}
            onAddTaxon={upsertTaxon}
            onSaveQuery={(id, queryText) => updateCondition(id, { query: queryText })}
            onAttachLink={(condId, taxonId, newLinks) => {
              const taxon = conditions.find((c) => c.id === condId).taxa.find((t) => t.id === taxonId)
              upsertTaxon(condId, { ...taxon, links: [...(taxon.links || []), ...newLinks] })
            }}
          />
        )}
        {![
          'conditions',
          'glossary',
          'b2s',
          's2b',
          'brain',
          'brain_r2c',
          'compare',
          'index',
          'sources',
          'data',
          'research',
        ].includes(activeTab) && (
          <TabPlaceholder tab={activeTab} conditionCount={conditions.length} researchTargetId={researchTargetId} />
        )}
        {/* Only the Conditions tab has drilled-in state worth resetting on
            the way back up - clearing it from another tab would silently
            discard a selection you would expect to still be there when you
            return.

            Clears BOTH the click-highlight and the search box, because
            ConditionsGrid filters on both independently. Clearing only the
            highlight looked like a no-op whenever the condition had been
            reached by searching for it first - the query filter was still
            hiding every other card. */}
        <JumpToTop
          onJump={
            activeTab === 'conditions'
              ? () => {
                  setClickedConditionName(null)
                  setConditionsQuery('')
                }
              : undefined
          }
        />
      </main>
    </div>
  )
}

// Stand-in for the tab components not yet ported (Xm/Zm/Km/Qm), ported
// one at a time next per PORTING_PLAN.md.
function TabPlaceholder({ tab, conditionCount, researchTargetId }) {
  return (
    <div className="p-6 text-sm" style={{ color: theme.muted }}>
      <p>
        Tab: <span style={{ color: theme.text }}>{tab}</span>
      </p>
      <p className="mt-1">{conditionCount} conditions loaded from bundled seed_data.json.</p>
      {tab === 'research' && researchTargetId && (
        <p className="mt-1">
          researchTargetId wired correctly: <span style={{ color: theme.text }}>{researchTargetId}</span> (set by
          ConditionDetail's "Find taxa in papers" button - confirms the handoff works even before Zm is ported)
        </p>
      )}
      <p className="mt-4">Real tab content not ported yet — see PORTING_PLAN.md.</p>
    </div>
  )
}
