import { useState } from 'react'
import { Button } from './components/Button'
import { Field } from './components/Field'
import { Modal } from './components/Modal'
import { theme } from './theme'

// This is a proof-of-concept scaffold, not the ported app yet - see
// PORTING_PLAN.md for the full inventory and status of every real
// component. This file exists to prove the pipeline (Vite + Tailwind v4 +
// lucide-react + the first 3 ported primitives) actually works end to end.
export default function App() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  return (
    <div className="min-h-screen p-6" style={{ color: theme.text }}>
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--display)' }}>
        Gut Flora Atlas — porting scaffold
      </h1>
      <p className="text-sm mb-6" style={{ color: theme.muted }}>
        Ported so far: theme, Button, Field, Modal. See PORTING_PLAN.md for everything else.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button tone="solid" onClick={() => setOpen(true)}>
          Open modal (Button + Modal test)
        </Button>
        <Button tone="quiet" onClick={() => {}}>
          Quiet tone
        </Button>
        <Button tone="danger" onClick={() => {}}>
          Danger tone
        </Button>
        <Button tone="ghost" disabled>
          Disabled
        </Button>
      </div>

      <div className="max-w-xs">
        <Field label="Field component test" value={text} onChange={setText} placeholder="type here" />
      </div>

      {open && (
        <Modal title="Modal component test" onClose={() => setOpen(false)}>
          <p className="text-sm">If you can see this, Button + Modal + Field + theme + Tailwind + lucide-react are all wired up correctly.</p>
        </Modal>
      )}
    </div>
  )
}
