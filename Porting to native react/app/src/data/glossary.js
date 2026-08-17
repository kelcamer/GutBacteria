// Ported verbatim from `GFA_GLOSSARY` in gut-flora-atlas.readable.html
// (~line 27096-27115). Plain array of [term, definition] pairs.
export const GLOSSARY = [
  [
    "SCFA (short-chain fatty acid)",
    "Small molecules like butyrate, acetate and propionate that fiber-fermenting gut bacteria produce. They feed colon cells directly, help hold the gut barrier together, and calm inflammation — a taxon marked as an 'SCFA producer' is usually a good one to have around."
  ],
  [
    "Butyrate",
    "The single most-studied SCFA. The main fuel source for the cells lining your colon; low butyrate output is linked across most of the inflammatory conditions in this app."
  ],
  [
    "LPS (lipopolysaccharide) / endotoxin",
    "A molecule from the outer wall of certain bacteria (mostly Gram-negative, Proteobacteria-type taxa). If it leaks into the bloodstream through a weakened gut barrier it triggers a strong immune/inflammatory response — this is the mechanism behind most 'dysbiosis-bloom → systemic inflammation' claims in this app."
  ],
  [
    "Dysbiosis",
    "A catch-all term for a gut microbial community that's out of its usual healthy balance — could mean lower diversity, a bloom of normally-rare taxa, or loss of key protective species. It's a description, not a specific diagnosis."
  ],
  [
    "Pathobiont",
    "A microbe that lives in the gut peacefully most of the time, but can turn harmful and drive inflammation when the community around it is disrupted — different from an outright pathogen, which is harmful by nature."
  ],
  [
    "Mucin-degrader",
    "A bacterium (Akkermansia muciniphila is the classic example) that eats the mucus layer lining your gut. In small amounts this is normal and even barrier-supportive; if the mucus layer isn't being replenished fast enough, the same behavior can thin the barrier."
  ],
  [
    "Facultative anaerobe",
    "A bacterium that can survive with or without oxygen. Blooms of these (e.g. Enterobacteriaceae, Proteobacteria) are a classic sign of gut inflammation, since inflamed gut tissue leaks a bit of oxygen that these species can exploit but strict anaerobes can't."
  ],
  [
    "Phylum / genus / species",
    "The taxonomy zoom levels used throughout this app, from broadest to narrowest — e.g. phylum Firmicutes → genus Ruminococcus → species Ruminococcus gnavus. A finding at one level doesn't necessarily apply to the others; this app tries to cite at the most specific level the evidence actually supports."
  ],
  [
    "Alpha-diversity",
    "A measure of how many different species live in one person's gut, and how evenly balanced they are. Lower alpha-diversity shows up in many disease states, but it's a blunt signal — two guts with identical diversity scores can look completely different taxon-by-taxon."
  ],
  [
    "Firmicutes/Bacteroidetes (F/B) ratio",
    "An older, once-popular obesity biomarker. Included here specifically to flag that large re-analyses (e.g. Sze & Schloss 2016) couldn't reproduce it — this app avoids leaning on it as evidence."
  ],
  [
    "Meta-analysis",
    "A study that statistically pools the results of many individual studies into one combined estimate — generally stronger evidence than any single study, though it inherits the weaknesses of whatever it's built from."
  ],
  [
    "Mendelian randomization (MR)",
    "A statistical method that uses naturally-occurring genetic variation as a stand-in for a controlled experiment, letting researchers estimate whether a microbe *causes* a trait rather than just tagging along with it. Stronger than plain correlation, but still not a randomized clinical trial — treat MR findings as promising, not proven."
  ],
  [
    "Gut-brain axis",
    "The two-way signalling network between gut microbes and the brain, running through the vagus nerve, immune signalling, and microbial metabolites (like SCFAs and neurotransmitter precursors). The mechanistic basis for most of this app's neuropsychiatric conditions."
  ],
  [
    "Gut-skin axis",
    "The same idea applied to skin — gut inflammation and microbial metabolites can influence skin conditions like acne and psoriasis at a distance, without the bacteria ever touching the skin directly."
  ],
  [
    "Endotoxemia",
    "Having detectable levels of bacterial endotoxin (LPS) circulating in the bloodstream — normally kept out by a healthy gut barrier. A common downstream consequence of the 'leaky gut' mechanism."
  ],
  [
    "Histamine intolerance",
    "A mismatch between how much histamine the gut is producing/absorbing and how fast the body can break it down (via the enzyme DAO). Certain gut bacteria (Morganella, Klebsiella aerogenes) are unusually efficient histamine producers and can push someone over that threshold."
  ],
  [
    "PMID / PMC / DOI",
    "Different ways papers get identified online. PMID is PubMed's own ID; PMC is PubMed Central's free-full-text ID (not every paper has one); DOI is a universal identifier used across all of academic publishing, not just biomedicine. This app tries to link every citation to one of these directly, rather than to a search page."
  ],
  [
    "FUT2 (Non-secretor)",
    "A genetic trait (not a disease) where someone doesn't secrete certain sugar molecules into their gut lining, which changes which bacteria can attach and thrive there — included in this app as its own 'condition' because it reliably reshapes the microbiome regardless of disease status."
  ]
]
