// Logo brand UKM PSHT — render gambar logopsht.png (di public, dilayani di
// "/logopsht.png"). Tinggi disamakan dengan mark lama agar navbar &
// footer tidak berubah layout; object-contain mencegah distorsi.
// variant dipertahankan demi kompatibilitas API (tidak lagi memengaruhi render).
export default function Logo({ variant = 'light', className = '' }) {
  return (
    <img
      src="/logopsht.png"
      alt="Logo PSHT"
      className={`w-auto object-contain ${className || 'h-14'}`}
    />
  )
}
