import { useState } from 'react'
import { theme } from '../theme'
import hormoneData from '../../../../hormone_interactions.json'

// The host-hormone <-> bacteria layer. Neither seed_data.json (condition ->
// taxon) nor cross_feeding.json (bacterium -> bacterium) captures that some
// bacteria USE host sex steroids as growth factors or CATABOLIZE them - a
// genuinely bidirectional relationship. Data lives in hormone_interactions.json;
// this is a filterable card list (no graph - the network is tiny and the
// direction split reads better as labelled cards).

const DIR_META = {
  'hormone->bacterium': ['hormone → bacterium', '#C9A7FF', '#3A2E4F'],
  'bacterium->hormone': ['bacterium → hormone', '#7FE0C0', '#213E38'],
}

function DirBadge({ direction }) {
  const [label, color, bg] = DIR_META[direction] || [direction, theme.muted, 'transparent']
  return (
    <span
      className="rounded-full"
      style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', color, background: bg, whiteSpace: 'nowrap' }}
    >
      {label}
    </span>
  )
}

function Card({ x }) {
  return (
    <div style={{ border: `1px solid ${theme.line}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
      {x.tldr && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: theme.text,
            background: theme.ink3,
            border: `1px solid ${theme.line}`,
            borderRadius: 10,
            padding: '8px 12px',
            marginBottom: 10,
            lineHeight: 1.45,
          }}
        >
          {x.tldr}
        </div>
      )}
      <div className="flex items-center flex-wrap gap-2" style={{ marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16, color: theme.text }}>
          {x.taxon}
        </span>
        <span style={{ color: theme.muted, fontSize: 13 }}>
          {'× ' + (x.hormones || []).join(' / ')}
        </span>
        <DirBadge direction={x.direction} />
      </div>
      <div style={{ color: theme.muted, fontSize: 12, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: theme.text }}>{x.mechanism}</span>
        {` · ${x.site} · ${x.evidence}`}
      </div>
      <div style={{ color: theme.text, fontSize: 13, marginBottom: 6, lineHeight: 1.5 }}>{x.effect}</div>
      <div style={{ color: theme.muted, fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>{x.note}</div>
      <a
        href={x.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#4FC3F7', fontSize: 12, textDecoration: 'none' }}
      >
        {x.ref}
      </a>
    </div>
  )
}

export function HormoneTab() {
  const data = hormoneData?.interactions || []
  const [filter, setFilter] = useState('all')
  const shown = data.filter((x) => filter === 'all' || x.direction === filter)

  const seg = (id, label) => (
    <button
      key={id}
      onClick={() => setFilter(id)}
      className="rounded-lg px-3 py-1.5 text-sm"
      style={{
        background: filter === id ? theme.ink3 : 'transparent',
        border: `1px solid ${filter === id ? theme.line : 'transparent'}`,
        color: filter === id ? theme.text : theme.muted,
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="px-4 pb-10" style={{ borderTop: `1px solid ${theme.line}`, marginTop: 8, paddingTop: 18 }}>
      <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20 }}>Hormonal Interactions</h2>
      <p className="mb-3" style={{ color: theme.muted, fontSize: 13, maxWidth: 680, lineHeight: 1.55 }}>
        Bidirectional cross-talk between host sex hormones (estradiol, progesterone) and bacteria — the
        microbiota both RESPONDS to host hormone levels and EDITS them. Some bacteria (Prevotella intermedia)
        even substitute sex steroids for vitamin K as a growth factor. Most Prevotella–hormone evidence is
        in-vitro and oral, so read this as a mechanistic map, not proof it dominates in vivo.{' '}
        {shown.length} of {data.length} interactions.
      </p>
      <div className="flex flex-wrap gap-1 mb-4">
        {seg('all', 'All')}
        {seg('hormone->bacterium', 'Hormone → bacterium')}
        {seg('bacterium->hormone', 'Bacterium → hormone')}
      </div>
      <div>
        {shown.map((x) => (
          <Card key={x.id} x={x} />
        ))}
      </div>
    </div>
  )
}
