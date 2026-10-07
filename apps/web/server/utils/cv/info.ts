interface DocumentInfoPayload {
  bytes: Uint8Array
  title: string
  author: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder('latin1')

// UTF-16BE with a byte order mark, so names outside ASCII survive.
function pdfText(value: string): string {
  let hex = 'FEFF'
  for (let index = 0; index < value.length; index++) {
    hex += value.charCodeAt(index).toString(16).padStart(4, '0')
  }
  return `<${hex.toUpperCase()}>`
}

function trailerValue(trailer: string, pattern: RegExp): string {
  const match = pattern.exec(trailer)
  if (!match?.[1]) {
    throw new Error(`The CV trailer has no ${pattern.source}`)
  }
  return match[1]
}

// Browser tabs read the title from the document information dictionary,
// which the PDF engine does not write. An incremental update appends one
// without touching the bytes before it.
export function withDocumentInfo({
  bytes,
  title,
  author,
}: DocumentInfoPayload): Uint8Array {
  const tail = decoder.decode(bytes.subarray(Math.max(0, bytes.length - 1024)))
  const trailer = tail.slice(tail.lastIndexOf('trailer'))
  const previous = trailerValue(tail, /startxref\s+(\d+)\s+%%EOF\s*$/)
  const size = Number(trailerValue(trailer, /\/Size (\d+)/))
  const root = trailerValue(trailer, /\/Root (\d+ \d+ R)/)
  const id = /\/ID\s*\[[^\]]*\]/.exec(trailer)?.[0] ?? ''

  const lead = bytes[bytes.length - 1] === 0x0a ? '' : '\n'
  const objectOffset = bytes.length + lead.length
  const object = `${size} 0 obj\n<< /Title ${pdfText(title)} /Author ${pdfText(author)} >>\nendobj\n`
  const xrefOffset = objectOffset + object.length
  const update = [
    lead,
    object,
    `xref\n${size} 1\n${String(objectOffset).padStart(10, '0')} 00000 n \n`,
    `trailer\n<< ${[`/Size ${size + 1}`, `/Root ${root}`, `/Info ${size} 0 R`, id, `/Prev ${previous}`].filter(Boolean).join(' ')} >>\n`,
    `startxref\n${xrefOffset}\n%%EOF\n`,
  ].join('')

  const appended = encoder.encode(update)
  const result = new Uint8Array(bytes.length + appended.length)
  result.set(bytes, 0)
  result.set(appended, bytes.length)
  return result
}
