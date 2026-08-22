import { waLink } from '../data'

export default function Hero({ data }) {
  const bg = data?.foto_background
  const ctaHref = data?.link_tombol || waLink(data?.whatsapp)

  return (
    <section
      id="beranda"
      className="relative flex min-h-[78vh] items-center justify-center overflow-hidden sm:min-h-[85vh] lg:min-h-[92vh]"
    >
      {/* Latar foto + gradien cadangan */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-950" />
      {bg && (
        <img
          src={bg}
          alt="Anggota UKM PSHT UPN 'Veteran' Jawa Timur sedang berlatih pencak silat"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      )}
      {/* Overlay gelap berlapis untuk keterbacaan */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/55 to-ink-950/90" />
      <div className="absolute inset-0 grain" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-24 text-center sm:px-6">
        <p className="hero-rise d1 mx-auto mb-5 inline-block max-w-full border border-gold-500/40 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.3em] text-gold-300 sm:text-xs">
          Persaudaraan Setia Hati Terate
        </p>

        <h1 className="hero-rise d2 font-display text-3xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl lg:text-7xl">
          UKM PSHT UPN 'Veteran'
          <span className="mt-1 block text-gold-gradient">Jawa Timur</span>
        </h1>

        <p className="hero-rise d3 mx-auto mt-6 max-w-2xl text-base text-neutral-200 sm:text-lg md:text-xl">
          Tangguh Dalam Aksi, Unggul Dalam Prestasi
        </p>

        {/* Tombol CTA hanya tampil jika "Teks Tombol" diisi lewat admin */}
        {data?.teks_tombol && (
          <div className="hero-rise d4 mt-9 flex justify-center">
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold tracking-wide text-ink-950 shadow-[0_8px_30px_rgba(212,175,55,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_12px_40px_rgba(212,175,55,0.5)] sm:text-base focus-ring"
            >
              {data.teks_tombol}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Indikator scroll */}
      <a
        href="#selamat-datang"
        aria-label="Gulir ke bawah"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-gold-400/70 transition-colors hover:text-gold-300 focus-ring"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="animate-[floatY_2.4s_ease-in-out_infinite]" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  )
}
