import { theme } from '../theme'

// Ported verbatim from `Sr` in gut-flora-atlas.readable.html (~line 16553) —
// a labeled text input used throughout the condition-editing forms.
export function Field({ label, value, onChange, placeholder, mono }) {
  return (
    <label className="block">
      <span
        className="font-mono block mb-1"
        style={{ fontSize: 10, letterSpacing: '.12em', color: theme.muted, textTransform: 'uppercase' }}
      >
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg px-3 py-2 text-sm outline-none ${mono ? 'font-mono' : ''}`}
        style={{ background: theme.ink, color: theme.text, border: `1px solid ${theme.line}` }}
      />
    </label>
  )
}
