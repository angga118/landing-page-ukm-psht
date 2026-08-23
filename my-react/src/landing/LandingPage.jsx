import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { FALLBACK_CONTENT } from './data'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import IntroSplash from './components/IntroSplash'
import SelamatDatang from './components/SelamatDatang'
import Sejarah from './components/Sejarah'
import Pengurus from './components/Pengurus'
import Prestasi from './components/Prestasi'
import Galeri from './components/Galeri'
import Kontak from './components/Kontak'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'

// Tentukan apakah splash intro perlu tampil:
// - hanya sekali per session (sessionStorage "psht_intro_seen")
// - dilewati sepenuhnya bila user memilih reduced-motion
const INTRO_KEY = 'psht_intro_seen'

function shouldShowIntro() {
  if (typeof window === 'undefined') return false
  try {
    if (window.sessionStorage.getItem(INTRO_KEY)) return false
  } catch {
    // sessionStorage tidak tersedia (mode privat/blokir) → jangan tampil
    // agar tidak mengunci scroll tanpa jaminan bisa disimpan.
    return false
  }
  const reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return !reduce
}

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

  // Splash hanya sekali per session; introActive menggeser timing hero-rise.
  const [showIntro, setShowIntro] = useState(shouldShowIntro)
  const [introActive] = useState(shouldShowIntro)

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

  // Kunci scroll body selama splash tampil, kembalikan setelah selesai.
  useEffect(() => {
    if (!showIntro) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [showIntro])

  // Splash selesai: tandai session dan lepas overlay. introActive sengaja
  // TIDAK di-reset di sini — mengubah --hero-rise-offset saat hero-rise masih
  // berjalan bisa memicu animasi ulang. Offset 1.5s sudah tidak berdampak
  // setelah animasi hero selesai (fill-mode forwards).
  const handleIntroDone = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // abaikan bila storage tidak tersedia
    }
    setShowIntro(false)
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero data={content.hero} wa={content.kontak?.whatsapp} introActive={introActive} />
        <SelamatDatang />
        <Sejarah data={content.sejarah} />
        <Pengurus data={content.pengurus} />
        <Prestasi data={content.prestasi} />
        <Galeri data={content.galeri} />
        <Kontak data={content.kontak} />
        <Footer kontak={content.kontak} />
      </main>
      <FloatingWhatsApp number={content.kontak?.whatsapp} />
      {showIntro && <IntroSplash onDone={handleIntroDone} />}
    </>
  )
}
