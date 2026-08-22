import { useState } from 'react'

// <img> dengan lazy loading + alt deskriptif, serta fallback placeholder bergaya
// (gradien emas–hitam + monogram) bila src kosong atau gagal dimuat (API mati).
// seed digunakan untuk memvariasikan sudut gradien placeholder agar tidak monoton.
export default function SmartImage({ src, alt, className = '', seed = 0, monogram = 'PSHT' }) {
  const [error, setError] = useState(false)
  const showImg = src && !error

  if (!showImg) {
    const angle = 120 + (seed % 4) * 35
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-ink-900 ${className}`}
        role="img"
        aria-label={alt}
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: `linear-gradient(${angle}deg, #0a0a0a 0%, #171717 45%, #684f16 130%)`,
          }}
        />
        <div className="absolute inset-0 grain" />
        <span className="relative font-display font-bold tracking-[0.2em] text-gold-500/80 text-2xl sm:text-3xl">
          {monogram}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className={className}
    />
  )
}
