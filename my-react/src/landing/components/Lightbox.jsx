import { useEffect, useRef } from 'react'
import SmartImage from './SmartImage'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function Lightbox({ items, index, onClose, onNavigate }) {
  const touchX = useRef(null)
  const dialogRef = useRef(null)
  const prevFocusRef = useRef(null)

  const prev = () => onNavigate((index - 1 + items.length) % items.length)
  const next = () => onNavigate((index + 1) % items.length)

  // Tangkap fokus pembuka & kunci scroll body; kembalikan fokus saat ditutup.
  useEffect(() => {
    prevFocusRef.current = document.activeElement
    const dialog = dialogRef.current
    const focusables = dialog ? dialog.querySelectorAll(FOCUSABLE) : []
    if (focusables.length) focusables[0].focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      if (prevFocusRef.current && prevFocusRef.current.focus) {
        prevFocusRef.current.focus()
      }
    }
  }, [])

  // Penanganan keyboard: Escape, panah, dan focus trap.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Tab') {
        const dialog = dialogRef.current
        if (!dialog) return
        const list = dialog.querySelectorAll(FOCUSABLE)
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
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length])

  const current = items[index]

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/95 backdrop-blur-sm animate-[fadeIn_0.25s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Galeri foto"
    >
      {/* Tombol tutup */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup galeri"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-ink-900/70 text-white transition-colors hover:border-gold-500/60 hover:text-gold-400 focus-ring"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Prev */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
        aria-label="Foto sebelumnya"
        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-900/70 text-white transition-colors hover:border-gold-500/60 hover:text-gold-400 sm:left-6 focus-ring"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Konten */}
      <figure
        className="mx-4 max-w-4xl animate-[scaleIn_0.3s_ease-out] sm:mx-16"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          if (dx > 50) prev()
          else if (dx < -50) next()
          touchX.current = null
        }}
      >
        <div className="overflow-hidden rounded-xl ring-1 ring-white/15">
          <SmartImage
            src={current?.foto}
            alt={`Galeri UKM PSHT — ${current?.kategori || 'dokumentasi'}`}
            seed={index + 5}
            className="max-h-[70vh] w-full object-contain"
          />
        </div>
        <figcaption className="mt-3 flex items-center justify-between text-sm text-neutral-300">
          <span className="uppercase tracking-wider text-gold-400">{current?.kategori || 'Galeri'}</span>
           <span className="text-neutral-400">
            {index + 1} / {items.length}
          </span>
        </figcaption>
      </figure>

      {/* Next */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
        aria-label="Foto berikutnya"
        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-900/70 text-white transition-colors hover:border-gold-500/60 hover:text-gold-400 sm:right-6 focus-ring"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
