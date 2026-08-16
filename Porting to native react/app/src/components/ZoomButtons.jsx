import { theme } from '../theme'

// Pairs with lib/useZoom.js - see its own header comment for why this
// exists. Centered, above the map, matching how it was specifically
// requested.
export function ZoomButtons({ onZoomIn, onZoomOut }) {
  return (
    <div className="flex justify-center gap-2 mb-2">
      <button
        onClick={onZoomIn}
        className="rounded-lg px-3 py-1.5 text-sm"
        style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
      >
        🔍 Zoom In
      </button>
      <button
        onClick={onZoomOut}
        className="rounded-lg px-3 py-1.5 text-sm"
        style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
      >
        🔍 Zoom Out
      </button>
    </div>
  )
}
