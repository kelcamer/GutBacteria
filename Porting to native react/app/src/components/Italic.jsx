// Ported verbatim from `Ko` in gut-flora-atlas.readable.html (~line 16494) -
// a plain italic text wrapper, used for taxon scientific names throughout
// the app (binomial nomenclature convention).
export function Italic({ children, className = '', style }) {
  return (
    <span className={className} style={{ fontStyle: 'italic', minWidth: 0, ...style }}>
      {children}
    </span>
  )
}
