// Ported verbatim from `Vf` in gut-flora-atlas.readable.html (~line 16211).
// Guesses a taxonomic rank from name-suffix conventions, for the small
// rank badge (G/S/F/O/P) shown next to taxon names throughout the app.
export function taxonRank(name) {
  const raw = String(name || '').trim()
  const lower = raw.toLowerCase()
  if (lower.endsWith('aceae')) return { code: 'F', label: 'family' }
  if (lower.endsWith('ales')) return { code: 'O', label: 'order' }
  if (/(cutes|detes|bacteria|microbia|mycetes|chaetes)$/.test(lower)) return { code: 'P', label: 'phylum' }
  if (/\s/.test(raw) && !/^\S+\s+\d+$/.test(raw)) return { code: 'S', label: 'species' }
  return { code: 'G', label: 'genus' }
}
