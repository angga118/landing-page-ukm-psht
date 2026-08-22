import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const menu = [
  { label: 'Overview', path: '/admin/overview' },
  { label: 'Kelola Beranda', path: '/admin/beranda' },
  { label: 'Kelola Sejarah', path: '/admin/sejarah' },
  { label: 'Kelola Pengurus', path: '/admin/pengurus' },
  { label: 'Kelola Prestasi', path: '/admin/prestasi' },
  { label: 'Kelola Galeri', path: '/admin/galeri' },
  { label: 'Kelola Kontak', path: '/admin/kontak' },
]

// Navigasi bawah ponsel: semua halaman harus terjangkau.
const bottomItems = [
  { label: 'Overview', path: '/admin/overview', icon: 'grid' },
  { label: 'Beranda', path: '/admin/beranda', icon: 'home' },
  { label: 'Sejarah', path: '/admin/sejarah', icon: 'book' },
  { label: 'Pengurus', path: '/admin/pengurus', icon: 'users' },
  { label: 'Prestasi', path: '/admin/prestasi', icon: 'trophy' },
  { label: 'Galeri', path: '/admin/galeri', icon: 'image' },
  { label: 'Kontak', path: '/admin/kontak', icon: 'mail' },
]

function NavIcon({ name }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
    case 'book':
      return <svg {...common}><path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z" /><path d="M4 19a2 2 0 012-2h12" /></svg>
    case 'users':
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0" /><path d="M16 5a3 3 0 010 6" /><path d="M21 20a6 6 0 00-5-5.9" /></svg>
    case 'trophy':
      return <svg {...common}><path d="M8 4h8v4a4 4 0 01-8 0z" /><path d="M8 6H5v2a3 3 0 003 3" /><path d="M16 6h3v2a3 3 0 01-3 3" /><path d="M10 14h4l1 6H9z" /></svg>
    case 'image':
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-7 7" /></svg>
    case 'mail':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></svg>
    case 'globe':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 010 18 14 14 0 000-18" /></svg>
    case 'grid':
    default:
      return <svg {...common}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>
  }
}

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring-light ${isActive ? 'bg-gold-500 text-ink-900' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
      }
    >
      {item.label}
    </NavLink>
  )
}

// Tautan kembali ke website publik; dibuka di tab baru agar admin tidak
// kehilangan posnya saat mempreview situs.
function WebsiteLink({ onClick }) {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring-light text-white/50 hover:bg-white/10 hover:text-gold-400"
    >
      <NavIcon name="globe" />
      <span>Lihat Website</span>
    </a>
  )
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => {
    // Navigasi DULU keluar dari area admin supaya guard RequireAuth tidak
    // sempat mengarahkan ke /admin/login saat state user dinolkan, lalu
    // bersihkan sesi di background.
    navigate('/', { replace: true })
    try {
      await logout()
    } catch {
      // Kegagalan API logout diabaikan — sesi lokal tetap dibersihkan
      // oleh logout() lewat blok finally-nya.
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:bg-ink-900 md:border-r md:border-gold-500/20">
        <div className="flex h-16 items-center gap-2 border-b border-gold-500/20 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gold-500 text-ink-900 text-sm font-bold">PS</div>
          <div>
            <p className="text-sm font-bold leading-none text-gold-400">UKM PSHT</p>
            <p className="text-xs text-white/60">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menu.map((m) => (
            <NavItem key={m.path} item={m} />
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 space-y-3">
          <WebsiteLink />
          {user && <p className="text-xs text-white/60">Masuk sebagai <span className="text-white font-medium">{user.username}</span></p>}
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/20 border border-white/10 focus-ring-light"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink-900 px-4 md:hidden border-b border-gold-500/20">
        <div className="flex items-center gap-3">
          <button
            aria-label="buka menu"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white focus-ring-light"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold text-gold-400">UKM PSHT</span>
          <span className="text-xs text-white/50 hidden sm:inline">Admin</span>
        </div>
        <button onClick={handleLogout} className="rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-bold text-ink-900 focus-ring-light">Logout</button>
      </header>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="tutup drawer" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-black/60 focus-ring-light" />
          <div className="relative flex h-full w-72 max-w-[80%] flex-col bg-ink-900">
            <div className="flex h-14 items-center justify-between px-4 border-b border-white/10">
              <span className="text-sm font-bold text-gold-400">Menu Admin</span>
              <button onClick={() => setDrawerOpen(false)} className="h-8 w-8 rounded bg-white/10 text-white flex items-center justify-center focus-ring-light">✕</button>
            </div>
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
              {menu.map((m) => (
                <NavItem key={m.path} item={m} onClick={() => setDrawerOpen(false)} />
              ))}
            </nav>
            <div className="p-4 border-t border-white/10 space-y-3">
              <WebsiteLink onClick={() => setDrawerOpen(false)} />
              {user && <p className="text-xs text-white/60">{user.username}</p>}
              <button onClick={handleLogout} className="w-full rounded-lg bg-gold-500 px-3 py-2.5 text-sm font-bold text-ink-900 focus-ring-light">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="md:pl-64">
        <main className="mx-auto max-w-5xl px-4 py-6 pb-20 md:pb-6 md:px-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex overflow-x-auto border-t border-neutral-200 bg-white md:hidden">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-[11px] font-medium focus-ring-light ${isActive ? 'text-gold-700 bg-gold-50' : 'text-ink-600'}`
            }
          >
            <span className="flex h-5 w-5 items-center justify-center"><NavIcon name={item.icon} /></span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
