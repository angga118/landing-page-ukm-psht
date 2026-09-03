import Reveal from './Reveal'
import SmartImage from './SmartImage'

export default function Pengurus({ data = [] }) {
  const list = [...data].sort((a, b) => (a.urutan || 0) - (b.urutan || 0))

  return (
    <section id="ketua" className="relative scroll-mt-24 bg-ink-900 py-20 sm:py-28">
      <div className="absolute inset-0 grain opacity-30" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
            Nahkoda Organisasi
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Ketua UKM PSHT UPN "Veteran" Jawa Timur
          </h2>
          <div className="mx-auto mt-5 h-px w-24 bg-gold-500/60" />
        </Reveal>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/50 py-12 text-center">
            <div className="h-px w-16 bg-gold-500/50" />
            <p className="text-sm text-neutral-400">Data pengurus akan segera diperbarui</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {list.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 90}>
                <article className="group h-full rounded-2xl border border-white/10 bg-ink-950/60 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-xl hover:shadow-gold-500/10 sm:p-5">
                  <div className="relative mb-2 overflow-hidden rounded-xl sm:mb-4">
                    <SmartImage
                      src={p.foto}
                      alt={`Foto ${p.nama}, ${p.jabatan} UKM PSHT UPN 'Veteran' Jawa Timur`}
                      seed={i + 1}
                      monogram="PSHT"
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-white sm:text-lg">{p.nama}</h3>
                  <p className="mt-0.5 text-xs font-medium text-gold-400 sm:mt-1 sm:text-sm">{p.jabatan}</p>
                  {p.periode && (
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-400 sm:mt-2 sm:text-xs">
                      Periode {p.periode}
                    </p>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
