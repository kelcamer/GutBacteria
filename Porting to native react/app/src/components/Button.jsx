import { theme } from '../theme'

// Ported verbatim from `W` in gut-flora-atlas.readable.html (~line 16508).
export function Button({ children, onClick, tone = 'ghost', style, title, disabled }) {
  const tones = {
    ghost: { background: 'transparent', color: theme.text, border: `1px solid ${theme.line}` },
    solid: { background: theme.text, color: theme.ink, border: '1px solid transparent' },
    quiet: { background: theme.ink3, color: theme.text, border: `1px solid ${theme.line}` },
    danger: { background: 'transparent', color: '#FF8FA3', border: '1px solid #7A2E45' },
  }
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-sm transition-opacity"
      style={{ ...tones[tone], opacity: disabled ? 0.4 : 1, ...style }}
    >
      {children}
    </button>
  )
}
