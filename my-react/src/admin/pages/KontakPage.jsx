import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api.js'
import { toMapsEmbedUrl } from '../../lib/maps.js'
import { useToast } from '../components/Toast.jsx'

export default function KontakPage() {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    whatsapp: '',
    email: '',
    alamat: '',
    jadwal_latihan: '',
    instagram: '',
    maps_embed: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .get('/content/kontak')
      .then((data) => {
        if (!mounted) return
        const d = data || {}
        setForm({
          whatsapp: d.whatsapp || '',
          email: d.email || '',
          alamat: d.alamat || '',
          jadwal_latihan: d.jadwal_latihan || '',
          instagram: d.instagram || '',
          maps_embed: d.maps_embed || '',
        })
      })
      .catch((e) => {
        if (e instanceof ApiError) setError(e.message)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSaving(true)
    try {
      const maps = toMapsEmbedUrl(form.maps_embed)
      const data = await api.post('/admin/content/kontak', { ...form, maps_embed: maps.url })
      const d = data || {}
      setForm({
        whatsapp: d.whatsapp ?? form.whatsapp,
        email: d.email ?? form.email,
        alamat: d.alamat ?? form.alamat,
        jadwal_latihan: d.jadwal_latihan ?? form.jadwal_latihan,
        instagram: d.instagram ?? form.instagram,
        maps_embed: d.maps_embed ?? form.maps_embed,
      })
      showToast('Kontak berhasil disimpan', 'success')
      if (form.maps_embed.trim() && !maps.ok) showToast('URL Maps tidak dikenali, disimpan apa adanya. Gunakan link google.com/maps yang lengkap.', 'info')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.errors) setFieldErrors(err.errors)
        showToast(err.message, 'error')
      } else {
        setError(err.message)
        showToast(err.message, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="rounded-xl border bg-white p-8 text-center text-sm text-ink-600">Memuat data...</div>

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-ink-900">Kelola Kontak</h1>
        <p className="text-sm text-ink-600">Ubah informasi kontak UKM PSHT</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white">
        <div className="p-5 space-y-4">
          {error && <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" placeholder="6281234567890" />
            {fieldErrors.whatsapp && <p className="mt-1 text-xs text-danger-600">{fieldErrors.whatsapp}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" placeholder="ukmpsht@kampus.ac.id" />
            {fieldErrors.email && <p className="mt-1 text-xs text-danger-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Alamat</label>
            <textarea value={form.alamat} onChange={(e) => update('alamat', e.target.value)} rows={2} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" placeholder="Alamat sekretariat..." />
            {fieldErrors.alamat && <p className="mt-1 text-xs text-danger-600">{fieldErrors.alamat}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Jadwal Latihan</label>
            <textarea value={form.jadwal_latihan} onChange={(e) => update('jadwal_latihan', e.target.value)} rows={2} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" placeholder="Senin & Kamis 19.00 - 21.00" />
            {fieldErrors.jadwal_latihan && <p className="mt-1 text-xs text-danger-600">{fieldErrors.jadwal_latihan}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Instagram</label>
            <input value={form.instagram} onChange={(e) => update('instagram', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" placeholder="https://instagram.com/..." />
            {fieldErrors.instagram && <p className="mt-1 text-xs text-danger-600">{fieldErrors.instagram}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Maps Embed</label>
            <textarea value={form.maps_embed} onChange={(e) => update('maps_embed', e.target.value)} rows={3} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" placeholder="Tempel URL Google Maps apa pun: link biasa, link share, atau URL embed" />
            {fieldErrors.maps_embed && <p className="mt-1 text-xs text-danger-600">{fieldErrors.maps_embed}</p>}
          </div>
        </div>

        <div className="sticky bottom-14 md:bottom-0 z-10 border-t bg-white px-5 py-3 flex justify-end rounded-b-xl">
          <button type="submit" disabled={saving} className="w-full md:w-auto rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-ink-900 hover:bg-gold-400 disabled:opacity-60">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
