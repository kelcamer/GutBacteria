import { theme } from '../theme'
import { seedData, symptomData } from '../data'
import { FILTER_LABELS, filterStats, DEFAULT_FILTERS } from '../lib/studyFilters'

// Global study filters. These apply to EVERY node map in the app, not just the
// screen you set them on - that is the point, so you can set "human only" once
// and trust the whole atlas from then on.
function Toggle({ id, on, onChange }) {
  const [label, help] = FILTER_LABELS[id]
  return (
    <button
      onClick={() => onChange(!on)}
      className="w-full flex items-start gap-3 rounded-xl px-3 py-3 mb-2 text-left"
      style={{
        background: on ? theme.ink3 : theme.ink2,
        border: `1px solid ${on ? '#2DD4BF' : theme.line}`,
        touchAction: 'manipulation',
      }}
    >
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: 40,
          height: 24,
          borderRadius: 999,
          background: on ? '#2DD4BF' : theme.line,
          position: 'relative',
          transition: 'background .15s',
          marginTop: 2,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 19 : 3,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: '#160E2B',
            transition: 'left .15s',
          }}
        />
      </span>
      <span className="min-w-0">
        <span style={{ display: 'block', color: theme.text, fontSize: 14, fontWeight: 600 }}>{label}</span>
        <span style={{ display: 'block', color: theme.muted, fontSize: 12, lineHeight: 1.45 }}>{help}</span>
      </span>
    </button>
  )
}

export function SettingsTab({ filters, setFilters }) {
  const stats = filterStats(seedData.conditions, symptomData, filters)
  const pct = stats.total ? Math.round((stats.hidden / stats.total) * 100) : 0

  // Women/men are mutually exclusive - both cannot be true at once.
  const set = (id) => (val) =>
    setFilters((f) => {
      const next = { ...f, [id]: val }
      if (id === 'womenOnly' && val) next.menOnly = false
      if (id === 'menOnly' && val) next.womenOnly = false
      return next
    })

  return (
    <div className="p-4 safe-bottom" style={{ maxWidth: 640 }}>
      <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Settings</h2>
      <p className="mb-4" style={{ color: theme.muted, fontSize: 13 }}>
        These apply to <b style={{ color: theme.text }}>every node map in the app</b>. Set them once and the
        whole atlas follows.
      </p>

      <div
        className="rounded-xl mb-4 px-3 py-2"
        style={{ background: theme.ink2, border: `1px solid ${theme.line}`, fontSize: 12.5, color: theme.muted }}
      >
        Showing <b style={{ color: theme.text }}>{stats.shown.toLocaleString()}</b> of{' '}
        {stats.total.toLocaleString()} links
        {stats.hidden > 0 && <> — hiding {stats.hidden.toLocaleString()} ({pct}%)</>}
      </div>

      <div className="font-mono mb-2" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.1em' }}>
        EVIDENCE TYPE
      </div>
      {['hideAnimal', 'hideInVitro', 'hideDerived', 'hideMendelian', 'hideMeta'].map((id) => (
        <Toggle key={id} id={id} on={filters[id]} onChange={set(id)} />
      ))}

      <div className="font-mono mt-4 mb-2" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.1em' }}>
        STUDY POPULATION
      </div>
      {['womenOnly', 'menOnly'].map((id) => (
        <Toggle key={id} id={id} on={filters[id]} onChange={set(id)} />
      ))}

      <button
        onClick={() => setFilters(DEFAULT_FILTERS)}
        className="rounded-lg px-3 py-2 text-sm mt-3"
        style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.muted }}
      >
        ↺ Reset to defaults
      </button>

      <h3 className="mt-6 mb-1" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>
        How these filters actually behave
      </h3>
      <p style={{ color: theme.muted, fontSize: 12.5, lineHeight: 1.6 }}>
        They <b style={{ color: theme.text }}>exclude what is confidently wrong</b>, rather than showing only
        what is confidently right — and that distinction matters. Study type was inferred from each entry's
        own citation text, and roughly a third could not be placed with confidence. Those stay visible.
        <br />
        <br />
        So <i>Human studies only</i> hides entries known to be animal or lab-dish work; it does not hide
        everything that failed to announce itself as human. Same for the population filters:{' '}
        <i>Women only</i> hides male-only studies rather than showing solely the small number of
        female-only ones.
        <br />
        <br />
        The alternative — hiding anything unproven — would quietly delete a third of the real evidence while
        leaving the map looking complete and authoritative. That seemed the more dangerous failure.
      </p>
    </div>
  )
}
