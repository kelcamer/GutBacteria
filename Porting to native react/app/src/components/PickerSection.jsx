import { useState } from 'react'
import { theme } from '../theme'

// One collapsible, searchable group of picker pills.
//
// The problem this solves: the map-builder picker rendered 94 pills in a
// single flat scroll - 53 symptoms, 41 conditions - which on a phone is a wall
// you swipe past rather than read. Nothing was findable, and the map you were
// trying to build sat below all of it.
//
// Three changes, in order of how much they help:
//   1. Collapsed by default, with a count in the header, so the whole picker
//      fits on one screen and you open only the group you want.
//   2. A filter box appears once a group has more than ~12 items, so you can
//      type "iron" instead of hunting.
//   3. Selected pills are hoisted to the front, so a chosen item never
//      scrolls out of sight behind the ones you did not pick.
//
// Kept as one component rather than inlined three times, because SymptomTab
// and CompareTab both need it and the previous duplication is exactly how the
// interventions section came to be missing from Compare for a whole session.
export function PickerSection({ label, items, isSelected, onToggle, colorFor, defaultOpen = false, accent }) {
  const [open, setOpen] = useState(defaultOpen)
  const [q, setQ] = useState('')

  const selectedCount = items.filter((it) => isSelected(it)).length
  const needle = q.trim().toLowerCase()
  const matched = needle ? items.filter((it) => it.label.toLowerCase().includes(needle)) : items
  // Selected first, so a pick never hides behind 40 unpicked pills.
  const ordered = [...matched].sort((a, b) => Number(isSelected(b)) - Number(isSelected(a)))

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{
          background: theme.ink2,
          border: `1px solid ${selectedCount ? accent || '#2DD4BF' : theme.line}`,
          touchAction: 'manipulation',
        }}
      >
        <span style={{ color: theme.muted, fontSize: 12, width: 12 }}>{open ? '▾' : '▸'}</span>
        <span className="font-mono" style={{ fontSize: 10.5, color: theme.muted, letterSpacing: '.1em' }}>
          {label}
        </span>
        <span style={{ color: theme.muted, fontSize: 11.5 }}>({items.length})</span>
        {selectedCount > 0 && (
          <span
            className="ml-auto rounded-full px-2 py-0.5"
            style={{ fontSize: 10.5, background: (accent || '#2DD4BF') + '33', color: accent || '#2DD4BF', fontWeight: 600 }}
          >
            {selectedCount} selected
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2">
          {items.length > 12 && (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Filter ${items.length} items…`}
              className="w-full rounded-lg px-3 py-2 mb-2 text-sm outline-none"
              style={{ background: theme.ink, color: theme.text, border: `1px solid ${theme.line}` }}
            />
          )}
          <div className="flex flex-wrap gap-1.5">
            {ordered.map((it) => {
              const on = isSelected(it)
              const c = colorFor ? colorFor(it) : accent || '#2DD4BF'
              return (
                <button
                  key={it.key}
                  onClick={() => onToggle(it)}
                  className="rounded-full px-3 py-1.5 text-sm"
                  style={{
                    background: on ? c + '33' : theme.ink2,
                    border: `1px solid ${on ? c : theme.line}`,
                    color: on ? theme.text : theme.muted,
                    minHeight: 34,
                    touchAction: 'manipulation',
                  }}
                >
                  {it.label}
                </button>
              )
            })}
            {ordered.length === 0 && (
              <span style={{ color: theme.muted, fontSize: 12.5 }}>Nothing matches “{q}”.</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
