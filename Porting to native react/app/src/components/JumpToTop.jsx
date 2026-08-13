import { ArrowUp } from 'lucide-react'
import { theme } from '../theme'

// New (no minified-source equivalent). Rendered once in App.jsx, right at
// the end of <main> - after every tab's conditional content block, not
// duplicated into each tab component individually - so it lands at the
// bottom of whichever tab is currently active without ~10 copies of the
// same button to keep in sync. The whole page is a normal scrolling
// document (no inner overflow:auto container - see index.css's .dish,
// nothing there restricts scroll to a sub-element), so a plain
// window.scrollTo is the correct target, not some ref chase.
export function JumpToTop() {
  return (
    <div className="flex justify-center px-4 pt-2 pb-6">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
        style={{ background: theme.ink2, border: `1px solid ${theme.line}`, color: theme.muted }}
      >
        <ArrowUp size={14} /> Jump to top?
      </button>
    </div>
  )
}
