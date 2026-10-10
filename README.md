# robinvey

Robin Vey’s personal website and CV. One Nuxt 4 app on mirror v2,
vue-equipment and Nuxt Content, generated as a static site. The CV is the
same content rendered to `/cv.pdf` at build time.

## Apps and packages

| Path            | Package             | Contents                                                                                      |
| --------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| `apps/web`      | `@robinscholz/web`  | The one-page site, the content collections, the Profile module and the `/cv.pdf` route        |
| `packages/base` | `@robinscholz/base` | Nuxt layer: mirror, vue-equipment and magic-image wiring, the token theme, type system and Ui |

## Setup

```sh
pnpm install
pnpm dev
```

`dev` builds the tokens in `packages/base` first, then starts the site on
port 3000. `/cv.pdf` renders on every request in development.

```sh
pnpm build
pnpm preview
```

`build` writes the static site to `apps/web/.output/public`, `cv.pdf`
included. Canonical URLs, the links printed on the CV and image sources all
start from `https://robinvey.com`. Set another origin for a preview deploy:

```sh
NUXT_PUBLIC_SITE_URL=https://preview.robinvey.com pnpm build
```

Lint and typecheck before you push:

```sh
pnpm lint
pnpm typecheck
```

Neither waits for the token build. `typecheck` runs through the app, so it
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
