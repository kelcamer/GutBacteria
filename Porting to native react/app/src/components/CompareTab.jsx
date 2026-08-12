import { useMemo, useState } from 'react'
import { theme } from '../theme'
import { symptomData } from '../data'
import { comparePair, buildSymptomPseudoConditions } from '../lib/compareConditions'
import { DirTriangle } from './DirTriangle'
import { RankBadge } from './RankBadge'
import { Italic } from './Italic'

// Ported from `jm` in gut-flora-atlas.readable.html (~line 28986-29601,
// 616 lines) - the Compare-two tab: pick any two conditions OR symptoms
// (symptoms are turned into condition-shaped pseudo-entries via
// buildSymptomPseudoConditions/`symptomPseudo` so the exact same
// comparePair/`Hf` logic handles both), see their aligned/opposed taxa
// side by side, a "closest neighbours" ranked list, and an optional
// multi-select (3+) alignment matrix. This is the tab flagged in
// ARCHITECTURE.md/PORTING_PLAN.md as having Rules-of-Hooks history in the
// original - ported with that in mind: every hook here runs
// unconditionally on every render (the early "add a second condition"
// return happens AFTER all hooks, exactly where the original put it,
// which is precisely the pattern that historically made this component
// fragile - kept as-is rather than "fixed", since reordering hooks here
// would be a real behavior-risking rewrite of working logic, not a port).
//
// Kind labels/colors ported from the original's `g` lookup table (~line
// 28966).
const KIND_ORDER = ['both-up', 'both-down', 'clash', 'only-a', 'only-b']

export function CompareTab({ conditions, loose, aId, bId, setAId, setBId }) {
  const symptomPseudo = useMemo(() => buildSymptomPseudoConditions(symptomData), [])
  const combined = useMemo(() => [...conditions, ...symptomPseudo], [conditions, symptomPseudo])

  const a = combined.find((c) => c.id === aId) || conditions[0]
  const b = combined.find((c) => c.id === bId) || conditions[1]
  const pair = useMemo(() => (a && b ? comparePair(a, b, loose) : null), [a, b, loose])
  const neighbors = useMemo(
    () =>
      a
        ? conditions
            .filter((c) => c.id !== a.id)
            .map((c) => ({ c, ...comparePair(a, c, loose) }))
            .sort((x, y) => y.aligned - x.aligned || y.score - x.score)
        : [],
    [conditions, a, loose]
  )

  const [showMulti, setShowMulti] = useState(false)
  const [multiIds, setMultiIds] = useState([])
  const multiNeighbors = useMemo(() => {
    if (multiIds.length < 2) return null
    const setConds = multiIds.map((id) => combined.find((c) => c.id === id)).filter(Boolean)
    return combined
      .filter((c) => !multiIds.includes(c.id))
      .map((c) => {
        let tA = 0, tC = 0, tT = 0
        setConds.forEach((sc) => {
          const pr = comparePair(sc, c, loose)
          tA += pr.aligned
          tC += pr.clash
          tT += pr.total
        })
        return { c, aligned: tA, clash: tC, total: tT }
      })
      .sort((x, y) => y.aligned - x.aligned || x.c.name.localeCompare(y.c.name))
  }, [multiIds, combined, loose])

  const onChangeA = (v) => {
    setMultiIds([])
    setAId(v)
  }
  const onChangeB = (v) => {
    setMultiIds([])
    setBId(v)
  }

  if (!a || !b || !pair) {
    return (
      <div className="p-6 text-sm" style={{ color: theme.muted }}>
        Add a second condition and this screen fills in.
      </div>
    )
  }

  const citeEls = (t) => {
    if (!t) return null
    if (t.links && t.links.length > 0) {
      return t.links.map((lk, ci) => (
        <a
          key={ci}
          href={lk.url}
          target="_blank"
          rel="noopener"
          onClick={(ev) => ev.stopPropagation()}
          className="font-mono truncate block"
          style={{ fontSize: 10, color: '#8FD3F4', textDecoration: 'underline' }}
        >
          {lk.label}
        </a>
      ))
    }
    return t.refs ? (
      <span className="font-mono truncate" style={{ fontSize: 10, color: theme.muted }}>
        {t.refs}
      </span>
    ) : null
  }

  const kindMeta = {
    'both-up': ['Raised in both', theme.up],
    'both-down': ['Lowered in both', theme.down],
    clash: ['Pulling opposite ways', '#FFC857'],
    'only-a': [`Only in ${a.abbr}`, a.color],
    'only-b': [`Only in ${b.abbr}`, b.color],
  }

  const Picker = ({ value, onChange, side }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl pl-3 pr-8 py-2.5 text-sm outline-none"
        style={{
          background: theme.ink2,
          color: theme.text,
          border: `1px solid ${theme.line}`,
          borderBottom: `3px solid ${side}`,
          fontFamily: 'var(--display)',
          fontWeight: 600,
        }}
      >
        <optgroup label="Conditions">
          {[...conditions]
            .sort((sA, sB) => sA.name.localeCompare(sB.name))
            .map((c) => (
              <option key={c.id} value={c.id} style={{ background: theme.ink2 }}>
                {c.name}
              </option>
            ))}
        </optgroup>
        <optgroup label="Symptoms">
          {[...symptomPseudo]
            .sort((sA, sB) => sA.name.localeCompare(sB.name))
            .map((c) => (
              <option key={c.id} value={c.id} style={{ background: theme.ink2 }}>
                {c.name}
              </option>
            ))}
        </optgroup>
      </select>
      <span
        className="absolute pointer-events-none"
        style={{ right: 10, top: '50%', transform: 'translateY(-50%)', color: theme.muted, fontSize: 11 }}
      >
        ▼
      </span>
    </div>
  )

  const neighborList = multiIds.length >= 2 ? multiNeighbors : neighbors

  return (
    <div className="p-4 safe-bottom">
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', maxWidth: 720 }}>
        <Picker value={a.id} onChange={onChangeA} side={a.color} />
        <span className="font-mono" style={{ fontSize: 11, color: theme.muted }}>
          vs
        </span>
        <Picker value={b.id} onChange={onChangeB} side={b.color} />
      </div>

      <div className="mb-5" style={{ maxWidth: 720 }}>
        <button
          onClick={() => setShowMulti(!showMulti)}
          className="text-sm mb-2"
          style={{ color: theme.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {showMulti ? '▾ ' : '▸ '}Compare more than two conditions or symptoms
        </button>
        {showMulti && (
          <div>
            <div className="mb-3">
              <div className="font-mono mb-1" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.1em' }}>
                CONDITIONS
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[...conditions]
                  .sort((cA, cB) => cA.name.localeCompare(cB.name))
                  .map((c) => {
                    const on = multiIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        onClick={() => setMultiIds(on ? multiIds.filter((x) => x !== c.id) : [...multiIds, c.id])}
                        className="rounded-full px-2.5 py-1 text-xs"
                        style={{
                          background: on ? c.color + '33' : theme.ink2,
                          border: `1px solid ${on ? c.color : theme.line}`,
                          color: on ? theme.text : theme.muted,
                        }}
                      >
                        {c.name}
                      </button>
                    )
                  })}
              </div>
              <div className="font-mono mb-1" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.1em' }}>
                SYMPTOMS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...symptomPseudo]
                  .sort((cA, cB) => cA.name.localeCompare(cB.name))
                  .map((c) => {
                    const on = multiIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        onClick={() => setMultiIds(on ? multiIds.filter((x) => x !== c.id) : [...multiIds, c.id])}
                        className="rounded-full px-2.5 py-1 text-xs"
                        style={{
                          background: on ? c.color + '33' : theme.ink2,
                          border: `1px solid ${on ? c.color : theme.line}`,
                          color: on ? theme.text : theme.muted,
                        }}
                      >
                        {c.name}
                      </button>
                    )
                  })}
              </div>
            </div>
            {multiIds.length >= 2 && (
              <div style={{ overflowX: 'auto', border: `1px solid ${theme.line}`, borderRadius: 12 }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 11.5 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '6px 8px' }} />
                      {multiIds.map((cid) => (
                        <th key={cid} style={{ padding: '6px 8px', textAlign: 'center', color: theme.muted, fontWeight: 600 }}>
                          {(combined.find((c) => c.id === cid) || {}).abbr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {multiIds.map((rid) => (
                      <tr key={rid} style={{ borderTop: `1px solid ${theme.line}` }}>
                        <td style={{ padding: '6px 8px', fontWeight: 600, color: theme.text, whiteSpace: 'nowrap' }}>
                          {(combined.find((c) => c.id === rid) || {}).abbr}
                        </td>
                        {multiIds.map((cid) => {
                          if (cid === rid) {
                            return (
                              <td key={cid} style={{ padding: '6px 8px', textAlign: 'center', color: theme.line }}>
                                —
                              </td>
                            )
                          }
                          const rc = combined.find((c) => c.id === rid)
                          const cc = combined.find((c) => c.id === cid)
                          if (!rc || !cc) return <td key={cid} />
                          const cellPair = comparePair(rc, cc, loose)
                          return (
                            <td
                              key={cid}
                              onClick={() => {
                                setAId(rid)
                                setBId(cid)
                              }}
                              style={{
                                padding: '6px 8px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: (aId === rid && bId === cid) || (aId === cid && bId === rid) ? theme.ink3 : 'transparent',
                              }}
                            >
                              <span className="font-mono" style={{ fontSize: 10 }}>
                                <span style={{ color: theme.text }}>{cellPair.aligned}</span>↓/
                                <span style={{ color: '#FFC857' }}>{cellPair.clash}</span>↑
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          [`${pair.aligned} aligned`, theme.text],
          [`${pair.clash} opposed`, '#FFC857'],
          [`${Math.round(pair.score * 100)}% of ${pair.total} taxa agree`, theme.muted],
        ].map(([label, color], i) => (
          <span
            key={i}
            className="font-mono rounded-full px-3 py-1.5"
            style={{ fontSize: 11, color, background: theme.ink2, border: `1px solid ${theme.line}` }}
          >
            {label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0, maxWidth: 400 }}>
          <h3 className="mb-1" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18 }}>
            {multiIds.length >= 2 ? 'Closest neighbours to Multiple' : `Closest neighbours to ${a.name}`}
          </h3>
          <p className="mb-3" style={{ color: theme.muted, fontSize: 13, maxWidth: 620 }}>
            {multiIds.length >= 2
              ? 'Ranked by combined alignment across your whole selected set. Click a condition to preview it against your set below — your selected set stays unchanged.'
              : 'Ranked by how many taxa move the same direction in both. Opposed taxa are counted separately, not subtracted.'}
          </p>
          <div className="space-y-2" style={{ maxWidth: 720 }}>
            {(neighborList || []).map(({ c, aligned, clash, total }) => (
              <div
                key={c.id}
                onClick={() => {
                  if (multiIds.length >= 2) {
                    setAId(multiIds[0])
                    setBId(c.id)
                  } else {
                    setBId(c.id)
                  }
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{
                  cursor: 'pointer',
                  background: c.id === b.id ? theme.ink3 : theme.ink2,
                  border: `1px solid ${c.id === b.id ? c.color : theme.line}`,
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: 99, background: c.color, flexShrink: 0 }} />
                <span className="text-sm truncate">{c.name}</span>
                <div className="flex-1 rounded-full mx-2 hidden sm:block" style={{ height: 5, background: theme.ink }}>
                  <div style={{ width: `${total ? (aligned / total) * 100 : 0}%`, height: '100%', background: c.color, borderRadius: 99 }} />
                </div>
                <span className="font-mono flex-shrink-0" style={{ fontSize: 11, color: theme.text }}>
                  {aligned} aligned
                </span>
                {clash > 0 && (
                  <span className="font-mono flex-shrink-0" style={{ fontSize: 11, color: '#FFC857' }}>
                    {clash} opposed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 460px', minWidth: 320, maxWidth: 640 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Full comparison</h3>
          <p className="mb-3" style={{ color: theme.muted, fontSize: 13 }}>
            Every taxon shared or diverging between {a.abbr} and {b.abbr}.
          </p>
          <div style={{ maxHeight: 600, overflowY: 'auto', borderRadius: 16 }}>
            <div className="rounded-2xl overflow-hidden mb-8" style={{ background: theme.ink2, border: `1px solid ${theme.line}` }}>
              <div
                className="grid px-3 py-2 font-mono"
                style={{
                  gridTemplateColumns: '1fr 150px 1fr',
                  borderBottom: `1px solid ${theme.line}`,
                  fontSize: 10,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: theme.muted,
                }}
              >
                <span style={{ textAlign: 'right', color: a.color }}>{a.abbr}</span>
                <span style={{ textAlign: 'center' }}>taxon</span>
                <span style={{ color: b.color }}>{b.abbr}</span>
              </div>
              {pair.aligned + pair.clash === 0 && (
                <div className="px-4 py-5 text-sm" style={{ color: theme.muted, borderBottom: `1px solid ${theme.line}` }}>
                  These two share no taxa at all. Turn on loose matching in the header to let related ranks line up,
                  or check the neighbour list below for a closer pair.
                </div>
              )}
              {KIND_ORDER.map((kind) => {
                const rows = pair.rows.filter((m) => m.kind === kind)
                if (!rows.length) return null
                const [kindLabel, kindColor] = kindMeta[kind]
                return (
                  <div key={kind}>
                    <div
                      className="px-3 py-1.5 font-mono"
                      style={{
                        background: `${kindColor}14`,
                        color: kindColor,
                        fontSize: 10,
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                        borderTop: `1px solid ${theme.line}`,
                        borderBottom: `1px solid ${theme.line}`,
                      }}
                    >
                      {kindLabel} · {rows.length}
                    </div>
                    {rows.map((m, c) => (
                      <div
                        key={m.label + c}
                        className="grid items-center px-3 py-2"
                        style={{ gridTemplateColumns: '1fr 150px 1fr', borderBottom: `1px solid ${theme.ink3}` }}
                      >
                        <div className="flex items-center justify-end gap-2 min-w-0">
                          {m.ta && (
                            <>
                              {citeEls(m.ta)}
                              <DirTriangle dir={m.ta.dir} size={12} />
                              <span className="h-px" style={{ width: 14, background: a.color }} />
                            </>
                          )}
                        </div>
                        <div className="text-center px-1 min-w-0">
                          <div className="flex items-center justify-center gap-1.5">
                            <RankBadge name={m.label} />
                            <Italic className="text-sm truncate">{m.label}</Italic>
                          </div>
                          {m.names.length > 1 && (
                            <div className="font-mono truncate" style={{ fontSize: 9, color: theme.muted }}>
                              + {m.names.filter((x) => x !== m.label).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          {m.tb && (
                            <>
                              <span className="h-px" style={{ width: 14, background: b.color }} />
                              <DirTriangle dir={m.tb.dir} size={12} />
                              {citeEls(m.tb)}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
