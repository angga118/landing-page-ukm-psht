import { Link } from 'react-router-dom'
import Logo from './Logo'
import { waLink } from '../data'

const MENU = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'sejarah', label: 'Sejarah' },
  { id: 'ketua', label: 'Ketua' },
  { id: 'prestasi', label: 'Prestasi' },
  { id: 'galeri', label: 'Galeri' },
  { id: 'kontak', label: 'Kontak' },
]

export default function Footer({ kontak }) {
  const year = new Date().getFullYear()
  const ig = kontak?.instagram ? `https://instagram.com/${kontak.instagram.replace(/^@/, '')}` : '#'

  return (
    <footer className="relative border-t border-gold-500/15 bg-ink-950 pt-14">
      <div className="absolute inset-x-0 top-0 rule-gold opacity-60" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 pb-10 md:grid-cols-3">
          {/* Identitas */}
          <div>
             <Logo variant="light" className="h-12" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Unit Kegiatan Mahasiswa pencak silat Persaudaraan Setia Hati Terate di UPN 'Veteran'
              Jawa Timur. Tangguh Dalam Aksi, Unggul Dalam Prestasi.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h3 className="mb-4 font-display text-sm uppercase tracking-[0.25em] text-gold-500">
              Navigasi
            </h3>
            <ul className="space-y-2">
              {MENU.map((m) => (
                <li key={m.id}>
                  <a
                    href={`#${m.id}`}
                    className="inline-flex min-h-[40px] items-center text-sm text-neutral-300 transition-colors hover:text-gold-400 focus-ring"
                  >
                    {m.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sosmed + kontak singkat */}
          <div>
            <h3 className="mb-4 font-display text-sm uppercase tracking-[0.25em] text-gold-500">
              Terhubung
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href={waLink(kontak?.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-gold-400 focus-ring"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.3 14.2c-.2.6-1.2 1.1-1.6 1.1-.5.1-1 .2-3.2-.7-2.6-1.1-4.2-3.8-4.3-4-.1-.2-1.1-1.5-1.1-2.9s.7-2 .9-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.5 2.8 1.7.3.1.5.1.7-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.9-.1 1.5z" />
                </svg>
                WhatsApp
              </a>
              <a
                href={ig}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-gold-400 focus-ring"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
                @{kontak?.instagram || 'ukmpsht_upnvjt'}
              </a>
              <a
                href={kontak?.email ? `mailto:${kontak.email}` : '#'}
                className="inline-flex min-h-[40px] items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-gold-400 focus-ring"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                {kontak?.email || 'ukmpsht@upnjatim.ac.id'}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 py-6 text-xs text-neutral-400 sm:flex-row">
          <p>
            © {year} UKM PSHT UPN 'Veteran' Jawa Timur. Hak cipta dilindungi.
            <span className="mx-1.5 text-neutral-600">·</span>
            <Link to="/admin" className="text-neutral-600 hover:text-gold-400 focus-ring">.</Link>
          </p>
          <p className="tracking-wide">Persaudaraan Setia Hati Terate</p>
        </div>
      </div>
    </footer>
  )
}
