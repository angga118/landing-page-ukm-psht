import Reveal from './Reveal'
import SmartImage from './SmartImage'

const TINGKAT_STYLE = {
  Nasional: 'bg-gold-500/15 text-gold-300 border-gold-500/40',
  Regional: 'bg-gold-500/10 text-gold-400 border-gold-500/30',
  Provinsi: 'bg-white/5 text-neutral-300 border-white/15',
  'Perguruan Tinggi': 'bg-white/5 text-neutral-300 border-white/15',
}

export default function Prestasi({ data = [] }) {
  const list = [...data].sort((a, b) => (a.urutan || 0) - (b.urutan || 0))

  return (
    <section id="prestasi" className="relative scroll-mt-24 bg-ink-950 py-20 sm:py-28">
      <div className="absolute inset-0 grain opacity-40" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
            Catatan Emas
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Prestasi
          </h2>
          <div className="mx-auto mt-5 h-px w-24 bg-gold-500/60" />
        </Reveal>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/50 py-12 text-center">
            <div className="h-px w-16 bg-gold-500/50" />
            <p className="text-sm text-neutral-400">Daftar prestasi akan segera diperbarui</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((p, i) => {
              const style = TINGKAT_STYLE[p.tingkat] || TINGKAT_STYLE['Provinsi']
              return (
                <Reveal key={p.id} delay={(i % 4) * 70}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40">
                    <div className="relative">
                      <SmartImage
                        src={p.foto}
                        alt={`Trofi dan dokumentasi ${p.nama_lomba}, ${p.tingkat} ${p.tahun}`}
                        seed={i + 3}
                        className="aspect-[16/10] w-full object-cover"
                      />
                      <span className="absolute right-3 top-3 rounded-full border bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur">
                        <span className={style}>{p.tahun}</span>
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <span className={`mb-2 inline-block w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style}`}>
                        {p.tingkat}
                      </span>
                      <h3 className="text-sm font-semibold leading-snug text-white">{p.nama_lomba}</h3>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
