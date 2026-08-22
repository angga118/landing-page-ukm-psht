import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { FALLBACK_CONTENT } from './data'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SelamatDatang from './components/SelamatDatang'
import Sejarah from './components/Sejarah'
import Pengurus from './components/Pengurus'
import Prestasi from './components/Prestasi'
import Galeri from './components/Galeri'
import Kontak from './components/Kontak'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'

// Ambil satu endpoint; jika gagal, kembalikan null (fallback tetap dipakai).
async function safeGet(path) {
  try {
    return await api.get(path)
  } catch {
    return null
  }
}

export default function LandingPage() {
  // Initial state = fallback lokal agar tampil sempurna walau API mati.
  const [content, setContent] = useState(FALLBACK_CONTENT)

  useEffect(() => {
    let alive = true
    async function load() {
      const [hero, sejarah, pengurus, prestasi, galeri, kontak] = await Promise.all([
        safeGet('/content/hero'),
        safeGet('/content/sejarah'),
        safeGet('/content/pengurus'),
        safeGet('/content/prestasi'),
        safeGet('/content/galeri'),
        safeGet('/content/kontak'),
      ])
      if (!alive) return
      setContent((prev) => ({
        // Merge agar field kosong dari API (mis. foto_background:"") tidak
        // menimpa aset lokal fallback.
        hero: {
          ...prev.hero,
          ...(hero || {}),
          foto_background: hero?.foto_background || prev.hero.foto_background,
        },
        sejarah: sejarah || prev.sejarah,
        pengurus: Array.isArray(pengurus) && pengurus.length ? pengurus : prev.pengurus,
        prestasi: Array.isArray(prestasi) && prestasi.length ? prestasi : prev.prestasi,
        galeri: Array.isArray(galeri) && galeri.length ? galeri : prev.galeri,
        kontak: kontak || prev.kontak,
      }))
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero data={content.hero} />
        <SelamatDatang />
        <Sejarah data={content.sejarah} />
        <Pengurus data={content.pengurus} />
        <Prestasi data={content.prestasi} />
        <Galeri data={content.galeri} />
        <Kontak data={content.kontak} />
        <Footer kontak={content.kontak} />
      </main>
      <FloatingWhatsApp number={content.kontak?.whatsapp} />
    </>
  )
}
