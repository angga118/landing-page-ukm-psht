import { useEffect, useState } from 'react'
import Logo from './Logo'

const NAV = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'sejarah', label: 'Sejarah' },
  { id: 'ketua', label: 'Ketua' },
  { id: 'prestasi', label: 'Prestasi' },
  { id: 'galeri', label: 'Galeri' },
  { id: 'kontak', label: 'Kontak' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Kunci scroll body saat overlay menu terbuka.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled || open
            ? 'bg-ink-950/90 backdrop-blur-md border-b border-gold-500/20'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="#beranda" className="flex items-center" aria-label="UKM PSHT beranda">
            <Logo variant="light" />
          </a>

          {/* Desktop menu */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group relative inline-flex min-h-[44px] items-center px-3 text-sm font-medium tracking-wide text-neutral-200 transition-colors hover:text-gold-400 focus-ring"
                >
                  {item.label}
                  <span className="absolute inset-x-3 bottom-2 h-px scale-x-0 bg-gold-500 transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-md text-gold-400 md:hidden focus-ring"
          >
            <span className="relative block h-5 w-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${
                  open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-1/2 bg-current transition-opacity duration-200 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${
                  open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
                }`}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* Mobile full-screen overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-ink-950/98 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ul className="flex flex-1 flex-col items-center justify-center gap-2 pt-16">
          {NAV.map((item, i) => (
            <li key={item.id} className="w-full px-8">
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="flex min-h-[56px] items-center justify-center border-b border-white/5 font-display text-2xl tracking-wide text-neutral-100 transition-colors hover:text-gold-400 focus-ring"
                style={{ transitionDelay: open ? `${i * 40}ms` : '0ms' }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="px-4 pb-8 text-center text-xs text-neutral-400">
          UKM PSHT UPN 'Veteran' Jawa Timur
        </p>
      </div>
    </>
  )
}
