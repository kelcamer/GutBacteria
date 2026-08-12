import { useEffect } from 'react'
import { X } from 'lucide-react'
import { theme } from '../theme'

// Ported verbatim from `Xo` in gut-flora-atlas.readable.html (~line 16585).
// `za` in the original is lucide-react's X icon (confirmed via the icon
// inventory - see the porting plan doc).
export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(8,4,20,.72)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} rounded-t-2xl sm:rounded-2xl overflow-hidden`}
        style={{ background: theme.ink2, border: `1px solid ${theme.line}`, maxHeight: '90vh' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: `1px solid ${theme.line}` }}
        >
          <h3 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} style={{ color: theme.muted }} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div
          className="p-4 overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 52px)', paddingBottom: 'calc(16px + env(safe-area-inset-bottom,0px))' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
