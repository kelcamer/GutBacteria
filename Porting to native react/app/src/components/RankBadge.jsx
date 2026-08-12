import { theme } from '../theme'
import { taxonRank } from '../lib/taxonRank'

// Ported verbatim from `Cr` in gut-flora-atlas.readable.html (~line 16475).
export function RankBadge({ name }) {
  const rank = taxonRank(name)
  return (
    <span
      title={rank.label}
      className="font-mono"
      style={{
        fontSize: 9,
        letterSpacing: '.08em',
        color: theme.muted,
        border: `1px solid ${theme.line}`,
        borderRadius: 3,
        padding: '1px 4px',
        flexShrink: 0,
      }}
    >
      {rank.code}
    </span>
  )
}
