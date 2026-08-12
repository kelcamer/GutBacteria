import { useMemo, useState } from 'react'
import { Search, X, TriangleAlert, Link2 } from 'lucide-react'
import { theme } from '../theme'
import { groupTaxa } from '../lib/looseMatch'
import { RankBadge } from './RankBadge'
import { Italic } from './Italic'
import { DirTriangle } from './DirTriangle'

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

export function BacteriaIndex({ conditions, loose, onOpen }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const grouped = useMemo(() => {
    const pairs = []
    conditions.forEach((c) => c.taxa.forEach((t) => pairs.push({ c, t })))
    return groupTaxa(
      pairs.map((p) => p.t.name),
      loose
    )
      .map((g) => {
        const hits = pairs.filter((p) => g.names.includes(p.t.name))
        const up = hits.filter((p) => p.t.dir === 'up')
        const down = hits.filter((p) => p.t.dir === 'down')
        return { label: g.label, names: g.names, hits, up, down, split: up.length > 0 && down.length > 0 }
      })
      .sort((x, y) => y.hits.length - x.hits.length || x.label.localeCompare(y.label))
  }, [conditions, loose])

  const rows = grouped.filter((g) => {
    if (filter === 'split' && !g.split) return false
    if (filter === 'shared' && g.hits.length < 2) return false
    if (query.trim()) return g.names.join(' ').toLowerCase().includes(query.trim().toLowerCase())
    return true
  })

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
            placeholder="Find a taxon"
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

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        {rows.map((g) => (
          <div
            key={g.label}
            className="rounded-2xl p-3.5"
            style={{ background: theme.ink2, border: `1px solid ${g.split ? '#FFC85744' : theme.line}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <RankBadge name={g.label} />
              <Italic className="truncate" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>
                {g.label}
              </Italic>
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
                  ? { href: t.links[0].url, target: '_blank', rel: 'noopener', title: 'Open source' }
                  : {
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
                    <span className="text-sm truncate">{c.name}</span>
                    {hasLink && <Link2 size={14} style={{ color: theme.muted, flexShrink: 0 }} />}
                    <span className="font-mono ml-auto flex-shrink-0" style={{ fontSize: 10, color: theme.muted }}>
                      {t.refs}
                    </span>
                  </Tag>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
