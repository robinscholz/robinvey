import { env } from 'cloudflare:workers'

const MAX_BYTES = 10 * 1024 * 1024

export interface StoredImage {
  bytes: ArrayBuffer
  contentType: string
  etag: string
}

interface StoreImagePayload {
  id: string
  source: string
}

// Fetches the picture from the shop and keeps a copy under the wish’s id, so
// the list no longer depends on the shop keeping it.
export async function storeImage({
  id,
  source,
}: StoreImagePayload): Promise<boolean> {
  const response = await fetch(source, { headers: { Accept: 'image/*' } })
  const contentType = response.headers.get('content-type') ?? ''
  if (!response.ok || !contentType.startsWith('image/')) {
    return false
  }
  const bytes = await response.arrayBuffer()
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
    return false
  }
  await env.IMAGES.put(id, bytes, { httpMetadata: { contentType } })
  return true
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

export async function deleteImage(id: string): Promise<void> {
  await env.IMAGES.delete(id)
}
