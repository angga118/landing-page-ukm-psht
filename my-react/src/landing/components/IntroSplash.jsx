// Intro splash (preloader) — layar penuh saat kunjungan pertama per session.
// Murni CSS animation + React state; tanpa dependency baru.
// Alur: logo (scale + glow emas) → garis emas melebar → teks nama fade-in →
// splash keluar (fade + zoom). Total ~2.2 detik, lalu onDone dipanggil.
import { useCallback, useEffect, useRef, useState } from 'react'

export default function IntroSplash({ onDone }) {
  const [exiting, setExiting] = useState(false)
  const doneRef = useRef(false)

  const finish = useCallback(() => {
    // Guard ganda agar onDone hanya dipanggil sekali (timeout maupun
    // animationend sama-sama aman).
    if (doneRef.current) return
    doneRef.current = true
    onDone?.()
  }, [onDone])

  useEffect(() => {
    // Fallback timer: bila animationend terlewat, splash tetap hilang.
    const beginExit = setTimeout(() => setExiting(true), 1500)
    const safety = setTimeout(finish, 2300)
    return () => {
      clearTimeout(beginExit)
      clearTimeout(safety)
    }
  }, [finish])

  // Panggil onDone begitu animasi keluar (introExit) selesai.
  const handleAnimationEnd = (e) => {
    if (e.animationName === 'introExit') finish()
  }

  return (
    <div
      className={`intro-splash${exiting ? ' is-exiting' : ''}`}
      aria-hidden="true"
      onAnimationEnd={handleAnimationEnd}
    >
      <img src="/logopsht.png" alt="" className="intro-logo" />
      <div className="intro-rule" />
      <p className="intro-name">UKM PSHT UPN 'Veteran' Jawa Timur</p>
    </div>
  )
}
