import AppKit
import Foundation

// Draws the Wunschzettel’s preview image: the site’s emoji canvas with fewer
// and larger tiles, six by three dot matrices of twelve dots a side on white,
// tiled with the emoji given, each in the dots it lights, sampled from
// Apple’s own art as og-tiles.swift samples the site’s. It is drawn here
// rather than at build time, so the Worker carries no resvg.
//
//   swift scripts/og-canvas.swift apps/wunschzettel/public 🎁 🎀 🎄 ⭐ 🎈 🔔

let arguments = CommandLine.arguments
guard arguments.count >= 3 else {
  print("usage: swift scripts/og-canvas.swift <directory> <emoji> [emoji …]")
  exit(1)
}
let directory = arguments[1]
let symbols = Array(arguments.dropFirst(2))

// The size link previews take.
let width = 1200
let height = 630

// Tiles as on the site’s preview, fewer and larger: twelve dots a side,
// 140px square, one every 200px, six to a row and three rows, centred on
// the picture.
let dots = 12
let size: CGFloat = 140
let pitch: CGFloat = 200
let columns = 6
let rows = 3

// The geometry MagicDotMatrix draws: round dots three times as wide as the
// gaps between them.
let gap = size / CGFloat(4 * dots - 1)
let dot = (size - CGFloat(dots - 1) * gap) / CGFloat(dots)

// The page’s white, and its subtle ink, black at 24%, which an unlit dot
// shows at the canvas’s own dimness.
let paper = NSColor.white
let subtle = NSColor(deviceWhite: 0, alpha: 0.24)
let dim: CGFloat = 0.35

// Sampling as og-tiles.swift does it: pixels a dot on the sampling bitmap,
// how much of the matrix the glyph fills and how much of a dot it has to
// cover to light it. The glyph is drawn large once and cropped to its ink.
let cell = 8
let fit: CGFloat = 0.9
let threshold: CGFloat = 0.35
let glyph = 160

func makeBitmap(_ width: Int, _ height: Int) -> NSBitmapImageRep {
  return NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8,
    samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
    bytesPerRow: 0, bitsPerPixel: 0
  )!
}

func drawing(on bitmap: NSBitmapImageRep, _ body: () -> Void) {
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
  body()
  NSGraphicsContext.restoreGraphicsState()
}

// The dots an emoji lights, by index counted in rows from the top, each in
// the alpha-weighted mean colour of the pixels it covers.
func sampled(_ symbol: String) -> [Int: NSColor] {
  // The ink’s box, counted in rows from the top as colorAt does.
  let probe = makeBitmap(glyph, glyph)
  let text = NSAttributedString(
    string: symbol, attributes: [.font: NSFont.systemFont(ofSize: CGFloat(glyph) * 0.6)]
  )
  drawing(on: probe) {
    let size = text.size()
    text.draw(at: NSPoint(x: (CGFloat(glyph) - size.width) / 2, y: (CGFloat(glyph) - size.height) / 2))
  }
  var minX = glyph, minY = glyph, maxX = -1, maxY = -1
  for y in 0..<glyph {
    for x in 0..<glyph {
      if let pixel = probe.colorAt(x: x, y: y), pixel.alphaComponent > 0.02 {
        minX = min(minX, x)
        maxX = max(maxX, x)
        minY = min(minY, y)
        maxY = max(maxY, y)
      }
    }
  }
  guard maxX >= 0 else {
    print("\(symbol): nothing drawn")
    exit(1)
  }
  let inkWidth = CGFloat(maxX - minX + 1)
  let inkHeight = CGFloat(maxY - minY + 1)
  let ink = NSRect(x: CGFloat(minX), y: CGFloat(glyph - 1 - maxY), width: inkWidth, height: inkHeight)

  // The ink, fitted into the sampling bitmap and centred.
  let side = CGFloat(dots * cell)
  let scale = fit * side / max(inkWidth, inkHeight)
  let fittedWidth = inkWidth * scale
  let fittedHeight = inkHeight * scale
  let image = NSImage(size: NSSize(width: glyph, height: glyph))
  image.addRepresentation(probe)
  let sample = makeBitmap(dots * cell, dots * cell)
  drawing(on: sample) {
    image.draw(
      in: NSRect(
        x: (side - fittedWidth) / 2, y: (side - fittedHeight) / 2,
        width: fittedWidth, height: fittedHeight
      ),
      from: ink, operation: .sourceOver, fraction: 1
    )
  }

  // A dot lights when its pixels cover enough of it.
  var colors: [Int: NSColor] = [:]
  for row in 0..<dots {
    for col in 0..<dots {
      var red: CGFloat = 0, green: CGFloat = 0, blue: CGFloat = 0, alpha: CGFloat = 0
      for y in (row * cell)..<((row + 1) * cell) {
        for x in (col * cell)..<((col + 1) * cell) {
          guard let pixel = sample.colorAt(x: x, y: y)?.usingColorSpace(.deviceRGB) else { continue }
          let weight = pixel.alphaComponent
          alpha += weight
          red += pixel.redComponent * weight
          green += pixel.greenComponent * weight
          blue += pixel.blueComponent * weight
        }
      }
      if alpha / CGFloat(cell * cell) >= threshold {
        colors[row * dots + col] = NSColor(
          deviceRed: red / alpha, green: green / alpha, blue: blue / alpha, alpha: 1
        )
      }
    }
  }
  return colors
}

let tiles = symbols.map(sampled)
for (symbol, colors) in zip(symbols, tiles) {
  print("\(symbol): \(colors.count) dots")
}

// The canvas, tiled as the site’s is: each emoji in turn along a row, and
// four on from one row to the next, so no two neighbours show the same.
// Counted from the top left as the site lays it out and drawn from the
// bottom as the bitmap counts.
let left = (CGFloat(width) - CGFloat(columns) * pitch + pitch - size) / 2
let top = (CGFloat(height) - CGFloat(rows) * pitch + pitch - size) / 2
let canvas = makeBitmap(width, height)
drawing(on: canvas) {
  paper.setFill()
  NSRect(x: 0, y: 0, width: width, height: height).fill()
  for row in 0..<rows {
    for column in 0..<columns {
      let x = left + CGFloat(column) * pitch
      let y = top + CGFloat(row) * pitch
      let colors = tiles[(column + row * 4) % tiles.count]
      for index in 0..<(dots * dots) {
        (colors[index] ?? subtle.withAlphaComponent(subtle.alphaComponent * dim)).setFill()
        let cx = x + CGFloat(index % dots) * (dot + gap) + dot / 2
        let cy = y + CGFloat(index / dots) * (dot + gap) + dot / 2
        NSBezierPath(
          ovalIn: NSRect(x: cx - dot / 2, y: CGFloat(height) - cy - dot / 2, width: dot, height: dot)
        ).fill()
      }
    }
  }
}

let url = URL(fileURLWithPath: directory).appendingPathComponent("og.png")
try! canvas.representation(using: .png, properties: [:])!.write(to: url)
print("Wrote \(url.path)")
