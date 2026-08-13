import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, TriangleAlert, Link2, ArrowRight } from 'lucide-react'
import { theme } from '../theme'
import { groupBacteriaFromConditions } from '../lib/bacteriaGroups'
import { RankBadge } from './RankBadge'
import { Italic } from './Italic'
import { DirTriangle } from './DirTriangle'
import { BacteriumFocusMap } from './BacteriumFocusMap'

// Ported from `Xm` in gut-flora-atlas.readable.html (~line 29603-29804,
// 202 lines) - the A-Z bacteria index: every taxon across every condition,
// grouped by loose-matching (reusing `groupTaxa`/`Wf`, same as
// CompareTab), searchable, and filterable to "shared" (2+ conditions) or
// "split" (goes up in one condition, down in another). Icon mapping
// confirmed via the icon inventory: Wo=Search, za=X, ea=TriangleAlert
// (already used elsewhere as TriangleAlert), ha=Link2 (not plain Link -
// see LinksEditor.jsx's header comment for how that mix-up was caught).
const FILTERS = [
  ['all', 'Everything'],
  ['shared', 'In 2+ conditions'],
  ['split', 'Opposite directions'],
]

export function BacteriaIndex({ conditions, loose, onOpen, focusRequest }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  // New (no minified-source equivalent): clicking a bacterium's name below
  // jumps to a focused node map of everything it touches, at the bottom
  // of this same tab - see BacteriumFocusMap.jsx / bacteriumFocusMap.js.
  const [focusedGroup, setFocusedGroup] = useState(null)
  const focusMapRef = useRef(null)

  useEffect(() => {
    if (focusedGroup) focusMapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focusedGroup])

  // External jump-in, e.g. from GlobalSearch: a fresh {label, names} object
  // means "focus this bacterium" - applied here rather than read directly
  // in the click handler below so both entry points (a real click on a
  // card, and an outside search result) converge on the same state and
  // the same scroll-into-view effect above.
  useEffect(() => {
    if (focusRequest) setFocusedGroup(focusRequest)
  }, [focusRequest])

  const grouped = useMemo(() => groupBacteriaFromConditions(conditions, loose), [conditions, loose])

  const rows = grouped.filter((g) => {
    if (filter === 'split' && !g.split) return false
    if (filter === 'shared' && g.hits.length < 2) return false
    if (query.trim()) return g.names.join(' ').toLowerCase().includes(query.trim().toLowerCase())
    return true
  })

  // New: pressing Enter in the search box jumps straight to the first
  // filtered result's focus map, same destination a real click on its
  // name reaches - clicking still works exactly as before, this is
  // purely an additional path for anyone who'd rather type + Enter than
  // reach for the mouse once the list is narrowed to what they want.
  const onSearchKeyDown = (ev) => {
    if (ev.key === 'Enter' && rows.length) {
      ev.preventDefault()
      setFocusedGroup({ label: rows[0].label, names: rows[0].names })
    }
  }

  return (
    <div className="p-4 safe-bottom">
      <div className="flex flex-wrap gap-2 mb-4" style={{ maxWidth: 720 }}>
        <div
          className="flex items-center gap-2 rounded-xl px-3 flex-1"
          style={{ background: theme.ink2, border: `1px solid ${theme.line}`, minWidth: 200 }}
        >
          <Search size={15} style={{ color: theme.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Find a taxon, then press Enter to jump to it"
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            style={{ color: theme.text }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: theme.muted }}>
              <X size={14} />
            </button>
          )}
        </div>
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="rounded-xl px-3 py-2 text-sm"
            style={{
              background: filter === id ? theme.ink3 : 'transparent',
              border: `1px solid ${filter === id ? theme.line : 'transparent'}`,
              color: filter === id ? theme.text : theme.muted,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {filter === 'split' && (
        <p
          className="flex items-start gap-2 mb-4 rounded-xl p-3"
          style={{ background: theme.ink2, border: `1px solid ${theme.line}`, color: theme.muted, fontSize: 13, maxWidth: 680 }}
        >
          <TriangleAlert size={15} style={{ color: '#FFC857', flexShrink: 0, marginTop: 2 }} />
          These taxa go up in one condition and down in another — the places where a shared intervention would help
          one and hurt the other.
        </p>
      )}

      {rows.length === 0 && (
        <p className="py-10 text-center text-sm" style={{ color: theme.muted }}>
          No taxa match that. Try a shorter search.
        </p>
      )}

      {rows.length > 0 && (
        <p className="mb-3" style={{ color: theme.muted, fontSize: 12.5 }}>
          Feel free to click on a bacterium's name to see its node map!
        </p>
      )}

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        {rows.map((g) => (
          <div
            key={g.label}
            className="rounded-2xl p-3.5"
            style={{ background: theme.ink2, border: `1px solid ${g.split ? '#FFC85744' : theme.line}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <RankBadge name={g.label} />
              <button
                onClick={() => setFocusedGroup({ label: g.label, names: g.names })}
                className="truncate text-left"
                title={`See everything ${g.label} touches`}
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <Italic style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, textDecoration: 'underline', textDecorationColor: theme.line, textUnderlineOffset: 3 }}>
                  {g.label}
                </Italic>
              </button>
              <span className="font-mono ml-auto" style={{ fontSize: 10, color: theme.muted }}>
                {g.hits.length}×
              </span>
            </div>
            {g.names.length > 1 && (
              <p className="font-mono mb-2" style={{ fontSize: 10, color: theme.muted }}>
                grouped: {g.names.join(' · ')}
              </p>
            )}
            <div className="space-y-1">
              {[...g.up, ...g.down].map(({ c, t }) => {
                const hasLink = t.links?.length > 0
                const Tag = hasLink ? 'a' : 'div'
                const extra = hasLink
                  ? { href: t.links[0].url, target: '_blank', rel: 'noopener', title: `Open source for ${c.name}` }
                  : {
                      title: `No direct source link for this entry - click to open the ${c.name} condition instead`,
                      onClick: () => onOpen(c.id),
                      role: 'button',
                      tabIndex: 0,
                      onKeyDown: (ev) => {
                        if (ev.key === 'Enter' || ev.key === ' ') {
                          ev.preventDefault()
                          onOpen(c.id)
                        }
                      },
                    }
                return (
                  <Tag
                    key={c.id + t.id}
                    {...extra}
                    className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left no-underline"
                    style={{ background: theme.ink, cursor: 'pointer', color: 'inherit' }}
                  >
                    <DirTriangle dir={t.dir} size={11} />
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: c.color, flexShrink: 0 }} />
                    {/* Bug fix: t.refs can be a long descriptive string (e.g. "n=23
                        PCOS/24 non-PCOS controls...") rather than a short code - with
                        no min-w-0/flex-1 here, that long text (flex-shrink-0 below)
                        squeezed this name down to invisible instead of just truncating
                        the refs text itself. */}
                    <span className="text-sm truncate" style={{ flex: '1 1 auto', minWidth: 0 }}>
                      {c.name}
                    </span>
                    {hasLink ? (
                      <Link2 size={14} style={{ color: theme.muted, flexShrink: 0 }} />
                    ) : (
                      <ArrowRight size={12} style={{ color: theme.muted, flexShrink: 0 }} />
                    )}
                    {t.refs && (
                      <span
                        className="font-mono truncate"
                        title={t.refs}
                        style={{ fontSize: 10, color: theme.muted, flexShrink: 1, minWidth: 0, maxWidth: 130 }}
                      >
                        {t.refs}
                      </span>
                    )}
                  </Tag>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div ref={focusMapRef}>
        {focusedGroup && (
          <BacteriumFocusMap
            key={focusedGroup.label}
            label={focusedGroup.label}
            names={focusedGroup.names}
            onClose={() => setFocusedGroup(null)}
          />
        )}
      </div>
    </div>
  )
}
