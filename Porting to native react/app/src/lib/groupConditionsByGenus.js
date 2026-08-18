// Genus grouping for the CONDITION (seed_data) shape, the sibling of
// groupByGenus.js which does the same for the symptom (bacteria) shape. Both
// are driven by the one "Group by genus?" setting so every node map behaves
// the same way.
//
// What it does: within each condition, taxa that share a genus (Faecalibacterium
// and F. prausnitzii) collapse into a single taxon named for the genus. Because
// the merged node takes the genus NAME, conditions studied at genus level and
// conditions studied at species level then land on the SAME node in every map
// that keys taxa by name - which is exactly why iron deficiency (F. prausnitzii)
// and a bare-Faecalibacterium condition connect only when this is on.
//
// The contested/null logic is copied from groupByGenus so the two can never
// disagree: a directional member outvotes a null one, members pointing opposite
// ways render as contested rather than picking a winner, and a merge is only
// 'derived' when every member was.

const DIR_ARROW = { up: '▲', down: '▼', both: '↔', none: '○' }

// A species name has a genus word + an epithet that isn't a bare cluster number.
function isSpecies(name) {
  // Capitalised genus + lowercase epithet only. Excludes "Family XIII",
  // "Prevotella 9", family/order names.
  return /^[A-Z][a-z]+\s+[a-z][a-z-]+$/.test(String(name || '').trim())
}

function genusOf(name) {
  return String(name || '').split(' ')[0]
}

function mergeTaxa(genus, members) {
  const directional = members.filter((t) => t.dir !== 'none')
  const voting = directional.length ? directional : members
  const dirs = new Set(voting.map((t) => t.dir))
  const disagrees = dirs.size > 1
  const dir = disagrees ? 'both' : voting[0].dir

  const perMember = members
    .map((t) => `[${t.name} ${DIR_ARROW[t.dir] || t.dir}] ${t.note || '(no note)'}`)
    .join('  ||  ')
  const distinct = [...new Set(members.map((t) => t.name))]
  const header = disagrees
    ? `Contested — members disagree (${members.map((t) => `${t.name} ${t.dir}`).join(' vs ')}). Turn off Group by genus to separate them. `
    : distinct.length > 1
      ? `Genus group of ${distinct.join(', ')}. `
      : "" 

  const links = []
  const seen = new Set()
  for (const t of members) {
    for (const l of t.links || []) {
      if (l.url && seen.has(l.url)) continue
      if (l.url) seen.add(l.url)
      links.push(l)
    }
  }

  return {
    id: members[0].id + '__genus',
    name: genus,
    dir,
    note: header + perMember,
    refs: [...new Set(members.map((t) => t.refs).filter(Boolean))].join('  |  '),
    links,
    // Only inferred if EVERY member was, so a real measurement never vanishes
    // behind the crossfeeding filter.
    derived: members.every((t) => t.derived),
    evidence: members.find((t) => t.evidence && t.evidence !== 'unclassified')?.evidence
      || members[0].evidence,
    population: members[0].population,
    groupedFrom: members.map((t) => ({ member: t.name, dir: t.dir })),
  }
}

// Group one condition's taxa by genus. Returns a new condition object; the input
// is not mutated.
export function groupConditionTaxa(condition) {
  if (!condition || !Array.isArray(condition.taxa)) return condition
  const buckets = new Map()
  for (const t of condition.taxa) {
    const g = genusOf(t.name)
    if (!buckets.has(g)) buckets.set(g, [])
    buckets.get(g).push(t)
  }
  let changed = false
  const taxa = []
  for (const [g, members] of buckets) {
    if (members.length === 1) {
      const t = members[0]
      if (isSpecies(t.name) && g !== t.name) {
        // Shown at genus level so this species connects to bare-genus entries in
        // other conditions. Name becomes the genus; the note keeps the species.
        taxa.push({
          ...t,
          name: g,
          note: `Shown at genus level; the evidence is for ${t.name} specifically. ` + (t.note || ''),
          groupedFrom: [{ member: t.name, dir: t.dir }],
        })
        changed = true
      } else {
        taxa.push(t)
      }
    } else {
      taxa.push(mergeTaxa(g, members))
      changed = true
    }
  }
  return changed ? { ...condition, taxa } : condition
}

// Accepts one condition or an array, matching filterConditions.
export function groupConditionsByGenus(input) {
  if (!input) return input
  if (!Array.isArray(input)) return groupConditionTaxa(input)
  let changed = false
  const out = input.map((c) => {
    const g = groupConditionTaxa(c)
    if (g !== c) changed = true
    return g
  })
  return changed ? out : input
}
