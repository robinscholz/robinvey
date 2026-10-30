// The size link previews take.
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_FONT = 'ABC Areal'

// The site’s paper, ink and muted ink in sRGB: `app.color.surface.bg.base`,
// `fg` and `fg.muted` of the light mode, which the renderer takes no oklch()
// for.
const PAPER = '#f2f2f0'
const INK = '#161615'
const MUTED = '#595954'

// Set at one size with the page’s line height, inside a margin that keeps
// the words clear of the rounded corners previews are cropped to.
const SIZE = 56
const LINE_HEIGHT = 1.5
const MARGIN = 96

interface OgCardPayload {
  profile: Profile
  host: string
}

// The tree the renderer lays out, written as elements with props, the way
// it reads them.
interface OgNode {
  type: string
  props: {
    style?: Record<string, string | number>
    children?: string | Array<OgNode>
  }
}

function line(text: string, color = INK): OgNode {
  return { type: 'div', props: { style: { color }, children: text } }
}

// Set like the site’s header: who and where, flush left, with the address
// at the foot in the muted ink. The renderer sizes a box by its content, so
// the margin is taken off the width and height to land on the picture’s.
export function ogCard({ profile, host }: OgCardPayload): OgNode {
  return {
    type: 'div',
    props: {
      style: {
        width: OG_SIZE.width - 2 * MARGIN,
        height: OG_SIZE.height - 2 * MARGIN,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: `${MARGIN}px`,
        backgroundColor: PAPER,
        fontFamily: OG_FONT,
        fontSize: `${SIZE}px`,
        lineHeight: `${SIZE * LINE_HEIGHT}px`,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              line(profile.name),
              line(profile.role, MUTED),
              line(profile.location, MUTED),
            ],
          },
        },
        line(host, MUTED),
      ],
    },
  }
}
