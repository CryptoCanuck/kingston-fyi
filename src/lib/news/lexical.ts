// Minimal helper to build a Payload lexical richText value from plain-text paragraphs — used
// by the aggregation pipeline to seed an article body the operator then edits.

interface LexicalRoot {
  root: {
    type: 'root'
    direction: 'ltr'
    format: ''
    indent: 0
    version: 1
    children: unknown[]
  }
}

const paragraph = (text: string) => ({
  type: 'paragraph',
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children: [{ type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
})

/** Wrap plain text (split on blank lines) into a lexical richText document. */
export const textToLexical = (text: string): LexicalRoot => {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: paras.length > 0 ? paras.map(paragraph) : [paragraph(text.trim())],
    },
  }
}
