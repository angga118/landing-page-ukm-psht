import { waLink } from '../data'

// Tombol WhatsApp mengambang, pojok kanan bawah.
export default function FloatingWhatsApp({ number }) {
  const href = waLink(number)
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi kami via WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-ink-950 shadow-[0_10px_30px_rgba(212,175,55,0.45)] transition-all duration-300 hover:-translate-y-1 hover:bg-gold-400 hover:shadow-[0_14px_40px_rgba(212,175,55,0.6)] sm:h-16 sm:w-16 focus-ring"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.3 14.2c-.2.6-1.2 1.1-1.6 1.1-.5.1-1 .2-3.2-.7-2.6-1.1-4.2-3.8-4.3-4-.1-.2-1.1-1.5-1.1-2.9s.7-2 .9-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.5 2.8 1.7.3.1.5.1.7-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.9-.1 1.5z" />
      </svg>
      <span className="pointer-events-none absolute -top-1 -right-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-75" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-gold-300" />
      </span>
    </a>
  )
}
