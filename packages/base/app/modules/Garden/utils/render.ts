import type { GardenFrame } from './compose'

export interface GardenRun {
  hue: number
  text: string
}

// Each line splits into runs of one hue, so a line costs a handful of
// elements rather than one per glyph.
export function render({ cols, rows, chars, hues }: GardenFrame) {
  const lines: Array<Array<GardenRun>> = []
  for (let row = 0; row < rows; row++) {
    const line: Array<GardenRun> = []
    let run: GardenRun = { hue: 0, text: '' }
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col
      const hue = hues[index] ?? 0
      const char = hue ? (chars[index] ?? ' ') : ' '
      if (hue !== run.hue && char !== ' ') {
        if (run.text) {
          line.push(run)
        }
        run = { hue, text: '' }
      }
      run.text += char
    }
    line.push(run)
    lines.push(line)
  }
  return lines
}
