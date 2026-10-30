# @robinscholz/base

The site’s Nuxt layer: mirror v2 and vue-equipment wiring, the Mirage token
theme and the face itself, the type system, the Ui module and the emoji
canvas under the page. [`apps/personal`](../../apps/personal/README.md)
extends it; the Wunschzettel stands apart from it, on the stock tokens. Its
`tokens` script builds the mirror tokens and the CSS from them, and runs
through turbo before every `dev` and `build`.

## Type

Everything is set in Mirage at one size and weight, 15px on 24px leading.
Tailwind’s other sizes and weights are reset in `app/assets/css/tailwind.css`,
so no other size can creep in.

Mirage is Dreamtype’s face. It comes from the MaaS font server, the same
stylesheet vue.equipment links, with the same features on: `ss02` sets square
quotes and punctuation and `cv04` a character variant, both through Tailwind’s
`--default-font-feature-settings`. The sheet is linked with critical priority
and the host preconnected in `nuxt.config.ts`, so the face is asked for
before anything else. The date column turns on tabular figures so years line
up digit by digit.

## Colour

Colour comes from mirror tokens. The `robinvey` theme in `tokens/theme` sets
the paper, the ink and the font family over the stock mirror-tokens tree,
which is fetched from git on every token build.

## Colour mode

`UiColorModeSwitch` offers Dark, Light and System; the site places it in its
colophon. A choice that changes the page cross-fades the old page into the
new through the View Transitions API where the browser has it, in
`useSwitch()`. One that leaves the page as it is, System on a system already
showing that mode, is kept without it. The `theme-color` tags follow the
mode, so the browser’s own frame takes the paper or the dark ground: one tag
per system scheme until a choice is made, both with the choice after
(`useThemeColor()`). `color-scheme` follows on `<html>`, so scrollbars and
form controls match.

## Hover and focus

A link in the prose is underlined, and a row under the pointer underlines its
title the same way, the dates beside it unchanged. Text selection is
mirror’s muted accent behind the text. Nothing else on the page takes a
colour of its own apart from the emoji and the focus ring, which is mirror’s
`focus-shadow` utility on `:focus-visible`: a 1px inner and a 2px outer ring
in the focus colour, drawn as a shadow so nothing moves, the widths set in
the `robinvey` theme.

## Emoji

`UiEmoji` in the Ui module draws any emoji on a dot matrix, at the dot count
and in the box of whoever places it: vue-equipment’s MagicDotMatrix and its
emoji tooling sample the system’s emoji glyph onto the grid and loop the
motion it picks for it. With `boot`, the emoji builds up from the bottom,
two rows a frame, in about a third of a second, before the motion plays;
when the emoji changes, the old picture goes first, a row at a time from the
top, and the new one builds up after it. Visitors who prefer reduced motion
see the emoji at rest.

## Icons

Icons come from Symbols, the MaaS icon set, served as an Iconify collection
from `https://symbols.maas.earth`. Use `UiIcon` with the symbol’s name; it
picks the `maas` collection and weight 300, a step lighter than the text, so
the arrows after the titles stay quiet:

```vue
<UiIcon name="arrow-n-e" />
<UiIcon name="arrow-n-e" :weight="400" />
```

Icons are inlined into the prerendered HTML, with five seconds for each to
arrive at build time; the colour mode switch fetches its menu’s icons as soon
as it is on the page.

## Emoji canvas

A field of emoji lies underneath the page. Drag the page’s right edge towards
the middle to uncover it, or click the edge, and the page is cut away with it.
Let go more than 48 pixels from where you started, or flick, and the page
snaps to uncover half the viewport, or three quarters of it below the `md`
breakpoint. Click the canvas, the part of the page still showing or its edge,
or press Escape, to close it again; the canvas and that part of the page are
drag surfaces as well, `MagicTrayTrigger`s, so the page can be pushed shut
from anywhere on either. The page casts a shadow onto the canvas as it moves.

The right edge gives the canvas away. With a cursor, the edge pulls back as
the cursor comes within 160px of it, by 48px once it is within 48px, and
settles again as the cursor leaves: MagicTray’s magnetism, for fine pointers
that allow motion, which uncovers a sliver of the canvas. A finger has to
find the edge itself.

The page sits in vue-equipment’s MagicTray, which clips it with `clip-path`.
The page itself stays where it is, so its fixed elements stay fixed. The
canvas is a fixed layer behind the page on `bg-surface-low`, in the page’s
colour mode. It stays hidden until the edge moves, so it never shows through
an overscroll. The page’s shadow comes from an empty box in the canvas layer,
the size of the viewport, that slides with the edge by a transform, since the
clip would cut off a shadow cast by the page itself.

The field is every emoji the system draws as a single code point, 1,096 of
them, each a still on a 48px dot matrix of twelve dots a side, one every 80px,
on a grid without an end. The field is tiled with blocks that each hold every
emoji once, in an order drawn from the block’s place and a seed for the visit,
so no emoji repeats within a block and the field is laid out afresh each time.
Families of look-alikes, the clock faces, the speakers and the coloured
shapes, are left out, since they would read as repeats, and so is any emoji
the system has no glyph for, which would draw as a box. The stills are drawn
in the browser: `app/modules/EmojiCanvas/utils/tile.ts` draws the glyph with
the system’s emoji font onto a canvas, crops it to its ink, reads it off at
six pixels a dot and paints the dots the way MagicDotMatrix would, round and
three times as wide as their gaps, onto a tile. `useEmojiCanvasTiles` draws
the tiles a few at a time while the browser is idle, or a batch every few
milliseconds in Safari, which has no idle callback, and the field paints the
tiles in view onto one canvas, so hundreds of emoji cost the page nothing in
elements.

The field drifts up and to the left while it shows, a few pixels a second, and
the wheel pans it. A cell the pointer rests on gets a matrix of its own over
its still, `UiEmoji`, which plays the emoji’s motion through the plugin’s emoji
tooling and loops it while the pointer stays. Visitors who prefer reduced
motion find the field still.

`EmojiCanvas` lists the cells in view, paints them and hands the pointer’s cell
to `UiEmoji`; `EmojiCanvasBed` puts the field behind the page and adds the tray’s
parts, the reveal, the shadow and the click that closes it. The site’s error
page sets an `EmojiCanvas` out in the open, with no page over it; its README
has that.
