import { useState } from 'react'
import { ArrowLeft, Microscope, Link2, Trash2, Plus, Pencil, ArrowLeftRight } from 'lucide-react'
import { theme } from '../theme'
import { Button } from './Button'
import { Modal } from './Modal'
import { RankBadge } from './RankBadge'
import { Italic } from './Italic'
import { DirTriangle } from './DirTriangle'
import { LinksEditor } from './LinksEditor'
import { TaxonEditor } from './TaxonEditor'
import { ConditionMap } from './ConditionMap'

// Ported verbatim from `Gm` in gut-flora-atlas.readable.html (~line
// 28517-28816). Icon mapping confirmed via the icon inventory: `Ro`=ArrowLeft,
// `Et`=Microscope, `ha`=Link2, `Nt`=Trash2, `at`=Plus, `Ho`=Pencil. (`ha`
// was mis-ported as plain `Link` originally - see LinksEditor.jsx's header
// comment for how that was caught and fixed.)
//
// `GFA_ConditionMap` (the per-condition force-graph) is stubbed for now -
// it depends on `GFA_buildSymptomMap`, which per PORTING_PLAN.md's
// dependency-first order hasn't been ported yet. Everything else here is
// real, not a placeholder.
const SECTIONS = [
  { dir: 'up', title: 'Increased', color: theme.up },
  { dir: 'down', title: 'Decreased', color: theme.down },
]

function newTaxon(dir) {
  return { id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9), name: '', dir, refs: '', note: '', links: [] }
}

export function ConditionDetail({ filters, condition, onBack, onUpdate, onUpsertTaxon, onRemoveTaxon, onDelete, onResearch, onCompare }) {
  const [editingTaxon, setEditingTaxon] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)

  return (
    <div className="p-4 safe-bottom">
      <div className="flex items-center gap-2 mb-4">
        <Button onClick={onBack} title="Back" style={{ padding: '6px 10px' }}>
          <ArrowLeft size={16} />
        </Button>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em' }}>
          {condition.name}
        </h2>
        <span
          className="font-mono px-2 py-1 rounded-md"
          style={{ fontSize: 10, color: condition.color, border: `1px solid ${condition.color}55` }}
        >
          {condition.abbr}
        </span>
        <div className="ml-auto flex gap-2">
          <Button onClick={() => onResearch(condition.id)} title="Find taxa in papers">
            <Microscope size={15} />
          </Button>
          <Button onClick={() => setNotesOpen(true)} title="Notes and sources">
            <Link2 size={15} />
          </Button>
          <Button tone="danger" onClick={() => setConfirmDelete(true)} title="Delete condition">
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {condition.note && (
        <p
          className="mb-4 rounded-xl p-3"
          style={{ background: theme.ink2, border: `1px solid ${theme.line}`, color: theme.muted, fontSize: 13, maxWidth: 680 }}
        >
          {condition.note}
        </p>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        {SECTIONS.map(({ dir, title, color }) => {
          const taxa = condition.taxa.filter((t) => t.dir === dir)
          return (
            <section key={dir} className="rounded-2xl overflow-hidden" style={{ background: theme.ink2, border: `1px solid ${theme.line}` }}>
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: `1px solid ${theme.line}`, background: `${color}12` }}
              >
                <DirTriangle dir={dir} />
                <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>{title}</span>
                <span className="font-mono ml-auto" style={{ fontSize: 11, color: theme.muted }}>
                  {taxa.length}
                </span>
              </div>
              <ul className="p-2">
                {taxa.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm" style={{ color: theme.muted }}>
                    Nothing logged here yet.
                  </li>
                )}
                {taxa.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => setEditingTaxon(t)}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left"
                      style={{ borderBottom: `1px solid ${theme.ink3}` }}
                    >
                      <RankBadge name={t.name} />
                      <Italic className="text-sm truncate flex-1">{t.name}</Italic>
                      {t.links?.length > 0 ? (
                        <a
                          href={t.links[0].url}
                          target="_blank"
                          rel="noopener"
                          onClick={(e) => e.stopPropagation()}
                          title="Open confirmed source"
                          style={{ padding: 4, margin: '-4px 0', display: 'flex', flexShrink: 0 }}
                        >
                          <Link2 size={16} style={{ color }} />
                        </a>
                      ) : (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(`${t.name} ${condition.name} gut microbiome`)}`}
                          target="_blank"
                          rel="noopener"
                          onClick={(e) => e.stopPropagation()}
                          title="No confirmed source on file — click to search PubMed instead"
                          style={{ padding: 4, margin: '-4px 0', display: 'flex', flexShrink: 0 }}
                        >
                          <Link2 size={16} style={{ color: theme.line }} />
                        </a>
                      )}
                      <span className="font-mono ml-auto flex-shrink-0" style={{ fontSize: 10, color: theme.muted }}>
                        {t.refs}
                      </span>
                      <Pencil size={12} style={{ color: theme.line, flexShrink: 0 }} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-2 pb-2">
                <Button onClick={() => setEditingTaxon(newTaxon(dir))} tone="quiet" style={{ width: '100%' }}>
                  <span className="flex items-center justify-center gap-2">
                    <Plus size={14} /> Add to {title.toLowerCase()}
                  </span>
                </Button>
              </div>
            </section>
          )
        })}
      </div>

      <ConditionMap condition={condition} filters={filters} />

      {/* New (no minified-source equivalent): jumps to Compare with this
          condition pre-loaded as side A - the natural next question after
          reading one condition's own taxa is "how does this stack up
          against something else," which used to mean leaving this screen,
          finding Compare in the nav, then re-picking this same condition
          from a dropdown. */}
      {onCompare && (
        <button
          onClick={() => onCompare(condition.id)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl p-3.5 mt-4 text-sm"
          style={{ background: theme.ink2, border: `1px dashed ${theme.line}`, color: theme.muted, maxWidth: 680 }}
        >
          <ArrowLeftRight size={15} />
          Want to compare {condition.name} with another condition?
        </button>
      )}

      {editingTaxon && (
        <TaxonEditor
          tx={editingTaxon}
          accent={condition.color}
          onClose={() => setEditingTaxon(null)}
          onSave={(t) => {
            onUpsertTaxon(condition.id, t)
            setEditingTaxon(null)
          }}
          onDelete={
            condition.taxa.some((t) => t.id === editingTaxon.id)
              ? () => {
                  onRemoveTaxon(condition.id, editingTaxon.id)
                  setEditingTaxon(null)
                }
              : null
          }
        />
      )}

      {notesOpen && (
        <Modal title={`${condition.name} — notes & sources`} onClose={() => setNotesOpen(false)}>
          <div className="space-y-4">
            <label className="block">
              <span className="font-mono block mb-1" style={{ fontSize: 10, letterSpacing: '.12em', color: theme.muted }}>
                NOTE
              </span>
              <textarea
                value={condition.note}
                onChange={(e) => onUpdate(condition.id, { note: e.target.value })}
                rows={4}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: theme.ink, color: theme.text, border: `1px solid ${theme.line}`, resize: 'vertical' }}
              />
            </label>
            <div>
              <span className="font-mono block mb-2" style={{ fontSize: 10, letterSpacing: '.12em', color: theme.muted }}>
                SOURCES
              </span>
              <LinksEditor
                links={condition.links}
                onAdd={(l) => onUpdate(condition.id, { links: [...(condition.links || []), l] })}
                onRemove={(id) => onUpdate(condition.id, { links: condition.links.filter((l) => l.id !== id) })}
              />
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete this condition?" onClose={() => setConfirmDelete(false)}>
          <p className="text-sm mb-4" style={{ color: theme.muted }}>
            {condition.name} and its {condition.taxa.length} entries will be removed. Export a backup first if you
            want to keep them.
          </p>
          <div className="flex gap-2">
            <Button tone="danger" onClick={() => onDelete(condition.id)}>
              Delete {condition.name}
            </Button>
            <Button onClick={() => setConfirmDelete(false)}>Keep it</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
