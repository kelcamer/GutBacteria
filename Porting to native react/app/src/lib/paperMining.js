// Ported verbatim from gut-flora-atlas.readable.html (~line 16274-16432,
// 159 lines across several small functions) - the Find-in-Papers pipeline:
// query Europe PMC, split each result into sentences, tag cue words
// (up/down vocabulary) and taxon-name mentions, then pair each mention
// with its nearest relevant cue to produce a ranked "proposal" list. Used
// only by FindInPapersTab.jsx (`Zm`).
//
// Minified name map: Mm=EUROPE_PMC_URL, Rm=searchPapers, Tm/Em=up/down cue
// word strings, Nm=CAVEAT_PHRASES, Gf=wordSet, Wu/Om=UP_WORDS/DOWN_WORDS,
// zm=TAXON_GAZETTEER, Um=splitSentences, qm=tokenizeWords,
// bm=extractFromPaper, Hm=isConnectorSpan, _m=extractFindings.

const EUROPE_PMC_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search'

export async function searchPapers(query, { newest = false, size = 40 } = {}) {
  const params = new URLSearchParams({ query, resultType: 'core', pageSize: String(size), format: 'json', synonym: 'false' })
  if (newest) params.set('sort', 'P_PDATE_D desc')
  let res
  try {
    res = await fetch(`${EUROPE_PMC_URL}?${params}`)
  } catch {
    throw new Error(
      "Couldn't reach Europe PMC. Check your connection — and note that opening this file straight from disk blocks some network requests. Serving it from a web address fixes that."
    )
  }
  if (!res.ok) throw new Error(`Europe PMC returned ${res.status}. Try again in a moment.`)
  const clean = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const results = ((await res.json()).resultList?.result || []).map((d) => ({
    pmid: d.pmid || null,
    title: clean(d.title),
    abstract: clean(d.abstractText),
    journal: d.journalInfo?.journal?.title || '',
    year: d.pubYear || '',
  }))
  const seen = new Set()
  return results.filter((d) => {
    const key = (d.pmid || d.title).toLowerCase()
    if (seen.has(key) || !d.abstract) return false
    seen.add(key)
    return true
  })
}

const UP_WORDS_TEXT =
  'increase increased increases increasing elevated elevation higher greater enriched enrichment enrich abundant overabundance overrepresented expansion expanded overgrowth bloom upregulated raised rise risen more predominant predominance'
const DOWN_WORDS_TEXT =
  'decrease decreased decreases decreasing reduced reduction reduce lower diminished depleted depletion deplete loss lost lack lacking fewer less scarce scarcity declined decline deficient deficiency underrepresented absent'

const CAVEAT_PHRASES = [
  ['healthy control', 'stated relative to controls'],
  ['healthy subject', 'stated relative to controls'],
  ['healthy volunteer', 'stated relative to controls'],
  ['compared with control', 'stated relative to controls'],
  ['compared to control', 'stated relative to controls'],
  ['versus control', 'stated relative to controls'],
  ['supplementation', 'may describe a treatment effect'],
  ['probiotic', 'may describe a treatment effect'],
  ['prebiotic', 'may describe a treatment effect'],
  ['intervention', 'may describe a treatment effect'],
  ['after treatment', 'may describe a treatment effect'],
  ['administration', 'may describe a treatment effect'],
  ['mice', 'animal model'],
  ['mouse', 'animal model'],
  ['rat ', 'animal model'],
  ['murine', 'animal model'],
  ['germ-free', 'animal model'],
  ['in vitro', 'not an in vivo finding'],
  ['no significant', 'reported as non-significant'],
  ['not significant', 'reported as non-significant'],
  ['no difference', 'reported as null'],
]

const wordSet = (text) => new Set(text.split(/\s+/))
const UP_WORDS = wordSet(UP_WORDS_TEXT)
const DOWN_WORDS = wordSet(DOWN_WORDS_TEXT)

// A gazetteer of common gut-microbiome taxon/clade names, searched for in
// abstract text IN ADDITION TO the user's own already-logged taxa - lets
// the miner surface genuinely new taxa the user doesn't track yet, not
// just confirm ones they already have.
const TAXON_GAZETTEER = [
  'Firmicutes', 'Bacteroidetes', 'Bacteroidota', 'Actinobacteria', 'Proteobacteria', 'Verrucomicrobia',
  'Fusobacteria', 'Tenericutes', 'Euryarchaeota', 'Cyanobacteria', 'Lachnospiraceae', 'Ruminococcaceae',
  'Prevotellaceae', 'Bacteroidaceae', 'Enterobacteriaceae', 'Bifidobacteriaceae', 'Lactobacillaceae',
  'Veillonellaceae', 'Christensenellaceae', 'Rikenellaceae', 'Erysipelotrichaceae', 'Peptostreptococcaceae',
  'Clostridiaceae', 'Coriobacteriaceae', 'Akkermansiaceae', 'Desulfovibrionaceae', 'Streptococcaceae',
  'Eggerthellaceae', 'Oscillospiraceae', 'Sutterellaceae', 'Barnesiellaceae', 'Tannerellaceae', 'Clostridiales',
  'Bacteroidales', 'Lactobacillales', 'Bifidobacteriales', 'Selenomonadales', 'Bacteroides', 'Prevotella',
  'Faecalibacterium', 'Roseburia', 'Blautia', 'Coprococcus', 'Ruminococcus', 'Bifidobacterium', 'Lactobacillus',
  'Akkermansia', 'Alistipes', 'Anaerostipes', 'Clostridium', 'Collinsella', 'Dorea', 'Dialister', 'Eubacterium',
  'Escherichia', 'Shigella', 'Streptococcus', 'Veillonella', 'Megasphaera', 'Megamonas', 'Haemophilus',
  'Sutterella', 'Parasutterella', 'Odoribacter', 'Oscillospira', 'Oscillibacter', 'Subdoligranulum', 'Agathobacter',
  'Butyricicoccus', 'Butyrivibrio', 'Lachnoclostridium', 'Lachnospira', 'Holdemanella', 'Holdemania',
  'Turicibacter', 'Hungatella', 'Phascolarctobacterium', 'Parabacteroides', 'Barnesiella', 'Butyricimonas',
  'Bilophila', 'Desulfovibrio', 'Fusobacterium', 'Enterococcus', 'Klebsiella', 'Citrobacter', 'Proteus',
  'Salmonella', 'Helicobacter', 'Campylobacter', 'Peptostreptococcus', 'Romboutsia', 'Intestinibacter',
  'Terrisporobacter', 'Flavonifractor', 'Gemmiger', 'Anaerotruncus', 'Coprobacillus', 'Catenibacterium',
  'Mitsuokella', 'Succinivibrio', 'Slackia', 'Eggerthella', 'Adlercreutzia', 'Gordonibacter', 'Atopobium',
  'Actinomyces', 'Rothia', 'Granulicatella', 'Anaerococcus', 'Finegoldia', 'Peptoniphilus', 'Varibaculum',
  'Methanobrevibacter', 'Christensenella', 'Marvinbryantia', 'Pseudobutyrivibrio', 'Sarcina', 'Solobacterium',
  'Erysipelatoclostridium', 'Ruthenibacterium', 'Akkermansia muciniphila', 'Faecalibacterium prausnitzii',
  'Bacteroides fragilis', 'Bacteroides vulgatus', 'Escherichia coli', 'Clostridioides difficile',
  'Clostridium difficile', 'Bifidobacterium longum', 'Bifidobacterium breve', 'Bifidobacterium bifidum',
  'Lactobacillus rhamnosus', 'Lactobacillus reuteri', 'Lactobacillus plantarum', 'Roseburia intestinalis',
  'Eubacterium rectale', 'Prevotella copri', 'Ruminococcus gnavus', 'Bacteroides uniformis', 'Blautia wexlerae',
  'Alistipes putredinis', 'Desulfovibrio piger',
]

function splitSentences(text) {
  return (String(text || '').replace(/\s+/g, ' ').match(/[^.;?!]+[.;?!]?/g) || [])
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
}

function tokenizeWords(text) {
  const out = []
  const re = /[A-Za-z][A-Za-z-]*/g
  let m
  while ((m = re.exec(text)) !== null) out.push({ w: m[0].toLowerCase(), i: m.index })
  return out
}

// True when the span between a cue word and a taxon mention is just
// connector filler ("and", "as well as", "relative abundance of", ...) -
// used to prefer a cue that's directly attached to the mention over a
// merely-nearby one.
function isConnectorSpan(sentence, cueEnd, mentionStart, mentions) {
  if (mentionStart <= cueEnd || mentionStart - cueEnd > 220) return false
  let span = sentence.slice(cueEnd, mentionStart)
  for (const m of mentions) {
    if (m.idx >= cueEnd && m.end <= mentionStart) span = span.replace(sentence.slice(m.idx, m.end), ' ')
  }
  return /^[\s,;]*(?:(?:and|or|as well as|along with|together with|also)[\s,;]*)*$/i.test(
    span.replace(/\b(?:relative|abundance|levels?|counts?|the|of|in|a|an|were|was|and)\b/gi, ' ')
  )
}

// Scans one paper's title+abstract sentence by sentence, pairing each
// candidate taxon mention (from `names`, the gazetteer plus the caller's
// own tracked taxa) with its nearest relevant up/down cue word, and
// collecting caveat flags (animal model, treatment effect, non-significant,
// etc.) from CAVEAT_PHRASES.
function extractFromPaper(paper, names) {
  const findings = []
  const text = `${paper.title}. ${paper.abstract}`
  for (const sentence of splitSentences(text)) {
    const lower = sentence.toLowerCase()
    const cues = tokenizeWords(sentence).filter((t) => UP_WORDS.has(t.w) || DOWN_WORDS.has(t.w))
    if (!cues.length) continue
    const flags = CAVEAT_PHRASES.filter(([phrase]) => lower.includes(phrase)).map(([, flag]) => flag)
    const mentions = []
    for (const name of names) {
      const idx = lower.indexOf(name.toLowerCase())
      if (idx === -1) continue
      const end = idx + name.length
      if (!mentions.some((m) => idx < m.end && end > m.idx)) mentions.push({ taxon: name, idx, end })
    }
    for (const mention of mentions) {
      const ranked = cues.map((c) => ({ ...c, d: Math.abs(c.i - mention.idx) })).sort((a, b) => a.d - b.d)
      if (!ranked.length) continue
      const attached = cues
        .filter((c) => c.i < mention.idx)
        .sort((a, b) => b.i - a.i)
        .find((c) => isConnectorSpan(sentence, c.i + c.w.length, mention.idx, mentions))
      const nearest = ranked[0]
      const chosen = attached || nearest
      if (!attached && nearest.d > 160) continue
      const dir = UP_WORDS.has(chosen.w) ? 'up' : 'down'
      const opposing = ranked.find((c) => (UP_WORDS.has(c.w) ? 'up' : 'down') !== dir)
      const opposingDist = opposing ? Math.abs(opposing.i - mention.idx) : Infinity
      const chosenDist = Math.abs(chosen.i - mention.idx)
      const contested = !attached && opposing && opposingDist < Math.max(chosenDist * 1.6, chosenDist + 12)
      findings.push({
        taxon: mention.taxon,
        dir,
        sentence,
        cue: chosen.w,
        flags: [...new Set(contested ? [...flags, 'two directions compete in this sentence'] : flags)],
        paper,
      })
    }
  }
  const seen = new Set()
  return findings.filter((f) => {
    const key = f.taxon + f.dir
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Runs extractFromPaper across every search result and aggregates into a
// ranked list of (taxon, direction) "proposals" - one per unique pair,
// carrying every supporting sentence as `evidence`, sorted by cleanest
// (fewest caveat flags) then most-supported.
export function extractFindings(papers, trackedNames) {
  const names = [...new Set([...TAXON_GAZETTEER, ...trackedNames])].sort((a, b) => b.length - a.length)
  const byKey = new Map()
  for (const paper of papers) {
    for (const finding of extractFromPaper(paper, names)) {
      const key = finding.taxon.toLowerCase() + '|' + finding.dir
      if (!byKey.has(key)) byKey.set(key, { taxon: finding.taxon, dir: finding.dir, evidence: [] })
      byKey.get(key).evidence.push(finding)
    }
  }
  return [...byKey.values()]
    .map((f) => ({
      ...f,
      papers: f.evidence.length,
      flags: [...new Set(f.evidence.flatMap((e) => e.flags))],
      clean: f.evidence.filter((e) => e.flags.length === 0).length,
    }))
    .sort((a, b) => b.clean - a.clean || b.papers - a.papers || a.taxon.localeCompare(b.taxon))
}
