// Collapse species nodes into their genus, on demand.
//
// WHY THIS EXISTS, AND WHY IT IS NOW ON BY DEFAULT
// ------------------------------------------------
// Asked for because the map kept splitting one question in half: FUT2 attaches
// to the genus Faecalibacterium (measured in colonic mucosa) while the HMO
// interventions attach to F. prausnitzii (measured in stool), so the two halves
// never met on screen and it read as a bug.
//
// Merging them permanently would be worse than the problem. Across this dataset
// there are 13 genus/species groups, 92 places where a genus and one of its own
// species make a claim about the same symptom, and **37 of those 92 point in
// OPPOSITE directions** - 40%. Bacteroides vs B. vulgatus disagree about FUT2
// itself; Ruminococcus vs R. gnavus disagree about anxiety, sleep, brain fog and
// six more; Akkermansia vs A. muciniphila disagree about seven symptoms. A
// permanently merged node would have to paint a single arrow over that, and
// would be wrong roughly half the time it mattered.
//
// So the merge never invents an arrow: when members disagree the merged claim is
// rendered CONTESTED ("both") rather than picking a winner, and nothing is quietly
// averaged away. That safeguard is what makes it defensible as the default, which
// it now is by explicit request - two dots for one organism at two ranks was the
// most persistent complaint about these maps. The toggle still ungroups, and the
// banner names which genera contain disagreeing members.
//
// Note the numbers above move as the data improves: after the FUT2 rank work,
// Faecalibacterium and F. prausnitzii agree on 26 of their 28 overlapping claims.
//
// HOW ATTRIBUTION SURVIVES
// ------------------------
// Every merged claim names the member it came from, in the note text - which is
// what the popup renders, so attribution shows up with no changes to the map
// engine at all. A merged claim built from a disagreement leads with the
// disagreement, then gives each member's own evidence in full.

const DIR_ARROW = { up: '▲', down: '▼', both: '↔', none: '○' }

// The genus is the first whitespace-delimited word. That is how rank is encoded
// in this dataset - there is no rank field to consult. Names with no space
// ("Escherichia/Shigella", "Lachnospiraceae") are their own group of one and are
// left exactly as they are.
// A real binomial species: Capitalised genus + a lowercase epithet. Excludes
// "Family XIII" (roman-numeral placeholder) and "Prevotella 9" (cluster number).
const STRICT_SPECIES = /^[A-Z][a-z]+\s+[a-z][a-z-]+$/
function genusOf(name) {
  return String(name || '').split(' ')[0]
}

/**
 * @param {{symptoms: string[], bacteria: object[]}} data - already study-filtered
 * @returns {{data: object, summary: {groups: number, merged: number, conflicts: number, conflictNames: string[]}}}
 */
export function groupByGenus(data) {
  const bacteria = data?.bacteria || []
  const buckets = new Map()
  for (const b of bacteria) {
    const g = genusOf(b.name)
    if (!buckets.has(g)) buckets.set(g, [])
    buckets.get(g).push(b)
  }

  const out = []
  let merged = 0
  const conflictNames = []

  for (const [genus, members] of buckets) {
    if (members.length === 1) {
      const only = members[0]
      // A lone species with no bare-genus sibling is shown AT its genus, so it
      // connects to genus-level entries the same way the condition maps do.
      // Its own name is kept in the popup via a genus-level relabel note.
      if (STRICT_SPECIES.test(only.name) && genus !== only.name) {
        out.push({
          ...only,
          name: genus,
          _speciesOrigin: only.name,
        })
      } else {
        out.push(only)
      }
      continue
    }
    merged++
    // symptom -> [{member, dir, note, ref, url, derived}]
    const claims = new Map()
    for (const m of members) {
      for (const dir of ['up', 'down', 'both', 'none']) {
        for (const e of m[dir] || []) {
          if (!claims.has(e.symptom)) claims.set(e.symptom, [])
          claims.get(e.symptom).push({ member: m.name, dir, ...e })
        }
      }
    }

    const node = { name: genus, count: 0, up: [], down: [], both: [], none: [] }
    let conflicted = 0
    const memberList = members.map((m) => m.name).join(', ')

    for (const [symptom, rows] of claims) {
      // "none" (tested, no reliable effect) is not an opposing direction - it is the
      // absence of one. A member reporting nothing does not contradict a member
      // reporting a decrease, it is just weaker evidence about the same organism.
      // Counting it as disagreement turned a careful grey + down pair into yellow,
      // which is exactly the overloading the grey state was added to end. So a
      // directional member wins over a null one, and the merged claim is only
      // "none" when every member is.
      const directional = rows.filter((r) => r.dir !== 'none')
      const voting = directional.length ? directional : rows
      const dirs = new Set(voting.map((r) => r.dir))
      const disagrees = dirs.size > 1
      if (disagrees) conflicted++

      // Every member is still shown, including the null ones - they are part of the
      // picture even when they do not set the arrow.
      const perMember = rows
        .map((r) => `[${r.member} ${DIR_ARROW[r.dir] || r.dir}] ${r.note || '(no note)'}`)
        .join('  ||  ')

      const members = [...new Set(rows.map((r) => r.member))]
      const header = disagrees
        ? `Contested — members disagree (${rows.map((r) => `${r.member} ${r.dir}`).join(' vs ')}). Turn off Group by genus to separate them. `
        : members.length > 1
          ? `Genus group of ${members.join(', ')}. `
          : "" 

      const dir = disagrees ? 'both' : voting[0].dir
      node[dir].push({
        symptom,
        note: header + perMember,
        ref: [...new Set(rows.map((r) => r.ref).filter(Boolean))].join('  |  '),
        url: rows.find((r) => r.url)?.url,
        // Only inferred if EVERY contributing claim was inferred - otherwise a
        // real measurement would vanish behind the crossfeeding filter.
        derived: rows.every((r) => r.derived),
        // Kept structured as well as in prose so this is queryable later.
        groupedFrom: rows.map((r) => ({ member: r.member, dir: r.dir })),
      })
      node.count++
    }

    if (conflicted) conflictNames.push(`${genus} (${conflicted})`)
    // Surfaced on the node itself so the map can warn without re-deriving it.
    node.groupSummary = {
      members: members.length,
      memberList,
      conflicted,
    }
    out.push(node)
  }

  return {
    data: { ...data, bacteria: out },
    summary: {
      groups: buckets.size,
      merged,
      conflicts: conflictNames.length,
      conflictNames,
    },
  }
}
