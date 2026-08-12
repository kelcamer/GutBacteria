import { groupTaxa } from './looseMatch'

// Ported verbatim from `Hf` in gut-flora-atlas.readable.html
// (~line 28958-28984) - pairs up two conditions' (or condition-shaped
// pseudo-condition, see buildSymptomPseudoConditions below) taxa lists
// using groupTaxa/`Wf`, then buckets each matched/unmatched pair into
// "both-up" / "both-down" / "clash" / "only-a" / "only-b".
export function comparePair(a, b, loose) {
  const names = [...a.taxa.map((t) => t.name), ...b.taxa.map((t) => t.name)]
  const groups = groupTaxa(names, loose)
  const findIn = (cond, group) => cond.taxa.find((t) => group.names.includes(t.name))
  const rows = groups.map((group) => {
    const ta = findIn(a, group)
    const tb = findIn(b, group)
    let kind = 'only-a'
    if (ta && tb) kind = ta.dir === tb.dir ? (ta.dir === 'up' ? 'both-up' : 'both-down') : 'clash'
    else if (tb && !ta) kind = 'only-b'
    return { label: group.label, names: group.names, ta, tb, kind }
  })
  const countKind = (kind) => rows.filter((r) => r.kind === kind).length
  const aligned = countKind('both-up') + countKind('both-down')
  const clash = countKind('clash')
  return { rows, aligned, clash, total: rows.length, score: rows.length ? aligned / rows.length : 0 }
}

// Ported verbatim from the inline `symptomPseudo` construction at the top
// of `jm` (~line 28994-29051) - turns symptom_data.json's symptom list
// into condition-shaped objects (id/name/abbr/color/taxa) so the Compare
// tab can compare a real condition against a symptom (or two symptoms
// against each other) with the exact same `comparePair` logic, no special
// casing. Each pseudo-condition's "taxa" are the real bacteria linked to
// that symptom, direction-tagged the same way a real condition's taxa are.
export function buildSymptomPseudoConditions(symptomData) {
  const symptoms = (symptomData && symptomData.symptoms) || []
  return symptoms.map((sym) => {
    const taxa = []
    ;(symptomData.bacteria || []).forEach((b) => {
      let dir = null
      let found = null
      ;(b.up || []).forEach((en) => {
        if (!found && en.symptom === sym) {
          found = en
          dir = 'up'
        }
      })
      if (!found) {
        ;(b.down || []).forEach((en) => {
          if (!found && en.symptom === sym) {
            found = en
            dir = 'down'
          }
        })
      }
      if (!found) {
        ;(b.both || []).forEach((en) => {
          if (!found && en.symptom === sym) {
            found = en
            dir = 'both'
          }
        })
      }
      if (found) {
        taxa.push({
          name: b.name,
          dir,
          refs: found.ref || '',
          note: found.note || '',
          links: found.url ? [{ label: found.ref || sym, url: found.url }] : [],
        })
      }
    })
    return {
      id: 'symptom:' + sym,
      name: sym,
      abbr: sym.length > 16 ? sym.slice(0, 15) + '…' : sym,
      color: '#2DD4BF',
      taxa,
      isSymptom: true,
    }
  })
}
