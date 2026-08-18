import { ID_CROSSWALK } from './idCrosswalk'

// How many DISTINCT PAPERS back one entry?
//
// Mirrors scripts/check_citation_coverage.py, deliberately: if the badge and
// the audit disagree, one of them is lying. Three things that pass for
// citations here are not identifiers, and each one produced a real false
// positive before it was handled:
//
//   PMC6421268 vs PMID 30915065  - one paper, two namespaces. 57 entries cite
//                                  both, and would look corroborated.
//   "115", "20-22"               - orphaned bibliography numbers pointing at a
//                                  reference list that no longer exists.
//   ?abstract_id=5101530         - somebody else's numbering inside a URL.
//
// Identifiers are read from the note as well as the ref: a citation a reader
// can see in the popup is a citation.

const DOI_URL = /(?:doi\.org\/|dx\.doi\.org\/)(10\.\d{4,9}\/[^\s"'<>)\]]+)/gi
const DOI_TEXT = /\b(10\.\d{4,9}\/[^\s"'<>,;)\]]+)/g
const PMC_ANY = /\bPMC\s*(\d{5,9})\b/gi
const PMID_LABELLED = /\bPMID\s*[:#]?\s*(\d{4,9})\b/gi
const PMID_URL = /pubmed\.ncbi\.nlm\.nih\.gov\/(\d{4,9})/g
const PMID_BARE = /(?<![\w/.-])(\d{7,9})(?![\w/.-])/g
const URL_SPAN = /\bhttps?:\/\/\S+|\bwww\.\S+/g
const DOI_VIEW_SUFFIX = /(?:\/(?:full|abstract|pdf|html?|text|meta|citation|epub|download))+$/i
const DOI_PREPRINT_VERSION = /^(10\.1101\/.+?)v\d+$/i

const blank = (m) => ' '.repeat(m.length)

function normaliseDoi(raw) {
  let doi = raw.replace(/[.,;)]+$/, '')
  doi = doi.replace(DOI_VIEW_SUFFIX, '')
  doi = doi.replace(DOI_PREPRINT_VERSION, '$1')
  return `DOI:${doi.toLowerCase()}`
}

export function extractIds(text) {
  const found = new Set()
  if (!text) return found

  for (const m of text.matchAll(DOI_URL)) found.add(normaliseDoi(m[1]))
  let masked = text.replace(DOI_URL, blank)
  for (const m of masked.matchAll(DOI_TEXT)) found.add(normaliseDoi(m[1]))
  masked = masked.replace(DOI_TEXT, blank)

  for (const m of masked.matchAll(PMC_ANY)) found.add(`PMC${m[1]}`)
  masked = masked.replace(PMC_ANY, blank)

  for (const m of masked.matchAll(PMID_LABELLED)) found.add(`PMID:${m[1]}`)
  masked = masked.replace(PMID_LABELLED, blank)
  for (const m of masked.matchAll(PMID_URL)) found.add(`PMID:${m[1]}`)
  masked = masked.replace(PMID_URL, blank)
  // Bare digits only count outside a URL - everything a URL can carry has
  // already been taken above.
  masked = masked.replace(URL_SPAN, blank)
  for (const m of masked.matchAll(PMID_BARE)) found.add(`PMID:${m[1]}`)

  return found
}

/** Every scrap of citation text on a condition taxon or a symptom link. */
function citationText(entry) {
  const parts = [entry?.refs, entry?.ref, entry?.note, entry?.url]
  for (const link of entry?.links || []) parts.push(link?.label, link?.url)
  return parts.filter(Boolean).join(' \n')
}

/** Distinct papers backing this entry, after collapsing aliases. */
export function sourceCount(entry) {
  const works = new Set()
  for (const id of extractIds(citationText(entry))) works.add(ID_CROSSWALK[id] || id)
  return works.size
}
