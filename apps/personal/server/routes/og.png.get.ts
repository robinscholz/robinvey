import { Resvg } from '@resvg/resvg-js'
import { OG_SIZE, ogCanvas } from '../utils/og/card'

// The picture a link to the site shows where it is shared: the emoji
// canvas, tiled with the mountains the panel cycles through. The build
// prerenders it to a static og.png.
export default defineEventHandler((event) => {
  setResponseHeaders(event, { 'Content-Type': 'image/png' })

  return new Resvg(ogCanvas(), {
    fitTo: { mode: 'width', value: OG_SIZE.width },
  })
    .render()
    .asPng()
})
