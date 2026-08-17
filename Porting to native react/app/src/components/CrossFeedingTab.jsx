import { theme } from '../theme'
import crossFeeding from '../../../../cross_feeding.json'
import { Italic } from './Italic'

// The microbe-to-microbe layer on its own, with no conditions or symptoms in
// the way. Everywhere else in the app these relationships only show up as
// consequences - derived links scattered across conditions - so there was no
// single place to see the network itself.
//
// Deliberately NOT a force graph. There are five edges. A force simulation of
// five edges is less legible than a list, and it would mean touching the two
// map engines, which is the riskiest code in this repo. If the network grows
// past ~20 edges this decision is worth revisiting.
const EVIDENCE = {
  'in-vitro-coculture': ['Co-culture', '#4FC3F7', 'Two named organisms grown together — the strongest form of evidence here'],
  'in-vitro-community': ['Community model', '#A78BFA', 'Fermentation model; outputs moved together but no named pair was isolated'],
  animal: ['Animal', '#FFC857', 'Demonstrated in a living animal'],
  human: ['Human', '#2DD4BF', 'Measured in people'],
  inferred: ['Inferred', '#A08FC7', 'Established biochemistry, no direct study of this pair'],
}

function Badge({ evidence }) {
  const [label, color, title] = EVIDENCE[evidence] || [evidence, theme.muted, '']
  return (
    <span
      title={title}
      className="font-mono rounded-full px-2 py-0.5"
      style={{ fontSize: 10, color, border: `1px solid ${color}55`, background: `${color}18`, whiteSpace: 'nowrap' }}
    >
      {label}
    </span>
  )
}

export function CrossFeedingTab() {
  const edges = crossFeeding.edges || []
  const candidates = crossFeeding.candidates || []
  const keystone = crossFeeding._keystone_resource

  return (
    <div className="p-4 safe-bottom">
      <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
        Crossfeeding network
      </h2>
      <p className="mb-4" style={{ color: theme.muted, fontSize: 13, maxWidth: 720 }}>
        Who feeds whom. One organism's waste is another's substrate — this is the mechanism behind
        indirect effects, where a bifidogenic prebiotic raises butyrate without feeding a single
        butyrate producer directly. These edges are what generate the{' '}
        <b style={{ color: theme.text }}>derived</b> links you can toggle on the maps.
      </p>

      {edges.map((e) => (
        <div
          key={e.id}
          className="rounded-2xl mb-3"
          style={{ background: theme.ink2, border: `1px solid ${theme.line}`, padding: 14, maxWidth: 720 }}
        >
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>
              <Italic>{e.from}</Italic>
            </span>
            <span style={{ color: '#A78BFA', fontSize: 15 }}>→</span>
            <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>
              <Italic>{e.to}</Italic>
            </span>
            <span className="ml-auto">
              <Badge evidence={e.evidence} />
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 mb-2" style={{ fontSize: 11.5 }}>
            {(e.metabolites || []).map((m) => (
              <span
                key={m}
                className="rounded-full px-2 py-0.5"
                style={{ background: theme.ink3, color: theme.muted, border: `1px solid ${theme.line}` }}
              >
                {m}
              </span>
            ))}
            <span style={{ color: theme.muted }}>⟶</span>
            <span
              className="rounded-full px-2 py-0.5"
              style={{ background: '#2DD4BF22', color: '#2DD4BF', border: '1px solid #2DD4BF55', fontWeight: 600 }}
            >
              {e.product}
            </span>
          </div>

          <p style={{ color: theme.muted, fontSize: 12.5, lineHeight: 1.5, marginBottom: 6 }}>{e.note}</p>
          <a
            href={e.url}
            target="_blank"
            rel="noopener"
            className="font-mono"
            style={{ fontSize: 10.5, color: '#8FD3F4', textDecoration: 'underline' }}
          >
            {e.ref}
          </a>
        </div>
      ))}

      {candidates.length > 0 && (
        <>
          <h3 className="mt-6 mb-1" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>
            Candidate edges — not verified, not propagated
          </h3>
          <p className="mb-3" style={{ color: theme.muted, fontSize: 12.5, maxWidth: 720 }}>
            Surfaced in reviews but not yet traced to a primary source naming the pair. Listed here rather
            than quietly dropped, so the gap stays visible — none of these generate derived links.
          </p>
          {candidates.map((c, i) => (
            <div
              key={i}
              className="rounded-2xl mb-2"
              style={{ background: 'transparent', border: `1px dashed ${theme.line}`, padding: 12, maxWidth: 720 }}
            >
              <div className="mb-1" style={{ fontSize: 14 }}>
                <Italic>{c.from}</Italic> <span style={{ color: theme.muted }}>→</span> <Italic>{c.to}</Italic>
                <span style={{ color: theme.muted, fontSize: 12 }}>
                  {' '}
                  · {(c.metabolites || []).join(', ')} ⟶ {c.product}
                </span>
              </div>
              <p style={{ color: theme.muted, fontSize: 12, lineHeight: 1.5 }}>{c.why}</p>
            </div>
          ))}
        </>
      )}

      {keystone && (
        <p className="mt-5" style={{ color: theme.muted, fontSize: 12, maxWidth: 720 }}>
          Expanding this network: start from{' '}
          <a href={keystone.url} target="_blank" rel="noopener" style={{ color: '#8FD3F4', textDecoration: 'underline' }}>
            {keystone.title}
          </a>{' '}
          ({keystone.journal}) rather than ad-hoc searching.
        </p>
      )}
    </div>
  )
}
