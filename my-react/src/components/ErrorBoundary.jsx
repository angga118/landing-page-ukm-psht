import { Component } from 'react'

// ErrorBoundary membungkus seluruh aplikasi di entry (main.jsx) sehingga juga
// menangkap kegagalan saat memuat chunk lazy admin. Fallback: kartu gelap rapi
// dengan ajakan muat ulang. Error hanya dicatat ke console.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Hanya log ke console; tidak mengirim ke layanan pihak ketiga.
    console.error('Terjadi kesalahan pada aplikasi:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 py-20 text-center">
          <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-[130px]"
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md rounded-2xl border border-gold-500/20 bg-ink-900/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/30 text-gold-400">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="mt-5 font-display text-2xl text-gold-200">Terjadi kesalahan</h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              Sempat terjadi kendala saat memuat halaman ini. Coba muat ulang untuk
              kembali melanjutkan.
            </p>

            <button
              type="button"
              onClick={this.handleReload}
              className="group mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold tracking-wide text-ink-950 shadow-[0_8px_30px_rgba(212,175,55,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_12px_40px_rgba(212,175,55,0.5)] sm:text-base focus-ring"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
