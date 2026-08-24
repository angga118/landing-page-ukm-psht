import { Link } from 'react-router-dom'

// Halaman 404 — konsisten dengan tema gelap landing (hitam-emas, font display
// Cinzel). Transisi CSS ringan saja, tanpa library animasi.
export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 py-20 text-center">
      {/* Lapisan grain + glow emas halus agar tidak terasa datar */}
      <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center">
        <p className="font-display text-xs uppercase tracking-[0.45em] text-gold-500 sm:text-sm">
          Halaman Tidak Ditemukan
        </p>

        <h1 className="mt-4 font-display text-[34vw] leading-none text-gold-gradient transition-opacity duration-700 sm:text-[17rem]">
          404
        </h1>

        <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-neutral-300">
          Maaf, halaman yang Anda tuju tidak tersedia atau mungkin telah dipindahkan.
        </p>

        <Link
          to="/"
          className="group mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold tracking-wide text-ink-950 shadow-[0_8px_30px_rgba(212,175,55,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_12px_40px_rgba(212,175,55,0.5)] sm:text-base focus-ring"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  )
}
