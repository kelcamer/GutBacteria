import { theme } from '../theme'

// Ported verbatim from `Ot` in gut-flora-atlas.readable.html (~line 16463).
// A simpler sibling of dirColor/dirArrow (theme.js) - only handles up/down,
// not "both", and renders solid triangles directly rather than returning a
// string. Used in contexts where a taxon's direction is guaranteed to be
// up/down (kept as its own component rather than merged into dirColor/
// dirArrow, matching the original's actual behavior instead of "improving"
// it into something the source didn't do).
export function DirTriangle({ dir, size = 18 }) {
  return (
    <span style={{ color: dir === 'up' ? theme.up : theme.down, fontSize: size, lineHeight: 1, fontWeight: 700 }}>
      {dir === 'up' ? '▲' : '▼'}
    </span>
  )
}
