// Ported verbatim from gut-flora-atlas.html's minified `f` (theme colors)
// and `zf` (12-color condition palette) objects — see
// gut-flora-atlas.readable.html around line 7556 for the source.
export const theme = {
  ink: '#160E2B',
  ink2: '#1E1440',
  ink3: '#291B52',
  line: '#3E2C6E',
  text: '#F1EAFF',
  muted: '#A08FC7',
  up: '#FF5C86',
  down: '#4FC3F7',
}

export const palette = [
  '#5B8DEF', '#B57BFF', '#FFA62B', '#FF6B6B', '#3DDC97', '#F45BAF',
  '#33C7E8', '#C3E88D', '#FF8FA3', '#8FD3F4', '#FFD166', '#9D8DF1',
]

// Direction color/arrow helpers, ported verbatim from GFA_dirColor /
// GFA_dirArrow (gut-flora-atlas.readable.html ~line 27192). Note "both" is
// the fallback branch (anything that isn't exactly "up" or "down"), not a
// strict equality check, matching the original.
export function dirColor(dir) {
  return dir === 'up' ? theme.up : dir === 'down' ? theme.down : '#FBBF24'
}

export function dirArrow(dir) {
  return dir === 'up' ? '▲' : dir === 'down' ? '▼' : '↕'
}
