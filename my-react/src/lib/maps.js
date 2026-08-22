export function toMapsEmbedUrl(raw) {
  const trimmed = raw == null ? '' : String(raw).trim()
  if (!trimmed) return { url: '', ok: true }
  let url = trimmed
  if (/<iframe/i.test(trimmed)) {
    const m = trimmed.match(/src=["']([^"']+)["']/i)
    if (m) url = m[1]
    else return { url: trimmed, ok: false }
  }
  if (url.includes('output=embed') || /google\.[a-z.]+\/maps\/embed/i.test(url)) return { url, ok: true }
  const coordMatch = url.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}(?:\.\d+)?)/)
  if (coordMatch) return { url: `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`, ok: true }
  const placeMatch = url.match(/\/maps\/place\/([^/@?]+)/)
  if (placeMatch) {
    const decoded = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ')
    return { url: `https://www.google.com/maps?q=${encodeURIComponent(decoded)}&output=embed`, ok: true }
  }
  const searchMatch = url.match(/\/maps\/search\/([^/@?]+)/)
  if (searchMatch) {
    const decoded = decodeURIComponent(searchMatch[1]).replace(/\+/g, ' ')
    return { url: `https://www.google.com/maps?q=${encodeURIComponent(decoded)}&output=embed`, ok: true }
  }
  const qMatch = url.match(/[?&]q=([^&]+)/)
  if (qMatch) return { url: `https://www.google.com/maps?q=${qMatch[1]}&output=embed`, ok: true }
  if (/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url)) return { url: trimmed, ok: false }
  return { url: trimmed, ok: false }
}
