import { useRef, useState } from 'react'
import { ChevronRight, Plus, Search, X } from 'lucide-react'
import { theme, palette } from '../theme'
import { makeId } from '../lib/id'
import { Button } from './Button'
import { Field } from './Field'
import { Modal } from './Modal'
import { Italic } from './Italic'

// One click vs. two, disambiguated with a plain setTimeout debounce
// rather than the browser's native dblclick event - the same reasoning
// buildSymptomMap.js/buildMap.js's own node click handling already
// documents (native dblclick's target-matching is unreliable enough on
// small/fast targets that this app avoids it everywhere). Keyed per
// condition id in a plain object (not one shared timer) so quickly
// clicking two DIFFERENT cards in a row can't be misread as a double-
// click on either one.
const DBLCLICK_WINDOW = 280

// Ported verbatim from `Wm` in gut-flora-atlas.readable.html (~line
// 28344-28515). `Eo`=ChevronRight, `at`=Plus (confirmed in the icon
// inventory), `zf`=palette (theme.js), `$`=makeId. Two deliberate
// deviations from the original, both requested UX changes applied
// consistently across the app rather than introduced unasked: the grid
// is alphabetized by name (the original rendered `conditions` in storage
// order), and a search box was added above it (matching the filter
// pattern BacteriaIndex.jsx already uses) - with 40 conditions and
// growing, plain scrolling stopped being enough.
// `query`/`onQueryChange` are controlled from App.jsx (not local state)
// so ConditionsMap.jsx, rendered as this grid's sibling, can highlight
// whatever's currently typed here - see App.jsx's own state comment.
export function ConditionsGrid({ conditions, onOpen, onAdd, onHighlight, highlightedName, query, onQueryChange }) {
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [color, setColor] = useState(palette[6])
  const clickTimers = useRef({})

  // Single click -> highlight this condition (and its connections) in
  // ConditionsMap below, without leaving this screen - and, per explicit
  // request, hide every OTHER card so the highlighted map is easy to see
  // without scrolling past a full grid first (see the render below,
  // filtered on highlightedName). Clicking the ALREADY-highlighted card
  // again toggles it back off - the map's own background click does the
  // same thing (App.jsx wires both to the same clearConditionHighlight),
  // this is just a second, more-discoverable way to reach it without
  // scrolling down to the map first. Double click (a second click on the
  // SAME card within DBLCLICK_WINDOW) -> open it, the original behavior.
  const handleCardClick = (c) => {
    const timers = clickTimers.current
    if (timers[c.id]) {
      clearTimeout(timers[c.id])
      delete timers[c.id]
      onOpen(c.id)
    } else {
      timers[c.id] = setTimeout(() => {
        delete timers[c.id]
        onHighlight?.(c.name === highlightedName ? null : c.name)
      }, DBLCLICK_WINDOW)
    }
  }

  const addCondition = () => {
    if (!name.trim()) return
    onAdd({
      id: makeId(),
      name: name.trim(),
      abbr: (code.trim() || name.trim().slice(0, 4)).toUpperCase(),
      color,
      note: '',
      links: [],
      taxa: [],
    })
    setName('')
    setCode('')
    setAddOpen(false)
  }

  return (
    <div className="p-4 safe-bottom">
      <p className="mb-4" style={{ color: theme.muted, fontSize: 13, maxWidth: 620 }}>
        Every condition holds a list of taxa marked increased or decreased. Tap one to edit it, or head to Compare
        to lay two side by side. Click once on a card to highlight it in the bacteria map below; click twice to
        open it.
      </p>

      <div
        className="flex items-center gap-2 rounded-xl px-3 mb-4"
        style={{ background: theme.ink2, border: `1px solid ${theme.line}`, maxWidth: 360 }}
      >
        <Search size={15} style={{ color: theme.muted, flexShrink: 0 }} />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Find a condition"
          className="flex-1 bg-transparent py-2.5 text-sm outline-none"
          style={{ color: theme.text }}
        />
        {query && (
          <button onClick={() => onQueryChange('')} style={{ color: theme.muted, flexShrink: 0 }} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

      {query.trim() &&
        conditions.filter(
          (c) => c.name.toLowerCase().includes(query.trim().toLowerCase()) || c.abbr.toLowerCase().includes(query.trim().toLowerCase())
        ).length === 0 && (
          <p className="py-6 text-center text-sm" style={{ color: theme.muted }}>
            No conditions match that. Try a shorter search.
          </p>
        )}

      {highlightedName && (
        <p className="mb-3" style={{ color: theme.muted, fontSize: 12.5 }}>
          Showing just <Italic>{highlightedName}</Italic> — click it again, or click the map's background below, to
          bring the rest back.
        </p>
      )}

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
        {[...conditions]
          .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()) || c.abbr.toLowerCase().includes(query.trim().toLowerCase()))
          .filter((c) => !highlightedName || c.name === highlightedName)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c) => {
          const up = c.taxa.filter((t) => t.dir === 'up').length
          const down = c.taxa.length - up
          return (
            <button
              key={c.id}
              onClick={() => handleCardClick(c)}
              className="text-left rounded-2xl p-4 transition-transform"
              style={{ background: theme.ink2, border: `1px solid ${theme.line}`, borderTop: `3px solid ${c.color}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, lineHeight: 1.15 }}>
                  {c.name}
                </div>
                <span className="font-mono" style={{ fontSize: 10, color: c.color, letterSpacing: '.08em' }}>
                  {c.abbr}
                </span>
              </div>
              <div className="flex mt-3 rounded-full overflow-hidden" style={{ height: 6, background: theme.ink3 }}>
                <div style={{ width: `${(up / Math.max(c.taxa.length, 1)) * 100}%`, background: theme.up }} />
                <div style={{ width: `${(down / Math.max(c.taxa.length, 1)) * 100}%`, background: theme.down }} />
              </div>
              <div className="flex items-center gap-4 mt-2.5 font-mono" style={{ fontSize: 11 }}>
                <span style={{ color: theme.up }}>▲ {up} up</span>
                <span style={{ color: theme.down }}>▼ {down} down</span>
                <ChevronRight size={14} style={{ color: theme.muted, marginLeft: 'auto' }} />
              </div>
            </button>
          )
        })}

        {!highlightedName && (
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2"
            style={{ border: `1px dashed ${theme.line}`, color: theme.muted, minHeight: 128 }}
          >
            <Plus size={20} />
            <span className="text-sm">Add a condition</span>
          </button>
        )}
      </div>

      {addOpen && (
        <Modal title="Add a condition" onClose={() => setAddOpen(false)}>
          <div className="space-y-3">
            <Field label="Name" value={name} onChange={setName} placeholder="e.g. Vestibular migraine" />
            <Field label="Short code" value={code} onChange={setCode} placeholder="VM" mono />
            <div>
              <span className="font-mono block mb-2" style={{ fontSize: 10, letterSpacing: '.12em', color: theme.muted }}>
                COLOR
              </span>
              <div className="flex flex-wrap gap-2">
                {palette.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: c,
                      outline: color === c ? `2px solid ${theme.text}` : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button tone="solid" onClick={addCondition}>
                Add condition
              </Button>
              <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
