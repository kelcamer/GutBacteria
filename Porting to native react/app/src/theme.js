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
// "none" = TESTED, NO RELIABLE EFFECT. A fourth state, added because yellow was
// carrying two different meanings: "studies disagree" (real conflict, worth your
// attention) and "we looked and found nothing" (settled, and not interesting).
// Reading the second as the first makes a null result look like an open question.
// Grey, because it should recede rather than draw the eye - it is the one state
// that means you can stop wondering.
export function dirColor(dir) {
  if (dir === 'up') return theme.up
  if (dir === 'down') return theme.down
  if (dir === 'none') return '#8A8598'
  return '#FBBF24'
}

export function dirArrow(dir) {
  if (dir === 'up') return '▲'
  if (dir === 'down') return '▼'
  if (dir === 'none') return '○'   // deliberately not an arrow: nothing moved
  return '↕'
}
