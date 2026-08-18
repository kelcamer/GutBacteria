import { theme, palette } from '../theme'
import { sourceCount } from '../lib/sourceCount'

// Green from the shared palette. Deliberately NOT theme.up / theme.down - those
// mean direction, and a badge that borrowed them would read as "this taxon went
// up" rather than "this claim has two papers behind it".
const CORROBORATED = palette[4]

// How fragile is this claim? Visible at a glance instead of one popup at a time.
//
// 11.6% of entries in this dataset rest on two or more genuinely different
// papers. The rest have no second opinion anywhere - if that one paper was
// small, measured a different rank, or used superseded nomenclature, the claim
// inherits the error and the map still draws a confident arrow.
//
// Counts PAPERS, not identifiers: an entry citing PMC6421268 and PMID 30915065
// cites one 2019 review twice, and 57 entries do exactly that.
export function SourceBadge({ entry, derived }) {
  // Derived entries inherit their evidence from the taxon they were derived
  // from, so a source count of their own would be double-counting.
  if (derived) return null

  const n = sourceCount(entry)
  const corroborated = n >= 2

  const label = n === 0 ? 'no id' : `${n}×`
  const title =
    n === 0
      ? 'No resolvable identifier on this entry'
      : n === 1
        ? 'Single-sourced - no second opinion in the dataset'
        : `Corroborated by ${n} independent papers`

  return (
    <span
      title={title}
      className="font-mono"
      style={{
        fontSize: 9,
        letterSpacing: '.08em',
        color: corroborated ? CORROBORATED : theme.muted,
        border: `1px solid ${corroborated ? CORROBORATED : theme.line}`,
        borderRadius: 3,
        padding: '1px 4px',
        flexShrink: 0,
        opacity: n === 0 ? 0.55 : 1,
      }}
    >
      {label}
    </span>
  )
}
