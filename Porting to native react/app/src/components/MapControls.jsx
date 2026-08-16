import { useEffect, useRef, useState } from 'react'
import { theme } from '../theme'

// Shared control bar for all five map components (SymptomTab, BrainTab,
// ConditionsMap, ConditionMap, BacteriumFocusMap), which until now each
// carried their own hand-duplicated row of six buttons.
//
// The mobile problem this solves: six buttons in a `flex-wrap` row become
// three stacked rows on a ~375px phone, eating the vertical space above the
// map you're actually trying to look at. Here the two most-used actions
// (Snap back / Connections) stay visible and the remaining four collapse
// behind a "⋯ More" popover below 560px. On wider screens every button
// renders inline exactly as before, so desktop is unchanged.
//
// Extracted as shared code deliberately - the per-map button rows were
// identical apart from which callbacks they invoked, and keeping five copies
// in sync (as the label-shortening pass had to) is pure overhead.
export function MapControls({ onSnapBack, onScramble, onHideIsolated, onIncreasedOnly, onDecreasedOnly, onConnections, onToggleCrossFeed }) {
  const [open, setOpen] = useState(false)
  // Cross-feeding links are INFERRED from metabolic relationships rather than
  // measured in the condition/symptom they appear under, so they stay hidden
  // unless asked for. Default false = proven data only.
  const [showCrossFeed, setShowCrossFeed] = useState(false)
  const wrapRef = useRef(null)

  // Close the overflow popover on any outside pointer press. Uses
  // pointerdown rather than click so it also dismisses when the press
  // starts on the map/SVG below, which stops pointer events from
  // reaching a normal click handler.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // Every one of these actions triggers a graph rebuild, which tears down
  // and re-inserts the SVG inside the map host. While the host is briefly
  // empty the page gets shorter, the browser clamps scrollY to the new
  // smaller maximum, and you get yanked back up the page - very obvious on
  // mobile, where the map is tall relative to the viewport.
  //
  // These are view-manipulation controls; none of them should move the
  // page. Capture scrollY, let React commit and the engine rebuild, then
  // put it back. Two rAFs because the restore has to land after layout has
  // settled at full height again, not while the host is still empty.
  // Instant (not smooth) so it reads as "nothing moved" rather than a jump
  // back.
  const keepScroll = (fn) => () => {
    const y = window.scrollY
    fn?.()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (window.scrollY !== y) window.scrollTo({ top: y, behavior: 'auto' })
      })
    })
  }

  const btn = {
    background: 'transparent',
    border: `1px solid ${theme.line}`,
    color: theme.muted,
    // 36px min keeps these closer to a real thumb target than the old
    // py-1.5 row managed, without changing desktop density much.
    minHeight: 36,
    touchAction: 'manipulation',
  }

  // Snap back and Connections are the two kept always-visible; the rest
  // collapse on narrow screens. Scramble sits in here rather than up front
  // because it's the least-reached-for of the six in practice.
  const overflow = [
    { label: '🔀 Scramble', fn: keepScroll(onScramble) },
    { label: '🕸️ Hide Isolated', fn: keepScroll(onHideIsolated) },
    { label: '▲ Increased Only', fn: keepScroll(onIncreasedOnly) },
    { label: '▼ Decreased Only', fn: keepScroll(onDecreasedOnly) },
    {
      label: showCrossFeed ? '🚫 Hide Cross-Feeders' : '🔀 Show Cross-Feeders',
      fn: keepScroll(() => {
        const next = !showCrossFeed
        setShowCrossFeed(next)
        onToggleCrossFeed?.(next)
      }),
    },
  ]

  return (
    <div ref={wrapRef} className="mt-3 flex flex-wrap gap-2 items-center" style={{ position: 'relative' }}>
      <button onClick={keepScroll(onSnapBack)} className="rounded-lg px-3 py-1.5 text-sm" style={btn}>
        ↻ Snap back
      </button>
      <button onClick={keepScroll(onConnections)} className="rounded-lg px-3 py-1.5 text-sm" style={btn}>
        🔗 Connections
      </button>

      {/* Wide screens: the remaining four inline. */}
      {overflow.map((o) => (
        <button key={o.label} onClick={() => o.fn?.()} className="gfa-ctl-wide rounded-lg px-3 py-1.5 text-sm" style={btn}>
          {o.label}
        </button>
      ))}

      {/* Narrow screens: one trigger that opens the same four. */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="gfa-ctl-more rounded-lg px-3 py-1.5 text-sm"
        style={{ ...btn, marginLeft: 'auto' }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        ⋯ More
      </button>

      {open && (
        <div
          className="gfa-ctl-menu rounded-xl"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 6,
            zIndex: 40,
            background: theme.ink2,
            border: `1px solid ${theme.line}`,
            boxShadow: '0 10px 30px rgba(0,0,0,.5)',
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: 190,
          }}
        >
          {overflow.map((o) => (
            <button
              key={o.label}
              onClick={() => {
                o.fn?.()
                setOpen(false)
              }}
              className="rounded-lg px-3 text-sm"
              style={{ ...btn, border: 'none', textAlign: 'left', minHeight: 42 }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
