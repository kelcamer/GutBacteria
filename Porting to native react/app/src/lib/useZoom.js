import { useState } from 'react'

// New (no minified-source equivalent). A deliberate, button-driven zoom
// for the node maps, added specifically as a mobile-friendly alternative
// to pinch/double-tap zoom - this session spent real effort making
// gesture-based zoom stop fighting the maps' own click/drag handling;
// explicit buttons sidestep all of that instead of trying to out-guess
// gesture intent. Pure CSS transform:scale on the host div, not a
// viewBox/engine change - the graph's own physics/click math (getScreenCTM,
// getBoundingClientRect - see buildSymptomMap.js/buildMap.js) already
// resolves real screen-space geometry, which correctly accounts for
// ancestor CSS transforms, so scaling the host visually doesn't require
// touching either fragile engine file at all.
export function useZoom(initial = 1, { min = 0.6, max = 2.5, step = 0.2 } = {}) {
  const [zoom, setZoom] = useState(initial)
  const zoomIn = () => setZoom((z) => Math.min(max, +(z + step).toFixed(2)))
  const zoomOut = () => setZoom((z) => Math.max(min, +(z - step).toFixed(2)))
  return { zoom, zoomIn, zoomOut }
}
