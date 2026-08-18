// Originally extracted programmatically (JSON round-trip) from
// `GFA_BRAIN_DATA` in gut-flora-atlas.readable.html (~line 17513-20537, 20
// entries) - one entry per condition, each with a `taxa` list where every
// "taxon" is actually a brain region name (matched against
// BRAIN_REGION_INFO) plus dir/refs/note/links, same shape as a Condition's
// taxa array so it can reuse buildMap.
//
// `brain_estrogen` (21st entry, added directly in this file rather than
// the original minified source, which never had it) is not a diagnosed
// condition like the rest - it tracks brain regions where estradiol
// level/menstrual-cycle phase/menopausal status/hormone therapy showed a
// significant human-neuroimaging effect (PET/fMRI/SPECT/SPET), 18 taxa
// across 17 distinct PMIDs, every one verified directly against Europe
// PMC's REST API before use (not taken from search-result summaries).
export const BRAIN_DATA = [
  {
    "id": "brain_asd",
    "name": "Autism",
    "abbr": "ASD",
    "color": "#B57BFF",
    "note": "Task-based fMRI. Shared findings vs ADHD come from a large 2024 meta-analysis (243 studies, 2,654 ASD/3,084 ADHD/6,795 controls) that deliberately matched cognitive task types across the two diagnoses to isolate disorder-specific signal; disorder-specific activations were more prominent than shared ones.",
    "links": [
      {
        "id": "brain_asd_l1",
        "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
      },
      {
        "id": "brain_asd_l2",
        "label": "ALE meta-analysis, World J Biol Psychiatry 2025 (PMID 39815640)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/39815640/"
      },
      {
        "id": "brain_asd_l3",
        "label": "Lukito et al. 2020, Psychological Medicine — comparative meta-analysis of cognitive control in ADHD vs. ASD (PMID 32216846)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/32216846/"
      },
      {
        "id": "brain_asd_l4",
        "label": "Kim et al. 2022, Autism Research — 24 ASD vs. 27 typically-developing children, pupillometry + ERP (PMID 36164264)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/36164264/"
      },
      {
        "id": "brain_asd_l5",
        "label": "Noel et al. 2018 meta-analysis + ABIDE cohort (n=681), Biological Psychiatry — cerebellar volume null finding (PMID 29146048)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/29146048/"
      }
    ],
    "taxa": [
      {
        "id": "brain_asd_t1",
        "name": "Lingual gyrus",
        "dir": "up",
        "refs": "PMID 38685858",
        "note": "Shared greater activation in both ASD and ADHD vs typically developing controls, across matched cognitive tasks.",
        "links": [
          {
            "id": "brain_asd_t1_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t2",
        "name": "Gyrus rectus",
        "dir": "up",
        "refs": "PMID 38685858",
        "note": "Shared greater activation in both ASD and ADHD vs controls.",
        "links": [
          {
            "id": "brain_asd_t2_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t3",
        "name": "Middle frontal gyrus",
        "dir": "down",
        "refs": "PMID 38685858",
        "note": "Shared lower activation in both ASD and ADHD vs controls.",
        "links": [
          {
            "id": "brain_asd_t3_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t4",
        "name": "Parahippocampal gyrus",
        "dir": "down",
        "refs": "PMID 38685858",
        "note": "Shared lower activation in both ASD and ADHD vs controls.",
        "links": [
          {
            "id": "brain_asd_t4_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t5",
        "name": "Insula",
        "dir": "down",
        "refs": "PMID 38685858",
        "note": "Shared lower activation in both ASD and ADHD vs controls.",
        "links": [
          {
            "id": "brain_asd_t5_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t6",
        "name": "Middle temporal gyrus",
        "dir": "both",
        "refs": "PMID 38685858",
        "note": "Genuinely lateralized in the same meta-analysis: greater activation on the left (k=620) but lower activation on the right (k=525) — not a simple up-or-down effect.",
        "links": [
          {
            "id": "brain_asd_t6_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t7",
        "name": "Amygdala",
        "dir": "down",
        "refs": "PMID 39815640",
        "note": "ALE meta-analysis of 22 fMRI studies (539 ASD, 502 typically-developing) found typically-developing participants showed increased left amygdala activity during facial emotion processing that ASD participants did not. A separate, larger ASD-vs-ADHD meta-analysis (Tamon et al. 2024) independently corroborates the lower-activation direction (left amygdala, x=-24,y=0,z=-12).",
        "links": [
          {
            "id": "brain_asd_t7_l1",
            "label": "ALE meta-analysis, World J Biol Psychiatry 2025 (PMID 39815640)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39815640/"
          },
          {
            "id": "brain_asd_t7_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t8",
        "name": "Cerebellum",
        "dir": "both",
        "refs": "PMID 39815640",
        "note": "Increased right cerebellum (lobule VI) task-based activation during facial emotion processing (ALE meta-analysis) — but this is a narrow, task-specific functional finding, not a general structural claim. Separately, an earlier literature meta-analysis found a weak, borderline-significant increase in overall cerebellar VOLUME (p=.049 uncorrected) — but this did NOT replicate when tested directly in a large sample of 681 subjects from the ABIDE database, a null result the authors attribute to publication bias in the smaller underpowered studies. Marked \"both\" to keep this null finding visible rather than only showing the positive result.",
        "links": [
          {
            "id": "brain_asd_t8_l1",
            "label": "ALE meta-analysis, World J Biol Psychiatry 2025 (PMID 39815640)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39815640/"
          },
          {
            "id": "brain_asd_t8_l2",
            "label": "Noel et al. 2018 meta-analysis + ABIDE cohort (n=681), Biological Psychiatry — cerebellar volume null finding (PMID 29146048)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29146048/"
          }
        ]
      },
      {
        "id": "brain_asd_t9",
        "name": "Medial prefrontal cortex",
        "dir": "down",
        "refs": "PMID 42017052",
        "note": "Reduced long-range functional connectivity, part of the default mode network's 'exteroceptive level' (self-other differentiation), per a 2026 systematic review of 49 fMRI/sMRI studies.",
        "links": [
          {
            "id": "brain_asd_t9_l1",
            "label": "Systematic review, Psychoradiology 2026 (PMID 42017052)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/42017052/"
          }
        ]
      },
      {
        "id": "brain_asd_t10",
        "name": "Posterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 42017052",
        "note": "Decreased functional connectivity and interhemispheric coherence, part of the DMN's 'mental level' (reflective self-processing), in the same 2026 systematic review.",
        "links": [
          {
            "id": "brain_asd_t10_l1",
            "label": "Systematic review, Psychoradiology 2026 (PMID 42017052)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/42017052/"
          }
        ]
      },
      {
        "id": "brain_asd_t11",
        "name": "Anterior cingulate cortex",
        "dir": "both",
        "refs": "PMID 42017052",
        "note": "Decreased functional connectivity alongside PCC, implicating atypical reflective self-processing within the default mode network (2026 systematic review). A separate ASD-vs-ADHD meta-analysis (Tamon et al. 2024) independently found a genuine dissociation within the ACC itself — greater activation at one coordinate (x=-2,y=36,z=24) and lower activation at another (x=0,y=38,z=20) during emotional/reward tasks.",
        "links": [
          {
            "id": "brain_asd_t11_l1",
            "label": "Systematic review, Psychoradiology 2026 (PMID 42017052)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/42017052/"
          },
          {
            "id": "brain_asd_t11_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t12",
        "name": "Orbitofrontal cortex",
        "dir": "up",
        "refs": "PMID 32216846",
        "note": "Overactivation in left ventrolateral PFC/OFC during cognitive control (z=1.14, p=0.0009) — an ASD-differentiating finding vs. ADHD in the same comparative meta-analysis, not shared between the two conditions.",
        "links": [
          {
            "id": "brain_asd_t12_l1",
            "label": "Lukito et al. 2020, Psychological Medicine — comparative meta-analysis of cognitive control in ADHD vs. ASD (PMID 32216846)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32216846/"
          }
        ]
      },
      {
        "id": "brain_asd_t13",
        "name": "Locus Coeruleus",
        "dir": "both",
        "refs": "PMID 36164264",
        "note": "Children with ASD showed increased tonic (resting pupil diameter, t(47)=2.27, p=0.03, d=0.64) but reduced phasic (event-related) LC-norepinephrine activity vs. typically-developing peers — a genuine dual-direction finding by measure type, not a contradiction. Small sample (n=24 vs. 27); the authors themselves note these measures correlated more with ADHD symptom severity than ASD symptom severity, and found no association with ASD symptomatology specifically.",
        "links": [
          {
            "id": "brain_asd_t13_l1",
            "label": "Kim et al. 2022, Autism Research — 24 ASD vs. 27 typically-developing children, pupillometry + ERP (PMID 36164264)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36164264/"
          }
        ]
      },
      {
        "id": "brain_asd_t14",
        "name": "Putamen",
        "dir": "up",
        "refs": "PMID 38685858",
        "note": "ASD-specific greater activation (left putamen, x=-26,y=-10,z=8) in the same task-matched ASD-vs-ADHD meta-analysis used for this condition's other shared/specific entries — not shared with ADHD.",
        "links": [
          {
            "id": "brain_asd_t14_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t15",
        "name": "Hippocampus",
        "dir": "both",
        "refs": "PMID 38685858",
        "note": "A genuine within-study dissociation at two different right-hippocampus coordinates in the same meta-analysis: greater activation at one subregion (x=30,y=-36,z=4) alongside lower activation at another (x=24,y=-4,z=-20) — not a simple up-or-down effect.",
        "links": [
          {
            "id": "brain_asd_t15_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t16",
        "name": "Inferior parietal lobule",
        "dir": "up",
        "refs": "PMID 38685858",
        "note": "ASD-specific greater activation, the second-largest cluster in the same meta-analysis (k=591) — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_asd_t16_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t17",
        "name": "Superior temporal gyrus",
        "dir": "down",
        "refs": "PMID 38685858",
        "note": "Shared lower activation in both ASD and ADHD vs. controls, in the same meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_asd_t17_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_asd_t18",
        "name": "Dorsolateral prefrontal cortex",
        "dir": "up",
        "refs": "PMID 32216846",
        "note": "ASD-differentiating (vs. ADHD) increased right gray matter volume (z≥1.64, p≤0.002, 1,445 ASD/1,477 controls) in the same comparative meta-analysis already used for this condition's Orbitofrontal cortex entry — a new region added to this app's brain-region list, directly relevant to the frontoparietal network shared across Autism, ADHD, and OCD.",
        "links": [
          {
            "id": "brain_asd_t18_l1",
            "label": "Lukito et al. 2020, Psychol Med — comparative meta-analysis, 86 VBM + 60 fMRI datasets (PMID 32216846)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32216846/"
          }
        ]
      },
      {
        "id": "brain_asd_t19",
        "name": "Ventrolateral prefrontal cortex",
        "dir": "up",
        "refs": "PMID 32216846",
        "note": "ASD-differentiating (vs. ADHD) overactivation (bilateral) during cognitive-control tasks in the same meta-analysis.",
        "links": [
          {
            "id": "brain_asd_t19_l1",
            "label": "Lukito et al. 2020, Psychol Med — comparative meta-analysis, 86 VBM + 60 fMRI datasets (PMID 32216846)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32216846/"
          }
        ]
      },
      {
        "id": "brain_asd_t20",
        "name": "Globus pallidus",
        "dir": "both",
        "refs": "",
        "note": "No overall volume difference vs. controls (n=373 ASD/384 controls), but surface-based shape analysis found real signal: bilateral dorsal medial globus pallidus surface area positively correlated with restricted/repetitive behavior (RRB) severity, and pallidal shape showed a steeper increase in concavity with age in ASD. Structure-vs-shape dissociation, not a simple volume finding — marked \"both\" to preserve the null overall-volume result alongside the real shape/RRB correlation.",
        "links": [
          {
            "id": "brain_asd_t20_l1",
            "label": "Neuropsychopharmacology 2016, n=373 ASD/384 controls (PMID 27125303)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27125303/"
          }
        ]
      },
      {
        "id": "brain_asd_t21",
        "name": "Thalamus",
        "dir": "both",
        "refs": "",
        "note": "No overall volume difference vs. controls (n=373 ASD/384 controls), but surface-based analysis found expanded surface area in the right posterior thalamus and a more concave shape in the left mediodorsal nucleus in ASD. Structure-vs-shape dissociation — marked \"both\" to preserve the null overall-volume result alongside the real shape finding, consistent with this app's convention for surface/shape-only signals.",
        "links": [
          {
            "id": "brain_asd_t21_l1",
            "label": "Neuropsychopharmacology 2016, n=373 ASD/384 controls (PMID 27125303)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27125303/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_adhd",
    "name": "ADHD",
    "abbr": "ADHD",
    "color": "#FFA62B",
    "note": "Task-based fMRI, from the same matched 243-study meta-analysis used for Autism above — worth comparing the two side by side on this map. ADHD's amygdala finding runs in the opposite direction from Autism's, a genuine reported contrast, not a data error.",
    "links": [
      {
        "id": "brain_adhd_l1",
        "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
      },
      {
        "id": "brain_adhd_t8_condl1",
        "label": "Arnsten 2009, J Pediatr (PMID 20596295)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/20596295/"
      },
      {
        "id": "brain_adhd_l3",
        "label": "Yu et al. 2023 meta-analysis, Frontiers in Psychiatry — 29 structural + 36 functional studies (PMID 36683981)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/36683981/"
      },
      {
        "id": "brain_adhd_l4",
        "label": "Sutcubasi et al. 2020 meta-analysis — 20 studies, 944 ADHD patients vs. 1,121 controls (PMID 32468880)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/32468880/"
      },
      {
        "id": "brain_adhd_l5",
        "label": "Drescher et al. 2026, Imaging Neuroscience — 27 ADHD vs. 28 controls, direct LC fMRI (PMID 41993143)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41993143/"
      },
      {
        "id": "brain_adhd_l6",
        "label": "Chen et al. 2025 meta-analysis, Prog Neuropsychopharmacol Biol Psychiatry — largest ADHD neuroimaging meta-analysis to date: 21 functional studies (595 vs. 564) + 50 structural studies (1,907 vs. 1,611) (PMID 39615871)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/39615871/"
      }
    ],
    "taxa": [
      {
        "id": "brain_adhd_t1",
        "name": "Lingual gyrus",
        "dir": "up",
        "refs": "PMID 38685858",
        "note": "Shared greater activation in both ADHD and ASD vs typically developing controls.",
        "links": [
          {
            "id": "brain_adhd_t1_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t2",
        "name": "Gyrus rectus",
        "dir": "up",
        "refs": "PMID 38685858",
        "note": "Shared greater activation in both ADHD and ASD vs controls.",
        "links": [
          {
            "id": "brain_adhd_t2_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t3",
        "name": "Middle frontal gyrus",
        "dir": "down",
        "refs": "PMID 38685858",
        "note": "Shared lower activation in both ADHD and ASD vs controls.",
        "links": [
          {
            "id": "brain_adhd_t3_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t4",
        "name": "Parahippocampal gyrus",
        "dir": "both",
        "refs": "PMID 38685858",
        "note": "A task-matched ADHD-vs-ASD comparison found shared lower activation in both conditions (Tamon 2024) — but a much larger, more recent multimodal meta-analysis (21 functional studies, 595 vs. 564 controls) found increased resting-state functional activity in the right parahippocampal gyrus in ADHD specifically. Marked \"both\" given the genuine conflict between a task-based comparative study and a larger resting-state meta-analysis — different paradigms, not necessarily a resolved contradiction.",
        "links": [
          {
            "id": "brain_adhd_t4_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          },
          {
            "id": "brain_adhd_t3_l2",
            "label": "Chen et al. 2025 meta-analysis, Prog Neuropsychopharmacol Biol Psychiatry — largest ADHD neuroimaging meta-analysis to date: 21 functional studies (595 vs. 564) + 50 structural studies (1,907 vs. 1,611) (PMID 39615871)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39615871/"
          }
        ]
      },
      {
        "id": "brain_adhd_t5",
        "name": "Insula",
        "dir": "both",
        "refs": "PMID 38685858",
        "note": "The abstract of this meta-analysis frames insula as part of the shared-lower-activation set, but the paper's own detailed results report a specific, coordinate-backed ADHD-specific GREATER activation cluster in the right insula (x=34,y=14,z=8, k=627) — a genuine tension within the same source that we preserve rather than silently pick one side of.",
        "links": [
          {
            "id": "brain_adhd_t5_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t6",
        "name": "Amygdala",
        "dir": "up",
        "refs": "PMID 38685858",
        "note": "ADHD-specific greater activation, not shared with ASD — the opposite direction from Autism's amygdala finding on this same map.",
        "links": [
          {
            "id": "brain_adhd_t6_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t7",
        "name": "Globus pallidus",
        "dir": "down",
        "refs": "PMID 38685858",
        "note": "ADHD-specific lower activation, not shared with ASD.",
        "links": [
          {
            "id": "brain_adhd_t7_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t8",
        "name": "Prefrontal cortex",
        "dir": "down",
        "refs": "PMID 20596295",
        "note": "Weaker PFC activation while regulating attention and behavior, especially right-hemisphere circuits — from a foundational review of ADHD prefrontal neurobiology.",
        "links": [
          {
            "id": "brain_adhd_t8_l1",
            "label": "Arnsten 2009, J Pediatr (PMID 20596295)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20596295/"
          }
        ]
      },
      {
        "id": "brain_adhd_t9",
        "name": "Anterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 36683981",
        "note": "Decreased gray matter volume (bilateral ACC/median cingulate/superior frontal gyrus) in ADHD vs. controls — structural (VBM) finding from a meta-analysis of 29 studies, 1,211 ADHD patients vs. 1,032 controls.",
        "links": [
          {
            "id": "brain_adhd_t9_l1",
            "label": "Yu et al. 2023 meta-analysis, Frontiers in Psychiatry — 29 structural + 36 functional studies (PMID 36683981)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36683981/"
          }
        ]
      },
      {
        "id": "brain_adhd_t10",
        "name": "Cerebellum",
        "dir": "up",
        "refs": "PMID 36683981",
        "note": "Increased task-state fMRI activation in the left cerebellar hemisphere/lobule in ADHD vs. controls — functional (activity), not structural; the same meta-analysis found no structural cerebellar difference.",
        "links": [
          {
            "id": "brain_adhd_t10_l1",
            "label": "Yu et al. 2023 meta-analysis, Frontiers in Psychiatry — 29 structural + 36 functional studies (PMID 36683981)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36683981/"
          }
        ]
      },
      {
        "id": "brain_adhd_t11",
        "name": "Medial prefrontal cortex",
        "dir": "down",
        "refs": "PMID 36683981",
        "note": "Functional hypoactivation in the medial superior frontal gyrus (a medial PFC subregion) in ADHD vs. controls — same meta-analysis used for this condition's other entries (29 structural + 36 functional studies, 1,211 ADHD patients vs. 1,032 controls). Mapped from the closest matching region reported, not an exact anatomical label match.",
        "links": [
          {
            "id": "brain_adhd_t11_l1",
            "label": "Yu et al. 2023 meta-analysis, Frontiers in Psychiatry — 29 structural + 36 functional studies (PMID 36683981)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36683981/"
          }
        ]
      },
      {
        "id": "brain_adhd_t12",
        "name": "Middle temporal gyrus",
        "dir": "both",
        "refs": "PMID 36683981",
        "note": "Genuinely mixed by hemisphere and subgroup in the same meta-analysis: right middle temporal gyrus showed overactivation specifically in the adult ADHD subgroup, while the overall (all-ages) functional comparison found hypoactivation in the left middle/inferior temporal gyrus. Marked \"both\" rather than picking one side.",
        "links": [
          {
            "id": "brain_adhd_t12_l1",
            "label": "Yu et al. 2023 meta-analysis, Frontiers in Psychiatry — 29 structural + 36 functional studies (PMID 36683981)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36683981/"
          }
        ]
      },
      {
        "id": "brain_adhd_t13",
        "name": "Posterior cingulate cortex",
        "dir": "both",
        "refs": "PMID 32468880",
        "note": "Reduced within-network connectivity at the default-mode network's core (PCC) seed in ADHD — a system-neuroscience meta-analysis of 20 studies, 944 ADHD patients vs. 1,121 controls. Functional connectivity finding, not structural. A separate ASD-vs-ADHD meta-analysis (Tamon et al. 2024) found the opposite direction — ADHD-specific greater task activation (x=6,y=-50,z=10, k=203) — a genuine connectivity-vs-activation dissociation (reduced resting-state network connectivity vs. increased task-evoked activation), not a simple contradiction.",
        "links": [
          {
            "id": "brain_adhd_t13_l1",
            "label": "Sutcubasi et al. 2020 meta-analysis — 20 studies, 944 ADHD patients vs. 1,121 controls (PMID 32468880)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32468880/"
          },
          {
            "id": "brain_adhd_t13_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t14",
        "name": "Locus Coeruleus",
        "dir": "down",
        "refs": "PMID 41993143",
        "note": "Resting-interval LC BOLD activity significantly lower in ADHD adults (F(1,53)=7.017, p=.011) — a direct fMRI measurement of the LC itself, not a peripheral proxy. Event-related (task) LC activity showed no group difference.",
        "links": [
          {
            "id": "brain_adhd_t14_l1",
            "label": "Drescher et al. 2026, Imaging Neuroscience — 27 ADHD vs. 28 controls, direct LC fMRI (PMID 41993143)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41993143/"
          }
        ]
      },
      {
        "id": "brain_adhd_t15",
        "name": "Orbitofrontal cortex",
        "dir": "both",
        "refs": "PMID 39615871",
        "note": "A genuine structure-vs-function dissociation, not a study-vs-study contradiction: reduced gray matter volume (structural) but increased resting-state functional activity (functional), both in the same large meta-analysis (bilateral OFC, 21 functional + 50 structural studies pooled).",
        "links": [
          {
            "id": "brain_adhd_t15_l1",
            "label": "Chen et al. 2025 meta-analysis, Prog Neuropsychopharmacol Biol Psychiatry — largest ADHD neuroimaging meta-analysis to date: 21 functional studies (595 vs. 564) + 50 structural studies (1,907 vs. 1,611) (PMID 39615871)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39615871/"
          }
        ]
      },
      {
        "id": "brain_adhd_t18",
        "name": "Putamen",
        "dir": "both",
        "refs": "PMID 39615871",
        "note": "Reduced gray matter volume (right, extending to right superior temporal gyrus). A separate ASD-vs-ADHD meta-analysis (Tamon et al. 2024) found the opposite direction — ADHD-specific greater functional activation (x=20,y=2,z=2, k=406) — a genuine structure-vs-function dissociation (structural GMV reduction vs. functional task-activation increase), not a study-vs-study contradiction.",
        "links": [
          {
            "id": "brain_adhd_pnn_Putamen",
            "label": "Chen et al. 2025 meta-analysis, Prog Neuropsychopharmacol Biol Psychiatry — largest ADHD neuroimaging meta-analysis to date: 21 functional studies (595 vs. 564) + 50 structural studies (1,907 vs. 1,611) (PMID 39615871)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39615871/"
          },
          {
            "id": "brain_adhd_t18_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t19",
        "name": "Inferior frontal gyrus",
        "dir": "down",
        "refs": "PMID 39615871",
        "note": "Reduced gray matter volume (left).",
        "links": [
          {
            "id": "brain_adhd_pnn_Inferior_frontal_gyrus",
            "label": "Chen et al. 2025 meta-analysis, Prog Neuropsychopharmacol Biol Psychiatry — largest ADHD neuroimaging meta-analysis to date: 21 functional studies (595 vs. 564) + 50 structural studies (1,907 vs. 1,611) (PMID 39615871)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39615871/"
          }
        ]
      },
      {
        "id": "brain_adhd_t20",
        "name": "Superior frontal gyrus",
        "dir": "down",
        "refs": "PMID 39615871",
        "note": "Reduced gray matter volume (right).",
        "links": [
          {
            "id": "brain_adhd_pnn_Superior_frontal_gyrus",
            "label": "Chen et al. 2025 meta-analysis, Prog Neuropsychopharmacol Biol Psychiatry — largest ADHD neuroimaging meta-analysis to date: 21 functional studies (595 vs. 564) + 50 structural studies (1,907 vs. 1,611) (PMID 39615871)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39615871/"
          }
        ]
      },
      {
        "id": "brain_adhd_t21",
        "name": "Precentral gyrus",
        "dir": "down",
        "refs": "PMID 39615871",
        "note": "Reduced gray matter volume — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_adhd_pnn_Precentral_gyrus",
            "label": "Chen et al. 2025 meta-analysis, Prog Neuropsychopharmacol Biol Psychiatry — largest ADHD neuroimaging meta-analysis to date: 21 functional studies (595 vs. 564) + 50 structural studies (1,907 vs. 1,611) (PMID 39615871)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39615871/"
          }
        ]
      },
      {
        "id": "brain_adhd_t22",
        "name": "Median cingulate cortex",
        "dir": "down",
        "refs": "PMID 39615871",
        "note": "Decreased resting-state functional activity, alongside PCC and ACC in the same bilateral cingulate cluster.",
        "links": [
          {
            "id": "brain_adhd_mcc",
            "label": "Chen et al. 2025 meta-analysis, Prog Neuropsychopharmacol Biol Psychiatry — largest ADHD neuroimaging meta-analysis to date: 21 functional studies (595 vs. 564) + 50 structural studies (1,907 vs. 1,611) (PMID 39615871)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39615871/"
          }
        ]
      },
      {
        "id": "brain_adhd_t23",
        "name": "Midbrain",
        "dir": "up",
        "refs": "PMID 38685858",
        "note": "ADHD-specific greater activation in the same ASD-vs-ADHD meta-analysis used for this condition's other Tamon-sourced entries — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_adhd_t23_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t24",
        "name": "Thalamus",
        "dir": "down",
        "refs": "PMID 38685858",
        "note": "ADHD-specific lower activation (left thalamus, x=-8,y=-16,z=0) in the same meta-analysis.",
        "links": [
          {
            "id": "brain_adhd_t24_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t25",
        "name": "Superior temporal gyrus",
        "dir": "down",
        "refs": "PMID 38685858",
        "note": "Shared lower activation in both ADHD and ASD vs. controls, in the same meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_adhd_t25_l1",
            "label": "Tamon et al. 2024, Am J Psychiatry (PMID 38685858)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38685858/"
          }
        ]
      },
      {
        "id": "brain_adhd_t26",
        "name": "Inferior parietal lobule",
        "dir": "down",
        "refs": "PMID 36683981",
        "note": "Smaller gray matter volume (bilateral) in ADHD, per this review's discussion of a prior meta-analysis (Jagger-Rickels et al.) and corroborated by Seidman et al.'s independent finding of smaller inferior parietal cortex GMV in adults with ADHD vs. controls — same review used for this condition's other structural entries.",
        "links": [
          {
            "id": "brain_adhd_t26_l1",
            "label": "Yu et al. 2022, Front Psychiatry (PMID 36683981)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36683981/"
          }
        ]
      },
      {
        "id": "brain_adhd_t27",
        "name": "Dorsolateral prefrontal cortex",
        "dir": "down",
        "refs": "PMID 23247506",
        "note": "Reduced activation (right) for attention specifically in medication-naive patients (normalized with long-term stimulant treatment) — a 171 ADHD/178 controls meta-analysis, part of the dorsal attention network alongside thalamus and inferior parietal cortex. A new region added to this app's brain-region list, directly relevant to the frontoparietal/dorsal-attention network shared across ADHD, Autism, and OCD.",
        "links": [
          {
            "id": "brain_adhd_t27_l1",
            "label": "Hart et al. 2013, JAMA Psychiatry — 171 ADHD/178 controls, attention-task meta-analysis (PMID 23247506)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23247506/"
          }
        ]
      },
      {
        "id": "brain_adhd_t28",
        "name": "Hippocampus",
        "dir": "down",
        "refs": "",
        "note": "Smaller volume in ADHD vs. controls (Cohen's d=-0.11 overall; larger in children d=-0.12 vs. adults d=-0.06, suggesting developmental delay pattern) — ENIGMA-ADHD mega-analysis, n=1,713 ADHD/1,529 controls, 23 sites.",
        "links": [
          {
            "id": "brain_adhd_t28_l1",
            "label": "Hoogman et al. 2017, ENIGMA-ADHD, n=1,713/1,529 (PMID 28219628)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28219628/"
          }
        ]
      },
      {
        "id": "brain_adhd_t29",
        "name": "Nucleus accumbens",
        "dir": "down",
        "refs": "",
        "note": "Smaller volume in ADHD vs. controls (Cohen's d=-0.15 overall; larger in children d=-0.19 vs. adults d=-0.10, suggesting developmental delay pattern) — same ENIGMA-ADHD mega-analysis as Hippocampus above.",
        "links": [
          {
            "id": "brain_adhd_t29_l1",
            "label": "Hoogman et al. 2017, ENIGMA-ADHD, n=1,713/1,529 (PMID 28219628)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28219628/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_ocd",
    "name": "OCD",
    "abbr": "OCD",
    "color": "#33C7E8",
    "note": "Symptom-provocation task fMRI (patients exposed to OCD-relevant triggers vs neutral stimuli), voxel-based ALE meta-analysis of 12 studies (238 OCD patients, 219 healthy controls), plus a pediatric performance-monitoring study. Each region below is labeled by which OCD symptom domain it's most tied to in the classic and updated circuit models: orbitofrontal cortex and dorsal ACC generate the “something is wrong” threat/error signal behind intrusive thoughts (obsessions); the striatum (caudate, putamen) and ventral medial frontal cortex drive the habitual, repetitive checking/correcting behavior performed to neutralize that signal (compulsions); inferior frontal gyrus relates to the difficulty stopping a compulsion once started. Insula and middle occipital gyrus don't map cleanly to one domain in the source studies and are left unlabeled rather than force-fit.",
    "links": [
      {
        "id": "brain_ocd_l1",
        "label": "Voxel-based meta-analysis, J Psychiatr Res 2022 (PMID 34971910)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/34971910/"
      },
      {
        "id": "brain_ocd_t7_condl1",
        "label": "Fitzgerald et al. 2010, Biol Psychiatry (PMID 20947065)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/20947065/"
      },
      {
        "id": "brain_ocd_t8_condl1",
        "label": "Fitzgerald et al. 2010, Biol Psychiatry (PMID 20947065)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/20947065/"
      },
      {
        "id": "brain_ocd_condl4",
        "label": "Milad & Rauch 2012, Trends Cogn Sci (PMID 22138231)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/22138231/"
      }
    ],
    "taxa": [
      {
        "id": "brain_ocd_t1",
        "name": "Caudate nucleus",
        "dir": "both",
        "refs": "PMID 34971910",
        "note": "Compulsions: higher activation (right caudate body) during symptom provocation vs healthy controls. Striatal regions like the caudate drive the habitual, repetitive checking/correcting behavior performed in response to obsessive anxiety. A separate, much larger frontoparietal-network-focused meta-analysis (Yu et al. 2024) found the opposite direction — decreased regional homogeneity (bilateral caudate body, left caudate head) — genuinely mixed, preserved rather than resolved.",
        "links": [
          {
            "id": "brain_ocd_t1_l1",
            "label": "Voxel-based meta-analysis, J Psychiatr Res 2022 (PMID 34971910)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34971910/"
          },
          {
            "id": "brain_ocd_t1_l1",
            "label": "Yu et al. 2024 — voxel-based meta-analysis of frontoparietal network in OCD, 31 studies, 1,359 OCD/1,360 controls (PMID 39041046)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39041046/"
          }
        ]
      },
      {
        "id": "brain_ocd_t2",
        "name": "Putamen",
        "dir": "up",
        "refs": "PMID 34971910",
        "note": "Compulsions: higher activation (right putamen) during symptom provocation — striatal, same habitual-behavior role as the caudate.",
        "links": [
          {
            "id": "brain_ocd_t2_l1",
            "label": "Voxel-based meta-analysis, J Psychiatr Res 2022 (PMID 34971910)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34971910/"
          }
        ]
      },
      {
        "id": "brain_ocd_t3",
        "name": "Insula",
        "dir": "up",
        "refs": "PMID 34971910",
        "note": "Not domain-specific in this study: higher activation (right insula) during symptom provocation — the opposite direction from Autism/ADHD's insula finding on this map. Often discussed in relation to disgust/contamination-themed obsessions specifically, but this study doesn't isolate that subtype. Independently corroborated by the same 2024 frontoparietal-network meta-analysis (left insula, increased regional activity).",
        "links": [
          {
            "id": "brain_ocd_t3_l1",
            "label": "Voxel-based meta-analysis, J Psychiatr Res 2022 (PMID 34971910)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34971910/"
          },
          {
            "id": "brain_ocd_t3_l1",
            "label": "Yu et al. 2024 — voxel-based meta-analysis of frontoparietal network in OCD, 31 studies, 1,359 OCD/1,360 controls (PMID 39041046)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39041046/"
          }
        ]
      },
      {
        "id": "brain_ocd_t4",
        "name": "Orbitofrontal cortex",
        "dir": "both",
        "refs": "PMID 34971910",
        "note": "Obsessions: lower activation (left OFC) during symptom provocation vs healthy controls. The OFC evaluates whether something is “wrong” or requires action — dysfunction here is tied to the harm/contamination appraisal that generates intrusive thoughts. A separate, larger meta-analysis of emotional processing specifically (571 OCD patients vs. 564 controls, Thorsen et al. 2018) found the opposite direction — increased OFC activation extending into the ACC and ventromedial PFC — a genuine task-type dissociation (symptom-provocation/appraisal vs. general emotional-stimulus processing), not a simple contradiction.",
        "links": [
          {
            "id": "brain_ocd_t4_l1",
            "label": "Voxel-based meta-analysis, J Psychiatr Res 2022 (PMID 34971910)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34971910/"
          },
          {
            "id": "brain_ocd_t4_l1",
            "label": "Thorsen et al. 2018, Biol Psychiatry Cogn Neurosci Neuroimaging (PMID 29550459)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29550459/"
          }
        ]
      },
      {
        "id": "brain_ocd_t5",
        "name": "Inferior frontal gyrus",
        "dir": "both",
        "refs": "PMID 34971910",
        "note": "Compulsions: lower activation (left IFG) during symptom provocation. The IFG supports response inhibition — stopping an action once started — so reduced activity here relates to difficulty interrupting a compulsion mid-behavior, not to generating the initial intrusive thought. A separate, much larger frontoparietal-network-focused meta-analysis (31 studies, 1,359 OCD/1,360 controls, Yu et al. 2024) found the opposite direction — increased regional activity (left, BA47) — alongside independently corroborating the decreased-connectivity direction (left, BA44). Genuinely mixed across measure types, preserved rather than resolved.",
        "links": [
          {
            "id": "brain_ocd_t5_l1",
            "label": "Voxel-based meta-analysis, J Psychiatr Res 2022 (PMID 34971910)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34971910/"
          },
          {
            "id": "brain_ocd_t5_l1",
            "label": "Yu et al. 2024 — voxel-based meta-analysis of frontoparietal network in OCD, 31 studies, 1,359 OCD/1,360 controls (PMID 39041046)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39041046/"
          }
        ]
      },
      {
        "id": "brain_ocd_t6",
        "name": "Middle occipital gyrus",
        "dir": "down",
        "refs": "PMID 34971910",
        "note": "Not domain-specific: lower activation during symptom provocation, in a general visual-processing region without a clear tie to obsessions or compulsions specifically.",
        "links": [
          {
            "id": "brain_ocd_t6_l1",
            "label": "Voxel-based meta-analysis, J Psychiatr Res 2022 (PMID 34971910)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34971910/"
          }
        ]
      },
      {
        "id": "brain_ocd_t7",
        "name": "Dorsal anterior cingulate cortex",
        "dir": "up",
        "refs": "PMID 20947065",
        "note": "Obsessions: greater activation during performance-monitoring fMRI tasks in pediatric OCD patients vs matched healthy youth, with greater activation predicting worse task performance. Dorsal ACC generates the error/threat-detection signal (“something is wrong”) that underlies intrusive, anxiety-provoking thoughts.",
        "links": [
          {
            "id": "brain_ocd_t7_l1",
            "label": "Fitzgerald et al. 2010, Biol Psychiatry (PMID 20947065)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20947065/"
          }
        ]
      },
      {
        "id": "brain_ocd_t8",
        "name": "Ventral medial frontal cortex",
        "dir": "up",
        "refs": "PMID 20947065",
        "note": "Compulsions: healthy controls deactivated this region during performance monitoring, whereas pediatric OCD patients activated it — a reversal of the typical pattern, in the same study. Ties to checking-type compulsions specifically, since the task is about monitoring whether an action was performed correctly.",
        "links": [
          {
            "id": "brain_ocd_t8_l1",
            "label": "Fitzgerald et al. 2010, Biol Psychiatry (PMID 20947065)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20947065/"
          }
        ]
      },
      {
        "id": "brain_ocd_t9",
        "name": "Middle frontal gyrus",
        "dir": "up",
        "refs": "PMID 18787662",
        "note": "Bilateral activation during symptom provocation (BA 11 and BA 9 clusters), the most concordant finding across the 8 included studies — a new region added to this app's brain-region list. Notably the opposite direction from ADHD/ASD's own middle-frontal-gyrus finding on this map (down in both).",
        "links": [
          {
            "id": "brain_ocd_t9_l1",
            "label": "Rotge et al. 2008, J Psychiatry Neurosci (PMID 18787662)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18787662/"
          }
        ]
      },
      {
        "id": "brain_ocd_t10",
        "name": "Globus pallidus",
        "dir": "up",
        "refs": "PMID 18787662",
        "note": "Bilateral external globus pallidus activation during symptom provocation, in the same meta-analysis — the opposite direction from ADHD's globus pallidus finding on this map (down).",
        "links": [
          {
            "id": "brain_ocd_t10_l1",
            "label": "Rotge et al. 2008, J Psychiatry Neurosci (PMID 18787662)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18787662/"
          }
        ]
      },
      {
        "id": "brain_ocd_t11",
        "name": "Thalamus",
        "dir": "up",
        "refs": "PMID 18787662",
        "note": "Right thalamus activation during symptom provocation, in the same meta-analysis — a new region added to this app's brain-region list. Independently corroborated by the same 2024 frontoparietal-network meta-analysis (increased connectivity, right thalamus).",
        "links": [
          {
            "id": "brain_ocd_t11_l1",
            "label": "Rotge et al. 2008, J Psychiatry Neurosci (PMID 18787662)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18787662/"
          },
          {
            "id": "brain_ocd_t11_l1",
            "label": "Yu et al. 2024 — voxel-based meta-analysis of frontoparietal network in OCD, 31 studies, 1,359 OCD/1,360 controls (PMID 39041046)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39041046/"
          }
        ]
      },
      {
        "id": "brain_ocd_t12",
        "name": "Hippocampus",
        "dir": "up",
        "refs": "PMID 18787662",
        "note": "Left hippocampus activation during symptom provocation, in the same meta-analysis.",
        "links": [
          {
            "id": "brain_ocd_t12_l1",
            "label": "Rotge et al. 2008, J Psychiatry Neurosci (PMID 18787662)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18787662/"
          }
        ]
      },
      {
        "id": "brain_ocd_t13",
        "name": "Amygdala",
        "dir": "up",
        "refs": "PMID 29550459",
        "note": "Bilateral amygdala hyperactivation during emotional processing (571 OCD patients vs. 564 controls, seed-based d mapping meta-analysis) — most pronounced in unmedicated patients.",
        "links": [
          {
            "id": "brain_ocd_t13_l1",
            "label": "Thorsen et al. 2018, Biol Psychiatry Cogn Neurosci Neuroimaging (PMID 29550459)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29550459/"
          }
        ]
      },
      {
        "id": "brain_ocd_t14",
        "name": "Middle temporal gyrus",
        "dir": "up",
        "refs": "PMID 29550459",
        "note": "Increased activation during emotional processing, in the same meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_ocd_t14_l1",
            "label": "Thorsen et al. 2018, Biol Psychiatry Cogn Neurosci Neuroimaging (PMID 29550459)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29550459/"
          }
        ]
      },
      {
        "id": "brain_ocd_t15",
        "name": "Posterior cingulate cortex",
        "dir": "both",
        "refs": "PMID 18787662",
        "note": "Right posterior cingulate (BA 29) activation during symptom provocation, from a sensitivity-analysis subset of the same Rotge et al. 2008 meta-analysis used for this condition's other entries — a smaller, marginal cluster (<10 mm3), included here for completeness rather than as a primary finding. A much larger, more robust frontoparietal-network meta-analysis (Yu et al. 2024, 1,359 OCD/1,360 controls) found the opposite direction — decreased regional homogeneity (right, BA29/30) — this newer, larger finding should be weighted more heavily than the small sensitivity-analysis cluster this entry was originally based on; both preserved as \"both\" given the genuine tension.",
        "links": [
          {
            "id": "brain_ocd_t15_l1",
            "label": "Rotge et al. 2008, J Psychiatry Neurosci (PMID 18787662)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18787662/"
          },
          {
            "id": "brain_ocd_t15_l1",
            "label": "Yu et al. 2024 — voxel-based meta-analysis of frontoparietal network in OCD, 31 studies, 1,359 OCD/1,360 controls (PMID 39041046)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39041046/"
          }
        ]
      },
      {
        "id": "brain_ocd_t16",
        "name": "Dorsolateral prefrontal cortex",
        "dir": "down",
        "refs": "PMID 39041046",
        "note": "Decreased functional connectivity (bilateral, BA9/46) in a 31-study frontoparietal-network-focused meta-analysis (1,359 OCD/1,360 controls) — the largest OCD neuroimaging meta-analysis on this map, and a direct hit on the frontoparietal network's core executive-control hub. A new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_ocd_t16_l1",
            "label": "Yu et al. 2024 — voxel-based meta-analysis of frontoparietal network in OCD, 31 studies, 1,359 OCD/1,360 controls (PMID 39041046)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39041046/"
          }
        ]
      },
      {
        "id": "brain_ocd_t17",
        "name": "Superior temporal gyrus",
        "dir": "up",
        "refs": "PMID 39041046",
        "note": "Increased regional activity (left, BA38) in the same 31-study meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_ocd_t17_l1",
            "label": "Yu et al. 2024 — voxel-based meta-analysis of frontoparietal network in OCD, 31 studies, 1,359 OCD/1,360 controls (PMID 39041046)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39041046/"
          }
        ]
      },
      {
        "id": "brain_ocd_t18",
        "name": "Precentral gyrus",
        "dir": "down",
        "refs": "PMID 39041046",
        "note": "Decreased functional connectivity (right, BA9) in the same 31-study meta-analysis.",
        "links": [
          {
            "id": "brain_ocd_t18_l1",
            "label": "Yu et al. 2024 — voxel-based meta-analysis of frontoparietal network in OCD, 31 studies, 1,359 OCD/1,360 controls (PMID 39041046)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39041046/"
          }
        ]
      },
      {
        "id": "brain_ocd_t19",
        "name": "Precuneus",
        "dir": "both",
        "refs": "PMID 39041046",
        "note": "A genuine within-study measure-type dissociation: decreased regional activity (ALFF, right, BA7) but increased regional homogeneity (ReHo, bilateral) in the same 31-study meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_ocd_t19_l1",
            "label": "Yu et al. 2024 — voxel-based meta-analysis of frontoparietal network in OCD, 31 studies, 1,359 OCD/1,360 controls (PMID 39041046)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39041046/"
          }
        ]
      },
      {
        "id": "brain_ocd_t20",
        "name": "Cerebellum",
        "dir": "both",
        "refs": "",
        "note": "Genuine contradiction depending on measurement granularity: an earlier multicenter mega-analysis (n=412 OCD/368 controls) found GREATER overall bilateral cerebellar gray matter volume (PMID 24220667), while the more recent ENIGMA-OCD subregional mega-analysis (n=1,954 OCD/2,091 controls, 22 sites) found SMALLER volumes in specific posterior subregions — corpus medullare (d=-0.093), bilateral lobule VIIb (d=-0.085/-0.091) — and only in adults, not children/adolescents (PMID 41724351). Overall-volume vs. subregional findings genuinely disagree, not just study noise.",
        "links": [
          {
            "id": "brain_ocd_t20_l1",
            "label": "ENIGMA-OCD mega-analysis, n=1,954 OCD/2,091 controls, 22 sites (PMID 41724351)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41724351/"
          },
          {
            "id": "brain_ocd_t20_l2",
            "label": "Mega-analysis, n=412 OCD/368 controls, greater overall cerebellar volume (PMID 24220667)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24220667/"
          }
        ]
      },
      {
        "id": "brain_ocd_t21",
        "name": "Anterior cingulate cortex",
        "dir": "down",
        "refs": "",
        "note": "Significantly smaller frontal gray/white matter volume bilaterally in OCD vs. controls, multicenter VBM mega-analysis (n=412 OCD/368 controls, International OCD Brain Imaging Consortium). Kept as its own node, separate from the more specific existing \"Dorsal anterior cingulate cortex\" entry — this source uses the generic ACC term.",
        "links": [
          {
            "id": "brain_ocd_t21_l1",
            "label": "Multicenter VBM mega-analysis, n=412/368 (PMID 24220667)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24220667/"
          }
        ]
      },
      {
        "id": "brain_ocd_t22",
        "name": "Dorsomedial prefrontal cortex",
        "dir": "down",
        "refs": "",
        "note": "Significantly smaller frontal gray/white matter volume bilaterally in OCD vs. controls, multicenter VBM mega-analysis (n=412 OCD/368 controls). New canonical region — distinct from the existing \"Medial prefrontal cortex\" entry used for ADHD/Autism, since this source specifically names the dorsomedial subdivision.",
        "links": [
          {
            "id": "brain_ocd_t22_l1",
            "label": "Multicenter VBM mega-analysis, n=412/368 (PMID 24220667)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24220667/"
          }
        ]
      },
      {
        "id": "brain_ocd_t23",
        "name": "Medial prefrontal cortex",
        "dir": "down",
        "refs": "",
        "note": "Decreased gray matter volume in right medial prefrontal cortex (BA10) in OCD patients vs. controls, whole-brain VBM study, n=55 medication-free OCD/50 controls. Resolves the same region already tracked for ADHD and Autism (both \"down\") — genuine shared finding, not assumed from comorbidity.",
        "links": [
          {
            "id": "brain_ocd_t23_l1",
            "label": "van den Heuvel et al. 2009, Brain, n=55/50 (PMID 18952675)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18952675/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_bd",
    "name": "Bipolar Disorder",
    "abbr": "BD",
    "color": "#F0B429",
    "note": "The amygdala finding draws on a 2025 Molecular Psychiatry critical review synthesizing fMRI studies in adolescents/young adults with bipolar disorder, framing subcortical (amygdalar/striatal/thalamic) dysfunction as an early-emerging, persisting trait feature rather than a state-dependent one — the 'new amygdala research' referenced when this map was built.",
    "links": [
      {
        "id": "brain_bd_l1",
        "label": "Critical review, Molecular Psychiatry 2025 (PMID 39333385)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/39333385/"
      },
      {
        "id": "brain_bd_l2",
        "label": "ALE meta-analysis, Scientific Reports 2025 (PMID 40467619)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40467619/"
      },
      {
        "id": "brain_bd_t4_condl1",
        "label": "2024, J Affect Disord (PMID 38876317)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38876317/"
      }
    ],
    "taxa": [
      {
        "id": "brain_bd_t1",
        "name": "Amygdala",
        "dir": "up",
        "refs": "PMID 39333385",
        "note": "Hyperactivation to emotional stimuli identified as an early-emerging, trait-related feature of bipolar disorder that persists across mood states, per a 2025 critical review of functional neuroimaging in adolescents and young adults with BD.",
        "links": [
          {
            "id": "brain_bd_t1_l1",
            "label": "Critical review, Molecular Psychiatry 2025 (PMID 39333385)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39333385/"
          }
        ]
      },
      {
        "id": "brain_bd_t2",
        "name": "Ventral prefrontal cortex",
        "dir": "down",
        "refs": "PMID 39333385",
        "note": "Reduced regulatory engagement identified as a trait-related feature alongside amygdala hyperactivation, consistent with disrupted top-down emotion regulation.",
        "links": [
          {
            "id": "brain_bd_t2_l1",
            "label": "Critical review, Molecular Psychiatry 2025 (PMID 39333385)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39333385/"
          }
        ]
      },
      {
        "id": "brain_bd_t3",
        "name": "Insula",
        "dir": "up",
        "refs": "PMID 40467619",
        "note": "Hyperactivation reported in the mood-disorders subgroup (which includes bipolar disorder) of a 2025 ALE meta-analysis of implicit emotion regulation.",
        "links": [
          {
            "id": "brain_bd_t3_l1",
            "label": "ALE meta-analysis, Scientific Reports 2025 (PMID 40467619)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40467619/"
          }
        ]
      },
      {
        "id": "brain_bd_t4",
        "name": "Frontal cortex",
        "dir": "up",
        "refs": "PMID 38876317",
        "note": "Greater activation during fear processing in BD vs both MDD and healthy comparisons, right-lateralized, in a combined PET ([18F]FPEB, mGlu5 receptor)/fMRI study (n=18 BD, 20 MDD, 25 healthy).",
        "links": [
          {
            "id": "brain_bd_t4_l1",
            "label": "2024, J Affect Disord (PMID 38876317)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38876317/"
          }
        ]
      },
      {
        "id": "brain_bp_t5",
        "name": "Posterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 36782061",
        "note": "Right PCC functional-connectivity difference during resting-state, specifically in depressed-episode BD (not euthymic or manic/hypomanic) — from a large-scale ALE meta-analysis of functional neuroimaging studies.",
        "links": [
          {
            "id": "brain_bp_t5_l1",
            "label": "Schumer et al. 2023, Mol Psychiatry (PMID 36782061)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36782061/"
          }
        ]
      },
      {
        "id": "brain_bp_t6",
        "name": "Inferior parietal lobule",
        "dir": "down",
        "refs": "PMID 36782061",
        "note": "Right IPL/angular gyrus hypoactivation during cognitive tasks, in the same meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_bp_t6_l1",
            "label": "Schumer et al. 2023, Mol Psychiatry (PMID 36782061)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36782061/"
          }
        ]
      },
      {
        "id": "brain_bp_t7",
        "name": "Superior parietal lobule",
        "dir": "down",
        "refs": "PMID 36782061",
        "note": "Left SPL hypoactivation during cognitive tasks, specifically in euthymic BD — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_bp_t7_l1",
            "label": "Schumer et al. 2023, Mol Psychiatry (PMID 36782061)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36782061/"
          }
        ]
      },
      {
        "id": "brain_bp_t8",
        "name": "Orbitofrontal cortex",
        "dir": "up",
        "refs": "PMID 36782061",
        "note": "Left medial OFC hyperactivation during working-memory and sustained-attention (cognitive) tasks, in the same meta-analysis.",
        "links": [
          {
            "id": "brain_bp_t8_l1",
            "label": "Schumer et al. 2023, Mol Psychiatry (PMID 36782061)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36782061/"
          }
        ]
      },
      {
        "id": "brain_bp_t9",
        "name": "Hippocampus",
        "dir": "up",
        "refs": "PMID 36782061",
        "note": "Same cluster as the amygdala finding on this map (left amygdala extending into left hippocampus), hyperactivation during emotional tasks with mixed positive/negative valence.",
        "links": [
          {
            "id": "brain_bp_t9_l1",
            "label": "Schumer et al. 2023, Mol Psychiatry (PMID 36782061)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36782061/"
          }
        ]
      },
      {
        "id": "brain_bp_t10",
        "name": "Anterior cingulate cortex",
        "dir": "both",
        "refs": "PMID 36782061",
        "note": "Left ventral ACC hyperactivation during cognitive tasks (pooled analysis), in the same meta-analysis. A separate, much larger structural meta-analysis (Chen et al. 2022, VBM arm, 83 studies) found the opposite direction — decreased gray matter volume — a genuine structure-vs-function dissociation.",
        "links": [
          {
            "id": "brain_bp_t10_l1",
            "label": "Schumer et al. 2023, Mol Psychiatry (PMID 36782061)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36782061/"
          },
          {
            "id": "brain_bp_t10_l1",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          }
        ]
      },
      {
        "id": "brain_bp_t11",
        "name": "Ventrolateral prefrontal cortex",
        "dir": "down",
        "refs": "PMID 36782061",
        "note": "Right VLPFC hypoactivation during emotional tasks (pooled analysis) — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_bp_t11_l1",
            "label": "Schumer et al. 2023, Mol Psychiatry (PMID 36782061)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36782061/"
          }
        ]
      },
      {
        "id": "brain_bp_t12",
        "name": "Supplementary motor area",
        "dir": "down",
        "refs": "PMID 36782061",
        "note": "Left premotor/supplementary motor cortex hypoactivation during cognitive tasks (pooled analysis), in the same meta-analysis.",
        "links": [
          {
            "id": "brain_bp_t12_l1",
            "label": "Schumer et al. 2023, Mol Psychiatry (PMID 36782061)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36782061/"
          }
        ]
      },
      {
        "id": "brain_bp_t13",
        "name": "Middle temporal gyrus",
        "dir": "down",
        "refs": "PMID 36093787",
        "note": "Decreased resting-state functional activity (left, extending into left superior temporal gyrus and post-central gyrus) — the opposite direction from Autism's middle temporal gyrus finding on this map (up, ASD-specific per Tamon et al. 2024), though Autism's own entry is itself lateralized/mixed (both).",
        "links": [
          {
            "id": "brain_bp_t13_l1",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          }
        ]
      },
      {
        "id": "brain_bp_t14",
        "name": "Middle frontal gyrus",
        "dir": "up",
        "refs": "PMID 36093787",
        "note": "Increased resting-state functional activity (left) — the opposite direction from Autism/ADHD's shared middle frontal gyrus finding on this map (down, Tamon et al. 2024).",
        "links": [
          {
            "id": "brain_bp_t14_l1",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          }
        ]
      },
      {
        "id": "brain_bp_t15",
        "name": "Inferior frontal gyrus",
        "dir": "both",
        "refs": "PMID 36093787 / PMID 21320248",
        "note": "A genuine dissociation across methodologies rather than a simple direction: increased RESTING-STATE functional activity (right, extending into right insula) in the 2022 multimodal meta-analysis, but decreased structural (VBM) volume (right, same meta-analysis) AND decreased TASK-BASED activation specifically during mania (Chen et al. 2011, 65 studies) — mood-state and measurement-type both matter here.",
        "links": [
          {
            "id": "brain_bp_t15_l1",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          },
          {
            "id": "brain_bp_t15_l2",
            "label": "Chen et al. 2011, Bipolar Disord — 65 fMRI studies, 1,040 BD/1,074 controls (PMID 21320248)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21320248/"
          }
        ]
      },
      {
        "id": "brain_bp_t16",
        "name": "Putamen",
        "dir": "both",
        "refs": "PMID 21320248 / PMID 36093787",
        "note": "A genuine dissociation: task-based underactivation during cognitive/emotional processing (Chen et al. 2011, 65 studies) vs. increased resting-state functional activity in the bilateral striatum, which includes the putamen (Chen et al. 2022) — different task states, not a simple contradiction.",
        "links": [
          {
            "id": "brain_bp_t16_l1",
            "label": "Chen et al. 2011, Bipolar Disord — 65 fMRI studies, 1,040 BD/1,074 controls (PMID 21320248)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21320248/"
          },
          {
            "id": "brain_bp_t16_l2",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          }
        ]
      },
      {
        "id": "brain_bp_t17",
        "name": "Parahippocampal gyrus",
        "dir": "up",
        "refs": "PMID 21320248",
        "note": "Overactivated, part of the medial temporal structures (alongside hippocampus and amygdala, both already on this map) that show limbic overactivity primarily during emotional-processing tasks, in a 65-study meta-analysis — a new region added to this app's brain-region list. Matches the direction of Autism/ADHD's shared parahippocampal gyrus finding on this map (down) in the OPPOSITE direction.",
        "links": [
          {
            "id": "brain_bp_t17_l1",
            "label": "Chen et al. 2011, Bipolar Disord — 65 fMRI studies, 1,040 BD/1,074 controls (PMID 21320248)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21320248/"
          }
        ]
      },
      {
        "id": "brain_bp_t18",
        "name": "Precuneus",
        "dir": "down",
        "refs": "PMID 36093787",
        "note": "Decreased resting-state functional activity (bilateral) in the 2022 multimodal meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_bp_t18_l1",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          }
        ]
      },
      {
        "id": "brain_bp_t19",
        "name": "Superior temporal gyrus",
        "dir": "down",
        "refs": "PMID 36093787",
        "note": "Decreased structural (VBM) volume (left, extending from a cluster involving the left insula/temporal pole/IFG), and part of the functional cluster with middle temporal gyrus above — same 2022 multimodal meta-analysis.",
        "links": [
          {
            "id": "brain_bp_t19_l1",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          }
        ]
      },
      {
        "id": "brain_bp_t20",
        "name": "Fusiform gyrus",
        "dir": "down",
        "refs": "PMID 36093787",
        "note": "Decreased structural (VBM) volume (right) in the same 2022 multimodal meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_bp_t20_l1",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          }
        ]
      },
      {
        "id": "brain_bp_t21",
        "name": "Thalamus",
        "dir": "down",
        "refs": "PMID 36093787",
        "note": "Decreased structural (VBM) volume (left) in the same 2022 multimodal meta-analysis.",
        "links": [
          {
            "id": "brain_bp_t21_l1",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          }
        ]
      },
      {
        "id": "brain_bp_t22",
        "name": "Cerebellum",
        "dir": "down",
        "refs": "PMID 36093787",
        "note": "Decreased resting-state functional activity (left) in the same 2022 multimodal meta-analysis.",
        "links": [
          {
            "id": "brain_bp_t22_l1",
            "label": "Chen et al. 2022, Psychol Med — multimodal meta-analysis, 51 functional studies (1,842 BD/2,190 controls) + 83 structural VBM studies (2,790 BD/3,690 controls) (PMID 36093787)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36093787/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_anx",
    "name": "Anxiety",
    "abbr": "ANX",
    "color": "#F45BAF",
    "note": "Combines a classic, heavily-cited 2007 meta-analysis of emotional-processing fMRI (PTSD, social anxiety disorder, specific phobia) with a 2026 coordinate-based meta-analysis specifically of amygdala resting-state connectivity in anxiety disorders — old and new evidence pointing the same direction. Important null finding: the largest structural-MRI study of GAD to date (ENIGMA-Anxiety, 28 sites, main analysis 1,020 GAD/2,999 controls) found NO significant effect of GAD on cortical thickness, cortical surface area, or subcortical volume anywhere in the brain, nor any interaction with age or sex — \"differences in brain structure related to GAD are small, possibly reflecting heterogeneity or [suggesting] structural alterations are not a major component of its pathophysiology.\" All entries on this map are functional (activation) findings, not structural — this is an important, deliberately-preserved caveat on the whole map, not a contradiction of any single entry.",
    "links": [
      {
        "id": "brain_anx_l1",
        "label": "Etkin & Wager meta-analysis, Am J Psychiatry 2007 (PMID 17898336)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/17898336/"
      },
      {
        "id": "brain_anx_l2",
        "label": "Coordinate-based meta-analysis, Psychological Medicine 2026 (PMID 42165096)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/42165096/"
      },
      {
        "id": "brain_anx_condl3",
        "label": "2025, Scientific Reports (PMID 40467619)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40467619/"
      }
    ],
    "taxa": [
      {
        "id": "brain_anx_t1",
        "name": "Amygdala",
        "dir": "up",
        "refs": "PMID 17898336",
        "note": "Hyperactivation during emotional processing, pooled across PTSD, social anxiety disorder, and specific phobia studies. A separate, larger transdiagnostic pooled meta-analysis (226 studies) found left amygdala/parahippocampal hyperactivation too, but only at a liberal, uncorrected threshold — weaker replication than the original finding on this map.",
        "links": [
          {
            "id": "brain_anx_t1_l1",
            "label": "Etkin & Wager meta-analysis, Am J Psychiatry 2007 (PMID 17898336)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17898336/"
          },
          {
            "id": "brain_anx_t1_l1",
            "label": "Janiri et al. 2020, JAMA Psychiatry — 226 studies, transdiagnostic mood/anxiety pooled ALE (PMID 31664439)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31664439/"
          }
        ]
      },
      {
        "id": "brain_anx_t2",
        "name": "Insula",
        "dir": "both",
        "refs": "PMID 17898336",
        "note": "Hyperactivation during emotional processing across the same pooled anxiety-disorder studies. A genuine cross-study contradiction, preserved rather than resolved: a much larger, more recent transdiagnostic pooled meta-analysis (226 studies, mood+anxiety+bipolar combined) found the opposite direction — robust hypoactivation in right inferior prefrontal cortex/insula, surviving strict family-wise-error correction.",
        "links": [
          {
            "id": "brain_anx_t2_l1",
            "label": "Etkin & Wager meta-analysis, Am J Psychiatry 2007 (PMID 17898336)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17898336/"
          },
          {
            "id": "brain_anx_t2_l1",
            "label": "Janiri et al. 2020, JAMA Psychiatry — 226 studies, transdiagnostic mood/anxiety pooled ALE (PMID 31664439)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31664439/"
          }
        ]
      },
      {
        "id": "brain_anx_t3",
        "name": "Anterior cingulate cortex",
        "dir": "both",
        "refs": "PMID 42165096",
        "note": "Reduced amygdala-ACC functional connectivity was the most robust finding in a 2026 coordinate-based meta-analysis (15 datasets, 378 patients, 405 controls) of anxiety disorders, surviving strict correction; driven mainly by adult patients and the left amygdala. A separate, larger transdiagnostic pooled meta-analysis (226 studies) found hyperactivation in the perigenual/dorsal ACC — but explicitly only at a liberal, uncorrected threshold; the authors state there were no significant hyperactivation clusters at their stringent, corrected threshold. Included for completeness, not as strong evidence.",
        "links": [
          {
            "id": "brain_anx_t3_l1",
            "label": "Coordinate-based meta-analysis, Psychological Medicine 2026 (PMID 42165096)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/42165096/"
          },
          {
            "id": "brain_anx_t3_l1",
            "label": "Janiri et al. 2020, JAMA Psychiatry — 226 studies, transdiagnostic mood/anxiety pooled ALE (PMID 31664439)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31664439/"
          }
        ]
      },
      {
        "id": "brain_anx_t4",
        "name": "Medial prefrontal cortex",
        "dir": "down",
        "refs": "PMID 40467619",
        "note": "Hypoactivation (right medial frontal gyrus, BA9) during implicit emotion regulation, pooled across a combined mood-and-anxiety-disorder sample (n=432) — same source and finding as the Depression entry on this map, since the study analyzed both diagnostic groups together.",
        "links": [
          {
            "id": "brain_anx_t4_l1",
            "label": "2025, Scientific Reports (PMID 40467619)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40467619/"
          }
        ]
      },
      {
        "id": "brain_anx_t5",
        "name": "Inferior frontal gyrus",
        "dir": "down",
        "refs": "PMID 31664439",
        "note": "Robust hypoactivation (right inferior prefrontal cortex/insula cluster), surviving strict family-wise-error correction in a 226-study transdiagnostic pooled meta-analysis (mood + anxiety + bipolar combined; 808 anxiety patients/780 controls in the anxiety subset) — the most statistically reliable finding in that analysis.",
        "links": [
          {
            "id": "brain_anx_t5_l1",
            "label": "Janiri et al. 2020, JAMA Psychiatry — 226 studies, transdiagnostic mood/anxiety pooled ALE (PMID 31664439)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31664439/"
          }
        ]
      },
      {
        "id": "brain_anx_t6",
        "name": "Inferior parietal lobule",
        "dir": "down",
        "refs": "PMID 31664439",
        "note": "Robust hypoactivation, surviving strict correction, in the same 226-study transdiagnostic pooled meta-analysis.",
        "links": [
          {
            "id": "brain_anx_t6_l1",
            "label": "Janiri et al. 2020, JAMA Psychiatry — 226 studies, transdiagnostic mood/anxiety pooled ALE (PMID 31664439)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31664439/"
          }
        ]
      },
      {
        "id": "brain_anx_t7",
        "name": "Putamen",
        "dir": "down",
        "refs": "PMID 31664439",
        "note": "Robust hypoactivation, surviving strict correction, in the same 226-study transdiagnostic pooled meta-analysis.",
        "links": [
          {
            "id": "brain_anx_t7_l1",
            "label": "Janiri et al. 2020, JAMA Psychiatry — 226 studies, transdiagnostic mood/anxiety pooled ALE (PMID 31664439)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31664439/"
          }
        ]
      },
      {
        "id": "brain_anx_t8",
        "name": "Thalamus",
        "dir": "up",
        "refs": "PMID 31664439",
        "note": "Hyperactivation in the same 226-study transdiagnostic pooled meta-analysis — but only at a liberal, uncorrected threshold, not the stringent corrected threshold. A new region added to this app's brain-region list, included for completeness rather than as strong evidence.",
        "links": [
          {
            "id": "brain_anx_t8_l1",
            "label": "Janiri et al. 2020, JAMA Psychiatry — 226 studies, transdiagnostic mood/anxiety pooled ALE (PMID 31664439)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31664439/"
          }
        ]
      },
      {
        "id": "brain_anx_t9",
        "name": "Ventral diencephalon",
        "dir": "up",
        "refs": "PMID 34599145",
        "note": "Narrow, sex-specific, secondary-analysis finding from the ENIGMA-Anxiety mega-analysis (28 sites): increased right ventral diencephalon volume in MALE individuals with GAD vs. male controls only — females with GAD showed no difference. This is the ONE positive structural finding in an otherwise null mega-analysis (see condition note) — a new region added to this app's brain-region list, included precisely because null/narrow findings are tracked here rather than omitted.",
        "links": [
          {
            "id": "brain_anx_t9_l1",
            "label": "Harrewijn et al. 2021, Transl Psychiatry — ENIGMA-Anxiety, 28 sites, 1,020 GAD/2,999 controls (PMID 34599145)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34599145/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_dep",
    "name": "Depression",
    "abbr": "DEP",
    "color": "#5B8DEF",
    "note": "The subgenual ACC finding is convergent across two independent 2026 meta-analyses — a dedicated sgACC systematic review and a broader ALE meta-analysis of working memory/reward/emotion processing (69 studies, 2,073 MDD patients, 2,009 controls) — a stronger-than-usual evidence pattern for this map.",
    "links": [
      {
        "id": "brain_dep_l1",
        "label": "Systematic review & meta-analysis, Translational Psychiatry 2026 (PMID 41916951)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41916951/"
      },
      {
        "id": "brain_dep_l2",
        "label": "ALE meta-analysis, Psychological Medicine 2026 (PMID 41749073)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41749073/"
      },
      {
        "id": "brain_dep_condl3",
        "label": "2025, Scientific Reports (PMID 40467619)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40467619/"
      }
    ],
    "taxa": [
      {
        "id": "brain_dep_t1",
        "name": "Subgenual anterior cingulate cortex",
        "dir": "up",
        "refs": "PMID 41916951 / PMID 41749073",
        "note": "Overactive subgenual ACC in medication-free MDD patients, replicated as a significant ALE cluster across two independent 2026 meta-analyses.",
        "links": [
          {
            "id": "brain_dep_t1_l1",
            "label": "Systematic review & meta-analysis, Translational Psychiatry 2026 (PMID 41916951)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41916951/"
          }
        ]
      },
      {
        "id": "brain_dep_t2",
        "name": "Insula",
        "dir": "both",
        "refs": "PMID 41749073",
        "note": "Hyperactivation (bilateral) in MDD vs healthy controls, in the general and emotion-processing analyses. A genuine structure-vs-function dissociation, not a contradiction: that finding was functional (activation); a separate, larger structural meta-analysis (19 studies, 619 first-episode MDD/707 controls) found the opposite direction for gray matter VOLUME — left insula smaller in MDD.",
        "links": [
          {
            "id": "brain_dep_t2_l1",
            "label": "ALE meta-analysis, Psychological Medicine 2026 (PMID 41749073)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41749073/"
          },
          {
            "id": "brain_dep_t2_l1",
            "label": "Zheng et al. 2021, Front Psychiatry — 19 studies, 619 first-episode MDD/707 controls (PMID 34276443)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34276443/"
          }
        ]
      },
      {
        "id": "brain_dep_t3",
        "name": "Fusiform gyrus",
        "dir": "down",
        "refs": "PMID 41749073",
        "note": "Hypoactivation in MDD vs healthy controls.",
        "links": [
          {
            "id": "brain_dep_t3_l1",
            "label": "ALE meta-analysis, Psychological Medicine 2026 (PMID 41749073)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41749073/"
          }
        ]
      },
      {
        "id": "brain_dep_t4",
        "name": "Caudate nucleus",
        "dir": "up",
        "refs": "PMID 41749073",
        "note": "Reward-related hyperactivation (left caudate) in MDD vs healthy controls during reward-processing tasks — striatal dysfunction the authors suggest plays a key role in emotion-motivation interplay in depression.",
        "links": [
          {
            "id": "brain_dep_t4_l1",
            "label": "ALE meta-analysis, Psychological Medicine 2026 (PMID 41749073)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41749073/"
          }
        ]
      },
      {
        "id": "brain_dep_t5",
        "name": "Medial prefrontal cortex",
        "dir": "down",
        "refs": "PMID 40467619",
        "note": "Hypoactivation (right medial frontal gyrus, BA9) during implicit emotion regulation, pooled across a combined mood-and-anxiety-disorder sample (n=432) in a 2025 ALE meta-analysis — the same finding used on the Anxiety entry, since this study analyzed both diagnostic groups together rather than separately. One of the few direct data links between depression and anxiety on this map, despite them being the most comorbid pair in psychiatry.",
        "links": [
          {
            "id": "brain_dep_t5_l1",
            "label": "2025, Scientific Reports (PMID 40467619)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40467619/"
          }
        ]
      },
      {
        "id": "brain_dep_t6",
        "name": "Parahippocampal gyrus",
        "dir": "down",
        "refs": "PMID 34276443",
        "note": "Smaller bilateral gray matter volume in first-episode MDD vs. controls, extending into the hippocampus, in a 19-study meta-analysis (619 patients/707 controls) — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_dep_t6_l1",
            "label": "Zheng et al. 2021, Front Psychiatry — 19 studies, 619 first-episode MDD/707 controls (PMID 34276443)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34276443/"
          }
        ]
      },
      {
        "id": "brain_dep_t7",
        "name": "Hippocampus",
        "dir": "both",
        "refs": "PMID 34276443 / PMID 31964160",
        "note": "A genuine structure-vs-function dissociation: smaller gray matter volume in first-episode MDD (same parahippocampal-extending cluster, Zheng et al. 2021), but functional hyperactivation/disrupted activity reported during emotional processing in a separate large pooled meta-analysis (McTeague et al. 2020, n=2,383) of transdiagnostic emotional-circuit disruption.",
        "links": [
          {
            "id": "brain_dep_t7_l1",
            "label": "Zheng et al. 2021, Front Psychiatry — 19 studies, 619 first-episode MDD/707 controls (PMID 34276443)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34276443/"
          },
          {
            "id": "brain_dep_t7_l2",
            "label": "McTeague et al. 2020, Am J Psychiatry — pooled n=2,383 (PMID 31964160)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31964160/"
          }
        ]
      },
      {
        "id": "brain_dep_t8",
        "name": "Gyrus rectus",
        "dir": "down",
        "refs": "PMID 34276443",
        "note": "Smaller gray matter volume (right) extending into the right striatum, in the same 19-study meta-analysis — the opposite direction from Autism/ADHD's gyrus rectus finding on this map (up, but a different functional-activation measure in a different condition).",
        "links": [
          {
            "id": "brain_dep_t8_l1",
            "label": "Zheng et al. 2021, Front Psychiatry — 19 studies, 619 first-episode MDD/707 controls (PMID 34276443)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34276443/"
          }
        ]
      },
      {
        "id": "brain_dep_t9",
        "name": "Superior frontal gyrus",
        "dir": "down",
        "refs": "PMID 34276443",
        "note": "Smaller gray matter volume, both the right dorsolateral and left medial subregions, in the same 19-study meta-analysis.",
        "links": [
          {
            "id": "brain_dep_t9_l1",
            "label": "Zheng et al. 2021, Front Psychiatry — 19 studies, 619 first-episode MDD/707 controls (PMID 34276443)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34276443/"
          }
        ]
      },
      {
        "id": "brain_dep_t10",
        "name": "Superior parietal lobule",
        "dir": "down",
        "refs": "PMID 34276443",
        "note": "Smaller gray matter volume (left) in the same 19-study meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_dep_t10_l1",
            "label": "Zheng et al. 2021, Front Psychiatry — 19 studies, 619 first-episode MDD/707 controls (PMID 34276443)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34276443/"
          }
        ]
      },
      {
        "id": "brain_dep_t11",
        "name": "Amygdala",
        "dir": "both",
        "refs": "PMID 31964160 / PMID 35775158",
        "note": "Left amygdala hyperreactivity to emotional stimuli (driven mainly by negative faces/scenes) is a long-standing depression finding, most recently confirmed in the largest pooled meta-analysis to date (McTeague et al. 2020, n=2,383, interview-verified MDD/anxiety). But a subsequent UK Biobank study — far larger than the entire meta-analysis literature combined (n=28,638) — found a \"null\" association between amygdala reactivity to negative faces and depressive symptoms/diagnoses; the one significant effect was \"vanishingly small\" (d=0.03, R²=0.03%) and non-significant once demographic covariates were included. Both are preserved here rather than picking one: this looks like a real but population-level-negligible effect, not a straightforward directional finding.",
        "links": [
          {
            "id": "brain_dep_t11_l1",
            "label": "McTeague et al. 2020, Am J Psychiatry — pooled n=2,383 (PMID 31964160)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31964160/"
          },
          {
            "id": "brain_dep_t11_l2",
            "label": "Tamm et al. 2022, Am J Psychiatry — UK Biobank, n=28,638 (PMID 35775158)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35775158/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_tbi",
    "name": "Traumatic Brain Injury",
    "abbr": "TBI",
    "color": "#4338CA",
    "note": "TBI's functional-connectivity literature is genuinely heterogeneous by design (findings vary by severity and time since injury), more so than any other condition on this map. These entries reflect the most frequently implicated resting-state networks in the largest coordinate-based meta-analysis to date (76 studies, 5,064 participants), but the underlying clusters did not survive the strictest statistical correction — flagged here as the thinnest evidence on this map, not an established consensus.",
    "links": [
      {
        "id": "brain_tbi_l1",
        "label": "Coordinate-based meta-analysis, Neurology 2025 (PMID 41105904)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41105904/"
      }
    ],
    "taxa": [
      {
        "id": "brain_tbi_t1",
        "name": "Default mode network",
        "dir": "up",
        "refs": "PMID 41105904",
        "note": "Most frequently implicated network in mild TBI specifically (22.9% of pooled peak coordinates); commonly reported in the wider literature as paradoxical hyperconnectivity in the subacute post-concussive period, though direction is heterogeneous across individual studies and this did not survive strict statistical correction here.",
        "links": [
          {
            "id": "brain_tbi_t1_l1",
            "label": "Coordinate-based meta-analysis, Neurology 2025 (PMID 41105904)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41105904/"
          }
        ]
      },
      {
        "id": "brain_tbi_t2",
        "name": "Frontoparietal network",
        "dir": "down",
        "refs": "PMID 41105904",
        "note": "Most frequently implicated network in moderate-to-severe TBI specifically (36% of pooled peak coordinates), consistent with reduced executive-network engagement; did not survive strict statistical correction here.",
        "links": [
          {
            "id": "brain_tbi_t2_l1",
            "label": "Coordinate-based meta-analysis, Neurology 2025 (PMID 41105904)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41105904/"
          }
        ]
      },
      {
        "id": "brain_tbi_t3",
        "name": "Dorsolateral prefrontal cortex",
        "dir": "down",
        "refs": "PMID 33425093",
        "note": "Attenuated activation (bilateral clusters) across task types — the most consistent finding in this meta-analysis.",
        "links": [
          {
            "id": "brain_tbi_t3_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t4",
        "name": "Middle frontal gyrus",
        "dir": "down",
        "refs": "PMID 33425093",
        "note": "Attenuated activation (bilateral).",
        "links": [
          {
            "id": "brain_tbi_t4_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t5",
        "name": "Posterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 33425093",
        "note": "Attenuated activation (right).",
        "links": [
          {
            "id": "brain_tbi_t5_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t6",
        "name": "Precuneus",
        "dir": "down",
        "refs": "PMID 33425093",
        "note": "Attenuated activation (right).",
        "links": [
          {
            "id": "brain_tbi_t6_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t7",
        "name": "Cerebellum",
        "dir": "both",
        "refs": "PMID 33425093",
        "note": "A genuine within-region dissociation: attenuated activation in the anterior lobe but enhanced activation in the cerebellar tonsil — different subregions, opposite directions.",
        "links": [
          {
            "id": "brain_tbi_t7_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t8",
        "name": "Insula",
        "dir": "up",
        "refs": "PMID 33425093",
        "note": "Enhanced activation (left, frontal insula).",
        "links": [
          {
            "id": "brain_tbi_t8_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t9",
        "name": "Inferior frontal gyrus",
        "dir": "up",
        "refs": "PMID 33425093",
        "note": "Enhanced activation (right).",
        "links": [
          {
            "id": "brain_tbi_t9_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t10",
        "name": "Midbrain",
        "dir": "up",
        "refs": "PMID 33425093",
        "note": "Enhanced activation.",
        "links": [
          {
            "id": "brain_tbi_t10_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t11",
        "name": "Inferior parietal lobule",
        "dir": "down",
        "refs": "PMID 33425093",
        "note": "Attenuated activation (right).",
        "links": [
          {
            "id": "brain_tbi_t11_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t12",
        "name": "Corpus callosum",
        "dir": "down",
        "refs": "PMID 33425093",
        "note": "Attenuated activation — a new region added to this app's brain-region list; also independently flagged elsewhere in the TBI literature as highly susceptible to diffuse axonal injury given it's the brain's largest white matter tract.",
        "links": [
          {
            "id": "brain_tbi_t12_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t13",
        "name": "Supramarginal gyrus",
        "dir": "down",
        "refs": "PMID 33425093",
        "note": "Attenuated activation (left) — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_tbi_t13_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t14",
        "name": "Angular gyrus",
        "dir": "up",
        "refs": "PMID 33425093",
        "note": "Enhanced activation (bilateral) — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_tbi_t14_l1",
            "label": "Zhang et al. 2020 — task-state fMRI meta-analysis, 7 studies, 174 mTBI/140 controls (PMID 33425093)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33425093/"
          }
        ]
      },
      {
        "id": "brain_tbi_t15",
        "name": "Amygdala",
        "dir": "down",
        "refs": "",
        "note": "Smaller acute-stage (median 19 days post-injury) amygdala volume was a strong predictor of unfavorable disability outcome at chronic stage (median 229 days), n=67 mild-to-severe TBI patients (PMID 29182625). A separate study found amygdala volume differences between 2-month and 1-year post-mTBI timepoints were more pronounced than other regions (PMID 25970552) — regionally-specific, not uniform recovery.",
        "links": [
          {
            "id": "brain_tbi_t15_l1",
            "label": "n=67, acute-stage predictor (PMID 29182625)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29182625/"
          },
          {
            "id": "brain_tbi_t15_l2",
            "label": "2-month vs. 1-year mTBI (PMID 25970552)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25970552/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_ptsd",
    "name": "PTSD",
    "abbr": "PTSD",
    "color": "#94A3B8",
    "note": "Directions here follow the well-established PTSD neurocircuitry model (amygdala hyperactivation, hippocampal hypoactivation/volume loss) as confirmed by a 2024 narrative review synthesizing the regions consistently implicated in PTSD's neuropsychological correlates.",
    "links": [
      {
        "id": "brain_ptsd_condl1",
        "label": "Neuroanatomical and functional correlates in PTSD, Ibrain 2024 (PMID 38682011)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
      },
      {
        "id": "brain_ptsd_condl2",
        "label": "Liberati & Perrotta 2024, Ibrain — same narrative review already cited for this condition's other entries (PMID 38682011)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
      }
    ],
    "taxa": [
      {
        "id": "brain_ptsd_t1",
        "name": "Amygdala",
        "dir": "up",
        "refs": "PMID 38682011",
        "note": "Hyperactivation to threat/trauma-related cues is the most consistently replicated PTSD neuroimaging finding; this region is among those confirmed as implicated by a 2024 narrative review of PTSD's neuroanatomical correlates.",
        "links": [
          {
            "id": "brain_ptsd_t1_l1",
            "label": "Ibrain 2024 (PMID 38682011)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
          }
        ]
      },
      {
        "id": "brain_ptsd_t2",
        "name": "Hippocampus",
        "dir": "down",
        "refs": "PMID 38682011",
        "note": "Reduced volume and hypoactivation, consistently implicated in PTSD's characteristic symptoms per the same 2024 review — part of the classic amygdala-hippocampus-vmPFC PTSD triad.",
        "links": [
          {
            "id": "brain_ptsd_t2_l1",
            "label": "Ibrain 2024 (PMID 38682011)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
          }
        ]
      },
      {
        "id": "brain_ptsd_t3",
        "name": "Precuneus",
        "dir": "up",
        "refs": "PMID 40722851",
        "note": "PTSD also shows hyperconnected precuneus states as part of default-mode-network hyperconnectivity, per a transdiagnostic comparison table in a 2025 BPD review — described as \"contextual, trauma-linked\" rather than BPD's \"stable, dominant\" pattern, which is the specific distinction the review draws between the two conditions.",
        "links": [
          {
            "id": "brain_ptsd_t3_l1",
            "label": "Giannoulis et al. 2025, Biomedicines (PMID 40722851)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40722851/"
          }
        ]
      },
      {
        "id": "brain_ptsd_t4",
        "name": "Anterior cingulate cortex",
        "dir": "up",
        "refs": "PMID 38682011",
        "note": "Increased volume in PTSD patients vs. controls, per the same review already cited for this condition's other entries.",
        "links": [
          {
            "id": "brain_ptsd_t4_l1",
            "label": "Liberati & Perrotta 2024, Ibrain — same narrative review already cited for this condition's other entries (PMID 38682011)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
          }
        ]
      },
      {
        "id": "brain_ptsd_t5",
        "name": "Thalamus",
        "dir": "down",
        "refs": "PMID 38682011",
        "note": "Decreased cerebral blood flow in PTSD — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_ptsd_t5_l1",
            "label": "Liberati & Perrotta 2024, Ibrain — same narrative review already cited for this condition's other entries (PMID 38682011)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
          }
        ]
      },
      {
        "id": "brain_ptsd_t6",
        "name": "Hypothalamus",
        "dir": "down",
        "refs": "PMID 38682011",
        "note": "Volumetric reduction in adults with PTSD and adverse childhood experiences, particularly in the paraventricular nucleus (PVN) — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_ptsd_t6_l1",
            "label": "Liberati & Perrotta 2024, Ibrain — same narrative review already cited for this condition's other entries (PMID 38682011)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
          }
        ]
      },
      {
        "id": "brain_ptsd_t7",
        "name": "Insula",
        "dir": "down",
        "refs": "PMID 38682011",
        "note": "Significantly reduced volumes and altered function in PTSD.",
        "links": [
          {
            "id": "brain_ptsd_t7_l1",
            "label": "Liberati & Perrotta 2024, Ibrain — same narrative review already cited for this condition's other entries (PMID 38682011)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
          }
        ]
      },
      {
        "id": "brain_ptsd_t8",
        "name": "Orbitofrontal cortex",
        "dir": "down",
        "refs": "PMID 38682011",
        "note": "Decreased volume in PTSD.",
        "links": [
          {
            "id": "brain_ptsd_t8_l1",
            "label": "Liberati & Perrotta 2024, Ibrain — same narrative review already cited for this condition's other entries (PMID 38682011)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
          }
        ]
      },
      {
        "id": "brain_ptsd_t9",
        "name": "Prefrontal cortex",
        "dir": "down",
        "refs": "PMID 38682011",
        "note": "Decreased gray and white matter density, and decreased responsiveness to trauma-related and emotional stimuli.",
        "links": [
          {
            "id": "brain_ptsd_t9_l1",
            "label": "Liberati & Perrotta 2024, Ibrain — same narrative review already cited for this condition's other entries (PMID 38682011)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38682011/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_scz",
    "name": "Schizophrenia",
    "abbr": "SCZ",
    "color": "#3DDC97",
    "note": "Based on a selective review of 48 PET/fMRI studies of mnemonic and executive task-related ACC activation in schizophrenia — hypoactivation was the dominant, most consistent pattern across task types, though some studies report hyperactivation (largely in n-back working-memory tasks), reflecting genuine heterogeneity the source paper discusses at length. A second study (n=45: 15 SCZ, 15 ASD, 15 controls, fMRI during an n-back working-memory task) directly compared SCZ to ASD on frontoparietal network hubs — SCZ showed distinctively elevated connectivity that ASD did not (ASD didn't differ from controls), addressing whether autism itself shows this pattern: in this study, it doesn't.",
    "links": [
      {
        "id": "brain_scz_condl1",
        "label": "Adams & David 2007, selective review (PMID 19300540)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/19300540/"
      },
      {
        "id": "brain_scz_condl2",
        "label": "2026, Front Psychiatry (PMID 41799819)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41799819/"
      }
    ],
    "taxa": [
      {
        "id": "brain_scz_t1",
        "name": "Anterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 19300540",
        "note": "Hypoactivation was the most common finding across 48 PET/fMRI studies of task-related ACC activation in schizophrenia, found in all task types; hyperactivation occurred mainly in n-back working-memory tasks specifically.",
        "links": [
          {
            "id": "brain_scz_t1_l1",
            "label": "Adams & David 2007 (PMID 19300540)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19300540/"
          }
        ]
      },
      {
        "id": "brain_scz_t2",
        "name": "Frontoparietal network",
        "dir": "up",
        "refs": "PMID 41799819",
        "note": "Elevated connectivity between core FPN hubs (DLPFC-IPS) during a working-memory task, distinctively higher than both autism and healthy controls — autism did not differ from controls in this same study. The opposite direction from TBI's frontoparietal network finding on this map.",
        "links": [
          {
            "id": "brain_scz_t2_l1",
            "label": "2026, Front Psychiatry (PMID 41799819)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41799819/"
          }
        ]
      },
      {
        "id": "brain_scz_t3",
        "name": "Insula",
        "dir": "up",
        "refs": "PMID 41799819",
        "note": "Elevated insula-IPS connectivity (linking the salience network to the frontoparietal network) in schizophrenia, distinctively higher than both autism and controls in the same study.",
        "links": [
          {
            "id": "brain_scz_t3_l1",
            "label": "2026, Front Psychiatry (PMID 41799819)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41799819/"
          }
        ]
      },
      {
        "id": "brain_sz_t4",
        "name": "Dorsolateral prefrontal cortex",
        "dir": "down",
        "refs": "PMID 19652121",
        "note": "Hypoactivation during executive-function tasks, part of the cognitive control network, in a 41-study meta-analysis.",
        "links": [
          {
            "id": "brain_sz_t4_l1",
            "label": "Minzenberg et al. 2009, Arch Gen Psychiatry — 41-study executive-function fMRI meta-analysis (PMID 19652121)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19652121/"
          }
        ]
      },
      {
        "id": "brain_sz_t5",
        "name": "Thalamus",
        "dir": "down",
        "refs": "PMID 19652121 / PMID 26283641",
        "note": "Corroborated across methodologies: hypoactivation during executive-function tasks (Minzenberg et al. 2009, 41 studies) AND smaller structural volume (Cohen's d=-0.31) in the largest schizophrenia structural MRI study to date (van Erp et al. 2016, ENIGMA, n=2,028 SCZ/2,540 controls).",
        "links": [
          {
            "id": "brain_sz_t5_l1",
            "label": "Minzenberg et al. 2009, Arch Gen Psychiatry — 41-study executive-function fMRI meta-analysis (PMID 19652121)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19652121/"
          },
          {
            "id": "brain_sz_t5_l2",
            "label": "van Erp et al. 2016, Mol Psychiatry — ENIGMA consortium, 2,028 SCZ/2,540 controls, structural MRI (PMID 26283641)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26283641/"
          }
        ]
      },
      {
        "id": "brain_sz_t6",
        "name": "Hippocampus",
        "dir": "down",
        "refs": "PMID 26283641",
        "note": "Smaller structural volume (Cohen's d=-0.46, the largest effect size in the study), ENIGMA consortium, n=2,028 SCZ/2,540 controls.",
        "links": [
          {
            "id": "brain_sz_t6_l1",
            "label": "van Erp et al. 2016, Mol Psychiatry — ENIGMA consortium, 2,028 SCZ/2,540 controls, structural MRI (PMID 26283641)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26283641/"
          }
        ]
      },
      {
        "id": "brain_sz_t7",
        "name": "Amygdala",
        "dir": "down",
        "refs": "PMID 26283641",
        "note": "Smaller structural volume (Cohen's d=-0.31), same ENIGMA study.",
        "links": [
          {
            "id": "brain_sz_t7_l1",
            "label": "van Erp et al. 2016, Mol Psychiatry — ENIGMA consortium, 2,028 SCZ/2,540 controls, structural MRI (PMID 26283641)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26283641/"
          }
        ]
      },
      {
        "id": "brain_sz_t8",
        "name": "Globus pallidus",
        "dir": "up",
        "refs": "PMID 26283641",
        "note": "Larger structural volume (Cohen's d=0.21) — positively associated with duration of illness — same ENIGMA study.",
        "links": [
          {
            "id": "brain_sz_t8_l1",
            "label": "van Erp et al. 2016, Mol Psychiatry — ENIGMA consortium, 2,028 SCZ/2,540 controls, structural MRI (PMID 26283641)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26283641/"
          }
        ]
      },
      {
        "id": "brain_sz_t9",
        "name": "Nucleus accumbens",
        "dir": "down",
        "refs": "PMID 26283641",
        "note": "Smaller structural volume (Cohen's d=-0.25), same ENIGMA study — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_sz_t9_l1",
            "label": "van Erp et al. 2016, Mol Psychiatry — ENIGMA consortium, 2,028 SCZ/2,540 controls, structural MRI (PMID 26283641)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26283641/"
          }
        ]
      },
      {
        "id": "brain_scz_t10",
        "name": "Cerebellum",
        "dir": "down",
        "refs": "",
        "note": "Total cerebellar gray matter volume robustly reduced (Cohen's d=-0.35), strongest in cerebellar regions functionally connected to frontoparietal cortex (d=-0.40) — multisite mega-analysis, n=983 SZ/1,349 controls, 14 sites, ages 16-66. Consistent across the age span including youngest patients — more consistent with neurodevelopmental than neurodegenerative origin. Corroborated by a separate 25-study voxel-based meta-analysis (n=996/1,109) finding decreased GMV in left Crus II, right lobule VI, right lobule VIII (PMID 36620665).",
        "links": [
          {
            "id": "brain_scz_t10_l1",
            "label": "Mega-analysis, n=983/1,349, 14 sites (PMID 28507318)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28507318/"
          },
          {
            "id": "brain_scz_t10_l2",
            "label": "Voxel-based meta-analysis, n=996/1,109 (PMID 36620665)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36620665/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_bpd",
    "name": "Borderline Personality Disorder",
    "abbr": "BPD",
    "color": "#E36AA6",
    "note": "Based on a 2025 narrative review synthesizing 112 neuroimaging/neurochemical/treatment studies. The review also describes broader prefrontal-amygdala circuitry and default-mode-network disruption, but only the precuneus finding was stated with a clear, single consistent direction in the source.",
    "links": [
      {
        "id": "brain_bpd_condl1",
        "label": "Giannoulis et al. 2025, Biomedicines (PMID 40722851)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40722851/"
      }
    ],
    "taxa": [
      {
        "id": "brain_bpd_t1",
        "name": "Precuneus",
        "dir": "up",
        "refs": "PMID 40722851",
        "note": "A 'dominant and stable pattern of hyperconnectivity' in the precuneus was highlighted as one of the most consistent findings across the 112 studies synthesized in this 2025 review, with partial overlap in default-mode-network dysregulation reported vs PTSD and cocaine use disorder.",
        "links": [
          {
            "id": "brain_bpd_t1_l1",
            "label": "Giannoulis et al. 2025 (PMID 40722851)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40722851/"
          }
        ]
      },
      {
        "id": "brain_bpd_t2",
        "name": "Dorsal anterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 40722851",
        "note": "dACC hypoactivity is named alongside precuneus hyperconnectivity as one of the few BPD biomarkers described as \"robust across studies\" in this review's conclusion, despite the field's general small-sample-size and replication limitations.",
        "links": [
          {
            "id": "brain_bpd_t2_l1",
            "label": "Giannoulis et al. 2025, Biomedicines (PMID 40722851)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40722851/"
          }
        ]
      },
      {
        "id": "brain_bpd_t3",
        "name": "Amygdala",
        "dir": "both",
        "refs": "PMID 34031363 / PMID 19663654",
        "note": "A genuine structure-vs-function dissociation: increased activation (bilateral, part of a hippocampal/amygdala complex) during emotion-processing tasks in a 52-study functional meta-analysis, but smaller structural volume (bilateral) in a separate 6-study structural MRI meta-analysis. The functional finding's authors caution it \"was not robust\" to publication bias (2-3 null studies would eliminate significance) — noted for transparency.",
        "links": [
          {
            "id": "brain_bpd_t3_l1",
            "label": "Degasperi et al. 2021, Transl Psychiatry — 52 studies, 1,104 BPD/1,100 controls (PMID 34031363)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34031363/"
          },
          {
            "id": "brain_bpd_t3_l2",
            "label": "Nunes et al. 2009, J Pers Disord — 6 studies, 104 BPD/122 controls, structural MRI (PMID 19663654)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19663654/"
          }
        ]
      },
      {
        "id": "brain_bpd_t4",
        "name": "Hippocampus",
        "dir": "both",
        "refs": "PMID 34031363 / PMID 19663654",
        "note": "Same structure-vs-function dissociation as amygdala above: increased functional activation (same complex, emotion-processing tasks) vs. smaller structural volume (bilateral) in the two meta-analyses.",
        "links": [
          {
            "id": "brain_bpd_t4_l1",
            "label": "Degasperi et al. 2021, Transl Psychiatry — 52 studies, 1,104 BPD/1,100 controls (PMID 34031363)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34031363/"
          },
          {
            "id": "brain_bpd_t4_l2",
            "label": "Nunes et al. 2009, J Pers Disord — 6 studies, 104 BPD/122 controls, structural MRI (PMID 19663654)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19663654/"
          }
        ]
      },
      {
        "id": "brain_bpd_t5",
        "name": "Anterior cingulate cortex",
        "dir": "up",
        "refs": "PMID 34031363",
        "note": "Increased activation (part of a middle-frontal-gyrus/ACC cluster) during emotion processing, in the same 52-study meta-analysis — kept distinct from this condition's existing Dorsal anterior cingulate cortex entry (down, different source), consistent with how other conditions on this map separate dorsal-specific from generic ACC findings.",
        "links": [
          {
            "id": "brain_bpd_t5_l1",
            "label": "Degasperi et al. 2021, Transl Psychiatry — 52 studies, 1,104 BPD/1,100 controls (PMID 34031363)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34031363/"
          }
        ]
      },
      {
        "id": "brain_bpd_t6",
        "name": "Middle frontal gyrus",
        "dir": "up",
        "refs": "PMID 34031363",
        "note": "Increased activation, same cluster as the ACC finding above, in the same meta-analysis.",
        "links": [
          {
            "id": "brain_bpd_t6_l1",
            "label": "Degasperi et al. 2021, Transl Psychiatry — 52 studies, 1,104 BPD/1,100 controls (PMID 34031363)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34031363/"
          }
        ]
      },
      {
        "id": "brain_bpd_t7",
        "name": "Insula",
        "dir": "down",
        "refs": "PMID 34031363",
        "note": "Lower activation vs. controls (right, extending into inferior frontal gyrus) — found only in a secondary analysis of the same 52-study meta-analysis.",
        "links": [
          {
            "id": "brain_bpd_t7_l1",
            "label": "Degasperi et al. 2021, Transl Psychiatry — 52 studies, 1,104 BPD/1,100 controls (PMID 34031363)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34031363/"
          }
        ]
      },
      {
        "id": "brain_bpd_t8",
        "name": "Inferior frontal gyrus",
        "dir": "down",
        "refs": "PMID 34031363",
        "note": "Lower activation vs. controls (right, same insula cluster above), secondary analysis, same meta-analysis.",
        "links": [
          {
            "id": "brain_bpd_t8_l1",
            "label": "Degasperi et al. 2021, Transl Psychiatry — 52 studies, 1,104 BPD/1,100 controls (PMID 34031363)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34031363/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_aud",
    "name": "Alcoholism",
    "abbr": "AUD",
    "color": "#B91C1C",
    "note": "ALE meta-analysis of 67 task-based fMRI studies in alcohol use disorder. The putamen also showed significant alterations (both hypo- and hyperactivation depending on task/abstinence stage) but was excluded here since its direction isn't a single consistent one — unlike the two entries below.",
    "links": [
      {
        "id": "brain_aud_condl1",
        "label": "ALE meta-analysis, Brain Sciences 2025 (PMID 40722257)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40722257/"
      }
    ],
    "taxa": [
      {
        "id": "brain_aud_t1",
        "name": "Middle frontal gyrus",
        "dir": "down",
        "refs": "PMID 40722257",
        "note": "Hypoactivation (dorsolateral prefrontal cortex) specific to short-term abstinence, consistent with executive dysfunction in AUD.",
        "links": [
          {
            "id": "brain_aud_t1_l1",
            "label": "ALE meta-analysis, Brain Sciences 2025 (PMID 40722257)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40722257/"
          }
        ]
      },
      {
        "id": "brain_aud_t2",
        "name": "Dorsal anterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 40722257",
        "note": "Hypoactivation specific to long-term abstinence, in the same region implicated in attentional salience.",
        "links": [
          {
            "id": "brain_aud_t2_l1",
            "label": "ALE meta-analysis, Brain Sciences 2025 (PMID 40722257)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40722257/"
          }
        ]
      },
      {
        "id": "brain_alc_t3",
        "name": "Putamen",
        "dir": "both",
        "refs": "PMID 40722257",
        "note": "Aberrant activity (mixed hypo- and hyperactivation, 68.1% of the cluster) during reward-processing/decision-making tasks, predominantly in short-term abstinence — from the same 67-study meta-analysis used for this condition's other entries.",
        "links": [
          {
            "id": "brain_alc_t3_l1",
            "label": "Roberge et al. 2025 — 67 task-based fMRI studies, 2,421 AUD/1,458 controls (PMID 40722257)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40722257/"
          }
        ]
      },
      {
        "id": "brain_alc_t4",
        "name": "Caudate nucleus",
        "dir": "both",
        "refs": "PMID 40722257",
        "note": "Aberrant activity (caudate body 22.5%, caudate head remainder of the same cluster as the putamen finding above) during reward-processing/decision-making tasks, short-term abstinence, in the same meta-analysis.",
        "links": [
          {
            "id": "brain_alc_t4_l1",
            "label": "Roberge et al. 2025 — 67 task-based fMRI studies, 2,421 AUD/1,458 controls (PMID 40722257)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40722257/"
          }
        ]
      },
      {
        "id": "brain_alc_t5",
        "name": "Superior frontal gyrus",
        "dir": "down",
        "refs": "PMID 40722257 / PMID 33664372",
        "note": "Hypoactivation (right, extending into middle frontal gyrus/dlPFC) during executive-function/working-memory/reward tasks specifically in long-term abstinence (Roberge et al. 2025) — independently corroborated by smaller structural gray matter volume (left) in a separate 27-study VBM meta-analysis (Spindler et al. 2021).",
        "links": [
          {
            "id": "brain_alc_t5_l1",
            "label": "Roberge et al. 2025 — 67 task-based fMRI studies, 2,421 AUD/1,458 controls (PMID 40722257)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40722257/"
          },
          {
            "id": "brain_alc_t5_l2",
            "label": "Spindler et al. 2021, Sci Rep — VBM meta-analysis, 27 studies, 1,045 AUD/1,054 controls (PMID 33664372)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33664372/"
          }
        ]
      },
      {
        "id": "brain_alc_t6",
        "name": "Anterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 33664372",
        "note": "Smaller gray matter volume (bilateral) in the 27-study VBM meta-analysis — a broader/structural finding distinct from this condition's existing Dorsal anterior cingulate cortex entry (functional, Roberge et al. 2025), kept as a separate entry consistent with how other conditions on this map distinguish dorsal-ACC-specific from generic-ACC findings.",
        "links": [
          {
            "id": "brain_alc_t6_l1",
            "label": "Spindler et al. 2021, Sci Rep — VBM meta-analysis, 27 studies, 1,045 AUD/1,054 controls (PMID 33664372)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33664372/"
          }
        ]
      },
      {
        "id": "brain_alc_t7",
        "name": "Posterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 33664372",
        "note": "Smaller gray matter volume in the same 27-study VBM meta-analysis.",
        "links": [
          {
            "id": "brain_alc_t7_l1",
            "label": "Spindler et al. 2021, Sci Rep — VBM meta-analysis, 27 studies, 1,045 AUD/1,054 controls (PMID 33664372)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33664372/"
          }
        ]
      },
      {
        "id": "brain_alc_t8",
        "name": "Precentral gyrus",
        "dir": "down",
        "refs": "PMID 33664372",
        "note": "Smaller gray matter volume (left) in the same 27-study VBM meta-analysis.",
        "links": [
          {
            "id": "brain_alc_t8_l1",
            "label": "Spindler et al. 2021, Sci Rep — VBM meta-analysis, 27 studies, 1,045 AUD/1,054 controls (PMID 33664372)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33664372/"
          }
        ]
      },
      {
        "id": "brain_alc_t9",
        "name": "Postcentral gyrus",
        "dir": "down",
        "refs": "PMID 33664372",
        "note": "Smaller gray matter volume (left) in the same 27-study VBM meta-analysis — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_alc_t9_l1",
            "label": "Spindler et al. 2021, Sci Rep — VBM meta-analysis, 27 studies, 1,045 AUD/1,054 controls (PMID 33664372)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33664372/"
          }
        ]
      },
      {
        "id": "brain_alc_t10",
        "name": "Insula",
        "dir": "down",
        "refs": "PMID 33664372",
        "note": "Smaller gray matter volume (right posterior insula; left anterior insula/claustrum) in the same 27-study VBM meta-analysis.",
        "links": [
          {
            "id": "brain_alc_t10_l1",
            "label": "Spindler et al. 2021, Sci Rep — VBM meta-analysis, 27 studies, 1,045 AUD/1,054 controls (PMID 33664372)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33664372/"
          }
        ]
      },
      {
        "id": "brain_aud_t11",
        "name": "Amygdala",
        "dir": "down",
        "refs": "",
        "note": "Smaller volume in AUD vs. controls, discovery cohort n=33 AUD/32 controls, validated in an independent n=19/20 cohort, MRI-morphometry classification (P<0.01 for bilateral volumes) (PMID 33629726). Left amygdala also showed significant age-related volume decline specific to AUD (accelerated aging), not seen in controls.",
        "links": [
          {
            "id": "brain_aud_t11_l1",
            "label": "2-cohort MRI morphometry study, n=33/32 + n=19/20 validation (PMID 33629726)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33629726/"
          }
        ]
      },
      {
        "id": "brain_aud_t12",
        "name": "Thalamus",
        "dir": "down",
        "refs": "",
        "note": "Smaller volume in AUD vs. controls, discovery cohort n=33 AUD/32 controls, validated in an independent n=19/20 cohort, MRI-morphometry classification (P<0.01 for bilateral volumes) (PMID 33629726). Consistent with other studies finding thalamic volume deficits predict relapse likelihood, and volume partially recovers with abstinence.",
        "links": [
          {
            "id": "brain_aud_t12_l1",
            "label": "2-cohort MRI morphometry study, n=33/32 + n=19/20 validation (PMID 33629726)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33629726/"
          }
        ]
      },
      {
        "id": "brain_aud_t13",
        "name": "Hippocampus",
        "dir": "down",
        "refs": "",
        "note": "Smaller volume in AUD vs. controls, discovery cohort n=33 AUD/32 controls, validated in an independent n=19/20 cohort, MRI-morphometry classification (P<0.01 for bilateral volumes) (PMID 33629726).",
        "links": [
          {
            "id": "brain_aud_t13_l1",
            "label": "2-cohort MRI morphometry study, n=33/32 + n=19/20 validation (PMID 33629726)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33629726/"
          }
        ]
      },
      {
        "id": "brain_aud_t14",
        "name": "Nucleus accumbens",
        "dir": "down",
        "refs": "",
        "note": "Smaller volume in AUD vs. controls, discovery cohort n=33 AUD/32 controls, validated in an independent n=19/20 cohort, MRI-morphometry classification (P<0.01 for bilateral volumes) (PMID 33629726).",
        "links": [
          {
            "id": "brain_aud_t14_l1",
            "label": "2-cohort MRI morphometry study, n=33/32 + n=19/20 validation (PMID 33629726)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33629726/"
          }
        ]
      },
      {
        "id": "brain_aud_t15",
        "name": "Cerebellum",
        "dir": "down",
        "refs": "",
        "note": "Cerebellar white matter volume 6.1% smaller in alcoholic vs. nonalcoholic participants (n=44 AL/39 controls), with particular involvement of the cerebellar vermis linked to postural-stability deficits. Some recovery with abstinence; further decline with continued drinking.",
        "links": [
          {
            "id": "brain_aud_t15_l1",
            "label": "Sullivan et al., n=44/39, cerebellar white matter (PMID 27130832)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27130832/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_whm",
    "name": "Wim Hof Method",
    "abbr": "WHM",
    "color": "#F97316",
    "note": "A single, rigorous multi-modal (fMRI + PET/CT) case study of Wim Hof himself practicing his self-developed technique (forced breathing + cold exposure + meditation) during a cold-exposure fMRI paradigm, vs a typical control cohort. Genuinely thin evidence (n=1 for the core finding) — included as an exploratory practice/intervention entry, not a diagnosed condition, to see how a voluntary regulation practice compares to the disorder entries on this map.",
    "links": [
      {
        "id": "brain_whm_condl1",
        "label": "van Middendorp et al. 2018, NeuroImage (PMID 29438845)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/29438845/"
      }
    ],
    "taxa": [
      {
        "id": "brain_whm_t1",
        "name": "Periaqueductal gray",
        "dir": "up",
        "refs": "PMID 29438845",
        "note": "WHM practice activated the periaqueductal gray, a primary control center for descending pain/cold modulation, possibly initiating a stress-induced analgesic response during cold exposure. IMPORTANT CAVEAT: this is a case study of ONE subject — Wim Hof himself (\"the Iceman\"), age 57 at the time — compared against an unspecified-size cohort of typical controls, not a group study of trained practitioners in general. Generalizability to other WHM practitioners is unverified by this source.",
        "links": [
          {
            "id": "brain_whm_t1_l1",
            "label": "van Middendorp et al. 2018, NeuroImage (PMID 29438845)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29438845/"
          }
        ]
      },
      {
        "id": "brain_whm_t2",
        "name": "Insula",
        "dir": "up",
        "refs": "PMID 29438845",
        "note": "WHM practice engaged the anterior (left) and middle (right) insula — regions tied to self-reflection, internal focus, and sustained attention in the presence of an aversive stimulus (cold). Notably the same direction as OCD, Bipolar Disorder, Anxiety, and Depression's insula findings on this map, worth comparing given this is a voluntary, adaptive practice rather than a disorder. IMPORTANT CAVEAT: this is a case study of ONE subject — Wim Hof himself (\"the Iceman\"), age 57 at the time — compared against an unspecified-size cohort of typical controls, not a group study of trained practitioners in general. Generalizability to other WHM practitioners is unverified by this source.",
        "links": [
          {
            "id": "brain_whm_t2_l1",
            "label": "van Middendorp et al. 2018, NeuroImage (PMID 29438845)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29438845/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_exercise",
    "name": "Exercise",
    "abbr": "EX",
    "color": "#22C55E",
    "note": "ALE meta-analysis of 20 task-based/resting-state fMRI studies on exercise interventions and executive-function-related brain activation in healthy populations (not a disorder — included to compare a beneficial intervention's neural signature against the disorder entries on this map). Effects varied by age group, exercise type, and duration; entries below are the convergent activation peaks for the inhibition-related executive-function contrast specifically.",
    "links": [
      {
        "id": "brain_exercise_condl1",
        "label": "ALE meta-analysis, Scientific Reports 2025 (PMID 41039062)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41039062/"
      }
    ],
    "taxa": [
      {
        "id": "brain_exercise_t1",
        "name": "Precuneus",
        "dir": "up",
        "refs": "PMID 41039062",
        "note": "Convergent activation peak during inhibition-related executive-function tasks across exercise-intervention fMRI studies.",
        "links": [
          {
            "id": "brain_exercise_t1_l1",
            "label": "ALE meta-analysis, Scientific Reports 2025 (PMID 41039062)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41039062/"
          }
        ]
      },
      {
        "id": "brain_exercise_t2",
        "name": "Middle frontal gyrus",
        "dir": "up",
        "refs": "PMID 41039062",
        "note": "Convergent activation peak during inhibition-related executive-function tasks after exercise — notably the opposite direction from Autism and ADHD's middle frontal gyrus finding on this map (both show decreased activation there). Independently corroborated by a separate 3-month RCT (Soshi et al. 2021, 24 intervention/23 control older adults): increased volume in the middle frontal sulcus, associated with general cognitive improvement.",
        "links": [
          {
            "id": "brain_exercise_t2_l1",
            "label": "ALE meta-analysis, Scientific Reports 2025 (PMID 41039062)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41039062/"
          },
          {
            "id": "brain_exercise_t2_l1",
            "label": "Soshi et al. 2021, Cereb Cortex — 3-month RCT, 24 intervention/23 control older adults (PMID 34009242)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34009242/"
          }
        ]
      },
      {
        "id": "brain_exercise_t3",
        "name": "Parahippocampal gyrus",
        "dir": "up",
        "refs": "PMID 41039062",
        "note": "Convergent activation peak during inhibition-related executive-function tasks after exercise — again the opposite direction from Autism and ADHD's parahippocampal gyrus finding on this map.",
        "links": [
          {
            "id": "brain_exercise_t3_l1",
            "label": "ALE meta-analysis, Scientific Reports 2025 (PMID 41039062)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41039062/"
          }
        ]
      },
      {
        "id": "brain_ex_t4",
        "name": "Hippocampus",
        "dir": "up",
        "refs": "PMID 21282661",
        "note": "Aerobic exercise training increased anterior hippocampal volume by 2% over 1 year in a 120-person RCT, effectively reversing 1-2 years of age-related volume loss, alongside improved spatial memory and higher serum BDNF — while volume in the control group declined. The SAME study explicitly reports a null finding worth preserving: \"Caudate nucleus and thalamus volumes were unaffected by the intervention.\" A published critical commentary (Coen, Lawlor & Kenny 2011, PNAS) also questioned whether the memory improvement was actually attributable to the exercise intervention or the volume change specifically, rather than disputing the volume finding itself. Independently, a separate 3-month RCT (Soshi et al. 2021) found reduced hippocampal volume in CONTROLS while the exercise group was protected from that decline — consistent direction, different framing.",
        "links": [
          {
            "id": "brain_ex_t4_l1",
            "label": "Erickson et al. 2011, PNAS — RCT, 120 older adults (PMID 21282661)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21282661/"
          },
          {
            "id": "brain_ex_t4_l2",
            "label": "Critical commentary: Coen et al. 2011, PNAS (PMID 21504947)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21504947/"
          },
          {
            "id": "brain_ex_t4_l3",
            "label": "Soshi et al. 2021, Cereb Cortex — 3-month RCT, 24 intervention/23 control older adults (PMID 34009242)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34009242/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_migraine",
    "name": "Migraine",
    "abbr": "MIG",
    "color": "#D4A15A",
    "note": "Interictal (between-attacks) fMRI study of migraine without aura (n=30) vs non-headache controls (n=29) during demanding visuospatial tasks. Migraine patients showed a lack of normal repetition suppression plus repetition enhancement in these two regions — interpreted as abnormal engagement of pain-modulatory regions during ordinary visual processing, consistent with sensory input being processed as aversive rather than neutral even between attacks.",
    "links": [
      {
        "id": "brain_migraine_condl1",
        "label": "2026, J Headache Pain (PMID 41820828)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41820828/"
      },
      {
        "id": "brain_migraine_condl2",
        "label": "Chen et al. 2022 meta-analysis, Frontiers in Neurology — 39 studies, 1,355 migraine patients vs. 1,149 controls (PMID 36419535)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/36419535/"
      },
      {
        "id": "brain_migraine_condl3",
        "label": "Schulte & May 2016, Brain — 30-day daily-scan longitudinal case study spanning 3 spontaneous attacks (PMID 27190019)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/27190019/"
      }
    ],
    "taxa": [
      {
        "id": "brain_migraine_t1",
        "name": "Periaqueductal gray",
        "dir": "up",
        "refs": "PMID 41820828",
        "note": "Repetition enhancement (rather than the normal repetition suppression) in interictal migraine without aura during visually demanding tasks; also correlated with increased photophobia. Same region and direction as the Wim Hof Method entry on this map, worth comparing — one is a voluntary practice, the other a chronic pain-processing abnormality.",
        "links": [
          {
            "id": "brain_migraine_t1_l1",
            "label": "2026, J Headache Pain (PMID 41820828)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41820828/"
          }
        ]
      },
      {
        "id": "brain_migraine_t2",
        "name": "Orbitofrontal cortex",
        "dir": "up",
        "refs": "PMID 41820828",
        "note": "Repetition enhancement correlated with task accuracy, interpreted as increased effortful top-down control to sustain performance — the opposite direction from OCD's orbitofrontal cortex finding on this map.",
        "links": [
          {
            "id": "brain_migraine_t2_l1",
            "label": "2026, J Headache Pain (PMID 41820828)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41820828/"
          }
        ]
      },
      {
        "id": "brain_migraine_t3",
        "name": "Thalamus",
        "dir": "up",
        "refs": "PMID 36419535",
        "note": "Increased regional homogeneity (left thalamus) — one of only two regions to reach meta-analytic significance across 39 studies; most individual-study VBM/connectivity findings did NOT replicate at the meta-analytic level (see note on this condition's other entries).",
        "links": [
          {
            "id": "brain_migraine_t3_l1",
            "label": "Chen et al. 2022 meta-analysis, Frontiers in Neurology — 39 studies, 1,355 migraine patients vs. 1,149 controls (PMID 36419535)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36419535/"
          }
        ]
      },
      {
        "id": "brain_migraine_t4",
        "name": "Brainstem",
        "dir": "up",
        "refs": "PMID 36419535",
        "note": "Increased regional homogeneity — a new region added to this app's brain-region list, distinct from the periaqueductal gray entry already tracked for this condition (both are brainstem structures but reported as separate ALE clusters).",
        "links": [
          {
            "id": "brain_migraine_t4_l1",
            "label": "Chen et al. 2022 meta-analysis, Frontiers in Neurology — 39 studies, 1,355 migraine patients vs. 1,149 controls (PMID 36419535)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36419535/"
          }
        ]
      },
      {
        "id": "brain_migraine_t5",
        "name": "Hypothalamus",
        "dir": "up",
        "refs": "PMID 27190019",
        "note": "Increased BOLD activation to trigeminal nociceptive stimulation specifically in the 24-48h before an attack (the \"premonitory phase\"), with altered functional coupling to the spinal trigeminal nuclei and dorsal rostral pons — a well-replicated finding across multiple independent studies, not just this one, though this longitudinal 30-day case study is the landmark demonstration.",
        "links": [
          {
            "id": "brain_migraine_t5_l1",
            "label": "Schulte & May 2016, Brain — 30-day daily-scan longitudinal case study spanning 3 spontaneous attacks (PMID 27190019)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27190019/"
          }
        ]
      },
      {
        "id": "brain_migraine_t6",
        "name": "Amygdala",
        "dir": "both",
        "refs": "",
        "note": "Functional connectivity finding (not structural volume), n=18 controls/18 episodic migraine/16 chronic migraine, FreeSurfer + resting-state fMRI: INCREASED left amygdala functional connectivity in episodic migraine, but DECREASED right amygdala functional connectivity in chronic migraine, both vs. controls — a genuine episodic-vs-chronic split, not a single direction.",
        "links": [
          {
            "id": "brain_migraine_t6_l1",
            "label": "n=18/18/16, FreeSurfer + rs-fMRI (PMID 28116559)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28116559/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_prosop",
    "name": "Prosopagnosia",
    "abbr": "PROS",
    "color": "#84CC16",
    "note": "fMRI study of developmental prosopagnosia (n=34) vs controls (n=23) during passive face viewing plus resting-state connectivity, focused on the face-selective processing network.",
    "links": [
      {
        "id": "brain_prosop_condl1",
        "label": "2025, Imaging Neuroscience (PMID 41255467)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41255467/"
      }
    ],
    "taxa": [
      {
        "id": "brain_prosop_t1",
        "name": "Fusiform gyrus",
        "dir": "down",
        "refs": "PMID 41255467",
        "note": "Reduced face-selective activation in the left fusiform face area during passive face viewing — the clearest single finding in developmental prosopagnosia, alongside reduced resting-state connectivity between this region and the right anterior superior temporal sulcus. Independently corroborated by a lesion network mapping study: all 44 analyzed prosopagnosia-causing lesions were functionally connected to the right fusiform face area (100% at the highest threshold).",
        "links": [
          {
            "id": "brain_prosop_t1_l1",
            "label": "2025, Imaging Neuroscience (PMID 41255467)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41255467/"
          },
          {
            "id": "brain_prosop_t1_l1",
            "label": "Cohen et al. 2019, Brain — lesion network mapping, 44 acquired prosopagnosia lesions (PMID 31740940)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31740940/"
          }
        ]
      },
      {
        "id": "brain_pro_t2",
        "name": "Occipital face area",
        "dir": "down",
        "refs": "PMID 31740940",
        "note": "Bilateral occipital face area functionally connected to >50% of prosopagnosia-causing lesions in the same lesion-network-mapping study — a new region added to this app's brain-region list, part of the \"core face network\" alongside the fusiform face area.",
        "links": [
          {
            "id": "brain_pro_t2_l1",
            "label": "Cohen et al. 2019, Brain — lesion network mapping, 44 acquired prosopagnosia lesions (PMID 31740940)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31740940/"
          }
        ]
      },
      {
        "id": "brain_pro_t3",
        "name": "Superior temporal sulcus",
        "dir": "down",
        "refs": "PMID 31740940",
        "note": "Right superior temporal sulcus functionally connected to >50% of prosopagnosia-causing lesions in the same study — a new region added to this app's brain-region list, the third node of the \"core face network.\" The same study also found that all 44 lesions were negatively functionally connected to four left frontal regions (frontopolar/anterior prefrontal cortex, anterior cingulate cortex, middle frontal gyrus, superior frontal gyrus) — not added as separate entries here since lesion-network negative-correlation doesn't map cleanly onto this app's up/down activation convention, but noted for completeness.",
        "links": [
          {
            "id": "brain_pro_t3_l1",
            "label": "Cohen et al. 2019, Brain — lesion network mapping, 44 acquired prosopagnosia lesions (PMID 31740940)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31740940/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_an",
    "name": "Anorexia Nervosa",
    "abbr": "AN",
    "color": "#E879F9",
    "note": "Multicenter resting-state fMRI study (111 AN patients, 131 healthy controls) testing the triple-network model (default mode, central executive, and salience networks). Findings are functional-connectivity reductions within/between networks, not simple regional activation — reduced salience-network connectivity specifically correlated with eating-disorder symptom severity.",
    "links": [
      {
        "id": "brain_an_condl1",
        "label": "2026, Biol Psychiatry Glob Open Sci (PMID 41846590)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41846590/"
      },
      {
        "id": "brain_an_condl2",
        "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
      },
      {
        "id": "brain_an_condl3",
        "label": "Titova et al. 2013 meta-analysis, BMC Psychiatry — 9 VBM studies, 228 AN vs. 240 controls (PMID 23570420)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/23570420/"
      }
    ],
    "taxa": [
      {
        "id": "brain_an_t1",
        "name": "Insula",
        "dir": "down",
        "refs": "PMID 41846590",
        "note": "Reduced functional connectivity within the salience network (anchored by the anterior insula and dACC) — the degree of reduction correlated with eating-disorder symptom severity, across a large multicenter sample.",
        "links": [
          {
            "id": "brain_an_t1_l1",
            "label": "2026, Biol Psychiatry Glob Open Sci (PMID 41846590)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41846590/"
          }
        ]
      },
      {
        "id": "brain_an_t2",
        "name": "Anterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 41846590",
        "note": "Reduced connectivity within the salience network alongside the insula, plus reduced coupling between the salience network and central executive network.",
        "links": [
          {
            "id": "brain_an_t2_l1",
            "label": "2026, Biol Psychiatry Glob Open Sci (PMID 41846590)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41846590/"
          }
        ]
      },
      {
        "id": "brain_an_t3",
        "name": "Median cingulate cortex",
        "dir": "down",
        "refs": "PMID 34296492",
        "note": "Reduced gray matter volume (bilateral), extending to precuneus/PCC/ACC/superior frontal gyrus in one large cluster.",
        "links": [
          {
            "id": "brain_an_t3_l1",
            "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
          }
        ]
      },
      {
        "id": "brain_an_t4",
        "name": "Precuneus",
        "dir": "down",
        "refs": "PMID 34296492",
        "note": "Reduced gray matter volume, part of the same extended cluster as median cingulate cortex.",
        "links": [
          {
            "id": "brain_an_t4_l1",
            "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
          }
        ]
      },
      {
        "id": "brain_an_t5",
        "name": "Middle occipital gyrus",
        "dir": "down",
        "refs": "PMID 34296492",
        "note": "Reduced gray matter volume (left), extending to left inferior parietal lobe.",
        "links": [
          {
            "id": "brain_an_t5_l1",
            "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
          }
        ]
      },
      {
        "id": "brain_an_t6",
        "name": "Posterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 34296492",
        "note": "Reduced gray matter volume (bilateral).",
        "links": [
          {
            "id": "brain_an_t6_l1",
            "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
          }
        ]
      },
      {
        "id": "brain_an_t7",
        "name": "Supplementary motor area",
        "dir": "down",
        "refs": "PMID 34296492",
        "note": "Reduced gray matter volume — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_an_t7_l1",
            "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
          }
        ]
      },
      {
        "id": "brain_an_t8",
        "name": "Superior frontal gyrus",
        "dir": "down",
        "refs": "PMID 34296492",
        "note": "Reduced gray matter volume (medial, bilateral) — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_an_t8_l1",
            "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
          }
        ]
      },
      {
        "id": "brain_an_t9",
        "name": "Parahippocampal gyrus",
        "dir": "up",
        "refs": "PMID 34296492",
        "note": "Increased resting-state functional activity (right), extending to right temporal pole, middle temporal gyrus, and amygdala in one cluster.",
        "links": [
          {
            "id": "brain_an_t9_l1",
            "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
          }
        ]
      },
      {
        "id": "brain_an_t10",
        "name": "Middle temporal gyrus",
        "dir": "up",
        "refs": "PMID 34296492",
        "note": "Increased resting-state functional activity, part of the same extended right-hemisphere cluster as parahippocampal gyrus.",
        "links": [
          {
            "id": "brain_an_t10_l1",
            "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
          }
        ]
      },
      {
        "id": "brain_an_t11",
        "name": "Amygdala",
        "dir": "up",
        "refs": "PMID 34296492",
        "note": "Increased resting-state functional activity, part of the same extended right-hemisphere cluster as parahippocampal gyrus.",
        "links": [
          {
            "id": "brain_an_t11_l1",
            "label": "Su et al. 2021 multimodal meta-analysis, Human Brain Mapping — 28 VBM studies (660 vs. 740) + 15 rs-fMRI studies (425 vs. 461) (PMID 34296492)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34296492/"
          }
        ]
      },
      {
        "id": "brain_an_t12",
        "name": "Hypothalamus",
        "dir": "down",
        "refs": "PMID 23570420",
        "note": "Reduced gray matter volume (left) — a separate, smaller VBM meta-analysis (9 studies, 228 vs. 240).",
        "links": [
          {
            "id": "brain_an_t12_l1",
            "label": "Titova et al. 2013 meta-analysis, BMC Psychiatry — 9 VBM studies, 228 AN vs. 240 controls (PMID 23570420)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23570420/"
          }
        ]
      },
      {
        "id": "brain_an_t13",
        "name": "Caudate nucleus",
        "dir": "down",
        "refs": "PMID 23570420",
        "note": "Reduced gray matter volume (right).",
        "links": [
          {
            "id": "brain_an_t13_l1",
            "label": "Titova et al. 2013 meta-analysis, BMC Psychiatry — 9 VBM studies, 228 AN vs. 240 controls (PMID 23570420)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23570420/"
          }
        ]
      },
      {
        "id": "brain_an_t14",
        "name": "Putamen",
        "dir": "down",
        "refs": "PMID 23570420",
        "note": "Reduced gray matter volume (right) — reported as \"lentiform nucleus,\" the combined putamen+globus pallidus structure; mapped here to putamen as the closer anatomical match.",
        "links": [
          {
            "id": "brain_an_t14_l1",
            "label": "Titova et al. 2013 meta-analysis, BMC Psychiatry — 9 VBM studies, 228 AN vs. 240 controls (PMID 23570420)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23570420/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_med",
    "name": "Meditation",
    "abbr": "MED",
    "color": "#2DD4BF",
    "note": "A 2014 meta-analysis of 21 structural neuroimaging studies (~300 practitioners) found eight brain regions consistently altered in meditators, spanning meta-awareness, body awareness, memory, and emotion regulation — not just the prefrontal cortex. A separate fMRI study adds a functional (activity-based, not structural) finding: the default-mode network's two main hubs are relatively quieted during meditation, consistent with reduced mind-wandering. The original prefrontal cortex entry (a specific self-kindness/DLPFC correlation from a small RCT) is kept as a narrower, additional finding, not the whole picture.",
    "links": [
      {
        "id": "brain_med_condl1",
        "label": "2026, Mindfulness (PMID 42306255)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/42306255/"
      },
      {
        "id": "brain_med_condl2",
        "label": "Fox et al. 2014 meta-analysis, Neurosci Biobehav Rev — 21 studies, ~300 practitioners (PMID 24705269)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/24705269/"
      },
      {
        "id": "brain_med_condl3",
        "label": "Brewer et al. 2011, PNAS — default-mode network activity in experienced meditators (PMID 22114193)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/22114193/"
      }
    ],
    "taxa": [
      {
        "id": "brain_med_t1",
        "name": "Prefrontal cortex",
        "dir": "up",
        "refs": "PMID 42306255",
        "note": "Increases in self-kindness after 8 weeks of MBSR training were positively associated with increased spontaneous activity (ALFF) in the right dorsolateral prefrontal cortex — a region tied to executive functioning.",
        "links": [
          {
            "id": "brain_med_t1_l1",
            "label": "2026, Mindfulness (PMID 42306255)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/42306255/"
          }
        ]
      },
      {
        "id": "brain_med_t2",
        "name": "Frontopolar cortex",
        "dir": "up",
        "refs": "PMID 24705269",
        "note": "One of eight regions consistently showing greater gray matter in meditators vs. non-meditators across a 21-study meta-analysis.",
        "links": [
          {
            "id": "brain_med_t2_l1",
            "label": "Fox et al. 2014 meta-analysis, Neurosci Biobehav Rev — 21 studies, ~300 practitioners (PMID 24705269)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24705269/"
          }
        ]
      },
      {
        "id": "brain_med_t3",
        "name": "Insula",
        "dir": "up",
        "refs": "PMID 24705269",
        "note": "Consistently greater gray matter in meditators — tied to exteroceptive and interoceptive body awareness.",
        "links": [
          {
            "id": "brain_med_t3_l1",
            "label": "Fox et al. 2014 meta-analysis, Neurosci Biobehav Rev — 21 studies, ~300 practitioners (PMID 24705269)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24705269/"
          }
        ]
      },
      {
        "id": "brain_med_t4",
        "name": "Hippocampus",
        "dir": "up",
        "refs": "PMID 24705269",
        "note": "Consistently greater gray matter in meditators — tied to memory consolidation and reconsolidation.",
        "links": [
          {
            "id": "brain_med_t4_l1",
            "label": "Fox et al. 2014 meta-analysis, Neurosci Biobehav Rev — 21 studies, ~300 practitioners (PMID 24705269)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24705269/"
          }
        ]
      },
      {
        "id": "brain_med_t5",
        "name": "Anterior cingulate cortex",
        "dir": "up",
        "refs": "PMID 24705269",
        "note": "Consistently greater gray matter (anterior and mid cingulate) in meditators — tied to self and emotion regulation.",
        "links": [
          {
            "id": "brain_med_t5_l1",
            "label": "Fox et al. 2014 meta-analysis, Neurosci Biobehav Rev — 21 studies, ~300 practitioners (PMID 24705269)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24705269/"
          }
        ]
      },
      {
        "id": "brain_med_t6",
        "name": "Orbitofrontal cortex",
        "dir": "up",
        "refs": "PMID 24705269",
        "note": "Consistently greater gray matter in meditators.",
        "links": [
          {
            "id": "brain_med_t6_l1",
            "label": "Fox et al. 2014 meta-analysis, Neurosci Biobehav Rev — 21 studies, ~300 practitioners (PMID 24705269)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24705269/"
          }
        ]
      },
      {
        "id": "brain_med_t7",
        "name": "Medial prefrontal cortex",
        "dir": "down",
        "refs": "PMID 22114193",
        "note": "Functional (activity), not structural: one of the default-mode network's two main hubs, relatively deactivated in experienced meditators across meditation types — consistent with reduced mind-wandering.",
        "links": [
          {
            "id": "brain_med_t7_l1",
            "label": "Brewer et al. 2011, PNAS — default-mode network activity in experienced meditators (PMID 22114193)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22114193/"
          }
        ]
      },
      {
        "id": "brain_med_t8",
        "name": "Posterior cingulate cortex",
        "dir": "down",
        "refs": "PMID 22114193",
        "note": "Functional (activity), not structural: the default-mode network's other main hub, relatively deactivated in experienced meditators — consistent with reduced mind-wandering.",
        "links": [
          {
            "id": "brain_med_t8_l1",
            "label": "Brewer et al. 2011, PNAS — default-mode network activity in experienced meditators (PMID 22114193)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22114193/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_sleepdep",
    "name": "Sleep Deprivation",
    "abbr": "SD",
    "color": "#FB923C",
    "note": "Not a diagnosed disorder — included as a common, everyday state with a well-established neuroimaging signature, useful for comparing against the disorder entries on this map. Based on a 2025 narrative review synthesizing the amygdala/prefrontal sleep-deprivation literature.",
    "links": [
      {
        "id": "brain_sleepdep_condl1",
        "label": "2025, Cureus review (PMID 40525051)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40525051/"
      }
    ],
    "taxa": [
      {
        "id": "brain_sleepdep_t1",
        "name": "Amygdala",
        "dir": "up",
        "refs": "PMID 40525051",
        "note": "Sleep deprivation increases amygdala reactivity to emotional stimuli — one of the most replicated findings in the sleep-deprivation neuroimaging literature.",
        "links": [
          {
            "id": "brain_sleepdep_t1_l1",
            "label": "2025, Cureus review (PMID 40525051)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40525051/"
          }
        ]
      },
      {
        "id": "brain_sleepdep_t2",
        "name": "Prefrontal cortex",
        "dir": "down",
        "refs": "PMID 40525051",
        "note": "Weakened prefrontal-amygdala connectivity after sleep deprivation, contributing to emotional dysregulation, impulsivity, and risk-taking behavior. Independently corroborated by an 11-study, 185-participant meta-analysis specifically of attention tasks (right PFC, reduced activation).",
        "links": [
          {
            "id": "brain_sleepdep_t2_l1",
            "label": "2025, Cureus review (PMID 40525051)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40525051/"
          },
          {
            "id": "brain_sleepdep_t2_l1",
            "label": "Ma et al. 2015, Sleep — 11-study ALE meta-analysis, 185 participants, attention tasks (PMID 25409102)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25409102/"
          }
        ]
      },
      {
        "id": "brain_sd_t3",
        "name": "Intraparietal sulcus",
        "dir": "down",
        "refs": "PMID 25409102",
        "note": "Reduced activation (bilateral) during attention tasks, part of the fronto-parietal attention network — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_sd_t3_l1",
            "label": "Ma et al. 2015, Sleep — 11-study ALE meta-analysis, 185 participants, attention tasks (PMID 25409102)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25409102/"
          }
        ]
      },
      {
        "id": "brain_sd_t4",
        "name": "Insula",
        "dir": "down",
        "refs": "PMID 25409102",
        "note": "Reduced activation (bilateral) during attention tasks, part of the salience network.",
        "links": [
          {
            "id": "brain_sd_t4_l1",
            "label": "Ma et al. 2015, Sleep — 11-study ALE meta-analysis, 185 participants, attention tasks (PMID 25409102)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25409102/"
          }
        ]
      },
      {
        "id": "brain_sd_t5",
        "name": "Medial prefrontal cortex",
        "dir": "down",
        "refs": "PMID 25409102",
        "note": "Reduced activation during attention tasks, part of the salience network alongside insula.",
        "links": [
          {
            "id": "brain_sd_t5_l1",
            "label": "Ma et al. 2015, Sleep — 11-study ALE meta-analysis, 185 participants, attention tasks (PMID 25409102)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25409102/"
          }
        ]
      },
      {
        "id": "brain_sd_t6",
        "name": "Parahippocampal gyrus",
        "dir": "down",
        "refs": "PMID 25409102",
        "note": "Reduced activation (right) during attention tasks.",
        "links": [
          {
            "id": "brain_sd_t6_l1",
            "label": "Ma et al. 2015, Sleep — 11-study ALE meta-analysis, 185 participants, attention tasks (PMID 25409102)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25409102/"
          }
        ]
      },
      {
        "id": "brain_sd_t7",
        "name": "Thalamus",
        "dir": "up",
        "refs": "PMID 25409102",
        "note": "The ONLY region showing increased activation (bilateral) during attention tasks in this meta-analysis — proposed to reflect a complex interaction between sleep loss's de-arousing effects and task performance's arousing effects on thalamic activity.",
        "links": [
          {
            "id": "brain_sd_t7_l1",
            "label": "Ma et al. 2015, Sleep — 11-study ALE meta-analysis, 185 participants, attention tasks (PMID 25409102)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25409102/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_endo",
    "name": "Endometriosis",
    "abbr": "ENDO",
    "color": "#ED64A6",
    "note": "Resting-state fMRI study of endometriosis-associated chronic pelvic pain (10 with deep infiltrating endometriosis + pain, 10 with painless ovarian endometriomas, 10 healthy controls) — small but a real clinical central-sensitization study, not an animal model. Findings are connectivity changes, not simple activation; no differences were found in the painless-endometrioma group, suggesting these changes track with chronic pain specifically rather than endometriosis alone.",
    "links": [
      {
        "id": "brain_endo_condl1",
        "label": "2026, Int J Gynaecol Obstet (PMID 42033133)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/42033133/"
      }
    ],
    "taxa": [
      {
        "id": "brain_endo_t1",
        "name": "Amygdala",
        "dir": "up",
        "refs": "PMID 42033133",
        "note": "Increased functional connectivity between the amygdala and several frontal pain-processing regions (frontal pole, paracingulate gyrus, frontal operculum, anterior cingulate) in patients with endometriosis-associated chronic pelvic pain, consistent with central sensitization.",
        "links": [
          {
            "id": "brain_endo_t1_l1",
            "label": "2026, Int J Gynaecol Obstet (PMID 42033133)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/42033133/"
          }
        ]
      },
      {
        "id": "brain_endo_t2",
        "name": "Posterior cingulate cortex",
        "dir": "up",
        "refs": "PMID 42033133",
        "note": "Increased functional connectivity with the precuneus in the same chronic-pelvic-pain patients, part of a broader pattern of altered connectivity within pain-modulation networks.",
        "links": [
          {
            "id": "brain_endo_t2_l1",
            "label": "2026, Int J Gynaecol Obstet (PMID 42033133)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/42033133/"
          }
        ]
      },
      {
        "id": "brain_endo_t3",
        "name": "Cerebellum",
        "dir": "up",
        "refs": "PMID 39241806",
        "note": "Increased gray matter volume (left) in endometriosis patients specifically, compared with women who have chronic pelvic pain but NOT endometriosis — an endometriosis-specific finding, not just a chronic-pain-general one.",
        "links": [
          {
            "id": "brain_endo_t3_l1",
            "label": "Maulitz et al. 2024, Hum Reprod — 53 endometriosis patients vs. 25 pain-free controls, structural MRI (PMID 39241806)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39241806/"
          }
        ]
      },
      {
        "id": "brain_endo_t4",
        "name": "Lingual gyrus",
        "dir": "up",
        "refs": "PMID 39241806",
        "note": "Increased gray matter volume (left), same endometriosis-vs-CPP-only comparison as the cerebellum finding above.",
        "links": [
          {
            "id": "brain_endo_t4_l1",
            "label": "Maulitz et al. 2024, Hum Reprod — 53 endometriosis patients vs. 25 pain-free controls, structural MRI (PMID 39241806)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39241806/"
          }
        ]
      },
      {
        "id": "brain_endo_t5",
        "name": "Calcarine gyrus",
        "dir": "up",
        "refs": "PMID 39241806",
        "note": "Increased gray matter volume (left, primary visual cortex), same endometriosis-vs-CPP-only comparison — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_endo_t5_l1",
            "label": "Maulitz et al. 2024, Hum Reprod — 53 endometriosis patients vs. 25 pain-free controls, structural MRI (PMID 39241806)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39241806/"
          }
        ]
      },
      {
        "id": "brain_endo_t6",
        "name": "Inferior parietal lobule",
        "dir": "up",
        "refs": "PMID 39241806",
        "note": "Not a simple case-control difference: gray matter volume correlated positively with dysmenorrhea (period pain) severity specifically, within the patient sample.",
        "links": [
          {
            "id": "brain_endo_t6_l1",
            "label": "Maulitz et al. 2024, Hum Reprod — 53 endometriosis patients vs. 25 pain-free controls, structural MRI (PMID 39241806)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39241806/"
          }
        ]
      },
      {
        "id": "brain_endo_t7",
        "name": "Superior frontal gyrus",
        "dir": "down",
        "refs": "PMID 39241806",
        "note": "Right superior medial gyrus volume decreased in association with depressive symptoms, across the patient groups in the same study.",
        "links": [
          {
            "id": "brain_endo_t7_l1",
            "label": "Maulitz et al. 2024, Hum Reprod — 53 endometriosis patients vs. 25 pain-free controls, structural MRI (PMID 39241806)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39241806/"
          }
        ]
      },
      {
        "id": "brain_endo_t8",
        "name": "Inferior temporal gyrus",
        "dir": "down",
        "refs": "PMID 39241806",
        "note": "Not a simple case-control difference: cortical thickness (left, alongside middle temporal gyrus) correlated negatively with dyspareunia (pain during intercourse) severity — a new region added to this app's brain-region list.",
        "links": [
          {
            "id": "brain_endo_t8_l1",
            "label": "Maulitz et al. 2024, Hum Reprod — 53 endometriosis patients vs. 25 pain-free controls, structural MRI (PMID 39241806)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39241806/"
          }
        ]
      },
      {
        "id": "brain_endo_t9",
        "name": "Middle temporal gyrus",
        "dir": "down",
        "refs": "PMID 39241806",
        "note": "Cortical thickness (left) correlated negatively with dyspareunia severity, same finding as inferior temporal gyrus above.",
        "links": [
          {
            "id": "brain_endo_t9_l1",
            "label": "Maulitz et al. 2024, Hum Reprod — 53 endometriosis patients vs. 25 pain-free controls, structural MRI (PMID 39241806)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39241806/"
          }
        ]
      }
    ]
  },
  {
    "id": "brain_pmdd_1",
    "name": "PMDD",
    "abbr": "PMDD",
    "color": "#F472B6",
    "note": "Premenstrual dysphoric disorder. Structural findings from a well-powered brain-morphometry + data-driven classification study (n=89 PMDD/42 controls, PMID 35705554); functional findings drawn from the wider fMRI literature (amygdala/insula hyperactivity, ACC/dlPFC hypoactivity during luteal-phase emotion processing) per a 2024 systematic review (PMID 38744159, n=1,026 total). New condition — women's-health gap-fill, added alongside the PCOS/PMDD/Menopause gut-microbiome conditions added earlier this session.",
    "links": [
      {
        "id": "brain_pmdd_1_l1",
        "label": "Brain morphometry + classification, n=89 PMDD/42 controls (PMID 35705554)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/35705554/"
      },
      {
        "id": "brain_pmdd_1_l2",
        "label": "Systematic review, n=1,026 (PMID 38744159)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38744159/"
      }
    ],
    "taxa": [
      {
        "id": "brain_pmdd_t1",
        "name": "Cerebellum",
        "dir": "down",
        "refs": "",
        "note": "Smaller gray matter volume in ventral posterior cortices and cerebellum (Cohen's d=0.45-0.76), n=89 PMDD/42 controls.",
        "links": [
          {
            "id": "brain_pmdd_t1_l1",
            "label": "Brain morphometry + classification, n=89 PMDD/42 controls (PMID 35705554)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35705554/"
          }
        ]
      },
      {
        "id": "brain_pmdd_t2",
        "name": "Putamen",
        "dir": "down",
        "refs": "",
        "note": "Smaller right putamen volume (Cohen's d=0.34-0.55).",
        "links": [
          {
            "id": "brain_pmdd_t2_l1",
            "label": "Brain morphometry + classification, n=89 PMDD/42 controls (PMID 35705554)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35705554/"
          }
        ]
      },
      {
        "id": "brain_pmdd_t3",
        "name": "Lingual gyrus",
        "dir": "down",
        "refs": "",
        "note": "Among the specific regions with reduced volume in a data-driven grey-matter classification analysis (up to 74% classification accuracy vs. controls).",
        "links": [
          {
            "id": "brain_pmdd_t3_l1",
            "label": "Brain morphometry + classification, n=89 PMDD/42 controls (PMID 35705554)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35705554/"
          }
        ]
      },
      {
        "id": "brain_pmdd_t4",
        "name": "Fusiform gyrus",
        "dir": "down",
        "refs": "",
        "note": "Among the specific regions with reduced volume in the same data-driven grey-matter classification analysis.",
        "links": [
          {
            "id": "brain_pmdd_t4_l1",
            "label": "Brain morphometry + classification, n=89 PMDD/42 controls (PMID 35705554)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35705554/"
          }
        ]
      },
      {
        "id": "brain_pmdd_t5",
        "name": "Inferior occipital gyrus",
        "dir": "down",
        "refs": "",
        "note": "Among the specific regions with reduced volume in the same data-driven grey-matter classification analysis. New canonical region for this app.",
        "links": [
          {
            "id": "brain_pmdd_t5_l1",
            "label": "Brain morphometry + classification, n=89 PMDD/42 controls (PMID 35705554)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35705554/"
          }
        ]
      },
      {
        "id": "brain_pmdd_t6",
        "name": "Parahippocampal gyrus",
        "dir": "down",
        "refs": "",
        "note": "Among the specific regions with reduced volume in the same data-driven grey-matter classification analysis.",
        "links": [
          {
            "id": "brain_pmdd_t6_l1",
            "label": "Brain morphometry + classification, n=89 PMDD/42 controls (PMID 35705554)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35705554/"
          }
        ]
      },
      {
        "id": "brain_pmdd_t7",
        "name": "Amygdala",
        "dir": "both",
        "refs": "",
        "note": "Structure-vs-function dissociation: smaller RIGHT amygdala volume structurally (Cohen's d=0.34-0.55, PMID 35705554), but a separate functional-MRI literature consistently finds amygdala HYPERactivity (greater reactivity to social/emotional stimuli in the luteal phase vs. follicular phase and vs. controls), associated with symptom severity — smaller structure, more reactive function, not a contradiction but two different measurement types.",
        "links": [
          {
            "id": "brain_pmdd_t7_l1",
            "label": "Brain morphometry + classification, n=89 PMDD/42 controls (PMID 35705554)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35705554/"
          }
        ]
      },
      {
        "id": "brain_pmdd_t8",
        "name": "Anterior cingulate cortex",
        "dir": "down",
        "refs": "",
        "note": "Functional finding (not structural): decreased ACC response during emotion-processing tasks in the luteal phase, among the most robust functional-MRI findings in the PMDD literature alongside amygdala/insula hyperactivity.",
        "links": []
      },
      {
        "id": "brain_pmdd_t9",
        "name": "Dorsolateral prefrontal cortex",
        "dir": "down",
        "refs": "",
        "note": "Functional finding (not structural): hypoactivity concurrent with amygdala hyperactivity in the late luteal phase, both correlating with PMDD symptom severity.",
        "links": []
      }
    ]
  },
  {
    "id": "brain_estrogen",
    "name": "Estrogen",
    "abbr": "E2",
    "color": "#FBBF24",
    "note": "Not a diagnosed condition like this map's other entries — tracks brain regions where estradiol (the primary circulating estrogen) level, menstrual-cycle phase, menopausal status, or hormone therapy was found to significantly affect activity, blood flow, glucose metabolism, receptor density, or connectivity in human neuroimaging studies (PET/fMRI/SPECT/SPET), plus one flagged rodent mechanistic study. Directions describe how each region's measured activity moves WITH higher estrogen (e.g. follicular phase, hormone-therapy use), not a claim about the region's baseline size or overall health.",
    "links": [
      {
        "id": "brain_estrogen_l1",
        "label": "Review: Estrogen and the prefrontal cortex, 2014, Hum Brain Mapp (PMID 23238908)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/23238908/"
      },
      {
        "id": "brain_estrogen_l2",
        "label": "Shaywitz et al. 1999, JAMA — randomized crossover fMRI, working memory (PMID 10199429)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/10199429/"
      },
      {
        "id": "brain_estrogen_l3",
        "label": "Dreher et al. 2007, PNAS — menstrual cycle phase and reward (PMID 17267613)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/17267613/"
      },
      {
        "id": "brain_estrogen_l4",
        "label": "Stevens et al. 2025, PNAS — hormonal mechanisms of women's risk, high-res fMRI (PMID 41397126)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/41397126/"
      }
    ],
    "taxa": [
      {
        "id": "brain_estrogen_t1",
        "name": "Hippocampus",
        "dir": "up",
        "refs": "PMID 10867223; PMID 9238064",
        "note": "Increased right hippocampal blood flow over time in postmenopausal hormone-therapy users vs. non-users (longitudinal PET), and greater hippocampal activation during PET-measured cognitive-task performance under estrogen (vs. placebo) add-back in women with ovarian hormone suppression.",
        "links": [
          {
            "id": "brain_estrogen_t1_l1",
            "label": "Maki & Resnick 2000, Neurobiol Aging — longitudinal PET CBF study",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10867223/"
          },
          {
            "id": "brain_estrogen_t1_l2",
            "label": "Berman et al. 1997, PNAS — PET, gonadal steroid add-back",
            "url": "https://pubmed.ncbi.nlm.nih.gov/9238064/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t2",
        "name": "Prefrontal cortex",
        "dir": "up",
        "refs": "PMID 16735938; PMID 23238908; PMID 9238064",
        "note": "Estrogen therapy selectively enhanced prefrontal-dependent cognitive processing (verbal encoding/working memory) on fMRI in perimenopausal/postmenopausal women, part of a broader literature reviewed as “estrogen and the prefrontal cortex.”",
        "links": [
          {
            "id": "brain_estrogen_t2_l1",
            "label": "Joffe et al. 2006, Menopause — RCT, fMRI",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16735938/"
          },
          {
            "id": "brain_estrogen_t2_l2",
            "label": "Review: Estrogen and the prefrontal cortex, 2014, Hum Brain Mapp",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23238908/"
          },
          {
            "id": "brain_estrogen_t2_l3",
            "label": "Berman et al. 1997, PNAS",
            "url": "https://pubmed.ncbi.nlm.nih.gov/9238064/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t3",
        "name": "Inferior frontal gyrus",
        "dir": "up",
        "refs": "PMID 9799627",
        "note": "Increased activation during episodic-memory retrieval in hormone-therapy users on PET, part of the same longitudinal cohort as this entry's Hippocampus finding.",
        "links": [
          {
            "id": "brain_estrogen_t3_l1",
            "label": "Resnick & Maki 1998, Horm Behav — PET CBF + neuropsychological performance",
            "url": "https://pubmed.ncbi.nlm.nih.gov/9799627/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t4",
        "name": "Superior frontal gyrus",
        "dir": "up",
        "refs": "PMID 10199429",
        "note": "Increased activation during retrieval in a working-memory task under estrogen therapy vs. placebo, in a randomized crossover fMRI study of postmenopausal women.",
        "links": [
          {
            "id": "brain_estrogen_t4_l1",
            "label": "Shaywitz et al. 1999, JAMA — randomized crossover fMRI",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10199429/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t5",
        "name": "Medial prefrontal cortex",
        "dir": "up",
        "refs": "PMID 14741674",
        "note": "Activation here (and at Postcentral gyrus) was reduced by tamoxifen (an anti-estrogen) relative to untreated/estrogen-therapy comparison groups — framed here as an estrogen-presence-associated increase, the inverse of the tamoxifen finding.",
        "links": [
          {
            "id": "brain_estrogen_t5_l1",
            "label": "Eberling et al. 2004, Neuroimage — estrogen- and tamoxifen-associated brain effects",
            "url": "https://pubmed.ncbi.nlm.nih.gov/14741674/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t6",
        "name": "Middle temporal gyrus",
        "dir": "up",
        "refs": "PMID 10867223",
        "note": "Enhanced resting activity in hormone-therapy users (bilateral finding: right middle/superior temporal gyrus and left middle temporal gyrus) in the same longitudinal PET cohort as this entry's Hippocampus finding.",
        "links": [
          {
            "id": "brain_estrogen_t6_l1",
            "label": "Maki & Resnick 2000, Neurobiol Aging",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10867223/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t7",
        "name": "Inferior temporal gyrus",
        "dir": "up",
        "refs": "PMID 10867223",
        "note": "Increased resting activity in hormone-therapy users, same longitudinal PET cohort as this entry's Hippocampus/Middle temporal gyrus findings.",
        "links": [
          {
            "id": "brain_estrogen_t7_l1",
            "label": "Maki & Resnick 2000, Neurobiol Aging",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10867223/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t8",
        "name": "Superior temporal gyrus",
        "dir": "up",
        "refs": "PMID 10994014",
        "note": "Greater cerebral glucose metabolism in estrogen-therapy users vs. non-users on PET, in postmenopausal women.",
        "links": [
          {
            "id": "brain_estrogen_t8_l1",
            "label": "Eberling et al. 2000, Neurology — PET glucose metabolism",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10994014/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t9",
        "name": "Parahippocampal gyrus",
        "dir": "up",
        "refs": "PMID 10867223",
        "note": "Increased right posterior parahippocampal blood flow over time in hormone-therapy users, same longitudinal PET cohort as this entry's Hippocampus finding.",
        "links": [
          {
            "id": "brain_estrogen_t9_l1",
            "label": "Maki & Resnick 2000, Neurobiol Aging",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10867223/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t10",
        "name": "Posterior cingulate cortex",
        "dir": "up",
        "refs": "PMID 15582750; PMID 10199429",
        "note": "Increased glucose metabolism over time in estrogen-therapy users (notable since this region is an early site of metabolic decline in Alzheimer's disease), plus enhanced working-memory-task activation under estrogen on fMRI.",
        "links": [
          {
            "id": "brain_estrogen_t10_l1",
            "label": "Rasgon et al. 2005, Neurobiol Aging — longitudinal PET metabolism",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15582750/"
          },
          {
            "id": "brain_estrogen_t10_l2",
            "label": "Shaywitz et al. 1999, JAMA",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10199429/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t11",
        "name": "Anterior cingulate cortex",
        "dir": "up",
        "refs": "PMID 12900319; PMID 10199429",
        "note": "Increased prefrontal/ACC serotonin 2A receptor binding following estradiol treatment in postmenopausal women (SPECT), alongside altered ACC activation during spatial working memory under estrogen on fMRI.",
        "links": [
          {
            "id": "brain_estrogen_t11_l1",
            "label": "Kugaya et al. 2003, Am J Psychiatry — SPECT, 5-HT2A binding",
            "url": "https://pubmed.ncbi.nlm.nih.gov/12900319/"
          },
          {
            "id": "brain_estrogen_t11_l2",
            "label": "Shaywitz et al. 1999, JAMA",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10199429/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t12",
        "name": "Inferior parietal lobule",
        "dir": "both",
        "refs": "PMID 10199429",
        "note": "Task-dependent bidirectional effect in the same randomized crossover fMRI study: estrogen increased activation during storage of verbal working-memory material but decreased it during storage of nonverbal material — genuinely mixed, not picking a side.",
        "links": [
          {
            "id": "brain_estrogen_t12_l1",
            "label": "Shaywitz et al. 1999, JAMA",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10199429/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t13",
        "name": "Thalamus",
        "dir": "up",
        "refs": "PMID 17173920",
        "note": "High muscarinic-acetylcholine-receptor density (linked to cognitive performance) in long-term estrogen-therapy users on SPET, alongside the Caudate nucleus/striatal finding from the same study.",
        "links": [
          {
            "id": "brain_estrogen_t13_l1",
            "label": "Norbury et al. 2007, Horm Behav — SPET, muscarinic receptor density",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17173920/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t14",
        "name": "Caudate nucleus",
        "dir": "up",
        "refs": "PMID 17173920",
        "note": "High striatal muscarinic-acetylcholine-receptor density identified as important for cognition in long-term estrogen-therapy users on SPET (filed at the caudate specifically since this app doesn't track a bare “striatum” region).",
        "links": [
          {
            "id": "brain_estrogen_t14_l1",
            "label": "Norbury et al. 2007, Horm Behav",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17173920/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t15",
        "name": "Amygdala",
        "dir": "down",
        "refs": "PMID 41397126; PMID 26581193; PMID 32849310",
        "note": "Estradiol administration reduced central/corticomedial amygdala reactivity to threat on high-resolution fMRI (effect present in trauma-naive women, absent in women with PTSD); separately, natural estradiol level and hormonal-contraceptive use both shaped sex differences in amygdala engagement during fear conditioning/extinction. A rodent (estrous-cycle) study found GPER receptor expression itself fluctuating in the amygdala and dorsal hippocampus — flagged as an animal-model mechanistic finding, not a human activity measurement.",
        "links": [
          {
            "id": "brain_estrogen_t15_l1",
            "label": "2025, PNAS — hormonal mechanisms of women's risk in the face of traumatic stress, high-resolution fMRI",
            "url": "https://pubmed.ncbi.nlm.nih.gov/41397126/"
          },
          {
            "id": "brain_estrogen_t15_l2",
            "label": "Hwang et al. 2015, BMC Psychiatry — fear conditioning/extinction, estradiol + contraceptives",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26581193/"
          },
          {
            "id": "brain_estrogen_t15_l3",
            "label": "2020, Front Endocrinol (Lausanne) — rodent estrous cycle, GPER immunoreactivity (animal model)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32849310/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t16",
        "name": "Nucleus accumbens",
        "dir": "up",
        "refs": "PMID 17267613; PMID 26471712",
        "note": "Reward-related neural response (both at reward outcome and during anticipation) was greater during the high-estradiol follicular phase than the luteal phase in two independent menstrual-cycle fMRI studies.",
        "links": [
          {
            "id": "brain_estrogen_t16_l1",
            "label": "Dreher et al. 2007, PNAS — event-related fMRI, follicular vs. luteal phase",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17267613/"
          },
          {
            "id": "brain_estrogen_t16_l2",
            "label": "Diekhof & Ratnayake 2016, Neuropsychologia — reward sensitivity + performance monitoring across cycle phase",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26471712/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t17",
        "name": "Postcentral gyrus",
        "dir": "up",
        "refs": "PMID 14741674",
        "note": "Activation here (and at Medial prefrontal cortex) was reduced by tamoxifen (an anti-estrogen) relative to comparison groups — framed here as an estrogen-presence-associated increase, the inverse of the tamoxifen finding.",
        "links": [
          {
            "id": "brain_estrogen_t17_l1",
            "label": "Eberling et al. 2004, Neuroimage",
            "url": "https://pubmed.ncbi.nlm.nih.gov/14741674/"
          }
        ]
      },
      {
        "id": "brain_estrogen_t18",
        "name": "Periaqueductal gray",
        "dir": "both",
        "refs": "PMID 40251694",
        "note": "Menopausal status and estrogen metabolites shaped PAG connectivity in opposite directions to different networks: PAG-default-mode-network connectivity was HIGHER in postmenopausal (low-estrogen) than premenopausal women, while PAG-sensorimotor-network connectivity was HIGHER in premenopausal (high-estrogen) women, and higher stool 2-hydroxyestrone specifically tracked with higher PAG connectivity to both networks in premenopausal women — genuinely mixed/metabolite-specific, not a single clean direction.",
        "links": [
          {
            "id": "brain_estrogen_t18_l1",
            "label": "Kilpatrick et al. 2025, Biol Sex Differ — brainstem connectivity by sex and menopausal status",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40251694/"
          }
        ]
      }
    ]
  },
  {
      "id": "brain_testo",
      "name": "Testosterone",
      "abbr": "T",
      "color": "#0EA5E9",
      "note": "Not a diagnosed condition like this map's other entries — tracks brain regions where testosterone level (endogenous or administered) showed a significant human-neuroimaging effect, mostly on amygdala reactivity/connectivity and its coupling with regulatory cortical regions. Smaller and more amygdala-centric than this app's Estrogen brain entry, reflecting a real difference in how much human testosterone-neuroimaging literature exists (most of the deepest mechanistic testosterone-brain work is rodent, not human) - not a gap left uninvestigated. See also this app's gut-flora Testosterone condition (Conditions tab) for the separate gut-microbiome side of this hormone.",
      "links": [
        {
          "id": "brain_testo_l1",
          "label": "van Wingen et al. 2011, Cereb Cortex — prefrontal-amygdala connectivity (PMID 21339377)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/21339377/"
        },
        {
          "id": "brain_testo_l2",
          "label": "Bos et al. 2013, Psychoneuroendocrinology — amygdala responses to faces (PMID 22999654)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/22999654/"
        },
        {
          "id": "brain_testo_l3",
          "label": "Hermans et al. 2010, Neuroimage — ventral striatal reward response (PMID 20398773)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/20398773/"
        }
      ],
      "taxa": [
        {
          "id": "brain_testo_t1",
          "name": "Amygdala",
          "dir": "up",
          "refs": "PMID 18235425; PMID 22999654; PMID 31506704; PMID 22341731; PMID 34896406; PMID 29744800",
          "note": "Repeatedly linked to heightened amygdala reactivity: exogenous testosterone raised amygdala reactivity in middle-aged women to a young-adulthood level; testosterone administration in women increased amygdala responses to fearful/happy faces; men with high hair-testosterone concentrations showed increased neural reactivity to emotional pictures; endogenous testosterone in healthy men correlated with amygdala reactivity and memory performance; amygdala-subregion structural covariance and resting connectivity both track endogenous testosterone and trait aggression.",
          "links": [
            {
              "id": "brain_testo_t1_l1",
              "label": "van Wingen et al. 2009, Neuropsychopharmacology",
              "url": "https://pubmed.ncbi.nlm.nih.gov/18235425/"
            },
            {
              "id": "brain_testo_t1_l2",
              "label": "Bos et al. 2013, Psychoneuroendocrinology",
              "url": "https://pubmed.ncbi.nlm.nih.gov/22999654/"
            },
            {
              "id": "brain_testo_t1_l3",
              "label": "2019, Soc Cogn Affect Neurosci — hair testosterone",
              "url": "https://pubmed.ncbi.nlm.nih.gov/31506704/"
            },
            {
              "id": "brain_testo_t1_l4",
              "label": "2012, Psychoneuroendocrinology — amygdala reactivity + memory",
              "url": "https://pubmed.ncbi.nlm.nih.gov/22341731/"
            },
            {
              "id": "brain_testo_t1_l5",
              "label": "2022, Neuropsychologia — amygdala subregion structural covariance",
              "url": "https://pubmed.ncbi.nlm.nih.gov/34896406/"
            },
            {
              "id": "brain_testo_t1_l6",
              "label": "2019, Brain Imaging Behav — basolateral amygdala connectivity",
              "url": "https://pubmed.ncbi.nlm.nih.gov/29744800/"
            }
          ]
        },
        {
          "id": "brain_testo_t2",
          "name": "Orbitofrontal cortex",
          "dir": "down",
          "refs": "PMID 19782476",
          "note": "Testosterone reduced amygdala-orbitofrontal cortex functional coupling in healthy volunteers, consistent with reduced top-down regulatory input from OFC to amygdala.",
          "links": [
            {
              "id": "brain_testo_t2_l1",
              "label": "van Wingen et al. 2010, Psychoneuroendocrinology",
              "url": "https://pubmed.ncbi.nlm.nih.gov/19782476/"
            }
          ]
        },
        {
          "id": "brain_testo_t3",
          "name": "Prefrontal cortex",
          "dir": "down",
          "refs": "PMID 21339377; PMID 24204845",
          "note": "Endogenous testosterone modulated prefrontal-amygdala connectivity during social emotional behavior, consistent with reduced PFC regulatory control over the amygdala; separately, testosterone was inversely related to brain activity during emotional inhibition in a schizophrenia cohort (clinical population, flagged as such rather than treated as a healthy-population finding).",
          "links": [
            {
              "id": "brain_testo_t3_l1",
              "label": "van Wingen et al. 2011, Cereb Cortex",
              "url": "https://pubmed.ncbi.nlm.nih.gov/21339377/"
            },
            {
              "id": "brain_testo_t3_l2",
              "label": "2013, PLoS One — schizophrenia cohort",
              "url": "https://pubmed.ncbi.nlm.nih.gov/24204845/"
            }
          ]
        },
        {
          "id": "brain_testo_t4",
          "name": "Nucleus accumbens",
          "dir": "up",
          "refs": "PMID 20398773",
          "note": "Exogenous testosterone increased ventral striatal (nucleus accumbens) BOLD response during reward anticipation in healthy women.",
          "links": [
            {
              "id": "brain_testo_t4_l1",
              "label": "Hermans et al. 2010, Neuroimage",
              "url": "https://pubmed.ncbi.nlm.nih.gov/20398773/"
            }
          ]
        }
      ]
    },
    {
      "id": "brain_meno",
      "name": "Menopause",
      "abbr": "MENO",
      "color": "#A855F7",
      "note": "Not a diagnosed condition like this map's other entries — a host life-stage entry, matching this app's gut-flora Menopause (transition) condition (Conditions tab). Tracks brain regions where menopausal status (vs. premenopausal) showed a significant human-neuroimaging effect: bioenergetic/metabolic decline concentrated in prefrontal cortex and hippocampus, plus connectivity shifts in brainstem-network coupling. Distinct from this map's separate Perimenopause entry, which tracks the fluctuating-hormone transition phase specifically rather than the sustained-low-estrogen postmenopausal state.",
      "links": [
        {
          "id": "brain_meno_l1",
          "label": "Mosconi et al. 2017, PLoS One — FDG-PET bioenergetics across the transition (PMID 29016679)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/29016679/"
        },
        {
          "id": "brain_meno_l2",
          "label": "2021, Sci Rep — brain structure/connectivity/metabolism/amyloid-beta (PMID 34108509)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/34108509/"
        },
        {
          "id": "brain_meno_l3",
          "label": "2022, Neurology — white matter hyperintensities, the Rhineland Study (PMID 35768207)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/35768207/"
        },
        {
          "id": "brain_meno_l4",
          "label": "2025, Biol Sex Differ — brainstem connectivity by menopausal status (PMID 40251694)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/40251694/"
        }
      ],
      "taxa": [
        {
          "id": "brain_meno_t1",
          "name": "Prefrontal cortex",
          "dir": "down",
          "refs": "PMID 29016679; PMID 34108509",
          "note": "Frontal cortex is among the first regions to show glucose-hypometabolism/bioenergetic decline across the menopause transition (FDG-PET, n=43 women across pre/peri/postmenopause), sustained into postmenopause; corroborated by a broader structural/connectivity/metabolic/amyloid-beta neuroimaging study.",
          "links": [
            {
              "id": "brain_meno_t1_l1",
              "label": "Mosconi et al. 2017, PLoS One",
              "url": "https://pubmed.ncbi.nlm.nih.gov/29016679/"
            },
            {
              "id": "brain_meno_t1_l2",
              "label": "2021, Sci Rep — brain structure/connectivity/metabolism/amyloid-beta",
              "url": "https://pubmed.ncbi.nlm.nih.gov/34108509/"
            }
          ]
        },
        {
          "id": "brain_meno_t2",
          "name": "Hippocampus",
          "dir": "down",
          "refs": "PMID 27263667; PMID 34108509",
          "note": "Reduced hippocampal volume associated with menopausal status (moderated by hormone-therapy use) in postmenopausal women, alongside verbal memory changes; part of the same bioenergetic decline pattern as this entry's Prefrontal cortex finding.",
          "links": [
            {
              "id": "brain_meno_t2_l1",
              "label": "2017, Neuropsychol Dev Cogn B Aging Neuropsychol Cogn — hippocampal volume + HT",
              "url": "https://pubmed.ncbi.nlm.nih.gov/27263667/"
            },
            {
              "id": "brain_meno_t2_l2",
              "label": "2021, Sci Rep",
              "url": "https://pubmed.ncbi.nlm.nih.gov/34108509/"
            }
          ]
        },
        {
          "id": "brain_meno_t3",
          "name": "Periaqueductal gray",
          "dir": "both",
          "refs": "PMID 40251694",
          "note": "PAG connectivity shifted with menopausal status in opposite directions to different networks: PAG-default-mode-network connectivity was HIGHER in postmenopausal than premenopausal women, while PAG-sensorimotor-network connectivity was HIGHER in premenopausal women — same brainstem-connectivity study already cited in this app's Estrogen brain entry, included here too since it's specifically about menopausal status, not just estrogen level in the abstract.",
          "links": [
            {
              "id": "brain_meno_t3_l1",
              "label": "2025, Biol Sex Differ — brainstem connectivity by sex and menopausal status",
              "url": "https://pubmed.ncbi.nlm.nih.gov/40251694/"
            }
          ]
        },
        {
          "id": "brain_meno_t4",
          "name": "Default mode network",
          "dir": "both",
          "refs": "PMID 40251694",
          "note": "See this entry's Periaqueductal gray finding — PAG-DMN connectivity itself was higher in postmenopausal than premenopausal women in the same study, a genuinely bidirectional-with-network-specificity result, not a single clean direction.",
          "links": [
            {
              "id": "brain_meno_t4_l1",
              "label": "2025, Biol Sex Differ",
              "url": "https://pubmed.ncbi.nlm.nih.gov/40251694/"
            }
          ]
        },
        {
          "id": "brain_meno_t5",
          "name": "Corpus callosum",
          "dir": "down",
          "refs": "PMID 35768207",
          "note": "Framed here as a proxy for this app's white-matter tracking (no dedicated diffuse-white-matter region exists in this map's region list): menopausal status was associated with white matter hyperintensity burden in a large population cohort (the Rhineland Study). White matter hyperintensities are a diffuse, not focal, finding - filed at Corpus callosum as this app's largest single white-matter tract rather than as a precise regional claim.",
          "links": [
            {
              "id": "brain_meno_t5_l1",
              "label": "2022, Neurology — the Rhineland Study",
              "url": "https://pubmed.ncbi.nlm.nih.gov/35768207/"
            }
          ]
        }
      ]
    },
    {
      "id": "brain_perimeno",
      "name": "Perimenopause",
      "abbr": "PERI",
      "color": "#D946A6",
      "note": "Not a diagnosed condition like this map\'s other entries; matches this app\'s gut-flora Perimenopause condition. Perimenopause is where the sharpest brain changes emerge: FDG-PET shows the Alzheimer\'s-like bioenergetic phenotype first appearing here (Mosconi 2017), and 2026 studies add structural hippocampal loss (2.8% volume) and a compensatory functional reorganization across the default-mode network, insula, posterior cingulate and middle frontal gyri. Expanded from 2 to 6 regions as that peri-specific neuroimaging literature matured.",
      "links": [
        {
          "id": "brain_perimeno_l1",
          "label": "Mosconi et al. 2017, PLoS One — FDG-PET, n=43 across pre/peri/postmenopause (PMID 29016679)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/29016679/"
        }
      ],
      "taxa": [
        {
          "id": "brain_perimeno_t1",
          "name": "Prefrontal cortex",
          "dir": "down",
          "refs": "PMID 29016679",
          "note": "The Alzheimer's-like bioenergetic phenotype (glucose hypometabolism, declining mitochondrial cytochrome-oxidase efficiency) EMERGES specifically during perimenopause in this FDG-PET study (n=43 across pre/peri/postmenopause), then persists into postmenopause — filed here rather than only under this map's separate Menopause entry because the study's own framing is about where the phenotype first appears.",
          "links": [
            {
              "id": "brain_perimeno_t1_l1",
              "label": "Mosconi et al. 2017, PLoS One",
              "url": "https://pubmed.ncbi.nlm.nih.gov/29016679/"
            }
          ]
        },
        {
          "id": "brain_perimeno_t2",
          "name": "Hippocampus",
          "dir": "down",
          "refs": "PMID 29016679; PMID 42364668",
          "note": "Bioenergetic decline (Mosconi FDG-PET) plus STRUCTURAL loss: a 12-month longitudinal MRI study of 150 perimenopausal women vs 80 controls found 2.8% bilateral hippocampal volume reduction and decreased activation during memory encoding, tracking estradiol and BDNF decline (PMID 42364668).",
          "links": [
            {
              "id": "brain_perimeno_t2_l1",
              "label": "Mosconi et al. 2017, PLoS One",
              "url": "https://pubmed.ncbi.nlm.nih.gov/29016679/"
            },
            {
              "id": "brain_perimeno_t2_l2",
              "label": "Longitudinal 3T MRI, 150 perimenopausal women (PMID 42364668)",
              "url": "https://pubmed.ncbi.nlm.nih.gov/42364668/"
            }
          ]
        },
        {
          "id": "brain_perimeno_t3",
          "name": "Default mode network",
          "dir": "both",
          "refs": "PMID 42254985",
          "note": "Functional reorganization, not simple loss: resting-state fMRI (16 peri vs 15 premenopausal) found altered DMN connectivity, read as a compensatory shift amid fluctuating estradiol rather than a uniform decline.",
          "links": [
            {
              "id": "brain_perimeno_t3_l1",
              "label": "Resting-state fMRI, DMN in perimenopause (PMID 42254985)",
              "url": "https://pubmed.ncbi.nlm.nih.gov/42254985/"
            }
          ]
        },
        {
          "id": "brain_perimeno_t4",
          "name": "Insula",
          "dir": "up",
          "refs": "PMID 42254985",
          "note": "Enhanced left-insula connectivity in perimenopausal vs premenopausal women (resting-state fMRI), part of a compensatory DMN reorganization amid estradiol decline and fluctuation.",
          "links": [
            {
              "id": "brain_perimeno_t4_l1",
              "label": "Resting-state fMRI, perimenopause (PMID 42254985)",
              "url": "https://pubmed.ncbi.nlm.nih.gov/42254985/"
            }
          ]
        },
        {
          "id": "brain_perimeno_t5",
          "name": "Posterior cingulate cortex",
          "dir": "up",
          "refs": "PMID 42254985",
          "note": "Enhanced connectivity in the PCC (core posterior-DMN hub) in perimenopausal women, alongside the insula and middle frontal gyri (resting-state fMRI).",
          "links": [
            {
              "id": "brain_perimeno_t5_l1",
              "label": "Resting-state fMRI, perimenopause (PMID 42254985)",
              "url": "https://pubmed.ncbi.nlm.nih.gov/42254985/"
            }
          ]
        },
        {
          "id": "brain_perimeno_t6",
          "name": "Middle frontal gyrus",
          "dir": "up",
          "refs": "PMID 42254985; PMID 42499590",
          "note": "Enhanced bilateral middle-frontal-gyrus connectivity (PMID 42254985); a separate effective-connectivity study identified perimenopause as a distinct stage of FRONTAL network organization for emotion regulation (PMID 42499590, 76 women). Compensatory frontal recruitment is the recurring perimenopause signature.",
          "links": [
            {
              "id": "brain_perimeno_t6_l1",
              "label": "Resting-state fMRI, perimenopause DMN (PMID 42254985)",
              "url": "https://pubmed.ncbi.nlm.nih.gov/42254985/"
            },
            {
              "id": "brain_perimeno_t6_l2",
              "label": "Effective-connectivity, emotion-regulation network across menopause (PMID 42499590)",
              "url": "https://pubmed.ncbi.nlm.nih.gov/42499590/"
            }
          ]
        }
      ]
    },
    {
      "id": "brain_prog",
      "name": "Progesterone",
      "abbr": "P4",
      "color": "#F97316",
      "note": "Not a diagnosed condition like this map's other entries — matches this app's gut-flora Progesterone condition (Conditions tab), and honestly smaller for the same underlying reason: less human-neuroimaging literature exists here than for Estrogen or Testosterone. What does exist centers on progesterone's neuroactive metabolites (allopregnanolone, pregnanolone) as GABA-A positive allosteric modulators acting on amygdala and hippocampus - the same mechanism implicated in this app's PMDD brain entry (see Amygdala/ACC/dlPFC findings there), since PMDD is fundamentally a progesterone-withdrawal-sensitivity condition.",
      "links": [
        {
          "id": "brain_prog_l1",
          "label": "Van Wingen et al. 2008, Mol Psychiatry — single-dose progesterone, amygdala reactivity (PMID 17579609)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/17579609/"
        },
        {
          "id": "brain_prog_l2",
          "label": "2018, J Neuroendocrinol — review, GABA-active steroids and PMDD (PMID 29072794)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/29072794/"
        }
      ],
      "taxa": [
        {
          "id": "brain_prog_t1",
          "name": "Amygdala",
          "dir": "up",
          "refs": "PMID 17579609; PMID 29072794",
          "note": "A single progesterone administration selectively increased amygdala reactivity to emotional faces in women (vs. placebo); consistent with the broader neurosteroid literature on progesterone's metabolites (allopregnanolone/pregnanolone) acting as positive allosteric GABA-A modulators in corticolimbic circuits including the amygdala, reviewed specifically in the context of PMDD.",
          "links": [
            {
              "id": "brain_prog_t1_l1",
              "label": "Van Wingen et al. 2008, Mol Psychiatry",
              "url": "https://pubmed.ncbi.nlm.nih.gov/17579609/"
            },
            {
              "id": "brain_prog_t1_l2",
              "label": "2018, J Neuroendocrinol — review, GABA-active steroids in the female brain",
              "url": "https://pubmed.ncbi.nlm.nih.gov/29072794/"
            }
          ]
        },
        {
          "id": "brain_prog_t2",
          "name": "Hippocampus",
          "dir": "both",
          "refs": "PMID 29072794; PMID 36842096",
          "note": "Allopregnanolone/pregnanolone are synthesized directly in hippocampal pyramidal neurons and modulate their excitability via GABA-A potentiation; a rodent PMDD-model study found GABAA-Rα4 receptor expression abnormally HIGH in hippocampus (vs. abnormally low in amygdala), with allopregnanolone normalizing both directions — genuinely region-specific rather than a single clean direction, and the receptor-expression study is a rodent model, flagged as such.",
          "links": [
            {
              "id": "brain_prog_t2_l1",
              "label": "2018, J Neuroendocrinol — review",
              "url": "https://pubmed.ncbi.nlm.nih.gov/29072794/"
            },
            {
              "id": "brain_prog_t2_l2",
              "label": "2023, Aging (Albany NY) — rodent PMDD model, GABAA-Rα4",
              "url": "https://pubmed.ncbi.nlm.nih.gov/36842096/"
            }
          ]
        }
      ]
    }
]
