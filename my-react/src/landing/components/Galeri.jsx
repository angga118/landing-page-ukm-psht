import { useState } from 'react'
import Reveal from './Reveal'
import SmartImage from './SmartImage'
import Lightbox from './Lightbox'

export default function Galeri({ data = [] }) {
  const list = [...data].sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
  const [active, setActive] = useState(null)

  return (
    <section id="galeri" className="relative scroll-mt-24 bg-ink-900 py-20 sm:py-28">
      <div className="absolute inset-0 grain opacity-30" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
            Dokumentasi
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Galeri
          </h2>
          <div className="mx-auto mt-5 h-px w-24 bg-gold-500/60" />
          <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-400">
            Kumpulan momen latihan, kejuaraan, dan kegiatan UKM PSHT. Tap untuk memperbesar.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((g, i) => (
            <Reveal key={g.id} delay={(i % 4) * 60}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Buka galeri: ${g.kategori || 'foto'}`}
                className="group relative block aspect-square w-full overflow-hidden rounded-xl ring-1 ring-white/10 transition-all duration-300 hover:ring-gold-500/50"
              >
                <SmartImage
                  src={g.foto}
                  alt={`Galeri UKM PSHT — ${g.kategori || 'dokumentasi'}`}
                  seed={i + 1}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-2 left-2 translate-y-1 text-[11px] font-medium uppercase tracking-wider text-gold-300 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {g.kategori || 'Galeri'}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active !== null && (
        <Lightbox items={list} index={active} onClose={() => setActive(null)} onNavigate={setActive} />
      )}
    </section>
  )
}
