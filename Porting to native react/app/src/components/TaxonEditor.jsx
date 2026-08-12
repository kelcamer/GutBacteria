import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { theme } from '../theme'
import { taxonRank } from '../lib/taxonRank'
import { Modal } from './Modal'
import { Field } from './Field'
import { Button } from './Button'
import { DirTriangle } from './DirTriangle'
import { LinksEditor } from './LinksEditor'

// Ported verbatim from `$m` in gut-flora-atlas.readable.html (~line
// 28819-28956) - the add/edit modal for a single taxon entry within a
// condition. `Nt`=Trash2 (confirmed in the icon inventory).
export function TaxonEditor({ tx, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(tx)
  const patch = (p) => setDraft((prev) => ({ ...prev, ...p }))
  const rank = taxonRank(draft.name || '')

  return (
    <Modal title={tx.name ? 'Edit entry' : 'New entry'} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Taxon" value={draft.name} onChange={(v) => patch({ name: v })} placeholder="e.g. Bifidobacterium" />
        {draft.name && (
          <p className="font-mono" style={{ fontSize: 11, color: theme.muted, marginTop: -4 }}>
            reads as {rank.label}
          </p>
        )}

        <div>
          <span className="font-mono block mb-2" style={{ fontSize: 10, letterSpacing: '.12em', color: theme.muted }}>
            DIRECTION
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['up', 'Increased', theme.up],
              ['down', 'Decreased', theme.down],
            ].map(([dir, label, color]) => (
              <button
                key={dir}
                onClick={() => patch({ dir })}
                className="rounded-lg px-3 py-2.5 text-sm flex items-center justify-center gap-2"
                style={{
                  background: draft.dir === dir ? `${color}1E` : 'transparent',
                  border: `1px solid ${draft.dir === dir ? color : theme.line}`,
                  color: draft.dir === dir ? color : theme.muted,
                }}
              >
                <DirTriangle dir={dir} size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        <Field label="Reference marks" value={draft.refs} onChange={(v) => patch({ refs: v })} placeholder="e.g. 56,57" mono />

        <label className="block">
          <span className="font-mono block mb-1" style={{ fontSize: 10, letterSpacing: '.12em', color: theme.muted }}>
            NOTE
          </span>
          <textarea
            value={draft.note}
            onChange={(e) => patch({ note: e.target.value })}
            rows={2}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: theme.ink, color: theme.text, border: `1px solid ${theme.line}`, resize: 'vertical' }}
          />
        </label>

        <div>
          <span className="font-mono block mb-2" style={{ fontSize: 10, letterSpacing: '.12em', color: theme.muted }}>
            PAPERS
          </span>
          <LinksEditor
            links={draft.links}
            onAdd={(l) => patch({ links: [...(draft.links || []), l] })}
            onRemove={(id) => patch({ links: draft.links.filter((l) => l.id !== id) })}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            tone="solid"
            onClick={() => draft.name.trim() && onSave({ ...draft, name: draft.name.trim() })}
            disabled={!draft.name.trim()}
          >
            Save entry
          </Button>
          <Button onClick={onClose}>Cancel</Button>
          {onDelete && (
            <Button tone="danger" onClick={onDelete} style={{ marginLeft: 'auto' }}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
