import Reveal from './Reveal'
import SmartImage from './SmartImage'
import { RichTextRenderer } from '../../lib/richText.js'

export default function Sejarah({ data }) {
  return (
    <section id="sejarah" className="relative scroll-mt-24 bg-ink-950 py-20 sm:py-28">
      <div className="absolute inset-0 grain opacity-40" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Teks narasi */}
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
              Jejak Kami
            </p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Sejarah
            </h2>
            <div className="mt-5 h-px w-20 bg-gold-500/60" />
            <div className="mt-6 text-[15px] leading-relaxed text-neutral-300 sm:text-base">
              {data?.konten?.trim() ? (
                <RichTextRenderer text={data.konten} />
              ) : (
                <p>Konten sejarah sedang disiapkan.</p>
              )}
            </div>
          </Reveal>

          {/* Foto pendukung */}
          <Reveal delay={120}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl border border-gold-500/20" />
              <SmartImage
                src={data?.foto}
                alt="Dokumentasi kegiatan dan latihan UKM PSHT UPN 'Veteran' Jawa Timur"
                seed={2}
                className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl shadow-black/50 ring-1 ring-white/10"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
