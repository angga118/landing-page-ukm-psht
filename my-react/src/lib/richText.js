// Parser & renderer rich-text ringan untuk konten sejarah (dan lainnya).
// Tanpa HTML sama sekali → XSS-safe by construction (semua elemen React murni,
// tidak ada dangerouslySetInnerHTML).
//
// File ini sengaja berekstensi .js (tanpa JSX) agar konsisten dengan konvensi
// lib; renderer memakai React.createElement, bukan JSX.
//
// Format marker yang didukung:
//   ## Teks          -> heading (blok)
//   - Teks / * Teks  -> item list (bullet, baris berurutan digabung jadi satu list)
//   1. Teks / 10. Tx -> item list bernomor (ordered, baris berurutan digabung
//                      jadi satu blok terpisah dari bullet)
//   paragraf biasa   -> dipisah baris kosong (\n\n+); baris tunggal dalam satu
//                      paragraf dirender sebagai spasi (sama seperti perilaku lama)
// Inline:
//   **teks** -> <strong> (bold)
//   *teks*   -> <em> (italic)
// Backward compatible: teks polos tanpa marker dirender persis seperti dulu.

import { createElement } from 'react'

const STRONG_CLS = 'font-semibold text-white'
const EM_CLS = 'italic'
const HEADING_CLS = 'font-display text-xl sm:text-2xl font-bold text-gold-400'
const PARA_CLS = 'leading-relaxed'
const LIST_CLS = 'list-disc space-y-1 pl-5 marker:text-gold-500'
const OLIST_CLS = 'list-decimal space-y-1 pl-5 marker:text-gold-500'

// Parse inline **bold** / *italic* secara aman (scan char-by-char, tidak ada
// regex global yang bisa infinite-loop; `***` ditangani sebagai literal).
function parseInline(text) {
  const nodes = []
  let i = 0
  let plain = ''
  let key = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '*') {
      let j = i
      while (j < text.length && text[j] === '*') j++
      const stars = j - i
      if (stars >= 2) {
        const close = text.indexOf('**', j)
        if (close !== -1) {
          if (plain) {
            nodes.push(plain)
            plain = ''
          }
          nodes.push(createElement('strong', { key: key++, className: STRONG_CLS }, parseInline(text.slice(j, close))))
          i = close + 2
          continue
        }
      }
      if (stars === 1) {
        const close = text.indexOf('*', j)
        if (close !== -1 && close > j) {
          if (plain) {
            nodes.push(plain)
            plain = ''
          }
          nodes.push(createElement('em', { key: key++, className: EM_CLS }, parseInline(text.slice(j, close))))
          i = close + 1
          continue
        }
      }
      plain += text.slice(i, j)
      i = j
      continue
    }
    plain += ch
    i++
  }
  if (plain) nodes.push(plain)
  return nodes.length === 1 && typeof nodes[0] === 'string' ? nodes[0] : nodes
}

// Parse konten menjadi array blok: { type:'heading'|'list'|'paragraph', ... }.
export function parseRichText(text) {
  const lines = (text || '').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed === '') {
      i++
      continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading', text: trimmed.slice(3) })
      i++
      continue
    }
    if (/^[-*]\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'list', items })
      continue
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'olist', items })
      continue
    }
    // Paragraf: kumpulkan baris non-blank, non-marker berturutan jadi satu blok.
    const para = []
    while (i < lines.length) {
      const t = lines[i].trim()
      if (t === '' || t.startsWith('## ') || /^[-*]\s+/.test(t) || /^\d+\.\s+/.test(t)) break
      para.push(lines[i])
      i++
    }
    blocks.push({ type: 'paragraph', text: para.join('\n') })
  }
  return blocks
}

// Render hasil parse ke elemen React murni. `className` diteruskan ke container
// (warna/ukuran teks diwarisi), elemen blok punya gaya tema gelap sendiri.
export function RichTextRenderer({ text, className = '' }) {
  const blocks = parseRichText(text)
  if (!blocks.length) return null
  return createElement(
    'div',
    { className: `space-y-4 ${className}` },
    blocks.map((b, idx) => {
      if (b.type === 'heading') {
        return createElement('h3', { key: idx, className: HEADING_CLS }, parseInline(b.text))
      }
      if (b.type === 'list') {
        return createElement(
          'ul',
          { key: idx, className: LIST_CLS },
          b.items.map((it, k) => createElement('li', { key: k }, parseInline(it))),
        )
      }
      if (b.type === 'olist') {
        return createElement(
          'ol',
          { key: idx, className: OLIST_CLS },
          b.items.map((it, k) => createElement('li', { key: k }, parseInline(it))),
        )
      }
      return createElement('p', { key: idx, className: PARA_CLS }, parseInline(b.text))
    }),
  )
}
