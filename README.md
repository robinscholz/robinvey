# robinvey

Robin Vey’s personal website and CV, and a Wunschzettel for the family. Two
Nuxt 4 apps: the site, generated as a static site from Nuxt Content on a
layer with mirror v2 and vue-equipment, and the Wunschzettel, a Cloudflare
Worker with a D1 database and an R2 bucket behind it. The CV is the same
content as the site rendered to `/cv.pdf` at build time.

## Apps and packages

| Path                | Package                     | Contents                                                                                                                    |
| ------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `apps/personal`     | `@robinscholz/personal`     | The one-page site, the content collections, the Profile module and the `/cv.pdf` route                                      |
| `apps/wunschzettel` | `@robinscholz/wunschzettel` | The wish list: the Wish module, the pages, the API, the picture store, the sign-in gate and the bookmarklet                 |
| `packages/base`     | `@robinscholz/base`         | The site’s Nuxt layer: mirror and vue-equipment wiring, the token theme and its fonts, type system, Ui and the emoji canvas |
| `packages/database` | `@robinscholz/database`     | The Wunschzettel’s D1 database: Drizzle schema, migrations, the wishes repository and the seed                              |

## Setup

```sh
pnpm install
pnpm dev
```

`dev` builds the mirror tokens in `packages/base` and `apps/wunschzettel`
first, then starts the site on port 3000 and the Wunschzettel on port 3001;
`pnpm dev:personal` and `pnpm dev:wunschzettel` start one of them. `/cv.pdf`
renders on every request in development. The Wunschzettel applies pending
migrations to its local D1 database first, then replaces the local wishes
with the ones in production (`apps/wunschzettel/scripts/pull-database.mjs`,
also `pnpm db:pull`), so a local run shows the list as it is online. It reads
them with a plain query, since `wrangler d1 export` holds up the live
database while it runs, and drops the local copy of any picture whose address
changed. Offline or signed out of wrangler, it keeps the local wishes and the
run goes on. Saves, edits and removals in development stay local and are gone
at the next pull. Nuxt then emulates the Cloudflare bindings through wrangler,
and the first API request seeds an empty database with the wishes in
`packages/database/seed`. Wrangler keeps that database and the local bucket
under `apps/wunschzettel/.wrangler/state`, ignored by git; `pnpm db:studio`
opens the database in drizzle-kit studio.

```sh
pnpm build
pnpm start
```

`build` writes the static site to `apps/personal/.output/public`, `cv.pdf`
included, and the Wunschzettel’s Worker to `apps/wunschzettel/.output`;
`pnpm build:personal` and `pnpm build:wunschzettel` build one of them.
`start` runs both builds in workerd, the runtime Cloudflare uses: the site
with the same cache headers and 404 page as online, on port 8787, and the
Wunschzettel on port 3001 against the same local database, sign-in gate
included; `pnpm start:personal` and `pnpm start:wunschzettel` start one of
them. Canonical URLs, the links printed on the CV and the preview image all
start from `https://robinvey.com`, and the Wunschzettel’s from
`https://wunschzettel.robinvey.com`. Set another origin for a preview
deploy:

```sh
NUXT_PUBLIC_SITE_URL=https://preview.robinvey.com pnpm build:personal
```

Lint and typecheck before you push:

```sh
pnpm lint
pnpm typecheck
```

Neither waits for the token build. `typecheck` runs through each app, so it
covers the base layer and the content schemas too, and runs again whenever
either package changes.

Every root script goes through Turborepo, and `turbo.json` holds the order:
`tokens` before `dev` and `build`, `db:migrate` and `db:pull` before the
Wunschzettel’s `dev` and `start`, `build` before `start` and `deploy`. Each
package keeps single commands in its own scripts, so
`pnpm --filter <package> <script>` runs that one step and nothing before it.

## Content

Everything on the page and in the PDF comes from `apps/personal/content`. Each
collection has a schema in `apps/personal/content.config.ts`, which types the
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
Both read the same transformers in `apps/personal/shared/utils`, so the two never
disagree.

## The look

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
line wherever they appear, and nor does a link in the prose.

Under the intro, the 🚠 emoji sits on a dot matrix 32ch wide, a dot to a
character, drawn by vue-equipment’s MagicDotMatrix and its emoji tooling,
which samples the system’s emoji glyph onto the grid and loops the motion it
picks for it; a click moves on through 🚡, 🪂, 🎿, 🏔️ and 🚲, in an order drawn for the
visit, and round again. `UiEmoji` in the Ui module
draws any emoji that way, at the dot count and in the box of whoever places
it.

Everything is set in Mirage at one size and weight, 15px on 24px leading.
Tailwind’s other sizes and weights are reset in
`packages/base/app/assets/css/tailwind.css`, so no other size can creep in.

Mirage is Dreamtype’s face. It comes from the MaaS font server, the same
stylesheet vue.equipment links, with the same features on: `ss02` sets square
quotes and punctuation and `cv04` a character variant, both through Tailwind’s
`--default-font-feature-settings`. The sheet is linked with critical priority
and the host preconnected in `packages/base/nuxt.config.ts`, so the face is
asked for before anything else. The date column turns on tabular figures so
years line up digit by digit.

Colour comes from mirror tokens. The `robinvey` theme in
`packages/base/tokens/theme` sets the paper, the ink and the font family over
the stock mirror-tokens tree, which is fetched from git on every token build.

## Hover and focus

A link in the prose is underlined, and a row under the pointer underlines its
title the same way, the dates beside it unchanged. Text selection is a 15%
tint of the ink behind the text. Nothing on the page takes
a colour of its own apart from the emoji and the focus ring, which is
mirror’s `focus-shadow` utility on `:focus-visible`: a 1px inner and a 2px
outer ring in the focus colour, drawn as a shadow so nothing moves, the
widths set in the `robinvey` theme.

## Intro

The text is simply there once the font is. The dot matrix under the intro
carries the moment: the emoji builds up from the bottom, two rows a frame,
in about a third of a second, before the motion plays. `UiEmoji` does this with `boot`. When its emoji changes, as it does with
every click on the panel, the old picture goes first, a row at a time from
the top, and the new one builds up after it. Visitors who prefer reduced
motion see the emoji at rest.

## Colour mode

The colour mode menu in the colophon offers Dark, Light and System. A choice that changes the page cross-fades the old page into the new through
the View Transitions API where the browser has it, in `useSwitch()`. One that leaves the page as it is, System on a system already
showing that mode, is kept without it. The `theme-color` tags follow the
mode, so the browser’s own frame takes the paper or the dark ground: one tag
per system scheme until a choice is made, both with the choice after
(`useThemeColor()`). `color-scheme`
follows on `<html>`, so scrollbars and form controls match.

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
that allow motion, which uncovers a sliver of the canvas. A finger cannot near an edge, so on a touch screen the
page pulls back once by itself, a moment after the page is up, holds,
and lets go (`useEmojiCanvasPeek`). A drag takes over wherever the pull is.

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
the system has no glyph for, which would draw as a box. The stills are drawn in the browser: `utils/tile.ts` draws the glyph
with the system’s emoji font onto a canvas, crops it to its ink, reads it off
at six pixels a dot and paints the dots the way MagicDotMatrix would, round and
three times as wide as their gaps, onto a tile. `useEmojiCanvasTiles` draws the
tiles a few at a time while the browser is idle, and the field paints the
tiles in view onto one canvas, so hundreds of emoji cost the page nothing in
elements.

The field drifts up and to the left while it shows, a few pixels a second, and
the wheel pans it. A cell the pointer rests on gets a matrix of its own over
its still, `UiEmoji`, which plays the emoji’s motion through the plugin’s emoji
tooling and loops it while the pointer stays. Visitors who prefer reduced
motion find the field still.

`EmojiCanvas` lists the cells in view, paints them and hands the pointer’s cell
to `UiEmoji`; `EmojiCanvasBed` puts the field behind the page and adds the tray’s
parts, the reveal, the shadow and the click that closes it.

An address that leads nowhere gets the field out in the open, with no page
over it: `apps/personal/app/error.vue` sets a header over a `EmojiCanvas` that
fills the rest of the viewport, drifting from the start. The static build’s
`404.html` boots the app in the browser, which finds no page and shows the
error page; `not_found_handling` in `wrangler.jsonc` serves it. Until the app
has booted, `app/spa-loading-template.html` stands in with the ground and the
header, so the page never flashes. The field is a lazy component: on
the home page it hydrates once the browser is idle, so its code stays out of
the page’s way, and on the error page it loads with the page.

## Titles on phones

Below the `md` breakpoint every title in Work, Built, Projects and Writing
stays on one line, cut off with a fade where it does not fit. It scrolls while
its row is open, or while a link row is held; a hold does not open the link.
From `md` up, and for visitors who prefer reduced motion, titles wrap.

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

The favicon is the 🚠 emoji: an SVG for the browsers that draw it, and
`favicon.png` with Apple’s art for Safari, which takes no SVG, next to
`apple-touch-icon.png` on the paper for the home screen. Both PNGs come from
`scripts/icons.swift`, which draws an emoji with AppKit:

```sh
swift scripts/icons.swift 🚠 '#f2f2f0' apps/personal/public
```

The Wunschzettel’s 🎁 is drawn the same way, on white.

## The CV

`apps/personal/server/routes/cv.pdf.get.ts` reads the collections, and
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
no stylistic sets. `apps/personal/server/assets/fonts/Mirage.ttf` is
therefore an instance cut from the variable Mirage at 400 and the CV’s
optical size, with just its kerning lookups, unwrapped, and the site’s
`ss02` and `cv04` written into its character map, so the face sets as it
does on the site. Cut it again after a font update, from the variable
Mirage in your font library or from a path you pass:

```sh
python3 apps/personal/scripts/cv-font.py
```

`server/utils/cv/typeset.ts` adds the one correction the kerning leaves: the
dash in a range of years gets a thin space either side, the fifth of an em
the site sets as a character. It applies to one-line text only, such as the
dates, because the engine may break a line wherever two text runs meet.

## Preview image

`apps/personal/server/routes/og.png.get.ts` draws the picture a shared link shows,
with satori and resvg: the name, role and location from `profile.yml` and
the site’s host, set in the CV’s cut of Mirage on the paper, 1200 by 630.
The build prerenders it to `og.png`, and the page’s Open Graph tags point at
it.

## Wunschzettel

`apps/wunschzettel` is a wish list for the family: a grid of things, each a
link to a shop in Germany with a fair price and an easy return. It stands
apart from the site’s layer: mirror v2 with the stock tokens and none of the
`robinvey` theme, a white page set in Mirage like the site, at 14px on 20px
in one weight, with a smaller size for the Edit buttons and the fields at
16px on a touch screen, where a smaller one would make iOS zoom in, a grid of pictures with a caption under
each, one to a row on a phone and up to four on a wide screen, on a page
capped at 2000px so a card in four columns is never wider than the widest in
three, no dark mode. Its icons are the 🎁 emoji, drawn as the site’s are, and
its `theme-color` is the white of the page. The local tokens in `apps/wunschzettel/tokens` merge over
the stock tree: `config.json` points the grey palette at neutral, so
surface, primary and secondary carry no blue, and `application.json` halves
the focus line and its halo, to 1px and 2px. The colours, radii and focus
ring are mirror utilities, fields are underlined, the drawer slides in from
the right under the shadow the site’s page casts onto its canvas and blurs
and dims the page behind it, and every button is `WishButton`, mirror’s `Button` as a ghost that fills in on hover: success
for Save, danger for Remove. A save answers with a toast 1rem in from the top
right corner, from vue-equipment’s MagicToast; while the drawer is open the
toaster moves into it, since a modal dialog leaves the rest of the page below
it and inert. It runs as a Cloudflare Worker: the pages and `/api` come from
one Nitro server, the wishes live in a D1 database and the pictures in an R2
bucket. Everyone can read; adding, editing and removing is behind a GitHub
sign-in. It is not for search engines: `robots.txt` disallows everything and
every page carries `noindex`.

The database is `packages/database`: the Drizzle schema, the migrations, the
wishes repository and the seed, with a README of its own. The API handlers
in `apps/wunschzettel/server/api/wishes` are thin: `GET` lists, `GET /:id`
reads one, `PUT /:id` upserts after `toWishForStorage` in
`shared/utils/transformers.ts` has shaped the body, `DELETE /:id` removes the
wish and its picture. `PUT /api/order` takes the ids in their new order and
numbers them in one batch; it sits outside `/api/wishes`, where a wish could
be called `order`. The list page reads them through `useWishes`, rendered
on the server, and `wishTransformer` turns a row into what a card shows.

| Field              | Shown as                                                       |
| ------------------ | -------------------------------------------------------------- |
| `title`            | The caption; its slug is the id and the picture’s name         |
| `url`              | Where the card links; its host, `bergzeit.de`, names the shop  |
| `shop`             | The shop’s name, in place of the host                          |
| `price`            | A number in euro, printed as `63,20 €`                         |
| `imageSource`      | The picture’s address on the shop                              |
| `imageTransparent` | Whether the picture came cut out, so it skips Cloudflare’s cut |
| `note`             | A line under the caption: size, colour, anything               |
| `added`            | When it came in, an ISO timestamp; newest first                |
| `position`         | Its place once dragged, from 1; 0 puts it first                |

### Pictures

When a wish is saved, the Worker fetches the picture from the shop and keeps
a copy in the bucket under the wish’s id (`server/utils/images.ts`), so the
list no longer depends on the shop keeping it. `/images/<id>/<version>`
serves that copy; if the save could not get it, the first request fetches it.
The version changes whenever the source does, so caches let go of a replaced
picture. In production the cards go through Cloudflare Images on the
production zone, which cuts the product out of its backdrop with
`segment=foreground` and resizes it for the grid; the Free plan covers 5,000
unique transformations a month, and since the pictures come from the zone
itself no other origin has to be allowed. In development they come straight
from the local bucket.

A picture the shop already cut out skips that cut. Cloudflare would ignore
its transparency and cut again from the colours under the transparent
pixels, where a shop may have left whatever it retouched away, and the soft
shadow would turn into a hard edge. When the Worker stores a copy it reads
from the file’s header whether the picture has transparency, a PNG, WebP,
AVIF or GIF with an alpha channel, and keeps that as `imageTransparent`
(`server/utils/transparency.ts`). Copies stored before, or seeded, are read
once per Worker isolate before the first API request. A picture with an
alpha channel but a solid backdrop keeps its backdrop.

The first four cards’ pictures come with the page, each with a preload link
and the share of the screen the grid gives it at every width, so the browser
asks for the size it shows; the rest load as they scroll into view and
measure themselves. Every picture fades in once it has loaded. A wish without
a picture shows the dashed square of an empty card, so the grid keeps its
shape.

### Adding a wish

Open `/add` and drag the 🎁 Wish link into the bookmarks bar. On a
shop’s product page, click it: it reads the product from the page’s JSON-LD
and Open Graph tags, name, brand, picture and price, strips tracking
parameters from the address and opens `/add` with the wish in the hash, so
nothing is sent anywhere until you save. Check the preview, fix what the
shop got wrong, compare prices on idealo or Geizhals, then click Save:
the wish is first on the list at once, with a toast that says so. A save that
fails says so too, with the server’s reason when it gave one, such as a
lapsed sign-in. `/add` without a product lists every wish with a Remove
button, which asks first in the same alert as the drawer and says so in a
toast if the removal fails. The page is served with the bookmarklet and the
list in its HTML; arriving with a product, an inline script marks the page
before it paints and the form takes their place.

The bookmarklet is `apps/wunschzettel/app/modules/Wish/bookmarklet/index.ts`,
a script in TypeScript. The Wish module minifies it with esbuild at build
time, and the add page links it with the site’s origin filled in, so a
preview build’s bookmarklet opens the preview. The bookmark carries its own
copy of the code: after a change, drag the link again.

### Editing a wish

Signed in, hover a card on the list and click Edit: a drawer slides in
from the right with the wish’s fields, the title, link and note from the card
at once and the rest from the record, read afresh from the database. Save
keeps the changes and closes the drawer with a toast; a failed save leaves it
open and says so in one. Remove asks first, in mirror’s `AlertDialog`, which
fades in over the drawer, then deletes the wish and its picture. Escape or a
click beside the drawer closes it; while the alert asks, Escape answers the
alert alone. The id stays when the title changes, and so does the time the
wish was added; a new picture address fetches the picture again. On a touch
screen the Edit buttons show without hovering, and the fields take 16px so
iOS does not zoom into them. The page keeps its scrollbar gutter while the
drawer locks it, so nothing moves when it opens.

### Sorting

Signed in, drag a card to another place on the list. The mouse has to move a
little before the card comes up, so a click still opens the shop; on a phone
a finger rests on the card first, so a swipe still scrolls. With the
keyboard, Space picks up the focused card, the arrow keys move it and Space
drops it. The picture lifts with a shadow, the other cards slide out of its
way, and on release it settles into its place. The order is saved at once,
for everyone; a save that fails puts the old order back and says so in a
toast.

`WishSortableGrid` wraps `WishGrid` in dnd-kit’s `DragDropProvider`
([`@dnd-kit/vue`](https://dndkit.com/vue/quickstart)), and each card is a
`WishSortableCard` with the card’s link as its handle. While a card is
dragged the grid renders the order a drop would leave, and dnd-kit slides
each card to its new place. The page loads the sortable grid only for a
signed-in visitor, so nobody else downloads dnd-kit.

### Not found

An address the Worker has no page for renders `app/error.vue` on the server,
in the same layout as every page: the header, then a single empty card where
the list’s first one would be, a dashed square with the status under it and a
link back to the list. Other errors get the same card with “Something went
wrong”.

### Sign in

`/add` and every write to `/api` need a session; the list and every `GET`
under `/api/wishes` stay open. The server reads the session while it renders
the list, so only a signed-in visitor gets the Edit links. Signing in works
with GitHub through
[`nuxt-auth-utils`](https://github.com/atinux/nuxt-auth-utils), and a
session lasts 90 days. `nuxt dev` stays open and shows the Edit links to
everyone.

Create an OAuth app under GitHub → Settings → Developer settings → OAuth
apps, with `https://wunschzettel.robinvey.com/auth/github` as the callback
URL, then generate a client secret. Set the values on the Worker as secrets,
with `pnpm exec wrangler secret put <NAME>` from `apps/wunschzettel`, or in
`apps/wunschzettel/.env` for `wrangler dev`:

```sh
NUXT_SESSION_PASSWORD=<32 random characters or more>
NUXT_OAUTH_GITHUB_CLIENT_ID=…
NUXT_OAUTH_GITHUB_CLIENT_SECRET=…
NUXT_ALLOWED_GITHUB_IDS=…
```

The allow list holds your numeric GitHub ID, not your login, since a login
can be renamed and then claimed by someone else. Find it at
`https://api.github.com/users/<login>`, or sign in once: the login page then
shows the ID that has to go on the list. Until the secrets are set, `/add`
says the sign-in is not set up yet.

## Deploy

The site is a Cloudflare Worker that serves only static files, from
`apps/personal/wrangler.jsonc`. The Wunschzettel is a Worker with a server,
from `apps/wunschzettel/wrangler.jsonc`: it names the Worker `wunschzettel`,
binds the D1 database `wunschzettel` as `DB`, the R2 bucket
`wunschzettel-images` as `IMAGES` and the built files as `ASSETS`, and sets
`wunschzettel.robinvey.com` as its Custom Domain; `workers_dev` is off, so
the GitHub redirect URI has one origin to match. Each is its own Workers
Builds project, and Workers Builds deploys every push to `main`. Both builds
run from the repository root:

| Setting        | Site                                             | Wunschzettel                                         |
| -------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Root directory | `/`                                              | `/`                                                  |
| Build command  | `pnpm build:personal`                            | `pnpm build:wunschzettel`                            |
| Deploy command | `pnpm --filter @robinscholz/personal run deploy` | `pnpm --filter @robinscholz/wunschzettel run deploy` |

The site’s `deploy` script is `wrangler deploy`. The Wunschzettel’s applies
pending migrations to the deployed database with
`wrangler d1 migrations apply DB --remote` first, then uploads the Worker.
`pnpm deploy:personal` and `pnpm deploy:wunschzettel` do the same from a
checkout, after a build. The `run` matters: without it, pnpm starts its own
`deploy` command instead. For the migrations, the build’s API token needs D1
edit access on top of what Workers Builds gives it. Set the Worker up once,
from `apps/wunschzettel`:

```sh
pnpm exec wrangler login
pnpm exec wrangler r2 bucket create wunschzettel-images
pnpm exec wrangler secret put NUXT_SESSION_PASSWORD
```

The D1 database exists and its id is in `wrangler.jsonc`. R2 has to be
enabled once in the Cloudflare dashboard before the bucket can be created.
Put every variable from “Sign in” the same way as `NUXT_SESSION_PASSWORD`,
and enable transformations for the `robinvey.com` zone under Images,
Transformations, so the pictures get their cut-out.

The site’s `public/_headers` caches the hashed files in `/_nuxt` for a year;
Nitro writes the same for the Wunschzettel. Everything else, the pages and
`cv.pdf` included, revalidates on every request, so a deploy shows up at
once.

The site’s Nitro preset is pinned to `static`: on Cloudflare’s build
machines Nitro would otherwise switch to a Worker preset, and its generated
config would take over `wrangler deploy`. The Wunschzettel’s is
`cloudflare-module`, and its `wrangler.jsonc` is written by hand, since the
generated one would know neither the database nor the bucket.

D1 keeps 30 days of point-in-time history. Roll the database back with
`wrangler d1 time-travel restore wunschzettel --timestamp=<time>`, or write a
dump with `wrangler d1 export wunschzettel --remote --output=wishes.sql`.

## Fonts

Mirage is Dreamtype’s face. The site takes it from `fonts.maas.engineering`,
and the CV and the preview image embed the cut in
`apps/personal/server/assets/fonts`. ABC Areal, licensed from Dinamo, is gone
from the tree but stays in the history, so keep this repository private
unless that history is rewritten.

## Tooling

- [Turborepo](https://turbo.build/repo), pnpm workspaces
- [Nuxt 4](https://nuxt.com), [Nuxt Content](https://content.nuxt.com)
- [mirror v2](https://github.com/magicasaservice/mirror), [vue-equipment](https://github.com/magicasaservice/vue-equipment), [magic-image](https://github.com/magicasaservice/magic-image)
- [`@jasy/pdf`](https://www.npmjs.com/package/@jasy/pdf) for the CV, [satori](https://github.com/vercel/satori) and [resvg](https://github.com/thx/resvg-js) for the preview image
- [`@nuxt/icon`](https://github.com/nuxt/icon) with the Symbols collection
- ESLint and Prettier presets from `@maas/config`
- [Drizzle](https://orm.drizzle.team) on [Cloudflare D1](https://developers.cloudflare.com/d1/), [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) for the Wunschzettel
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) with static assets, D1 and R2, deployed by Workers Builds
