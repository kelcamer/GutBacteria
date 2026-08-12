// Deliberately imported straight from the repo root, NOT duplicated into
// this app's own src/data/ - see PORTING_PLAN.md for why. Short version:
// the original app kept 4 physical copies of this data in sync by hand
// (seed_data.json, an embedded qf() fallback, symptom_data.json, an
// embedded GFA_SYMPTOM_DATA_SHIPPED fallback) because fetch() is blocked
// when the app is opened via file://. A real deployed Vite app never has
// that problem - Vite bundles a plain ES module import at build time
// regardless of how the page is later served - so there's no reason to
// keep more than one copy at all. Verified this cross-directory import
// actually works in both `npm run dev` (Vite serves it via its /@fs/
// mechanism) and `npm run build` (bundle size jumped from ~199KB to
// ~740KB when this was wired in, confirming it's really bundled, not
// silently no-op'd).
import seedData from '../../../../seed_data.json'
import symptomData from '../../../../symptom_data.json'

export { seedData, symptomData }
