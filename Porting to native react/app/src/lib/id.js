// Ported verbatim from `$` in gut-flora-atlas.readable.html (~line 7569).
export function makeId() {
  return Math.random().toString(36).slice(2, 9)
}
