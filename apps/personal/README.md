# @robinscholz/personal

robinvey.com: the one-page site, set from Nuxt Content on
[`@robinscholz/base`](../../packages/base/README.md), the layer that brings
mirror v2, vue-equipment, Mirage, the Ui module and the emoji canvas, and
the CV, the same content rendered to `/cv.pdf` at build time.
`pnpm dev:personal` starts it on port 3000, where `/cv.pdf` renders on every
request; `pnpm build:personal` writes the static site to `.output/public`,
`cv.pdf` included, and `pnpm start:personal` serves that build in workerd on
port 8787, with the same cache headers and 404 page as online. Canonical
URLs, the links printed on the CV and the preview image all start from
`https://robinvey.com`; set `NUXT_PUBLIC_SITE_URL` for a preview deploy.

## Content

Everything on the page and in the PDF comes from `content`. Each collection
has a schema in `content.config.ts`, which types the queries. Nuxt Content
does not reject a file that breaks it, so check the page and the PDF after
an edit.

YAML reads a colon followed by a space as the start of a new key, so quote any
value that contains one:

```yaml
summary: 'I build interfaces and the systems underneath them: design systems …'
```

| File               | Collection   | Used for                                                                         |
| ------------------ | ------------ | -------------------------------------------------------------------------------- |
| `index.md`         | `pages`      | The intro, the meta description and the colophon                                 |
| `contact.md`       | `contact`    | The Contact paragraph                                                            |
| `profile.yml`      | `profile`    | Name, role, location, email and links; the CV reads its email and links          |
| `experience/*.yml` | `experience` | Work, newest first by `start`                                                    |
| `sites/*.yml`      | `sites`      | Sites, newest first by `year`, then in file order, each with a short description |
| `projects/*.yml`   | `projects`   | Projects, in file order (`1.mirror.yml` comes first)                             |
| `writing/*.yml`    | `writing`    | Articles published elsewhere, newest first by `date`                             |
| `cv.yml`           | `cv`         | Everything only the PDF shows: summary, education, etc.                          |

Write experience and education dates as `'YYYY'` or `'YYYY-MM'`, quoted; a
year prints as a year, so nothing claims a month nobody wrote down. Leave `end`
out for a current role. Articles take a full `'YYYY-MM-DD'`.

A role with neither a `summary` nor a `url` shows as a plain row with nothing
to expand.

The site shows each role’s `summary`; the PDF continues it with its
`highlights`, written as whole sentences, so each role reads as one paragraph.
Both read the same transformers in `shared/utils`, so the two never disagree.

## The page

The page is set flush left in one column, like a typed letter: the name, the
intro, then one section after another, each a heading half a line over its
block, in a 64ch measure. The four lists, Work, Projects, Built and Writing,
sit side by side where there is room, two from the `xl` breakpoint, across
the whole page. Each list is a ledger of a date and the entry; a row that leaves
the site carries `↗` after its title, and a row in Work or Projects opens on a
click to show its summary. Structure comes from whitespace alone. The margin is
the Wunschzettel’s: 24px on phones, 48px from the `md` breakpoint and 80px
from `xl`, with 48px above the name from `md`. The names the
page lists, the companies, the projects and the sites, never break across a
line wherever they appear, and nor does a link in the prose. The colophon
holds the colour mode menu, the layer’s `UiColorModeSwitch`.

Under the intro, the 🚠 emoji sits on a dot matrix 32ch wide, a dot to a
character, drawn by vue-equipment’s MagicDotMatrix and its emoji tooling,
which samples the system’s emoji glyph onto the grid and loops the motion it
picks for it; a click moves on through 🚡, 🪂, 🎿, 🏔️ and 🚲, in an order drawn for the
visit, and round again. The panel is `ProfileCarousel`, on the layer’s
`UiEmoji`.

## Intro

The text is simply there once the font is. The dot matrix under the intro
carries the moment: the emoji builds up from the bottom, two rows a frame,
in about a third of a second, before the motion plays. `UiEmoji` does this with `boot`. When its emoji changes, as it does with
every click on the panel, the old picture goes first, a row at a time from
the top, and the new one builds up after it. Visitors who prefer reduced
motion see the emoji at rest.

## Titles on phones

Below the `md` breakpoint every title in Work, Built, Projects and Writing
stays on one line, cut off with a fade where it does not fit. It scrolls while
its row is open, or while a link row is held; a hold does not open the link.
From `md` up, and for visitors who prefer reduced motion, titles wrap.

## Favicon

The favicon is the 🚠 emoji: an SVG for the browsers that draw it, and
`favicon.png` with Apple’s art for Safari, which takes no SVG, next to
`apple-touch-icon.png` on the paper for the home screen. Both PNGs come from
`scripts/icons.swift` at the repository root, which draws an emoji with
AppKit; from there:

```sh
swift scripts/icons.swift 🚠 '#f2f2f0' apps/personal/public
```

## The CV

`server/routes/cv.pdf.get.ts` reads the collections, and
`server/utils/cv/document.ts` lays the CV out with
[`@jasy/pdf`](https://www.npmjs.com/package/@jasy/pdf): A4, real text, tagged
for screen readers, every link clickable, with a document title so the
browser tab reads “Robin Vey, CV”. The build prerenders it to a static
`cv.pdf`.

It is set like the site, black on white: the name and role, the summary a
line below, then one section after another in a measure of about 64
characters, each heading half a line over its block, with the dates beside
each entry in a margin column. Space comes in lines of text: two above a section, one
between the entries of a section. Each role reads as one paragraph under
its company and role, and the site a role or project links to sits under
that, as under an open row on the site. Contact comes
last.

The PDF engine embeds static TrueType faces, reads kerning only from plain
pair-positioning lookups, which Mirage wraps in Extension lookups, and reads
no stylistic sets. `server/assets/fonts/Mirage.ttf` is therefore an instance
cut from the variable Mirage at 400 and the CV’s optical size, with just its
kerning lookups, unwrapped, and the site’s `ss02` and `cv04` written into its
character map, so the face sets as it does on the site. Cut it again after a
font update, from the variable Mirage in your font library or from a path
you pass:

```sh
python3 scripts/cv-font.py
```

`server/utils/cv/typeset.ts` adds the one correction the kerning leaves: the
dash in a range of years gets a thin space either side, the fifth of an em
the site sets as a character. It applies to one-line text only, such as the
dates, because the engine may break a line wherever two text runs meet.

## Preview image

`server/routes/og.png.get.ts` draws the picture a shared link shows, with
resvg: the emoji canvas, tiled ten by five with the mountains the panel
cycles through, each on a dot matrix of twelve dots a side on the paper,
1200 by 630. The tiles are sampled from Apple’s emoji art by
`scripts/og-tiles.swift` at the repository root, which writes the dots each
emoji lights and their colours to `server/utils/og/tiles.json`; run it again
from there to change the emoji:

```sh
swift scripts/og-tiles.swift apps/personal/server/utils/og/tiles.json 🚠 🚡 🪂 🎿 🏔️ 🚲
```

The build prerenders it to `og.png`, and the page’s Open Graph tags point at
it.

## Not found

An address that leads nowhere gets the layer’s emoji canvas out in the open,
with no page over it: `app/error.vue` sets a header over an `EmojiCanvas`
that fills the rest of the viewport, drifting from the start. The static
build’s `404.html` boots the app in the browser, which finds no page and
shows the error page; `not_found_handling` in `wrangler.jsonc` serves it.
Until the app has booted, `app/spa-loading-template.html` stands in with the
ground and the header, so the page never flashes. The field is a lazy
component: on the home page it hydrates once the browser is idle, so its
code stays out of the page’s way, and on the error page it loads with the
page.

## Deploy

The site is a Cloudflare Worker that serves only static files, from
`wrangler.jsonc`; its `deploy` script is `wrangler deploy`, and Workers
Builds runs it on every push to `main`, from the repository root, with the
settings in the root README. `public/_headers` caches the hashed files in
`/_nuxt` for a year; everything else, the pages and `cv.pdf` included,
revalidates on every request, so a deploy shows up at once.

The Nitro preset is pinned to `static`: on Cloudflare’s build machines Nitro
would otherwise switch to a Worker preset, and its generated config would
take over `wrangler deploy`.
