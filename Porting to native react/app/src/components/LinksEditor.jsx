import { useState } from 'react'
import { Link2, Plus, X } from 'lucide-react'
import { theme } from '../theme'
import { parseLink } from '../lib/parseLink'
import { Button } from './Button'

// Ported verbatim from `jf` in gut-flora-atlas.readable.html (~line 16642).
// `ha`=Link2, `za`=X, `at`=Plus in the original (confirmed via the icon
// inventory in PORTING_PLAN.md; `ha` was double-checked against its actual
// `T("Link2", [...])` factory call while porting FindInPapersTab, which
// caught this file - along with navItems.js and ConditionDetail.jsx - all
// having been mis-ported as plain `Link` instead of `Link2` earlier in the
// session).
export function LinksEditor({ links, onAdd, onRemove }) {
  const [input, setInput] = useState('')
  const [label, setLabel] = useState('')

  const add = () => {
    const parsed = parseLink(input, label)
    if (parsed) {
      onAdd(parsed)
      setInput('')
      setLabel('')
    }
  }

  return (
    <div className="space-y-2">
      {links?.length > 0 && (
        <ul className="space-y-1">
          {links.map((l) => (
            <li
              key={l.id}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              style={{ background: theme.ink, border: `1px solid ${theme.line}` }}
            >
              <Link2 size={13} style={{ color: theme.muted, flexShrink: 0 }} />
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 truncate text-sm hover:underline"
                style={{ color: theme.text }}
              >
                {l.label}
              </a>
              <button onClick={() => onRemove(l.id)} style={{ color: theme.muted }} aria-label="Remove link">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="PMID or URL"
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm font-mono outline-none"
          style={{ background: theme.ink, color: theme.text, border: `1px solid ${theme.line}` }}
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: theme.ink, color: theme.text, border: `1px solid ${theme.line}` }}
        />
        <Button onClick={add} tone="quiet" style={{ padding: '8px 10px' }} title="Add link">
          <Plus size={16} />
        </Button>
      </div>
      <p style={{ fontSize: 11, color: theme.muted }}>A bare number becomes a PubMed link automatically.</p>
    </div>
  )
}
