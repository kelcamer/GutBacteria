import { FlaskConical, Scale, Microscope, List, Link2, Settings, Activity } from 'lucide-react'

// Ported verbatim from `Me` inside `$u` (gut-flora-atlas.readable.html
// ~line 16893). Icon mapping confirmed via the icon inventory in
// PORTING_PLAN.md: Uo=FlaskConical, Vo=Scale, Et=Microscope, qo=List,
// ha=Link2, Go=Settings, GFA_SymptomIcon=Activity (a custom icon in the
// original, not a real lucide export - Activity is the closest lucide
// equivalent and is what GFA_SymptomIcon's own path data traces out
// anyway, see gut-flora-atlas.readable.html's GFA_SymptomIcon definition).
export const NAV_ITEMS = [
  { id: 'conditions', label: 'Conditions', icon: FlaskConical },
  { id: 'compare', label: 'Compare two', icon: Scale },
  { id: 'research', label: 'Find in papers', icon: Microscope },
  { id: 'index', label: 'Bacteria index', icon: List },
  { id: 's2b', label: 'Symptom to Bacteria Map', icon: Activity },
  { id: 'b2s', label: 'Bacteria to Symptom Map', icon: Activity },
  { id: 'crossfeed', label: 'Crossfeeding Network', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Activity },
  { id: 'brain', label: 'Condition to Brain Region', icon: Activity },
  { id: 'brain_r2c', label: 'Brain Region to Condition', icon: Activity },
  { id: 'sources', label: 'Sources', icon: Link2 },
  { id: 'glossary', label: 'Glossary', icon: Link2 },
  { id: 'data', label: 'Backup', icon: Settings },
]
