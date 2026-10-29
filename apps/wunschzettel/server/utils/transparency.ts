interface TransparencyPayload {
  bytes: ArrayBuffer
  contentType: string
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function readText(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length))
}

function isPng(bytes: Uint8Array): boolean {
  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)
}

// Grey or colour with alpha, or a tRNS chunk ahead of the image data, which
// is how palette pictures carry theirs.
function pngHasAlpha(bytes: Uint8Array): boolean {
  const colorType = bytes[25]
  if (colorType === 4 || colorType === 6) {
    return true
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 8
  while (offset + 8 <= bytes.length) {
    const type = readText(bytes, offset + 4, 4)
    if (type === 'tRNS') {
      return true
    }
    if (type === 'IDAT' || type === 'IEND') {
      return false
    }
    offset += 12 + view.getUint32(offset)
  }
  return false
}

// VP8X keeps an alpha flag; lossless VP8L keeps an alpha bit after the
// size; plain lossy VP8 has none.
function webpHasAlpha(bytes: Uint8Array): boolean {
  switch (readText(bytes, 12, 4)) {
    case 'VP8X':
      return ((bytes[20] ?? 0) & 0x10) !== 0
    case 'VP8L':
      return ((bytes[24] ?? 0) & 0x10) !== 0
    default:
      return false
  }
}

// An AVIF with alpha names its auxiliary alpha image near the start.
function avifHasAlpha(bytes: Uint8Array): boolean {
  return readText(bytes, 0, Math.min(bytes.length, 4096)).includes(
    'auxiliary:alpha'
  )
}

// A graphic control extension with its transparent colour flag set.
function gifHasAlpha(bytes: Uint8Array): boolean {
  for (let index = 0; index + 3 < bytes.length; index++) {
    if (
      bytes[index] === 0x21 &&
      bytes[index + 1] === 0xf9 &&
      bytes[index + 2] === 0x04 &&
      ((bytes[index + 3] ?? 0) & 0x01) !== 0
    ) {
      return true
    }
  }
  return false
}

// Whether a picture comes with transparency, read from its header alone.
// Shops send cut-out products this way; Cloudflare’s cut would redraw their
// edges from the colours under the transparent pixels.
export function hasTransparency({
  bytes,
  contentType,
}: TransparencyPayload): boolean {
  const view = new Uint8Array(bytes)
  if (isPng(view)) {
    return pngHasAlpha(view)
  }
  if (readText(view, 0, 4) === 'RIFF' && readText(view, 8, 4) === 'WEBP') {
    return webpHasAlpha(view)
  }
  if (readText(view, 4, 4) === 'ftyp') {
    return avifHasAlpha(view)
  }
  if (readText(view, 0, 4) === 'GIF8') {
    return gifHasAlpha(view)
  }
  return contentType.startsWith('image/svg')
}
