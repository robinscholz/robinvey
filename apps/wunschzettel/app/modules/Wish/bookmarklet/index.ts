// Runs from the bookmarks bar on a shop’s product page: reads the product
// from the page and opens the Wunschzettel with it, ready to commit.
const ORIGIN = '__WISH_ORIGIN__'

// Set on the address by shops and campaigns to follow the visitor, nothing
// anyone needs to land on the product.
const TRACKING =
  /^(utm_|ref$|ref_|tag$|gclid$|fbclid$|msclkid$|pf_rd_|pd_rd_|linkCode$|ascsubtag$|mc_|igshid$|sr$|qid$|keywords$|sprefix$|crid$|dib|th$|psc$)/i

type Node = Record<string, unknown>

function isRecord(value: unknown): value is Node {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// A JSON-LD value as text: a string, a number, the first of a list, or an
// object’s name, address or id.
function text(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(text).find(Boolean) ?? ''
  }
  if (isRecord(value)) {
    return text(value.name ?? value.url ?? value.contentUrl ?? value['@id'])
  }
  return ''
}

function types(node: Node): Array<string> {
  const type = node['@type']
  return (Array.isArray(type) ? type : [type]).map(text)
}

// Every Product and ProductGroup in the page’s JSON-LD, in document order:
// a group comes before its variants, so the name the shop shows comes first.
function products(): Array<Node> {
  const found: Array<Node> = []
  function walk(node: unknown) {
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (!isRecord(node)) {
      return
    }
    if (
      types(node).some((type) => type === 'Product' || type === 'ProductGroup')
    ) {
      found.push(node)
    }
    Object.values(node).forEach(walk)
  }
  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]'
  )) {
    try {
      walk(JSON.parse(script.textContent ?? ''))
    } catch {
      // Broken JSON-LD is the shop’s problem, not the wish’s.
    }
  }
  return found
}

function first(nodes: Array<Node>, key: string): string {
  for (const node of nodes) {
    const value = text(node[key])
    if (value) {
      return value
    }
  }
  return ''
}

function offerPrice(offers: unknown): string {
  if (Array.isArray(offers)) {
    return offers.map(offerPrice).find(Boolean) ?? ''
  }
  if (!isRecord(offers)) {
    return ''
  }
  return text(offers.price ?? offers.lowPrice ?? offers.highPrice)
}

function price(nodes: Array<Node>): string {
  for (const node of nodes) {
    const value = offerPrice(node.offers)
    if (value) {
      return value
    }
  }
  return ''
}

function meta(names: Array<string>): string {
  for (const name of names) {
    const element = document.querySelector<HTMLMetaElement>(
      `meta[property="${name}"], meta[name="${name}"], meta[itemprop="${name}"]`
    )
    const content = element?.content.trim()
    if (content) {
      return content
    }
  }
  return ''
}

function attribute(selector: string, name: string): string {
  return document.querySelector(selector)?.getAttribute(name)?.trim() ?? ''
}

function content(selector: string): string {
  return document.querySelector(selector)?.textContent?.trim() ?? ''
}

// 72,60 €, 1.299,00 €, 1,299.00 or 72.6 as a decimal number: the last
// separator is the decimal one, unless it is the only one and sets off three
// digits, as the German thousands point does.
function amount(raw: string): string {
  const match = raw.replace(/\s/g, '').match(/\d+(?:[.,]\d+)*/)
  if (!match) {
    return ''
  }
  const digits = match[0]
  const separators = digits.match(/[.,]/g) ?? []
  const last = Math.max(digits.lastIndexOf(','), digits.lastIndexOf('.'))
  if (last === -1) {
    return digits
  }
  const whole = digits.slice(0, last).replace(/[.,]/g, '')
  const decimal = digits.slice(last + 1)
  const grouping =
    separators.length === 1 && digits[last] === '.' && decimal.length === 3
  return grouping ? whole + decimal : `${whole}.${decimal}`
}

// Without any metadata, the largest picture on the page is the product.
function largestImage(): string {
  const images = [...document.images].filter(
    (image) => image.naturalWidth >= 300 && image.naturalHeight >= 300
  )
  images.sort(
    (first, second) =>
      second.naturalWidth * second.naturalHeight -
      first.naturalWidth * first.naturalHeight
  )
  return images[0]?.currentSrc ?? ''
}

function absolute(url: string): string {
  try {
    return new URL(url, location.href).href
  } catch {
    return ''
  }
}

// The address without tracking; Amazon’s down to the product number.
function address(): string {
  const url = new URL(location.href)
  const amazon = url.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/)
  if (amazon) {
    return `${url.origin}/dp/${amazon[1]}`
  }
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING.test(key)) {
      url.searchParams.delete(key)
    }
  }
  url.hash = ''
  return url.href
}

// The page title without the shop’s name after a pipe, a dash or a colon.
function pageTitle(): string {
  return document.title.split(/\s[|:–-]\s/)[0] ?? ''
}

if (location.origin !== ORIGIN) {
  const nodes = products()
  const name =
    first(nodes, 'name') || meta(['og:title', 'twitter:title']) || pageTitle()
  const brand = first(nodes, 'brand')
  const title =
    brand && !name.toLowerCase().includes(brand.toLowerCase())
      ? `${brand} ${name}`
      : name
  const image =
    meta(['og:image', 'og:image:secure_url', 'twitter:image']) ||
    first(nodes, 'image') ||
    largestImage()
  const found =
    price(nodes) ||
    meta(['product:price:amount', 'og:price:amount']) ||
    attribute('[itemprop="price"]', 'content') ||
    content('[itemprop="price"], .a-price .a-offscreen')
  const params = new URLSearchParams({
    title: title.replace(/\s+/g, ' ').trim(),
    url: address(),
    image: absolute(image),
    price: amount(found),
  })
  window.open(`${ORIGIN}/add/#${params}`, '_blank')
}
