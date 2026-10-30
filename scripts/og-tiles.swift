import AppKit
import Foundation

// Samples emoji onto dot matrices for the site’s preview image, with Apple’s
// own art: each emoji becomes the dots it lights on a twelve by twelve grid,
// each with the colour it covers the dot with, written as JSON.
//
//   swift scripts/og-tiles.swift apps/personal/server/utils/og/tiles.json 🚠 🚡 🪂 🎿 🏔️ 🚲

let arguments = CommandLine.arguments
guard arguments.count >= 3 else {
  print("usage: swift scripts/og-tiles.swift <json file> <emoji> [emoji …]")
  exit(1)
}
let target = arguments[1]
let symbols = Array(arguments.dropFirst(2))

// Dots a side, pixels a dot on the sampling bitmap, how much of the matrix
// the glyph fills and how much of a dot it has to cover to light it.
let dots = 12
let cell = 8
let fit = 0.9
let threshold = 0.35

// The glyph is drawn large once and cropped to its ink.
let glyph = 160

func makeBitmap(_ size: Int) -> NSBitmapImageRep {
  return NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
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

func hex(_ value: CGFloat) -> String {
  return String(format: "%02x", Int((value * 255).rounded()))
}

var tiles: [[String: Any]] = []

for symbol in symbols {
  // The ink’s box, counted in rows from the top as colorAt does.
  let probe = makeBitmap(glyph)
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
    continue
  }
  let inkWidth = CGFloat(maxX - minX + 1)
  let inkHeight = CGFloat(maxY - minY + 1)
  let ink = NSRect(x: CGFloat(minX), y: CGFloat(glyph - 1 - maxY), width: inkWidth, height: inkHeight)

  // The ink, fitted into the sampling bitmap and centred.
  let side = CGFloat(dots * cell)
  let scale = fit * side / max(inkWidth, inkHeight)
  let width = inkWidth * scale
  let height = inkHeight * scale
  let image = NSImage(size: NSSize(width: glyph, height: glyph))
  image.addRepresentation(probe)
  let sample = makeBitmap(dots * cell)
  drawing(on: sample) {
    image.draw(
      in: NSRect(x: (side - width) / 2, y: (side - height) / 2, width: width, height: height),
      from: ink, operation: .sourceOver, fraction: 1
    )
  }

  // Each dot takes the alpha-weighted mean colour of its pixels, and lights
  // when they cover enough of it.
  var lit: [[Any]] = []
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
      let coverage = alpha / CGFloat(cell * cell)
      if coverage >= threshold {
        let color = "#" + hex(red / alpha) + hex(green / alpha) + hex(blue / alpha)
        lit.append([row * dots + col, color])
      }
    }
  }
  tiles.append(["symbol": symbol, "dots": lit])
  print("\(symbol): \(lit.count) dots")
}

let json = try! JSONSerialization.data(withJSONObject: tiles, options: [.prettyPrinted, .withoutEscapingSlashes])
try! json.write(to: URL(fileURLWithPath: target))
print("Wrote \(target)")
