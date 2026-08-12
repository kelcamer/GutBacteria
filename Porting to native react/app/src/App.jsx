import { useRef, useState } from 'react'
import { Menu, X, TriangleAlert } from 'lucide-react'
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
import { BacteriaIndex } from './components/BacteriaIndex'
import { SourcesTab } from './components/SourcesTab'
import { BackupTab } from './components/BackupTab'
import { FindInPapersTab } from './components/FindInPapersTab'

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

  const recentIds = useRecentConditions(activeConditionId)
  useSwipeGestures()

  const conditions = data?.conditions ?? []
  const activeCondition = conditions.find((c) => c.id === activeConditionId) ?? null

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
            const rest = conditions.filter((c) => !recentIds.includes(c.id))
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
            <ConditionsGrid conditions={conditions} onOpen={setActiveConditionId} onAdd={addCondition} />
            <ConditionsMap conditions={conditions} />
          </>
        )}
        {activeTab === 'conditions' && activeCondition && (
          <ConditionDetail
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
          />
        )}
        {activeTab === 'glossary' && <Glossary />}
        {activeTab === 'b2s' && <SymptomTab pinType="bact" />}
        {activeTab === 's2b' && <SymptomTab pinType="symptom" />}
        {activeTab === 'brain' && <BrainTab pinType="cond" />}
        {activeTab === 'brain_r2c' && <BrainTab pinType="bact" />}
        {activeTab === 'compare' && (
          <CompareTab
            conditions={conditions}
            loose={looseMatching}
            aId={compareAId}
            bId={compareBId}
            setAId={setCompareAId}
            setBId={setCompareBId}
          />
        )}
        {activeTab === 'index' && (
          <BacteriaIndex
            conditions={conditions}
            loose={looseMatching}
            onOpen={(id) => {
              setActiveTab('conditions')
              setActiveConditionId(id)
            }}
          />
        )}
        {activeTab === 'sources' && <SourcesTab conditions={conditions} />}
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
