import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)
let idSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info') => {
    const id = ++idSeq
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastCtx.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto z-[100] flex flex-col gap-2 md:max-w-sm">
        {toasts.map((t) => {
          const isError = t.type === 'error'
          const tone =
            t.type === 'success'
              ? 'bg-success-50 border-success-200 text-success-800'
              : isError
                ? 'bg-danger-50 border-danger-200 text-danger-800'
                : 'bg-ink-800 border-gold-500/30 text-white'
          return (
            <div
              key={t.id}
              role={isError ? 'alert' : 'status'}
              aria-live={isError ? 'assertive' : 'polite'}
              className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm shadow-lg border ${tone}`}
            >
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Tutup notifikasi"
                className="-mr-1 -mt-0.5 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-ring-light"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast harus di dalam ToastProvider')
  return ctx
}
