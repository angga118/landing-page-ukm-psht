import { useEffect, useState, useRef } from 'react'
import { api, ApiError } from '../../lib/api.js'
import { useToast } from '../components/Toast.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import SmartImage from '../../landing/components/SmartImage.jsx'

const RESOURCE = 'prestasi'

function validateImage(file) {
  if (!file) return null
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return 'Format harus JPG, PNG, atau WebP'
  if (file.size > 2 * 1024 * 1024) return 'Ukuran maksimal 2MB'
  return null
}

export default function PrestasiPage() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [dragId, setDragId] = useState(null)

  const fetchList = async () => {
    setLoading(true)
    try {
      const data = await api.get(`/admin/${RESOURCE}`)
      const arr = Array.isArray(data) ? data : data?.data || data || []
      setItems(Array.isArray(arr) ? arr : [])
      setError('')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api.get(`/admin/${RESOURCE}`)
        if (cancelled) return
        const arr = Array.isArray(data) ? data : data?.data || data || []
        setItems(Array.isArray(arr) ? arr : [])
        setError('')
      } catch (e) {
        if (cancelled) return
        setError(e instanceof ApiError ? e.message : e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleReorder = async (newItems) => {
    setItems(newItems)
    const ids = newItems.map((i) => i.id)
    try {
      await api.post(`/admin/${RESOURCE}/reorder`, { ids })
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Gagal menyimpan urutan', 'error')
      fetchList()
    }
  }

  const move = (index, dir) => {
    const newItems = [...items]
    const target = index + dir
    if (target < 0 || target >= newItems.length) return
    const tmp = newItems[index]
    newItems[index] = newItems[target]
    newItems[target] = tmp
    handleReorder(newItems)
  }

  const onDragStart = (id) => setDragId(id)
  const onDrop = (targetId) => {
    if (dragId == null || dragId === targetId) return
    const fromIdx = items.findIndex((i) => String(i.id) === String(dragId))
    const toIdx = items.findIndex((i) => String(i.id) === String(targetId))
    if (fromIdx === -1 || toIdx === -1) return
    const newItems = [...items]
    const [moved] = newItems.splice(fromIdx, 1)
    newItems.splice(toIdx, 0, moved)
    handleReorder(newItems)
    setDragId(null)
  }

  const openAdd = () => {
    setEditing(null)
    setShowForm(true)
  }
  const openEdit = (item) => {
    setEditing(item)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.post(`/admin/${RESOURCE}/delete`, { id: deleteId })
      showToast('Data dihapus', 'success')
      setDeleteId(null)
      fetchList()
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Gagal menghapus', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Kelola Prestasi</h1>
          <p className="text-sm text-ink-600">Tambah, edit, hapus, dan atur urutan prestasi</p>
        </div>
        <button onClick={openAdd} className="rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-bold text-ink-900 hover:bg-gold-400">
          + Tambah
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-ink-600">Memuat data...</div>
      ) : error ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-ink-600">Belum ada data prestasi.</div>
      ) : (
        <>
          <div className="hidden md:block overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs font-semibold text-ink-600">
                <tr>
                  <th className="px-2 py-3 w-10" aria-label="Seret untuk mengubah urutan"></th>
                  <th className="px-4 py-3 w-10">#</th>
                  <th className="px-4 py-3">Foto</th>
                  <th className="px-4 py-3">Nama Lomba</th>
                  <th className="px-4 py-3">Tingkat</th>
                  <th className="px-4 py-3">Tahun</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr
                    key={it.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(it.id)}
                    className="border-t hover:bg-neutral-50"
                  >
                    <td
                      draggable
                      onDragStart={() => onDragStart(it.id)}
                      aria-label={`Seret untuk mengubah urutan ${it.nama_lomba}`}
                      className="cursor-move select-none px-2 py-3 text-center text-lg leading-none text-neutral-400 hover:text-gold-600"
                    >
                      ⠿
                    </td>
                    <td className="px-4 py-3 text-ink-600">{idx + 1}</td>
                    <td className="px-4 py-3">{it.foto ? <SmartImage src={it.foto} alt={it.nama_lomba} className="h-10 w-10 rounded object-cover border" /> : <span className="text-xs text-neutral-400">-</span>}</td>
                    <td className="px-4 py-3 font-medium text-ink-900">{it.nama_lomba}</td>
                    <td className="px-4 py-3 text-ink-700">{it.tingkat}</td>
                    <td className="px-4 py-3 text-ink-600">{it.tahun}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => move(idx, -1)} disabled={idx === 0} aria-label={`Naikkan urutan ${it.nama_lomba}`} className="rounded border px-2 py-1 text-xs disabled:opacity-40 focus-ring-light">↑</button>
                        <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} aria-label={`Turunkan urutan ${it.nama_lomba}`} className="rounded border px-2 py-1 text-xs disabled:opacity-40 focus-ring-light">↓</button>
                        <button onClick={() => openEdit(it)} className="rounded bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-800 focus-ring-light">Edit</button>
                        <button onClick={() => setDeleteId(it.id)} className="rounded bg-danger-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-danger-700 focus-ring-light">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {items.map((it, idx) => (
              <div key={it.id} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(it.id)} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    draggable
                    onDragStart={() => onDragStart(it.id)}
                    aria-label={`Seret untuk mengubah urutan ${it.nama_lomba}`}
                    className="cursor-move select-none rounded px-1 text-lg leading-none text-neutral-400 hover:text-gold-600"
                  >
                    ⠿
                  </span>
                  <span className="text-xs text-neutral-400">Urutan {idx + 1}</span>
                </div>
                <div className="flex gap-3">
                  {it.foto ? <SmartImage src={it.foto} alt={it.nama_lomba} className="h-14 w-14 rounded-lg object-cover border" /> : <div className="h-14 w-14 rounded-lg bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">No Foto</div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{it.nama_lomba}</p>
                    <p className="text-xs text-ink-600">{it.tingkat} • {it.tahun}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => move(idx, -1)} disabled={idx === 0} aria-label={`Naikkan urutan ${it.nama_lomba}`} className="flex-1 rounded-lg border py-2 text-xs font-medium disabled:opacity-40 focus-ring-light">Naik</button>
                  <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} aria-label={`Turunkan urutan ${it.nama_lomba}`} className="flex-1 rounded-lg border py-2 text-xs font-medium disabled:opacity-40 focus-ring-light">Turun</button>
                  <button onClick={() => openEdit(it)} className="flex-1 rounded-lg bg-ink-900 py-2 text-xs font-bold text-white focus-ring-light">Edit</button>
                  <button onClick={() => setDeleteId(it.id)} className="flex-1 rounded-lg bg-danger-600 py-2 text-xs font-bold text-white focus-ring-light">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <PrestasiForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchList()
            showToast(editing ? 'Data diperbarui' : 'Data ditambahkan', 'success')
          }}
        />
      )}

      <ConfirmModal open={!!deleteId} title="Hapus prestasi?" description="Data yang dihapus tidak dapat dikembalikan." onCancel={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}

function PrestasiForm({ initial, onClose, onSuccess }) {
  const [nama_lomba, setNamaLomba] = useState(initial?.nama_lomba || '')
  const [tingkat, setTingkat] = useState(initial?.tingkat || '')
  const [tahun, setTahun] = useState(initial?.tahun ? String(initial.tahun) : '')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(initial?.foto || '')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

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
    setFieldErrors({})
    if (!nama_lomba.trim() || !tingkat.trim() || !tahun.trim()) {
      setError('Nama lomba, tingkat, dan tahun wajib diisi')
      return
    }
    if (file) {
      const msg = validateImage(file)
      if (msg) {
        setError(msg)
        return
      }
    }
    const fd = new FormData()
    fd.append('nama_lomba', nama_lomba.trim())
    fd.append('tingkat', tingkat.trim())
    fd.append('tahun', tahun.trim())
    if (file) fd.append('foto', file)
    if (initial?.id) fd.append('id', String(initial.id))

    setSubmitting(true)
    try {
      await api.post(`/admin/${RESOURCE}`, fd)
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.errors) setFieldErrors(err.errors)
      } else setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <button aria-label="tutup" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-t-2xl md:rounded-xl bg-white">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">{initial ? 'Edit Prestasi' : 'Tambah Prestasi'}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded bg-neutral-100 flex items-center justify-center text-ink-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="rounded-lg bg-danger-50 border border-danger-200 px-3 py-2 text-sm text-danger-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Nama Lomba *</label>
            <input value={nama_lomba} onChange={(e) => setNamaLomba(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" placeholder="Kejuaraan Pencak Silat ..." />
            {fieldErrors.nama_lomba && <p className="text-xs text-danger-600 mt-1">{fieldErrors.nama_lomba}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Tingkat *</label>
            <input value={tingkat} onChange={(e) => setTingkat(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" placeholder="Kabupaten / Provinsi / Nasional" />
            {fieldErrors.tingkat && <p className="text-xs text-danger-600 mt-1">{fieldErrors.tingkat}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Tahun *</label>
            <input value={tahun} onChange={(e) => setTahun(e.target.value)} inputMode="numeric" placeholder="2024" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none" />
            {fieldErrors.tahun && <p className="text-xs text-danger-600 mt-1">{fieldErrors.tahun}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Foto (JPG/PNG/WebP max 2MB)</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-ink-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white" />
            {preview && (
              <div className="mt-3">
                <p className="text-xs text-ink-600 mb-1">Preview:</p>
                <SmartImage src={preview} alt="Preview" className="h-32 w-32 rounded-lg object-cover border" />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-ink-700">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-gold-500 px-4 py-3 text-sm font-bold text-ink-900 hover:bg-gold-400 disabled:opacity-60">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
