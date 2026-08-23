import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api.js'

export default function OverviewPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api
      .get('/admin/stats')
      .then((data) => {
        if (mounted) {
          setStats(data)
          setError('')
        }
      })
      .catch((e) => {
        if (mounted) setError(e instanceof ApiError ? e.message : e.message)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const counts = stats?.counts || stats || { pengurus: '-', prestasi: '-', galeri: '-' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Overview</h1>
        <p className="mt-1 text-sm text-ink-600">Ringkasan konten landing page UKM PSHT</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-ink-600">Memuat statistik...</div>
      ) : error ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">Gagal memuat statistik: {error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Pengurus" value={counts.pengurus} to="/admin/pengurus" />
          <StatCard label="Prestasi" value={counts.prestasi} to="/admin/prestasi" />
          <StatCard label="Galeri" value={counts.galeri} to="/admin/galeri" />
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink-900">Aksi Cepat</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickLink to="/admin/beranda" title="Kelola Beranda" desc="Ubah hero, judul, dan tombol" />
          <QuickLink to="/admin/sejarah" title="Kelola Sejarah" desc="Edit konten sejarah & foto" />
          <QuickLink to="/admin/pengurus" title="Kelola Pengurus" desc="Tambah / edit pengurus" />
          <QuickLink to="/admin/prestasi" title="Kelola Prestasi" desc="Tambah / edit prestasi" />
          <QuickLink to="/admin/galeri" title="Kelola Galeri" desc="Upload foto galeri" />
          <QuickLink to="/admin/kontak" title="Kelola Kontak" desc="WhatsApp, email, alamat" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, to }) {
  return (
    <Link to={to} className="rounded-xl border border-gold-500/20 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-ink-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink-900">{value ?? '-'}</p>
      <p className="mt-2 text-xs font-medium text-gold-700">Kelola →</p>
    </Link>
  )
}

function QuickLink({ to, title, desc }) {
  return (
    <Link to={to} className="rounded-lg border border-neutral-200 px-4 py-3 hover:border-gold-500/40 hover:bg-gold-50/50">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="text-xs text-ink-600">{desc}</p>
    </Link>
  )
}
