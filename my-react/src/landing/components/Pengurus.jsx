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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 90}>
              <article className="group h-full rounded-2xl border border-white/10 bg-ink-950/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-xl hover:shadow-gold-500/10">
                <div className="relative mb-4 overflow-hidden rounded-xl">
                  <SmartImage
                    src={p.foto}
                    alt={`Foto ${p.nama}, ${p.jabatan} UKM PSHT UPN 'Veteran' Jawa Timur`}
                    seed={i + 1}
                    monogram="PSHT"
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{p.nama}</h3>
                <p className="mt-1 text-sm font-medium text-gold-400">{p.jabatan}</p>
                {p.periode && (
                  <p className="mt-2 text-xs uppercase tracking-wider text-neutral-500">
                    Periode {p.periode}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
