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
// `onJump` is an optional hook for the active tab to reset whatever
// "drilled-in" state it has before the scroll - on the Conditions tab that
// means clearing a single-clicked condition so the full card grid comes
// back, since going back to the top and finding 40 of 41 cards still
// hidden reads as broken. Kept as a prop rather than baked in, because
// this button is shared by every tab and most of them have nothing to
// reset.
export function JumpToTop({ onJump }) {
  return (
    <div className="flex justify-center px-4 pt-2 pb-6">
      <button
        onClick={() => {
          // Clear first, then scroll. Expanding the grid back to every card
          // makes the page taller, but scrolling to 0 is valid at any
          // height, so unlike the other scroll fixes here there is no
          // reflow race to wait out.
          onJump?.()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
        style={{ background: theme.ink2, border: `1px solid ${theme.line}`, color: theme.muted }}
      >
        <ArrowUp size={14} /> Jump to top?
      </button>
    </div>
  )
}
