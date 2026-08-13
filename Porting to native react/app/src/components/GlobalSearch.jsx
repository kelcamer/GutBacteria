import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, CornerDownLeft } from 'lucide-react'
import { theme } from '../theme'
import { symptomData } from '../data'
import { BRAIN_DATA } from '../data/brainData'
import { groupBacteriaFromConditions } from '../lib/bacteriaGroups'

// New (no minified-source equivalent). A single "find anything" palette
// (Cmd/Ctrl+K, or the search icon in the header for touch) over all four
// of this app's real entities - Conditions, Bacteria, Symptoms, and Brain
// regions - each normally only searchable from inside its own tab. Picking
// a result doesn't just switch tabs; it hands off to whatever mechanism
// that destination tab already has for "focus on one specific thing":
// ConditionDetail's onOpen, BacteriaIndex's focusRequest (which drives the
// same BacteriumFocusMap a real card click does), SymptomTab's
// initialSelection (the same map-builder picker state a real pill click
// drives), and BrainTab's focusRegion (buildMap's selectByNames, added
// alongside this feature). Every destination re-uses an existing, already
// -verified path rather than inventing a second way to "open" the same
// thing - see each prop's own call site for the specific wiring.
//
// Limited to REGULAR at most (no financial/irreversible/etc. rule
// applies) - a client-side view-only jump between tabs, nothing sent
// anywhere and nothing persisted.
const MAX_PER_GROUP = 6

function uniqueBrainRegionNames() {
  const seen = new Set()
  BRAIN_DATA.forEach((c) => (c.taxa || []).forEach((t) => {
    const n = (t?.name || '').trim()
    if (n) seen.add(n)
  }))
  return [...seen].sort((a, b) => a.localeCompare(b))
}

export function GlobalSearch({ open, onClose, conditions, loose, onSelect }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      // Focus needs to wait one tick for the input to actually be in the
      // DOM (this effect fires the same commit the modal itself mounts).
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  const bacteriaGroups = useMemo(() => groupBacteriaFromConditions(conditions, loose), [conditions, loose])
  const symptomNames = useMemo(() => [...(symptomData.symptoms || [])].sort((a, b) => a.localeCompare(b)), [])
  const brainRegionNames = useMemo(uniqueBrainRegionNames, [])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const matches = (s) => s.toLowerCase().includes(q)

    const condResults = conditions
      .filter((c) => matches(c.name))
      .slice(0, MAX_PER_GROUP)
      .map((c) => ({ type: 'condition', key: 'c' + c.id, id: c.id, name: c.name, color: c.color }))

    const bactResults = bacteriaGroups
      .filter((g) => matches(g.label) || g.names.some(matches))
      .slice(0, MAX_PER_GROUP)
      .map((g) => ({ type: 'bacteria', key: 'b' + g.label, label: g.label, names: g.names, hitCount: g.hits.length }))

    const symResults = symptomNames
      .filter(matches)
      .slice(0, MAX_PER_GROUP)
      .map((s) => ({ type: 'symptom', key: 's' + s, name: s }))

    const brainResults = brainRegionNames
      .filter(matches)
      .slice(0, MAX_PER_GROUP)
      .map((r) => ({ type: 'brainRegion', key: 'r' + r, name: r }))

    return [
      { label: 'Conditions', items: condResults },
      { label: 'Bacteria', items: bactResults },
      { label: 'Symptoms', items: symResults },
      { label: 'Brain regions', items: brainResults },
    ].filter((g) => g.items.length > 0)
  }, [query, conditions, bacteriaGroups, symptomNames, brainRegionNames])

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])

  useEffect(() => {
    if (activeIndex >= flat.length) setActiveIndex(Math.max(0, flat.length - 1))
  }, [flat.length, activeIndex])

  const choose = (result) => {
    if (!result) return
    onSelect(result)
  }

  // Window-level (not just the input's own onKeyDown), matching
  // Modal.jsx's own Escape handling - keeps Escape/arrows/Enter working
  // even after a mouse click moves focus off the text input.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        onClose()
      } else if (ev.key === 'ArrowDown') {
        ev.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, flat.length - 1))
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (ev.key === 'Enter') {
        ev.preventDefault()
        choose(flat[activeIndex])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose/choose are stable enough per render; only re-bind when what Enter/arrows should act on changes
  }, [open, flat, activeIndex, onClose])

  if (!open) return null

  let runningIndex = -1

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4"
      style={{ background: 'rgba(8,4,20,.7)', paddingTop: '10vh' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-2xl overflow-hidden"
        style={{ maxWidth: 560, background: theme.ink2, border: `1px solid ${theme.line}`, boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}
      >
        <div className="flex items-center gap-2 px-4" style={{ borderBottom: `1px solid ${theme.line}` }}>
          <Search size={16} style={{ color: theme.muted, flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a condition, bacterium, symptom, or brain region…"
            className="flex-1 bg-transparent py-3.5 text-sm outline-none"
            style={{ color: theme.text }}
          />
          <button onClick={onClose} aria-label="Close search" style={{ color: theme.muted, flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          {!query.trim() && (
            <p className="px-4 py-8 text-center text-sm" style={{ color: theme.muted }}>
              Start typing to search across everything in the app.
            </p>
          )}
          {query.trim() && groups.length === 0 && (
            <p className="px-4 py-8 text-center text-sm" style={{ color: theme.muted }}>
              Nothing matches "{query.trim()}".
            </p>
          )}
          {groups.map((g) => (
            <div key={g.label} className="py-1.5">
              <div className="font-mono px-4 pb-1" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.12em' }}>
                {g.label.toUpperCase()}
              </div>
              {g.items.map((item) => {
                runningIndex++
                const isActive = runningIndex === activeIndex
                return (
                  <ResultRow
                    key={item.key}
                    item={item}
                    active={isActive}
                    onMouseEnter={() => setActiveIndex(runningIndex)}
                    onClick={() => choose(item)}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {flat.length > 0 && (
          <div
            className="flex items-center gap-1.5 px-4 py-2 font-mono"
            style={{ borderTop: `1px solid ${theme.line}`, fontSize: 10, color: theme.muted, letterSpacing: '.08em' }}
          >
            <CornerDownLeft size={11} /> to jump &middot; ESC to close
          </div>
        )}
      </div>
    </div>
  )
}

function ResultRow({ item, active, onMouseEnter, onClick }) {
  const rowStyle = {
    background: active ? theme.ink3 : 'transparent',
  }
  return (
    <button
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm"
      style={rowStyle}
    >
      {item.type === 'condition' && (
        <>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: item.color, flexShrink: 0 }} />
          <span className="truncate" style={{ color: theme.text }}>{item.name}</span>
        </>
      )}
      {item.type === 'bacteria' && (
        <>
          <span className="truncate" style={{ color: theme.text, fontStyle: 'italic' }}>{item.label}</span>
          <span className="font-mono ml-auto flex-shrink-0" style={{ fontSize: 10, color: theme.muted }}>
            {item.hitCount}×
          </span>
        </>
      )}
      {item.type === 'symptom' && <span className="truncate" style={{ color: theme.text }}>{item.name}</span>}
      {item.type === 'brainRegion' && <span className="truncate" style={{ color: theme.text }}>{item.name}</span>}
    </button>
  )
}
