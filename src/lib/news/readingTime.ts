// Reading-time estimation from a lexical richText body (FR7). Pure + null-safe so it backs
// both the read-time hook and any display fallback.

const WORDS_PER_MINUTE = 220

const collectText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: unknown; children?: unknown[] }
  let out = typeof n.text === 'string' ? `${n.text} ` : ''
  if (Array.isArray(n.children)) out += n.children.map(collectText).join('')
  return out
}

/** Plain-text word count of a lexical richText value. */
export const richTextWordCount = (value: unknown): number => {
  const root = (value as { root?: unknown } | null)?.root
  if (!root) return 0
  const words = collectText(root).trim().split(/\s+/).filter(Boolean)
  return words.length
}

/** Estimated read time in whole minutes (min 1) for a richText body; null when empty. */
export const readingTimeMinutes = (value: unknown): number | null => {
  const words = richTextWordCount(value)
  if (words === 0) return null
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
