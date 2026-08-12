import { useRef, useState } from 'react'
import { Download, Upload, Copy, RotateCcw } from 'lucide-react'
import { theme } from '../theme'
import { seedData, symptomData } from '../data'
import { Button } from './Button'
import { Modal } from './Modal'

// Ported from `Qm` in gut-flora-atlas.readable.html (~line 29956-30185,
// 230 lines) - the Backup tab: stat cards, export (two JSON files -
// conditions and symptoms, tracked separately), import (accepts either
// file alone or both at once, plus the older bundled single-file export
// shape for backward compatibility), copy-to-clipboard, and reset-to-seed
// with a confirm modal. Icon mapping confirmed: Oo=Download, $o=Upload,
// No=Copy, _o=RotateCcw.
//
// `reset` is simplified from the original's `GFA_seed()` (an async
// fetch-with-embedded-fallback, same pattern already eliminated from this
// port's data loading - see hooks/useConditionsData.js's header comment)
// to a synchronous `commit(seedData)`, since the bundled `seedData` import
// already *is* "what GFA_seed() would have resolved to" in a real deployed
// app - not a behavior change, just skipping a network round-trip that
// only existed to work around file:// in the original.
export function BackupTab({ data, commit }) {
  const [message, setMessage] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const fileInputRef = useRef(null)

  const exportJSON = () => {
    const dlFile = (obj, suffix) => {
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gut-flora-atlas-${suffix}-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    dlFile({ version: data.version || 1, conditions: data.conditions }, 'conditions')
    dlFile({ version: 1, symptoms: symptomData.symptoms, bacteria: symptomData.bacteria }, 'symptoms')
    setMessage('Exported 2 files: conditions and symptoms.')
  }

  const importJSON = (ev) => {
    const files = Array.from(ev.target.files || [])
    if (!files.length) return
    const readOne = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            resolve(JSON.parse(reader.result))
          } catch {
            resolve(null)
          }
        }
        reader.onerror = () => resolve(null)
        reader.readAsText(file)
      })
    Promise.all(files.map(readOne)).then((parsedList) => {
      // Supports both the current split-file export (a plain
      // {conditions:[...]} file and a plain {symptoms:[...],bacteria:[...]}
      // file) and the older bundled single-file export ({conditions,
      // symptomData:{symptoms,bacteria}}) so past exports still import
      // fine. Selecting both files at once works in one pass; selecting
      // just one only applies that half.
      let hasConditions = false
      let hasSymptoms = false
      let condCount = 0
      let bactCount = 0
      parsedList.forEach((parsed) => {
        if (!parsed) return
        if (Array.isArray(parsed.conditions)) {
          commit(parsed)
          hasConditions = true
          condCount = parsed.conditions.length
        }
        const symData =
          parsed.symptomData && Array.isArray(parsed.symptomData.symptoms) && Array.isArray(parsed.symptomData.bacteria)
            ? parsed.symptomData
            : Array.isArray(parsed.symptoms) && Array.isArray(parsed.bacteria)
              ? parsed
              : null
        if (symData) {
          localStorage.setItem('gfa_symptom_data_override', JSON.stringify(symData))
          localStorage.setItem('gfa_symptom_data_override_baseline', JSON.stringify(symptomData))
          hasSymptoms = true
          bactCount = symData.bacteria.length
        }
      })
      if (!hasConditions && !hasSymptoms) {
        setMessage('None of the selected files look like a valid atlas export.')
        ev.target.value = ''
        return
      }
      const parts = []
      if (hasConditions) parts.push(`${condCount} conditions`)
      if (hasSymptoms) parts.push(`${bactCount} symptom-linked bacteria`)
      setMessage(`Imported ${parts.join(' and ')}.` + (hasSymptoms ? ' Reloading to apply symptom data…' : ''))
      if (hasSymptoms) {
        sessionStorage.setItem('gfa_last_tab', 'data')
        setTimeout(() => window.location.reload(), 900)
      }
      ev.target.value = ''
    })
  }

  const copyJSON = async () => {
    const text = JSON.stringify({ conditions: data.conditions, symptomData }, null, 2)
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        if (!ok) throw new Error('copy rejected')
      }
      setMessage('Copied the whole atlas to your clipboard.')
    } catch {
      setMessage("Couldn't reach the clipboard — use Export JSON instead.")
    }
  }

  const stats = {
    conditions: data.conditions.length,
    taxa: data.conditions.reduce((n, c) => n + c.taxa.length, 0),
    links: data.conditions.reduce(
      (n, c) => n + (c.links?.length || 0) + c.taxa.reduce((m, t) => m + (t.links?.length || 0), 0),
      0
    ),
    symBact: symptomData.bacteria.length,
  }

  return (
    <div className="p-4 safe-bottom" style={{ maxWidth: 640 }}>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          ['conditions', stats.conditions],
          ['entries', stats.taxa],
          ['papers', stats.links],
          ['symptom taxa', stats.symBact],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: theme.ink2, border: `1px solid ${theme.line}` }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 30 }}>{value}</div>
            <div className="font-mono" style={{ fontSize: 10, color: theme.muted, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <p className="mb-4" style={{ color: theme.muted, fontSize: 13 }}>
        Your atlas saves automatically as you edit. Export downloads two files — one for conditions, one for
        symptoms — since they're tracked separately. Import accepts either file on its own, or select both at once.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button tone="quiet" onClick={exportJSON}>
          <span className="flex items-center gap-2">
            <Download size={15} /> Export JSON
          </span>
        </Button>
        <Button tone="quiet" onClick={() => fileInputRef.current?.click()}>
          <span className="flex items-center gap-2">
            <Upload size={15} /> Import JSON
          </span>
        </Button>
        <Button tone="quiet" onClick={copyJSON}>
          <span className="flex items-center gap-2">
            <Copy size={15} /> Copy JSON
          </span>
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" multiple onChange={importJSON} style={{ display: 'none' }} />
        <Button tone="danger" onClick={() => setConfirmReset(true)}>
          <span className="flex items-center gap-2">
            <RotateCcw size={15} /> Reset to seed data
          </span>
        </Button>
      </div>

      {message && (
        <p className="font-mono rounded-lg px-3 py-2" style={{ fontSize: 12, color: theme.text, background: theme.ink2, border: `1px solid ${theme.line}` }}>
          {message}
        </p>
      )}

      {confirmReset && (
        <Modal title="Reset the atlas?" onClose={() => setConfirmReset(false)}>
          <p className="text-sm mb-4" style={{ color: theme.muted }}>
            This wipes every edit and restores the seven conditions from the review paper plus the non-secretor
            profile.
          </p>
          <div className="flex gap-2">
            <Button
              tone="danger"
              onClick={() => {
                commit(seedData)
                localStorage.removeItem('gfa_symptom_data_override')
                localStorage.removeItem('gfa_symptom_data_override_baseline')
                sessionStorage.setItem('gfa_last_tab', 'data')
                setConfirmReset(false)
                setMessage('Reset to seed data.')
                setTimeout(() => window.location.reload(), 600)
              }}
            >
              Reset everything
            </Button>
            <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
