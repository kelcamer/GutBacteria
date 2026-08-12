import { theme } from '../theme'
import { GLOSSARY } from '../data/glossary'

// Ported verbatim from `GFA_Glossary` in gut-flora-atlas.readable.html
// (~line 27117-27167).
export function Glossary() {
  return (
    <div className="p-4 safe-bottom" style={{ maxWidth: 780 }}>
      <p className="mb-4" style={{ color: theme.muted, fontSize: 13 }}>
        Plain-English definitions for the recurring jargon in this app — taxonomy ranks, the evidence-quality
        terms, and the biology behind the up/down calls.
      </p>
      <div className="space-y-3">
        {GLOSSARY.map(([term, definition]) => (
          <div key={term} className="rounded-2xl p-4" style={{ background: theme.ink2, border: `1px solid ${theme.line}` }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15, marginBottom: 6, color: theme.text }}>
              {term}
            </div>
            <p style={{ fontSize: 13, color: theme.muted, lineHeight: 1.5 }}>{definition}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
