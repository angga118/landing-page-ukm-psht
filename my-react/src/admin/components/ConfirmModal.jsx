import { useEffect, useRef } from 'react'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function ConfirmModal({ open, title, description, confirmLabel = 'Hapus', cancelLabel = 'Batal', onConfirm, onCancel, loading }) {
  const panelRef = useRef(null)
  const prevFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return
    prevFocusRef.current = document.activeElement
    const panel = panelRef.current
    const focusables = panel ? panel.querySelectorAll(FOCUSABLE) : []
    if (focusables.length) focusables[0].focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
        return
      }
      if (e.key === 'Tab') {
        const list = panel.querySelectorAll(FOCUSABLE)
        if (list.length === 0) return
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (prevFocusRef.current && prevFocusRef.current.focus) {
        prevFocusRef.current.focus()
      }
    }
  }, [open, onCancel])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="tutup modal" onClick={onCancel} className="absolute inset-0 bg-black/60 focus-ring-light" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h3 id="confirm-title" className="text-lg font-semibold text-ink-900">{title}</h3>
        {description && <p className="mt-2 text-sm text-ink-600">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-neutral-50 focus-ring-light"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-60 focus-ring-light"
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
