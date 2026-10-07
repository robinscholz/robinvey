import theme from '@robinscholz/base/tokens/theme/robinvey.json'

const OKLCH = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/

const HUES: Record<string, { $value: string }> = theme.app.color.hue

function encode(channel: number): number {
  const linear = Math.min(1, Math.max(0, channel))
  return linear <= 0.0031308
    ? 12.92 * linear
    : 1.055 * linear ** (1 / 2.4) - 0.055
}

// The PDF engine takes sRGB only and refuses oklch(), so the theme’s hues are
// converted here, through OKLab and linear sRGB.
export function oklchToHex(value: string): string {
  const match = OKLCH.exec(value)
  if (!match) {
    throw new Error(`Not an oklch() colour: ${value}`)
  }
  const [lightness = 0, chroma = 0, hue = 0] = match.slice(1).map(Number)
  const a = chroma * Math.cos((hue * Math.PI) / 180)
  const b = chroma * Math.sin((hue * Math.PI) / 180)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return `#${channels
    .map((channel) =>
      Math.round(encode(channel) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`
}

// A rainbow hue of the light theme, the one the paper matches.
export function themeHue(index: number): string {
  const token = HUES[String(index)]
  if (!token) {
    throw new Error(`The robinvey theme has no hue ${index}`)
  }
  return oklchToHex(token.$value)
}
