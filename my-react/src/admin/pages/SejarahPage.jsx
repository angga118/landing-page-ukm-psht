import { useEffect, useState, useRef } from 'react'
import { api, ApiError } from '../../lib/api.js'
import { useToast } from '../components/Toast.jsx'
import SmartImage from '../../landing/components/SmartImage.jsx'

function validateImage(file) {
  if (!file) return null
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return 'Format harus JPG, PNG, atau WebP'
  if (file.size > 2 * 1024 * 1024) return 'Ukuran maksimal 2MB'
  return null
}

export default function SejarahPage() {
  const { showToast } = useToast()
  const [konten, setKonten] = useState('')
  const [foto, setFoto] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .get('/content/sejarah')
      .then((data) => {
        if (!mounted) return
        const d = data || {}
        setKonten(d.konten || '')
        setFoto(d.foto || '')
        if (d.foto) setPreview(d.foto)
      })
      .catch((e) => {
        if (e instanceof ApiError) setError(e.message)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const msg = validateImage(f)
    if (msg) {
      setError(msg)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (file) {
      const msg = validateImage(file)
      if (msg) {
        setError(msg)
        return
      }
    }
    const fd = new FormData()
    fd.append('konten', konten)
    if (file) fd.append('foto', file)

    setSaving(true)
    try {
      const data = await api.post('/admin/content/sejarah', fd)
      const d = data || {}
      if (d.foto) {
        setFoto(d.foto)
        setPreview(d.foto)
      }
      showToast('Sejarah berhasil disimpan', 'success')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err.message
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="rounded-xl border bg-white p-8 text-center text-sm text-ink-600">Memuat data...</div>

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-ink-900">Kelola Sejarah</h1>
        <p className="text-sm text-ink-600">Edit konten sejarah organisasi</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white">
        <div className="p-5 space-y-4">
          {error && <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Konten Sejarah</label>
            <textarea value={konten} onChange={(e) => setKonten(e.target.value)} rows={8} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" placeholder="Tulis sejarah UKM PSHT..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Foto (JPG/PNG/WebP max 2MB)</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-ink-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white" />
            {preview && (
              <div className="mt-3">
                <p className="text-xs text-ink-600 mb-1">Preview:</p>
                <SmartImage src={preview} alt="Preview sejarah" className="h-48 w-full rounded-lg object-cover border" />
                {foto && !file && <p className="mt-1 text-xs text-neutral-500 break-all">{foto}</p>}
              </div>
            )}
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
