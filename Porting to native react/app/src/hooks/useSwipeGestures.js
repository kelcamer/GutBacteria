import { useEffect } from 'react'

// Ported from `GFA_wireSwipeGestures` in gut-flora-atlas.readable.html
// (~line 24831-24926, 96 lines) - a document-level touch listener wired
// once at module load in the original (`GFA_wireSwipeGestures();` right
// after its own definition, line 24927), independent of and in ADDITION
// to App.jsx's own onTouchStart/onTouchEnd drawer-swipe handlers (ported
// earlier as `onTouchStart`/`onTouchEnd` in App.jsx, itself from `Be`/`re`
// inside `$u`). Both mechanisms really do coexist in the original - this
// one works by finding and `.click()`-ing the real "Open menu"/"Back"
// buttons via querySelector rather than touching React state directly, so
// it works regardless of which tab/view is mounted. Kept as a genuine
// duplicate on purpose (not deduped/merged), since resolving that overlap
// would be a real behavior decision beyond what a port should make unasked.
//
// Only mechanical change: wrapped in a `useEffect(() => {...}, [])` so it
// installs once on mount and tears itself down on unmount (the original
// never tore down, since it ran once for the page's entire lifetime -
// cleanup here is a strict improvement for React's dev-mode double-mount,
// not a behavior change for the shipped app).
export function useSwipeGestures() {
  useEffect(() => {
    // Two independent touch gestures, wired at the document level so they
    // work regardless of which tab/view is mounted (avoids needing access
    // to the app's own React state setters):
    //  - Swipe right starting within EDGE_ZONE px of the left edge: opens
    //    the nav drawer, by clicking its real "Open menu" button.
    //  - Swipe left anywhere else: acts as "back" when a condition detail
    //    is open, by clicking its real "Back" button (a no-op otherwise,
    //    since that button only exists in the DOM when there's something
    //    to go back from).
    // Both simulate a real button .click() rather than touching React
    // state directly, so they go through the exact same code path a real
    // tap would.
    const EDGE_ZONE = 24
    const OPEN_DIST = 60
    const BACK_DIST = 36
    const MAX_SLOPE = 1.6
    let touch = null

    function isDrawerOpen() {
      const nav = document.querySelector('nav.safe-drawer')
      return !!(nav && nav.style.transform === 'translateX(0)')
    }

    function hasHScrollAncestor(el) {
      while (el && el !== document.body) {
        if (el.scrollWidth > el.clientWidth + 1) {
          const ov = getComputedStyle(el).overflowX
          if (ov === 'auto' || ov === 'scroll') return true
        }
        el = el.parentElement
      }
      return false
    }

    function onTouchStart(ev) {
      if (!ev.touches || ev.touches.length !== 1) {
        touch = null
        return
      }
      if (isDrawerOpen()) {
        touch = null
        return
      }
      const t = ev.touches[0]
      if (ev.target.closest && ev.target.closest('svg')) {
        touch = null
        return
      }
      if (hasHScrollAncestor(ev.target)) {
        touch = null
        return
      }
      touch = { x: t.clientX, y: t.clientY, edge: t.clientX <= EDGE_ZONE, triggered: false }
    }

    function onTouchMove(ev) {
      if (!touch || touch.triggered || !ev.touches || ev.touches.length !== 1) return
      const t = ev.touches[0]
      const dx = t.clientX - touch.x
      const dy = t.clientY - touch.y
      if (Math.abs(dy) > Math.abs(dx) * MAX_SLOPE) return // too vertical, let normal scroll happen
      if (touch.edge && dx > OPEN_DIST) {
        const openBtn = document.querySelector('button[aria-label="Open menu"]')
        if (openBtn) {
          touch.triggered = true
          openBtn.click()
        }
      } else if (!touch.edge && dx < -BACK_DIST) {
        const backBtn = document.querySelector('button[title="Back"]')
        if (backBtn) {
          touch.triggered = true
          backBtn.click()
        }
      }
    }

    function onTouchEnd() {
      touch = null
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    document.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])
}
