import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { theme, dirColor, dirArrow } from '../theme'
import { Italic } from './Italic'

// Ported from `Km` in gut-flora-atlas.readable.html (~line 29806-29954,
// 149 lines) - every attached link across every condition (both a
// condition's own note-panel links and its individual taxa's links),
// deduplicated by URL, sorted by use count, filterable to one condition,
// and downloadable as a plain-text list. Icon mapping confirmed: zo =
// ExternalLink.
export function SourcesTab({ conditions }) {
  const flat = []
  conditions.forEach((c) => {
    ;(c.links || []).forEach((l) => flat.push({ c, l, taxon: null }))
    c.taxa.forEach((t) => (t.links || []).forEach((l) => flat.push({ c, l, taxon: t })))
  })

  const byUrl = new Map()
  flat.forEach(({ c, l, taxon }) => {
    if (!byUrl.has(l.url)) byUrl.set(l.url, { url: l.url, label: l.label, uses: [] })
    byUrl.get(l.url).uses.push({ c, taxon })
  })
  const sources = [...byUrl.values()].sort((x, y) => y.uses.length - x.uses.length)

  const [selCond, setSelCond] = useState('')
  const filtered = selCond ? sources.filter((s) => s.uses.some((u) => u.c.id === selCond)) : sources
  // New (no minified-source equivalent): filtering to one condition shows
  // that condition's own note at the top - it's already this app's
  // synthesized summary of what the combined research says, written once
  // per condition rather than re-derived here from the raw taxa list.
  const selectedCondition = selCond ? conditions.find((c) => c.id === selCond) : null

  const downloadSources = () => {
    const lines = filtered.map((s) => s.label + '\n' + s.url).join('\n\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const dlUrl = URL.createObjectURL(blob)
    const dlA = document.createElement('a')
    const condAbbr = selCond ? ((conditions.find((c) => c.id === selCond) || {}).abbr || 'filtered') : 'all'
    dlA.href = dlUrl
    dlA.download = `gut-flora-atlas-sources-${condAbbr}.txt`
    dlA.click()
    URL.revokeObjectURL(dlUrl)
  }

  return (
    <div className="p-4 safe-bottom" style={{ maxWidth: 780 }}>
      <p className="mb-4" style={{ color: theme.muted, fontSize: 13 }}>
        Every paper you've attached, and where it's cited. Add links from a condition's note panel or from any
        individual entry.
      </p>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={selCond}
          onChange={(ev) => setSelCond(ev.target.value)}
          className="rounded-xl px-3 py-2 text-sm outline-none"
          style={{ background: theme.ink2, color: theme.text, border: `1px solid ${theme.line}` }}
        >
          <option value="">All conditions</option>
          {[...conditions]
            .sort((cA, cB) => cA.name.localeCompare(cB.name))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <button
          onClick={downloadSources}
          className="rounded-xl px-3 py-2 text-sm"
          style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.text }}
        >
          ⬇️ Download all PMIDs ({filtered.length})
        </button>
      </div>

      {selectedCondition && selectedCondition.note && (
        <div
          className="mb-4 rounded-2xl p-4"
          style={{ background: theme.ink2, border: `1px solid ${selectedCondition.color}55` }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span style={{ width: 8, height: 8, borderRadius: 99, background: selectedCondition.color }} />
            <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14 }}>
              What the combined research says about {selectedCondition.name}
            </span>
          </div>
          <p style={{ color: theme.muted, fontSize: 13 }}>{selectedCondition.note}</p>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm" style={{ color: theme.muted }}>
          No papers attached yet for this condition.
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((s) => (
          <div key={s.url} className="rounded-2xl p-4" style={{ background: theme.ink2, border: `1px solid ${theme.line}` }}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 hover:underline mb-2"
              style={{ color: theme.text }}
            >
              <ExternalLink size={15} style={{ color: theme.muted, flexShrink: 0, marginTop: 3 }} />
              <span style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15 }}>{s.label}</span>
            </a>
            <p className="font-mono mb-3 truncate" style={{ fontSize: 10, color: theme.muted }}>
              {s.url}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {s.uses.map(({ c, taxon }, n) => (
                <span
                  key={n}
                  className="rounded-full px-2.5 py-1 text-xs flex items-center gap-1.5"
                  style={{ background: theme.ink, border: `1px solid ${c.color}44` }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: c.color }} />
                  {c.abbr}
                  {taxon && (
                    <>
                      {' '}
                      · <Italic>{taxon.name}</Italic>{' '}
                      <span style={{ color: dirColor(taxon.dir), fontWeight: 700 }} title={`${taxon.name} ${taxon.dir === 'up' ? 'increased' : taxon.dir === 'down' ? 'decreased' : 'mixed/both directions'} per this source`}>
                        {dirArrow(taxon.dir)}
                      </span>
                    </>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
