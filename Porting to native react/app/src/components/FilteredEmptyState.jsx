import { theme } from '../theme'

// Shown when the study filters have removed everything that would have been on
// screen.
//
// Without this, a filtered-empty map is indistinguishable from a broken one -
// and worse, from "there is no evidence here", which is a different and much
// stronger claim. The distinction matters: turning on "Human studies only"
// empties the Psilocybin map entirely, and that is a genuine finding (no human
// gut-microbiome psilocybin studies exist) rather than a rendering failure. The
// app should say which.
export function FilteredEmptyState({ hiddenCount, filters }) {
  const active = []
  if (filters?.hideAnimal) active.push('animal studies')
  if (filters?.hideInVitro) active.push('lab-dish studies')
  if (filters?.hideMeta) active.push('meta-analyses')
  if (filters?.hideMendelian) active.push('Mendelian randomisation')
  if (filters?.womenOnly) active.push('male-only studies')
  if (filters?.menOnly) active.push('female-only studies')
  if (filters?.hideDerived) active.push('crossfeeding links')

  return (
    <div
      className="rounded-2xl px-4 py-6 text-center"
      style={{ background: theme.ink2, border: `1px dashed ${theme.line}` }}
    >
      <div style={{ fontSize: 22, marginBottom: 6 }}>🔍</div>
      <p style={{ color: theme.text, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
        Nothing left to show at your current evidence settings
      </p>
      <p style={{ color: theme.muted, fontSize: 12.5, lineHeight: 1.55, maxWidth: 460, margin: '0 auto' }}>
        {hiddenCount > 0 && (
          <>
            <b style={{ color: theme.text }}>{hiddenCount}</b> link{hiddenCount === 1 ? '' : 's'}{' '}
            {hiddenCount === 1 ? 'was' : 'were'} hidden here.{' '}
          </>
        )}
        {active.length > 0 && <>You are currently excluding {active.join(', ')}. </>}
        This is worth reading as a result rather than an error: it means every link here comes from a
        study type you have chosen to exclude. Adjust it in <b style={{ color: theme.text }}>Settings</b>.
      </p>
    </div>
  )
}
