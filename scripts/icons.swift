import AppKit
import Foundation

// Draws an app’s emoji as its icons, with Apple’s own art: a transparent
// favicon.png for the browsers that take no SVG, and an opaque
// apple-touch-icon.png on the page’s ground for the home screen.
//
//   swift scripts/icons.swift 🚠 '#f2f2f0' apps/web/public
//   swift scripts/icons.swift 🎁 '#ffffff' apps/wunschzettel/public

let arguments = CommandLine.arguments
guard arguments.count == 4 else {
  print("usage: swift scripts/icons.swift <emoji> <background> <directory>")
  exit(1)
}
let emoji = arguments[1]
let background = arguments[2]
let directory = arguments[3]

// Canvas and emoji sizes in pixels: the favicon nearly fills its box, the
// touch icon leaves the margin a home screen icon has.
let icons = [
  (name: "favicon.png", canvas: 96, size: 84, background: nil as String?),
  (name: "apple-touch-icon.png", canvas: 180, size: 120, background: background),
]

func makeBitmap(_ size: Int) -> NSBitmapImageRep {
  return NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
    samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
    bytesPerRow: 0, bitsPerPixel: 0
  )!
}

func color(_ hex: String) -> NSColor {
  let digits = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
  let value = UInt32(digits, radix: 16)!
  return NSColor(
    deviceRed: CGFloat((value >> 16) & 0xff) / 255, green: CGFloat((value >> 8) & 0xff) / 255,
    blue: CGFloat(value & 0xff) / 255, alpha: 1
  )
}

func draw(_ text: NSAttributedString, on bitmap: NSBitmapImageRep, at point: NSPoint, background: String?) {
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
  if let background {
    color(background).setFill()
    NSRect(x: 0, y: 0, width: bitmap.pixelsWide, height: bitmap.pixelsHigh).fill()
  }
  text.draw(at: point)
  NSGraphicsContext.restoreGraphicsState()
}

for icon in icons {
  let text = NSAttributedString(
    string: emoji, attributes: [.font: NSFont.systemFont(ofSize: CGFloat(icon.size))]
  )
  let canvas = icon.canvas

  // A first pass finds the ink, so the second can centre it: the glyph’s box
  // and its drawing rarely share a middle.
  let probe = makeBitmap(canvas)
  draw(text, on: probe, at: NSPoint(x: 0, y: 0), background: nil)
  var minX = canvas, minY = canvas, maxX = -1, maxY = -1
  for y in 0..<canvas {
    for x in 0..<canvas {
      if let pixel = probe.colorAt(x: x, y: y), pixel.alphaComponent > 0.02 {
        minX = min(minX, x)
        maxX = max(maxX, x)
        minY = min(minY, y)
        maxY = max(maxY, y)
      }
    }
  }
  // colorAt counts rows from the top, drawing from the bottom.
  let width = CGFloat(maxX - minX + 1)
  let height = CGFloat(maxY - minY + 1)
  let left = CGFloat(minX)
  let bottom = CGFloat(canvas - 1 - maxY)
  let point = NSPoint(
    x: (CGFloat(canvas) - width) / 2 - left,
    y: (CGFloat(canvas) - height) / 2 - bottom
  )

  let bitmap = makeBitmap(canvas)
  draw(text, on: bitmap, at: point, background: icon.background)
  let url = URL(fileURLWithPath: directory).appendingPathComponent(icon.name)
  try! bitmap.representation(using: .png, properties: [:])!.write(to: url)
  print("\(icon.name): \(Int(width))×\(Int(height)) in \(canvas)")
}
