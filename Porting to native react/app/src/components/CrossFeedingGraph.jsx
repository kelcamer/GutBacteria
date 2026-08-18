import { useMemo, useState } from 'react'
import { theme } from '../theme'

// A purpose-built SVG for the cross-feeding network.
//
// Deliberately NOT buildSymptomMap/buildMap. Those are ~1000 lines each of
// force simulation and pointer handling, and they are the source of most of
// this project's bugs. This network is a handful of directed edges with a
// natural left-to-right reading (feeder -> fed), which a force layout would
// actively obscure by scattering it into a ring. A deterministic bipartite
// layout is both simpler and more legible here.
//
// Direction matters and is drawn: cross-feeding is one-way. An undirected
// line would imply a mutual relationship that does not exist.
const EV_COLOR = {
  'in-vitro-coculture': '#4FC3F7',
  'in-vitro-community': '#A78BFA',
  animal: '#FFC857',
  human: '#2DD4BF',
  inferred: '#A08FC7',
}

const ROW = 96
const PAD = 60

// Label geometry. The left column's labels are right-anchored and grow LEFTWARD
// from the node, so a long one runs past x=0 and is clipped by the viewBox -
// reported as "the F in Faecalibacterium is hidden". The gutter is therefore
// measured from the longest name actually being drawn rather than assumed.
const LABEL_SIZE = 11.5
const LABEL_GAP = 16       // node centre to first glyph
const MAX_LABEL_CHARS = 26 // names longer than this are truncated below
// Italic sans at 11.5px averages ~0.52em per character across these names.
// Rounded up deliberately: a slightly wide gutter costs whitespace, a narrow
// one costs a letter.
const CHAR_W = 0.56 * LABEL_SIZE
const labelWidth = (name) => Math.min(name.length, MAX_LABEL_CHARS + 1) * CHAR_W

export function CrossFeedingGraph({ edges, onSelect, selectedId }) {
  const [hover, setHover] = useState(null)

  const layout = useMemo(() => {
    // Sources on the left, targets on the right. A node that is only ever a
    // source sits left; only ever a target sits right. Nothing here is both
    // yet - if that changes, a middle column is the natural extension.
    const sources = [], targets = []
    edges.forEach((e) => {
      if (!sources.includes(e.from)) sources.push(e.from)
    })
    edges.forEach((e) => {
      if (!targets.includes(e.to) && !sources.includes(e.to)) targets.push(e.to)
    })
    const rows = Math.max(sources.length, targets.length)
    const H = Math.max(280, rows * ROW + PAD * 2)
    const pos = {}
    // Each side gets exactly the gutter its longest label needs, and the canvas
    // widens to keep the columns the same distance apart however long the names
    // are - so nothing is ever clipped and the edges never get shorter.
    const leftGutter = Math.max(...sources.map(labelWidth), 0) + LABEL_GAP + 12
    const rightGutter = Math.max(...targets.map(labelWidth), 0) + LABEL_GAP + 12
    const leftX = Math.max(150, leftGutter)
    const W = leftX + 520 + rightGutter
    // Sources centred vertically against the taller column so a single hub
    // (Bifidobacterium feeds four things) sits level with its fan-out.
    sources.forEach((n, i) => {
      const span = (H - PAD * 2) / Math.max(1, sources.length)
      pos[n] = { x: leftX, y: PAD + span * (i + 0.5), side: 'L' }
    })
    targets.forEach((n, i) => {
      const span = (H - PAD * 2) / Math.max(1, targets.length)
      pos[n] = { x: W - rightGutter, y: PAD + span * (i + 0.5), side: 'R' }
    })
    return { pos, H, W }
  }, [edges])

  const { pos, H, W } = layout

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        {Object.entries(EV_COLOR).map(([k, c]) => (
          <marker
            key={k}
            id={`cf-arrow-${k}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
          </marker>
        ))}
      </defs>

      {edges.map((e) => {
        const a = pos[e.from]
        const b = pos[e.to]
        if (!a || !b) return null
        const c = EV_COLOR[e.evidence] || theme.muted
        const mx = (a.x + b.x) / 2
        const active = hover === e.id || selectedId === e.id
        const dim = (hover || selectedId) && !active
        return (
          <g
            key={e.id}
            style={{ cursor: 'pointer' }}
            opacity={dim ? 0.18 : 1}
            onMouseEnter={() => setHover(e.id)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onSelect?.(selectedId === e.id ? null : e.id)}
          >
            <path
              d={`M ${a.x + 12} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x - 16} ${b.y}`}
              fill="none"
              stroke={c}
              strokeWidth={active ? 3 : 1.8}
              strokeOpacity={active ? 1 : 0.75}
              markerEnd={`url(#cf-arrow-${e.evidence})`}
            />
            <text
              x={mx}
              y={(a.y + b.y) / 2 - 6}
              textAnchor="middle"
              style={{ fontSize: 9.5, fill: c, opacity: active ? 1 : 0.75 }}
            >
              {e.product}
            </text>
            {/* Fat invisible hit area - the stroke itself is too thin to tap */}
            <path
              d={`M ${a.x + 12} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x - 16} ${b.y}`}
              fill="none"
              stroke="transparent"
              strokeWidth={18}
              style={{ touchAction: 'manipulation' }}
            />
          </g>
        )
      })}

      {Object.entries(pos).map(([name, p]) => (
        <g key={name}>
          <circle cx={p.x} cy={p.y} r={9} fill={p.side === 'L' ? '#2DD4BF' : '#A78BFA'} fillOpacity={0.9} />
          <text
            x={p.side === 'L' ? p.x - LABEL_GAP : p.x + LABEL_GAP}
            y={p.y + 4}
            textAnchor={p.side === 'L' ? 'end' : 'start'}
            style={{ fontSize: LABEL_SIZE, fill: theme.text, fontStyle: 'italic' }}
          >
            {name.length > MAX_LABEL_CHARS ? name.slice(0, MAX_LABEL_CHARS - 1) + '…' : name}
          </text>
        </g>
      ))}
    </svg>
  )
}
