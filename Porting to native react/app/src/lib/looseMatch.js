// Ported verbatim from `Dm`/`Gu`/`Wf` in gut-flora-atlas.readable.html
// (~line 16196-16253) - the "loose matching" machinery behind the header's
// loose-taxa toggle. Shared by CompareTab (`jm`), and will be shared again
// once BacteriaIndex (`Xm`, ~line 29613) and FindInPapersTab (`Zm`, ~line
// 30245-30246) are ported - both call the same `Wf`/`Gu` there too, so this
// is factored into its own module rather than duplicated per-tab.
//
// `stem` crudely strips common Latin taxonomic suffixes (family/order/etc.
// endings, then a trailing "i") so e.g. "Prevotellaceae" and "Prevotella"
// collapse to the same root token. `looseTokens` reduces a full taxon name
// to its first word's stemmed token(s); `groupTaxa` clusters a list of
// names into token-overlap groups, used to line up equivalent taxa across
// two conditions even when they're logged at different ranks.
const SUFFIXES = ['aceae', 'ales', 'ineae', 'eae', 'ium', 'ia', 'us', 'um', 'es', 'ae', 'a']

export function stem(word) {
  let a = word
  for (const suf of SUFFIXES) {
    if (a.length > suf.length + 3 && a.endsWith(suf)) {
      a = a.slice(0, -suf.length)
      break
    }
  }
  if (a.length > 4 && a.endsWith('i')) a = a.slice(0, -1)
  return a
}

export function looseTokens(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .split(/\s+/)[0]
    .split(/[-/]/)
    .map((t) => stem(t.replace(/[^a-z]/g, '')))
    .filter(Boolean)
}

export function groupTaxa(names, loose) {
  const groups = []
  for (const name of names) {
    const tokens = loose ? looseTokens(name) : [name.toLowerCase().trim()]
    let matches = groups.filter((g) => tokens.some((tok) => g.tokens.has(tok)))
    let g
    if (matches.length === 0) {
      g = { tokens: new Set(), names: [], label: name }
      groups.push(g)
    } else {
      g = matches[0]
      for (const other of matches.slice(1)) {
        other.tokens.forEach((tok) => g.tokens.add(tok))
        other.names.forEach((nm) => {
          if (!g.names.includes(nm)) g.names.push(nm)
        })
        if (other.label.length < g.label.length) g.label = other.label
      }
      const dropped = matches
      for (let i = groups.length - 1; i >= 0; i--) {
        if (groups[i] !== g && dropped.includes(groups[i])) groups.splice(i, 1)
      }
    }
    tokens.forEach((tok) => g.tokens.add(tok))
    if (!g.names.includes(name)) g.names.push(name)
    if (name.length < g.label.length) g.label = name
  }
  return groups
}
