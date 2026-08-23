import { useEffect, useState, useRef } from 'react'
import { api, ApiError } from '../../lib/api.js'
import { useToast } from '../components/Toast.jsx'
import SmartImage from '../../landing/components/SmartImage.jsx'
import { RichTextRenderer } from '../../lib/richText.js'

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
  const taRef = useRef(null)
  const pendingSel = useRef(null)

  useEffect(() => {
    let mounted = true
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

  // Kembalikan seleksi kursor setelah konten diubah oleh toolbar/shortcut.
  useEffect(() => {
    if (pendingSel.current && taRef.current) {
      const [s, en] = pendingSel.current
      taRef.current.focus()
      taRef.current.setSelectionRange(s, en)
      pendingSel.current = null
    }
  }, [konten])

  // Sisipkan/wrap marker inline (** / *) pada seleksi kursor textarea.
  const applyInline = (marker) => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const v = ta.value
    const sel = v.slice(s, e)
    const wrapped = sel ? `${marker}${sel}${marker}` : `${marker}${marker}`
    const nv = v.slice(0, s) + wrapped + v.slice(e)
    const newStart = s + marker.length
    const newEnd = sel ? e + marker.length : s + marker.length
    setKonten(nv)
    pendingSel.current = [newStart, newEnd]
  }

  // Prefix di awal baris kursor (untuk heading/list), idempoten.
  const applyPrefix = (prefix) => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart
    const end = ta.selectionEnd
    const v = ta.value
    const lineStart = v.lastIndexOf('\n', s - 1) + 1
    let lineEnd = v.indexOf('\n', end)
    if (lineEnd === -1) lineEnd = v.length
    const block = v.slice(lineStart, lineEnd)
    const lines = block.split('\n')
    const newLines = lines.map((l) => (l.startsWith(prefix) ? l : prefix + l))
    const nb = newLines.join('\n')
    const nv = v.slice(0, lineStart) + nb + v.slice(lineEnd)
    setKonten(nv)
    pendingSel.current = [lineStart + prefix.length, lineStart + prefix.length]
  }

  const onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase()
      if (k === 'b') {
        e.preventDefault()
        applyInline('**')
      } else if (k === 'i') {
        e.preventDefault()
        applyInline('*')
      }
    }
  }

  const words = (konten.trim().match(/\S+/g) || []).length
  const chars = konten.length

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

  const btnCls =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-sm text-ink-700 transition-colors hover:border-gold-500 hover:text-gold-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-ink-900">Kelola Sejarah</h1>
        <p className="text-sm text-ink-600">Edit konten sejarah organisasi</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white">
        <div className="space-y-4 p-5">
          {error && <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Editor */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Konten Sejarah</label>
              <div className="mb-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => applyInline('**')} title="Bold (Ctrl+B)" className={btnCls}>
                  <span className="font-bold">B</span>
                </button>
                <button type="button" onClick={() => applyInline('*')} title="Italic (Ctrl+I)" className={btnCls}>
                  <span className="italic">I</span>
                </button>
                <button type="button" onClick={() => applyPrefix('## ')} title="Heading" className={btnCls}>
                  <span className="font-semibold">H</span>
                </button>
                <button type="button" onClick={() => applyPrefix('- ')} title="Bullet" className={btnCls}>
                  <span className="text-base leading-none">•</span>
                </button>
                <button type="button" onClick={() => applyPrefix('1. ')} title="Numbering" className={btnCls}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="10" y1="6" x2="21" y2="6" />
                    <line x1="10" y1="12" x2="21" y2="12" />
                    <line x1="10" y1="18" x2="21" y2="18" />
                    <path d="M4 6h1v4" />
                    <path d="M4 10h2" />
                    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                  </svg>
                </button>
              </div>
              <textarea
                ref={taRef}
                value={konten}
                onChange={(e) => setKonten(e.target.value)}
                onKeyDown={onKeyDown}
                rows={10}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none"
                placeholder={'Tulis sejarah UKM PSHT...\nGunakan ## untuk judul, - untuk daftar, 1. untuk penomoran, **teks** untuk tebal, *teks* untuk miring.'}
              />
              <p className="mt-1 text-xs text-neutral-500">{words} kata · {chars} karakter</p>
            </div>

            {/* Pratinjau langsung (tema gelap mirip landing) */}
            <div>
              <p className="mb-1 text-sm font-medium text-ink-700">Pratinjau</p>
              <div className="min-h-[16rem] rounded-xl border border-neutral-200 bg-ink-950 p-4">
                {konten.trim() ? (
                  <RichTextRenderer text={konten} className="text-sm text-neutral-300" />
                ) : (
                  <p className="text-sm text-neutral-500">Pratinjau akan muncul di sini...</p>
                )}
              </div>
            </div>
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
