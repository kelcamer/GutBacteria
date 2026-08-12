import { useEffect, useMemo, useState } from 'react'
import { TriangleAlert, Link2, Check } from 'lucide-react'
import { theme } from '../theme'
import { makeId } from '../lib/id'
import { looseTokens } from '../lib/looseMatch'
import { searchPapers, extractFindings } from '../lib/paperMining'
import { Button } from './Button'
import { DirTriangle } from './DirTriangle'
import { RankBadge } from './RankBadge'
import { Italic } from './Italic'

// Ported from `Zm` in gut-flora-atlas.readable.html (~line 30187-30657,
// ~471 lines) - the Find-in-Papers tab: pick a condition (and, per this
// session's earlier feature addition, optionally narrow to one bacterium
// via the "+ BACTERIUM" dropdown), search Europe PMC, and review each
// taxon/direction "proposal" the miner extracted, with evidence sentences
// and one-click "Add"/"Attach papers" actions. Icon mapping confirmed:
// ea=TriangleAlert, ha=Link2, To=Check.
//
// `buildQuery` (was the inline `I` closure) is kept as a plain function
// here rather than a hook, matching the original - it's pure string
// building, no state/effect involved.
function buildQuery(condition, fullText, bacterium) {
  const scope = fullText ? '' : 'TITLE_ABS:'
  const parenthetical = (condition.name.match(/\(([^)]+)\)/) || [])[1]
  const bacteriumClause = bacterium ? `(${scope}"${bacterium}") AND ` : ''
  const nameTerms = [condition.name.replace(/\s*\([^)]*\)\s*/g, ' ').trim(), parenthetical]
    .filter(Boolean)
    .map((t) => `${scope}"${t}"`)
    .join(' OR ')
  return `${bacteriumClause}(${nameTerms}) AND (${scope}"gut microbiota" OR ${scope}"gut microbiome") AND (${scope}abundance OR ${scope}composition)`
}

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Ported from `Jm` (~line 30659-30680) - highlights the taxon name and the
// matched cue word within an evidence sentence.
function HighlightedSentence({ sentence, taxon, cue, color }) {
  const parts = []
  const re = new RegExp(`(${escapeRegExp(taxon)}|\\b${escapeRegExp(cue)}\\b)`, 'gi')
  let last = 0
  let m
  while ((m = re.exec(sentence)) !== null) {
    if (m.index > last) parts.push(sentence.slice(last, m.index))
    const isTaxon = m[0].toLowerCase() === taxon.toLowerCase()
    parts.push(
      <span key={m.index} style={isTaxon ? { fontStyle: 'italic', fontWeight: 600 } : { color, fontWeight: 600 }}>
        {m[0]}
      </span>
    )
    last = m.index + m[0].length
  }
  parts.push(sentence.slice(last))
  return <>{parts}</>
}

export function FindInPapersTab({ conditions, targetId, setTargetId, onAddTaxon, onAttachLink, onSaveQuery, loose }) {
  const condition = conditions.find((c) => c.id === targetId) || conditions[0]
  const [query, setQuery] = useState('')
  const [newest, setNewest] = useState(false)
  const [fullText, setFullText] = useState(false)
  const [search, setSearch] = useState({ phase: 'idle' })
  const [expanded, setExpanded] = useState({})
  const [actioned, setActioned] = useState({})
  const [bacterium, setBacterium] = useState('')

  const allBacteria = useMemo(
    () => [...new Set(conditions.flatMap((c) => c.taxa.map((t) => t.name)))].sort((a, b) => a.localeCompare(b)),
    [conditions]
  )

  useEffect(() => {
    if (condition) {
      setQuery(condition.query || buildQuery(condition, fullText, bacterium))
      setSearch({ phase: 'idle' })
      setActioned({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ported 1:1 from the original's own deps ([targetId])
  }, [targetId])

  if (!condition) {
    return (
      <div className="p-6 text-sm" style={{ color: theme.muted }}>
        Add a condition first.
      </div>
    )
  }

  const runSearch = async () => {
    setSearch({ phase: 'loading' })
    if (query !== condition.query) onSaveQuery(condition.id, query)
    try {
      const papers = await searchPapers(query, { newest })
      const findings = extractFindings(papers, condition.taxa.map((t) => t.name))
      setSearch({ phase: 'done', papers, findings })
      setExpanded({})
    } catch (e) {
      setSearch({ phase: 'error', message: e.message })
    }
  }

  // Ported from `A` - finds this condition's already-logged taxon matching
  // a mined name, respecting the loose-matching toggle.
  const findTracked = (name) => {
    const tokens = loose ? looseTokens(name) : [name.toLowerCase()]
    return condition.taxa.find((t) => (loose ? looseTokens(t.name) : [t.name.toLowerCase()]).some((tok) => tokens.includes(tok)))
  }

  const linkFromPaper = (paper) =>
    paper.pmid ? { id: makeId(), label: `PMID ${paper.pmid}`, url: `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/` } : null

  // Ported from `M` - adds a mined finding as a brand-new taxon entry.
  const addFinding = (finding, dir) => {
    const links = []
    finding.evidence.map((e) => linkFromPaper(e.paper)).filter(Boolean).forEach((l) => {
      if (!links.some((x) => x.url === l.url)) links.push(l)
    })
    onAddTaxon(condition.id, {
      id: makeId(),
      name: finding.taxon,
      dir,
      refs: `${finding.papers} paper${finding.papers > 1 ? 's' : ''}`,
      note: finding.evidence[0]?.sentence || '',
      links: links.slice(0, 5),
    })
    setActioned({ ...actioned, [finding.taxon + finding.dir]: 'added' })
  }

  // Ported from `Q` - attaches this finding's papers to an already-tracked taxon.
  const attachFinding = (finding, taxon) => {
    const links = finding.evidence
      .map((e) => linkFromPaper(e.paper))
      .filter(Boolean)
      .filter((l) => !(taxon.links || []).some((x) => x.url === l.url))
    const deduped = []
    links.forEach((l) => {
      if (!deduped.some((x) => x.url === l.url)) deduped.push(l)
    })
    if (deduped.length) onAttachLink(condition.id, taxon.id, deduped.slice(0, 5))
    setActioned({ ...actioned, [finding.taxon + finding.dir]: 'attached' })
  }

  return (
    <div className="p-4 safe-bottom" style={{ maxWidth: 860 }}>
      <p className="mb-4" style={{ color: theme.muted, fontSize: 13, maxWidth: 680 }}>
        Searches Europe PMC, which indexes all of PubMed, then reads the abstracts for taxon names sitting next to
        direction words. Everything below is a <em>proposal</em> — abstracts phrase findings against controls,
        describe what a probiotic did, and report null results in the same vocabulary, so read the sentence before
        you accept it.
      </p>

      <div className="rounded-2xl p-3 mb-5" style={{ background: theme.ink2, border: `1px solid ${theme.line}` }}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-mono" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.12em' }}>
            SEARCHING FOR
          </span>
          <select
            value={condition.id}
            onChange={(e) => setTargetId(e.target.value)}
            className="rounded-lg px-2 py-1 text-sm outline-none"
            style={{ background: theme.ink, color: theme.text, border: `1px solid ${condition.color}66` }}
          >
            {[...conditions]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id} style={{ background: theme.ink2 }}>
                  {c.name}
                </option>
              ))}
          </select>
          <span className="font-mono" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.12em' }}>
            + BACTERIUM
          </span>
          <select
            value={bacterium}
            onChange={(e) => {
              const v = e.target.value
              setBacterium(v)
              setQuery(buildQuery(condition, fullText, v))
            }}
            className="rounded-lg px-2 py-1 text-sm outline-none"
            style={{ background: theme.ink, color: theme.text, border: `1px solid ${theme.line}`, maxWidth: 220 }}
          >
            <option value="" style={{ background: theme.ink2 }}>
              Any bacterium
            </option>
            {allBacteria.map((b) => (
              <option key={b} value={b} style={{ background: theme.ink2 }}>
                {b}
              </option>
            ))}
          </select>
          {bacterium && (
            <button
              onClick={() => {
                setBacterium('')
                setQuery(buildQuery(condition, fullText, ''))
              }}
              className="rounded-lg px-2 py-1 text-sm"
              style={{ border: `1px solid ${theme.line}`, color: theme.muted }}
            >
              × clear
            </button>
          )}
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={2}
          className="w-full rounded-lg px-3 py-2 text-sm font-mono outline-none mb-2"
          style={{ background: theme.ink, color: theme.text, border: `1px solid ${theme.line}`, resize: 'vertical' }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button tone="solid" onClick={runSearch} disabled={search.phase === 'loading' || !query.trim()}>
            {search.phase === 'loading' ? 'Searching…' : 'Search papers'}
          </Button>
          <button
            onClick={() => setNewest((v) => !v)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ border: `1px solid ${newest ? theme.up : theme.line}`, color: newest ? theme.up : theme.muted }}
          >
            {newest ? 'Newest first' : 'Most relevant'}
          </button>
          <button
            onClick={() => {
              const next = !fullText
              setFullText(next)
              setQuery(buildQuery(condition, next, bacterium))
            }}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ border: `1px solid ${fullText ? '#FFC857' : theme.line}`, color: fullText ? '#FFC857' : theme.muted }}
          >
            {fullText ? 'Full text too' : 'Title & abstract'}
          </button>
          <Button onClick={() => setQuery(buildQuery(condition, fullText, bacterium))} tone="ghost">
            Reset query
          </Button>
        </div>
        <p className="mt-2" style={{ fontSize: 11.5, color: fullText ? '#FFC857' : theme.muted, lineHeight: 1.5 }}>
          {fullText
            ? 'Searching full text as well. Europe PMC indexes whole open-access papers, so this pulls in articles that only mention the condition in passing — wider net, more noise.'
            : "TITLE_ABS: holds the match to the title and abstract, so papers that merely mention the condition somewhere in the body don't come back."}
        </p>
      </div>

      {search.phase === 'error' && (
        <div className="rounded-2xl p-4 mb-4 flex items-start gap-3" style={{ background: '#3A1030', border: '1px solid #7A2E45', color: '#FFD7E2', fontSize: 13 }}>
          <TriangleAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{search.message}</span>
        </div>
      )}

      {search.phase === 'done' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              `${search.papers.length} papers read`,
              `${search.findings.length} proposals`,
              `${search.findings.filter((f) => !findTracked(f.taxon)).length} taxa you don't track yet`,
            ].map((label, i) => (
              <span key={i} className="font-mono rounded-full px-3 py-1.5" style={{ fontSize: 11, color: theme.muted, background: theme.ink2, border: `1px solid ${theme.line}` }}>
                {label}
              </span>
            ))}
          </div>

          {search.findings.length === 0 && (
            <p className="py-10 text-center text-sm" style={{ color: theme.muted }}>
              Nothing matched. Try broadening the query, or drop the abundance clause.
            </p>
          )}

          <div className="space-y-2">
            {search.findings.map((finding) => {
              const key = finding.taxon + finding.dir
              const tracked = findTracked(finding.taxon)
              const matches = tracked && tracked.dir === finding.dir
              const conflicts = tracked && tracked.dir !== finding.dir
              const actionState = actioned[key]
              const dirColor = finding.dir === 'up' ? theme.up : theme.down

              return (
                <div key={key} className="rounded-2xl overflow-hidden" style={{ background: theme.ink2, border: `1px solid ${conflicts ? '#FFC85755' : theme.line}` }}>
                  <div className="flex items-center gap-2 px-3 py-2.5 flex-wrap">
                    <DirTriangle dir={finding.dir} size={13} />
                    <RankBadge name={finding.taxon} />
                    <Italic className="text-sm">{finding.taxon}</Italic>
                    <span className="font-mono" style={{ fontSize: 10, color: theme.muted }}>
                      {finding.papers} paper{finding.papers > 1 ? 's' : ''}
                    </span>
                    {finding.evidence[0]?.paper?.pmid && (
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${finding.evidence[0].paper.pmid}/`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open first source on PubMed"
                        className="hover:underline flex items-center gap-1"
                        style={{ fontSize: 10, color: theme.text }}
                      >
                        <Link2 size={12} style={{ flexShrink: 0 }} /> PMID {finding.evidence[0].paper.pmid}
                      </a>
                    )}
                    {finding.flags.length > 0 && (
                      <span className="font-mono rounded-full px-2 py-0.5" style={{ fontSize: 9, color: '#FFC857', border: '1px solid #FFC85744' }}>
                        read carefully
                      </span>
                    )}
                    {matches && !actionState && (
                      <span className="font-mono" style={{ fontSize: 10, color: theme.down }}>
                        matches your entry
                      </span>
                    )}
                    {conflicts && !actionState && (
                      <span className="font-mono" style={{ fontSize: 10, color: '#FFC857' }}>
                        you have this as {tracked.dir === 'up' ? 'raised' : 'lowered'}
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        onClick={() => setExpanded({ ...expanded, [key]: !expanded[key] })}
                        className="rounded-lg px-2 py-1 font-mono"
                        style={{ fontSize: 10, color: theme.muted, border: `1px solid ${theme.line}` }}
                      >
                        {expanded[key] ? 'hide' : 'evidence'}
                      </button>
                      {actionState ? (
                        <span className="flex items-center gap-1 font-mono px-2" style={{ fontSize: 10, color: theme.down }}>
                          <Check size={12} /> {actionState}
                        </span>
                      ) : tracked ? (
                        <Button tone="quiet" onClick={() => attachFinding(finding, tracked)} style={{ padding: '5px 10px', fontSize: 12 }}>
                          Attach papers
                        </Button>
                      ) : (
                        <Button
                          tone="quiet"
                          onClick={() => addFinding(finding, finding.dir)}
                          style={{ padding: '5px 10px', fontSize: 12, borderColor: dirColor, color: dirColor }}
                        >
                          Add as {finding.dir === 'up' ? 'raised' : 'lowered'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {expanded[key] && (
                    <div className="px-3 pb-3" style={{ borderTop: `1px solid ${theme.ink3}` }}>
                      {finding.flags.length > 0 && (
                        <p className="font-mono mt-2 mb-1" style={{ fontSize: 10, color: '#FFC857' }}>
                          {finding.flags.join(' · ')}
                        </p>
                      )}
                      {finding.evidence.slice(0, 4).map((ev, i) => (
                        <div key={i} className="mt-2 rounded-lg p-2.5" style={{ background: theme.ink }}>
                          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: theme.text }}>
                            <HighlightedSentence sentence={ev.sentence} taxon={finding.taxon} cue={ev.cue} color={dirColor} />
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {ev.paper.pmid ? (
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${ev.paper.pmid}/`}
                                target="_blank"
                                rel="noreferrer"
                                title="Open on PubMed"
                                className="font-mono hover:underline flex items-center gap-1"
                                style={{ fontSize: 10, color: theme.text }}
                              >
                                <Link2 size={11} style={{ flexShrink: 0 }} /> PMID {ev.paper.pmid}
                              </a>
                            ) : (
                              <span className="font-mono" style={{ fontSize: 10, color: theme.muted }}>
                                no PMID
                              </span>
                            )}
                            <span className="font-mono truncate" style={{ fontSize: 10, color: theme.muted }}>
                              {ev.paper.journal} {ev.paper.year}
                            </span>
                          </div>
                        </div>
                      ))}
                      {!tracked && (
                        <div className="flex gap-2 mt-3">
                          <Button tone="quiet" onClick={() => addFinding(finding, 'up')} style={{ padding: '5px 10px', fontSize: 12, color: theme.up, borderColor: `${theme.up}66` }}>
                            Add as raised
                          </Button>
                          <Button tone="quiet" onClick={() => addFinding(finding, 'down')} style={{ padding: '5px 10px', fontSize: 12, color: theme.down, borderColor: `${theme.down}66` }}>
                            Add as lowered
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
