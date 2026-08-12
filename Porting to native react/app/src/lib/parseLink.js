import { makeId } from './id'

// Ported verbatim from `Bm` in gut-flora-atlas.readable.html (~line 16255).
// A bare 5-9 digit number is treated as a PMID and turned into a real
// PubMed link automatically; anything else is treated as a URL (https://
// prepended if missing), with the label falling back to the hostname.
export function parseLink(rawInput, rawLabel) {
  const value = String(rawInput || '').trim()
  if (!value) return null

  if (/^\d{5,9}$/.test(value)) {
    return {
      id: makeId(),
      label: rawLabel?.trim() || `PMID ${value}`,
      url: `https://pubmed.ncbi.nlm.nih.gov/${value}/`,
    }
  }

  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`
  let hostname = 'link'
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    // leave hostname as the "link" fallback - matches the original's bare catch{}
  }
  return { id: makeId(), label: rawLabel?.trim() || hostname, url }
}
