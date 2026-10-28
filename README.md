# robinvey

Robin Vey’s personal website and CV, and a Wunschzettel for the family. Two
Nuxt 4 apps on one layer, mirror v2, vue-equipment and Nuxt Content, each
generated as a static site. The CV is the same content as the site rendered to
`/cv.pdf` at build time.

## Apps and packages

| Path                | Package                     | Contents                                                                                                  |
| ------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `apps/web`          | `@robinscholz/web`          | The one-page site, the content collections, the Profile module and the `/cv.pdf` route                    |
| `apps/wunschzettel` | `@robinscholz/wunschzettel` | The wish list: the wishes, the Wish module, the add page and the bookmarklet                              |
| `packages/base`     | `@robinscholz/base`         | Nuxt layer: mirror, vue-equipment and magic-image wiring, the token theme, type system, Ui and the garden |

## Setup

```sh
pnpm install
pnpm dev
```

`dev` builds the tokens in `packages/base` first, then starts the site on
port 3000 and the Wunschzettel on port 3001; `pnpm --filter @robinscholz/web
dev` starts one of them. `/cv.pdf` renders on every request in development.

```sh
pnpm build
pnpm preview
```

`build` writes the static site to `apps/web/.output/public`, `cv.pdf`
included, and the Wunschzettel to `apps/wunschzettel/.output/public`.
`preview` serves them the way Cloudflare does, with the same cache headers and
404 page, on ports 8787 and 8788. Canonical URLs, the links printed on the CV
and image sources all start from `https://robinvey.com`, and the Wunschzettel’s
from `https://wunschzettel.robinvey.com`. Set another origin for a preview
deploy:

```sh
NUXT_PUBLIC_SITE_URL=https://preview.robinvey.com pnpm --filter @robinscholz/web build
```

Lint and typecheck before you push:

```sh
pnpm lint
pnpm typecheck
```

Neither waits for the token build. `typecheck` runs through each app, so it
covers the base layer and the content schemas too, and runs again whenever
either package changes.

## Content

Everything on the page and in the PDF comes from `apps/web/content`. Each
collection has a schema in `apps/web/content.config.ts`, which types the
queries. Nuxt Content does not reject a file that breaks it, so check the page
and the PDF after an edit.

YAML reads a colon followed by a space as the start of a new key, so quote any
value that contains one:

```yaml
summary: 'I build interfaces and the systems underneath them: design systems …'
```

| File               | Collection   | Used for                                                                                |
| ------------------ | ------------ | --------------------------------------------------------------------------------------- |
| `index.md`         | `pages`      | The intro, the meta description and the colophon                                        |
| `contact.md`       | `contact`    | The Contact paragraph                                                                   |
| `profile.yml`      | `profile`    | Name, role, location, email, links and the “Now” line; the CV reads its email and links |
| `experience/*.yml` | `experience` | Work, newest first by `start`                                                           |
| `sites/*.yml`      | `sites`      | Sites, newest first by `year`, then in file order, each with a short description        |
| `projects/*.yml`   | `projects`   | Projects, in file order (`1.mirror.yml` comes first)                                    |
| `writing/*.yml`    | `writing`    | Articles published elsewhere, newest first by `date`                                    |
| `cv.yml`           | `cv`         | Everything only the PDF shows: summary, education, etc.                                 |

Write experience and education dates as `'YYYY'` or `'YYYY-MM'`, quoted; a
year prints as a year, so nothing claims a month nobody wrote down. Leave `end`
out for a current role. Articles take a full `'YYYY-MM-DD'`.

A role with neither a `summary` nor a `url` shows as a plain row with nothing
to expand.

The site shows each role’s `summary`; the PDF continues it with its
`highlights`, written as whole sentences, so each role reads as one paragraph.
Both read the same transformers in `apps/web/shared/utils`, so the two never
disagree.

### Images

A project takes an optional `image` with `src` and `alt`. Put the file under
`apps/web/public/images` and write the path from the site root:

```yaml
image:
  src: /images/mirror.jpg
  alt: The Mirror token pipeline
```

Images go out through magic-image and the MaaS image CDN, which fetches the
original by its public URL. A new image therefore shows up once it is
deployed, in development too, since the CDN cannot reach `localhost`.

## The look

The page is set flush left, like a typed letter. Section labels sit in a margin
column; each list is a ledger of a date or label, the entry and a mark (`+` to
open, `↗` to leave). The grid is measured in `ch`, so every column lands on the
same character grid. Structure comes from whitespace and typed rules: every
section opens with a line of one glyph, set with `UiRule` at the size and weight
of the text in the muted ink. Each page load shuffles `∗`, `–`, `+`, `×`, `#`,
`%` and `=` across the seven rules. ABC Areal has no asterisk operator, so `∗`
comes from the `system-ui` fallback. The server renders the rules empty, so the shuffle happens in the
browser and differs from one visit to the next. Every rule keeps the same
visible gap between glyphs, 0.35em of the text from ink to ink, whatever each
glyph’s own side bearings; it fits as many whole glyphs as the width allows,
puts the first and last on the text inset, centres the glyph on the middle of a
capital, and measures again whenever the width or the type size changes.

Everything is set in ABC Areal Semi Mono at one size, `text-sm` on phones and
`text-base` from the `sm` breakpoint, in two weights, regular and
`font-medium`. Tailwind’s other sizes and weights are reset in
`packages/base/app/assets/css/tailwind.css`, so no other size can creep in.

The font is the variable ABC Areal Superfamily with its `MONO` axis fixed at
50: Semi Mono, mono letterforms on proportional widths. Semi Mono sets round
and square brackets in wide cells, which opens gaps around them, so those come
from a proportional cut instead. The date column turns on tabular figures so
years still line up digit by digit. Dark mode also switches on the font’s
`DRKM` axis, which thins the strokes for light type on a dark ground.

Colour comes from mirror tokens. The `robinvey` theme in
`packages/base/tokens/theme` sets the paper, the ink and the font family over
the stock mirror-tokens tree, which is fetched from git on every token build.

## Hover colour

Every hover takes the next colour of the rainbow: red, orange, yellow,
green, blue, indigo, violet. The hues are tokens in the `robinvey` theme,
`app.color.hue.1` to `app.color.hue.7`, one set per colour mode. Each sits
at the most saturated hue and lightness sRGB allows within its colour’s
range, while keeping at least 3:1 contrast on the paper, or 4.5:1 on the
dark ground. Orange and yellow are the exceptions in light mode, at 2.3:1 and
1.8:1: dark enough for 3:1 on the paper, they turn to brown and mustard.

Text selection takes the same rainbow as a 40% tint behind the ink, so the
text stays legible, and moves on to the next hue with every new selection. It
keeps its own count, so dragging across rows that advance the hover hue does
not recolour a selection mid-drag.

`useHue()` in the Ui module owns the counter. Rows, links and the colour mode
switch call `advance()` when the pointer enters, and read the result as
`--ui-hue`. Links in markdown render through `ProseA`, which hands them to
`UiLink`, so the intro and the Contact paragraph behave like every other link.
An open row in Work or Projects pins the hue it had when it was opened and
keeps it until it closes, so open rows stay easy to find.

## Intro

On load, the text scrambles through ASCII symbols and settles into place in
reading order within half a second, while the rules type themselves out glyph
by glyph. Each symbol is about as wide as the letter it stands in for, and
every line’s breaks are pinned while it runs, so nothing shifts or rewraps.
Mark a container with `data-scramble` to include its text; anything
`aria-hidden` is left alone.

The page is prerendered, so its final text would paint before the app
hydrates. An inline script in the head hides everything under
`[data-scramble]` from the first paint, and the intro reveals it once the app
has hydrated and the font has loaded. Past 1.5 seconds the text appears
without the scramble, and after two seconds CSS reveals it regardless.
Visitors who prefer reduced motion, or have no JavaScript, see the text
straight away.

## Typeface switch

The words Semi Mono in the colophon switch the whole page between ABC Areal
Semi Mono and its Regular cut, by moving the font’s `MONO` axis from 50 to 0.
The page scrambles, fades out, changes face while hidden and fades back in as
noise before the text settles, all within 600ms; the switch keeps its place on
screen while the text above it rewraps. Visitors who prefer reduced motion get
the new face at once. Regular drops what is there only for Semi Mono: the
tighter word spacing and the proportional brackets.

The choice is kept in `localStorage` under `robinvey-typeface`. An inline
script sets it on `<html>` before the first paint, so a returning visitor never
sees Semi Mono first, and the colophon’s label follows once the page has
hydrated.

## Garden

A garden of ASCII flowers grows underneath the page. Drag the page’s left or
right edge towards the middle to uncover it, or click the edge, and the page
slides aside with it. Let go more than 48 pixels from where you started, or
flick, and the page snaps to uncover half the viewport, or three quarters of it
below the `md` breakpoint. Click the garden, the part of the page still showing
or its edge, or press Escape, to close it again. While one edge is out, the
other cannot be dragged. Once the page has come to rest open, it casts a shadow
onto the garden, which fades as soon as the page moves again.

The page sits in vue-equipment’s MagicTray, which clips it with `clip-path`,
and MagicTrayTransform slides it along with the clip. The transform is only set
while the page is away from rest, since a transformed ancestor pins fixed
elements to the page instead of the viewport. The colour mode switch is sticky
rather than fixed for the same reason, so it slides aside with the page
wherever the page is scrolled to. The garden is a fixed layer behind the page
on `bg-surface-low`, and always dark: it carries `data-color-mode="dark"`,
which scopes the dark mode’s tokens to it, so it stays black with the dark hues
whichever mode the page is in. It stays hidden until an edge moves, so it never
shows through an overscroll. The page’s shadow comes from an empty box in the
garden layer over the part of the page in view, since the clip would cut off a
shadow cast by the page itself.

The garden is set in ABC Areal Mono, the font’s `MONO` axis at 100, where every
ASCII glyph is 0.61em wide, so the art sits on an exact grid of cells. Each
visit plants a new garden from a random seed, as soon as the page has loaded.
Tall flowers stand at the back, shorter ones in front of them, then blades,
daisies and grass, all sized to the smaller of the viewport’s width and height.
A resize regrows the same garden to the new size. Only the seven hover hues
colour it: each flower takes a hue for its petals, the next one for its stripes
and a third for its eye, on green or yellow stems.

The wind blows one way for a whole visit, in gusts that travel across the
garden. Each plant hangs on a damped spring and follows the lean the wind gives
it at its spot, so tall plants swing slowly and lag behind a gust while short
ones swing quickly. A flower’s head moves as a whole and its stem bends below
it. Wherever the stem steps sideways from one row to the next, its stroke turns
from `|` to `/` or `\`, so the stem stays joined. Grass and blades bend along
their length and tip their strokes over in strong gusts. Sweeping the pointer
across a plant pushes it the way the pointer moves. The wind only blows while
the garden shows, and redraws it 30 times a second. Each plant starts at the
lean the wind already gives it, so the garden sways from the first frame.
Visitors who prefer reduced motion find the garden still.

Each species is a function in
`packages/base/app/modules/Garden/utils/plants.ts` that draws one plant from a
size and a height. `grow.ts` lays the rows out, `wind.ts` sets the gusts and
`compose.ts` lays every plant into the grid at its current lean.

## Titles on phones

Below the `md` breakpoint every title in Work, Sites, Projects and Writing
stays on one line, cut off with a fade where it does not fit. It scrolls while
its row is open, or while a link row is held; a hold does not open the link.
From `md` up, and for visitors who prefer reduced motion, titles wrap.

## Icons

Icons come from Symbols, the MaaS icon set, served as an Iconify collection
from `https://symbols.maas.earth`. Use `UiIcon` with the symbol’s name; it
picks the `maas` collection and weight 300, a step lighter than the text, so
the marks in each row stay quiet:

```vue
<UiIcon name="arrow-n-e" />
<UiIcon name="plus" :weight="400" />
```

Icons are inlined into the prerendered HTML. One that first appears after a
click, such as `minus`, is fetched from the same endpoint in the browser.

## The CV

`apps/web/server/routes/cv.pdf.get.ts` reads the collections, and
`server/utils/cv/document.ts` lays the CV out with
[`@jasy/pdf`](https://www.npmjs.com/package/@jasy/pdf): one A4 page, real text,
tagged for screen readers, every link clickable, with a document title
so the browser tab reads “Robin Vey, CV”. The build prerenders it to a
static `cv.pdf`.

It follows the site: name, role and location in the margin column with the
summary beside them, then one section after another, Contact last. Space comes
in lines of text: one between the entries of a section, two above a section.
Each role reads as one paragraph. Project titles link out and carry the site’s
outbound arrow after them, which links too; company names and the contact lines
link without it.

The PDF engine embeds static faces, and reads kerning only from plain
pair-positioning lookups, which ABC Areal mostly wraps in Extension lookups.
`apps/web/server/assets/fonts` therefore holds a Semi Mono instance at 400, the
CV’s only weight, with just its kerning lookups, unwrapped, and its space a
tenth of an em narrower; glyphs and kerning values are untouched. Brackets
come from a proportional cut, as on the site, and the section emoji from a
Noto Color Emoji subset. Cut Semi Mono again after a font update:

```sh
python3 apps/web/scripts/cv-font.py
```

`server/utils/cv/typeset.ts` adds the optical corrections the kerning leaves: a
comma or full stop moves in to meet an r, and the dash in a range of years gets
a thin space either side. They apply to one-line text only, such as titles and
dates, because the engine may break a line wherever two text runs meet. The
site sets that dash the same way with `UiRange`.

## Wunschzettel

`apps/wunschzettel` is a wish list for the family: a grid of things, each a
link to a shop in Germany with a fair price and an easy return. It extends the
same base layer as the site, so it is set in the same face on the same paper,
with the same rules and hover hues, and is generated the same way. It is not
for search engines: `robots.txt` disallows everything and every page carries
`noindex`.

Every wish is a YAML file in `apps/wunschzettel/content/wishes`. The grid
shows them newest first by `added`, then in file order.

```yaml
title: 'Petzl Actik Core Stirnlampe'
url: 'https://www.bergzeit.de/p/petzl-actik-core-stirnlampe/5064106/'
price: 63.2
image: 'https://static.bergzeit.com/product_gallery_regular/5064106-002_pic1.jpg'
note: 'Farbe egal'
added: '2026-10-28'
```

| Field   | Required | Shown as                                                      |
| ------- | -------- | ------------------------------------------------------------- |
| `title` | yes      | The caption                                                   |
| `url`   | yes      | Where the card links; its host, `bergzeit.de`, names the shop |
| `shop`  | no       | The shop’s name, in place of the host                         |
| `price` | no       | A number in euro, printed as `63,20 €`                        |
| `image` | no       | The picture, by its address on the shop                       |
| `note`  | no       | A line under the caption: size, colour, anything              |
| `added` | yes      | A day, `'YYYY-MM-DD'`, quoted                                 |

`content/index.yml` holds the title, the name and the intro. The three wishes
in the repository are examples; delete them.

Pictures go out through magic-image and the MaaS image CDN, which fetches
them from the shop by their address, resizes them for the grid and caches
them. Each multiplies onto the light paper, so a shop’s white backdrop
disappears; in dark mode the paper comes along as a tile.

### Adding a wish

Open `/add` and drag the 🎁 Wünschen link into the bookmarks bar. On a
shop’s product page, click it: it reads the product from the page’s JSON-LD
and Open Graph tags, name, brand, picture and price, strips tracking
parameters from the address and opens `/add` with the wish in the hash, so
nothing is sent anywhere. Check the preview, fix what the shop got wrong,
compare prices on idealo or Geizhals, then click Auf GitHub anlegen: GitHub
opens a new file under `content/wishes`, named after the title, with the YAML
filled in. Commit it to `main`, and Workers Builds deploys the list a minute
later. YAML kopieren puts the same file on the clipboard instead.

The bookmarklet is `apps/wunschzettel/app/modules/Wish/bookmarklet/index.ts`,
a script in TypeScript. The Wish module minifies it with esbuild at build
time, and the add page links it with the site’s origin filled in, so a
preview build’s bookmarklet opens the preview.

## Deploy

Each app is a Cloudflare Worker that serves only static files: the site from
`wrangler.jsonc` at the root, the Wunschzettel from
`apps/wunschzettel/wrangler.jsonc`. Each is its own Workers Builds project.
Workers Builds deploys every push to `main`, and every other branch gets a
preview URL. Both builds run from the repository root:

| Setting        | Site                  | Wunschzettel                                                    |
| -------------- | --------------------- | --------------------------------------------------------------- |
| Root directory | `/`                   | `/`                                                             |
| Build command  | `pnpm build`          | `pnpm build`                                                    |
| Deploy command | `npx wrangler deploy` | `npx wrangler deploy --config apps/wunschzettel/wrangler.jsonc` |

Each app’s `public/_headers` caches the hashed files in `/_nuxt` for a year.
Everything else, the pages and `cv.pdf` included, revalidates on every
request, so a deploy shows up at once.

The Nitro preset is pinned to `static`. On Cloudflare’s build machines Nitro
would otherwise switch to a Worker preset, and its generated config would take
over `wrangler deploy`.

## Fonts

ABC Areal is licensed from Dinamo. The font files are committed, so keep this
repository private.

## Tooling

- [Turborepo](https://turbo.build/repo), pnpm workspaces
- [Nuxt 4](https://nuxt.com), [Nuxt Content](https://content.nuxt.com)
- [mirror v2](https://github.com/magicasaservice/mirror), [vue-equipment](https://github.com/magicasaservice/vue-equipment), [magic-image](https://github.com/magicasaservice/magic-image)
- [`@jasy/pdf`](https://www.npmjs.com/package/@jasy/pdf) for the CV
- [`@nuxt/icon`](https://github.com/nuxt/icon) with the Symbols collection
- ESLint and Prettier presets from `@maas/config`
- [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) with static assets, deployed by Workers Builds
