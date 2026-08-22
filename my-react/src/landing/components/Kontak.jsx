import Reveal from './Reveal'
import { waLink } from '../data'

function InfoItem({ icon, label, children, href }) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-ink-950/50 text-gold-400">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] uppercase tracking-wider text-neutral-400">{label}</span>
        <span className="block text-sm text-neutral-200 sm:text-[15px]">{children}</span>
      </span>
    </>
  )
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-white/5">
      {inner}
    </a>
  ) : (
    <div className="flex items-start gap-3 rounded-xl p-2">{inner}</div>
  )
}

export default function Kontak({ data }) {
  const k = data || {}
  const mapSrc = k.maps_embed
  const ig = k.instagram ? `https://instagram.com/${k.instagram.replace(/^@/, '')}` : '#'

  return (
    <section id="kontak" className="relative scroll-mt-24 bg-ink-950 py-20 sm:py-28">
      <div className="absolute inset-0 grain opacity-40" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
            Hubungi Kami
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Kontak
          </h2>
          <div className="mx-auto mt-5 h-px w-24 bg-gold-500/60" />
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Info */}
          <Reveal className="space-y-2">
            <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-5 sm:p-7">
              <InfoItem
                label="WhatsApp"
                href={waLink(k.whatsapp)}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.3 14.2c-.2.6-1.2 1.1-1.6 1.1-.5.1-1 .2-3.2-.7-2.6-1.1-4.2-3.8-4.3-4-.1-.2-1.1-1.5-1.1-2.9s.7-2 .9-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.5 2.8 1.7.3.1.5.1.7-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.9-.1 1.5z" />
                  </svg>
                }
              >
                {k.whatsapp ? `+${k.whatsapp.replace(/^62/, '62 ')}` : '0812-3456-7890'}
              </InfoItem>

              <InfoItem
                label="Email"
                href={k.email ? `mailto:${k.email}` : undefined}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                }
              >
                {k.email || 'ukmpsht@upnjatim.ac.id'}
              </InfoItem>

              <InfoItem
                label="Alamat"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                }
              >
                {k.alamat || "Kampus UPN 'Veteran' Jawa Timur, Surabaya"}
              </InfoItem>

              <InfoItem
                label="Jadwal Latihan"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                }
              >
                <span className="whitespace-pre-line">{k.jadwal_latihan || 'Selasa & Jumat\n16.00–18.00 WIB'}</span>
              </InfoItem>

              <InfoItem
                label="Instagram"
                href={ig}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                  </svg>
                }
              >
                {k.instagram || 'ukmpsht_upn'}
              </InfoItem>
            </div>
          </Reveal>

          {/* Peta */}
          <Reveal delay={120}>
            <div className="h-full min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
              {mapSrc ? (
                <iframe
                  title="Lokasi Sekretariat UKM PSHT UPN 'Veteran' Jawa Timur"
                  src={mapSrc}
                  loading="lazy"
                  className="h-full min-h-[320px] w-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 text-neutral-500">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  <p className="text-sm">Peta lokasi sedang disiapkan</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
