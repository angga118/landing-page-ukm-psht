import Reveal from './Reveal'

export default function SelamatDatang() {
  return (
    <section
      id="selamat-datang"
      className="relative overflow-hidden bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 py-20 sm:py-28"
    >
      <div className="absolute inset-0 grain opacity-50" />
      {/* Ornamen lingkaran emas terang */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/20" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full border border-white/15" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-ink-900/70">
            Salam Persaudaraan
          </p>
          <h2 className="font-display text-4xl font-bold text-ink-950 sm:text-5xl md:text-6xl">
            Selamat Datang
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-ink-950/30" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-900/85 sm:text-xl">
            di landing page resmi UKM PSHT UPN 'Veteran' Jawa Timur
          </p>
        </Reveal>
      </div>
    </section>
  )
}
