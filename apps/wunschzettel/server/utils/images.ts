import { env } from 'cloudflare:workers'

const MAX_BYTES = 10 * 1024 * 1024

export interface StoredImage {
  bytes: ArrayBuffer
  contentType: string
  etag: string
}

export interface ImageHead {
  bytes: ArrayBuffer
  contentType: string
}

interface StoreImagePayload {
  id: string
  source: string
}

export interface ImageCopy {
  transparent: boolean
}

// Fetches the picture from the shop and keeps a copy under the wish’s id, so
// the list no longer depends on the shop keeping it. Null when the shop does
// not hand it out.
export async function storeImage({
  id,
  source,
}: StoreImagePayload): Promise<ImageCopy | null> {
  const response = await fetch(source, { headers: { Accept: 'image/*' } })
  const contentType = response.headers.get('content-type') ?? ''
  if (!response.ok || !contentType.startsWith('image/')) {
    return null
  }
  const bytes = await response.arrayBuffer()
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
    return null
  }
  await env.IMAGES.put(id, bytes, { httpMetadata: { contentType } })
  return { transparent: hasTransparency({ bytes, contentType }) }
}

export async function readImage(id: string): Promise<StoredImage | null> {
  const object = await env.IMAGES.get(id)
  if (!object) {
    return null
  }
  return {
    bytes: await object.arrayBuffer(),
    contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
    etag: object.httpEtag,
  }
}

// Enough of a copy to read its header from.
const HEAD_BYTES = 64 * 1024

export async function readImageHead(id: string): Promise<ImageHead | null> {
  const object = await env.IMAGES.get(id, { range: { length: HEAD_BYTES } })
  if (!object) {
    return null
  }
  return {
    bytes: await object.arrayBuffer(),
    contentType: object.httpMetadata?.contentType ?? '',
  }
}

export async function deleteImage(id: string): Promise<void> {
  await env.IMAGES.delete(id)
}
