# robinvey

Robin Vey’s personal website and CV, and a Wunschzettel for the family. Two
Nuxt 4 apps: the site, generated as a static site from Nuxt Content on a
layer with mirror v2 and vue-equipment, and the Wunschzettel, a Cloudflare
Worker with a D1 database and an R2 bucket behind it. The CV is the same
content as the site rendered to `/cv.pdf` at build time.

## Apps and packages

| Path                | Package                     | Contents                                                                                                             |
| ------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `apps/web`          | `@robinscholz/web`          | The one-page site, the content collections, the Profile module and the `/cv.pdf` route                               |
| `apps/wunschzettel` | `@robinscholz/wunschzettel` | The wish list: the Wish module, the pages, the API, the picture store, the sign-in gate and the bookmarklet          |
| `packages/base`     | `@robinscholz/base`         | The site’s Nuxt layer: mirror, vue-equipment and magic-image wiring, the token theme, type system, Ui and the garden |
| `packages/database` | `@robinscholz/database`     | The Wunschzettel’s D1 database: Drizzle schema, migrations, the wishes repository and the seed                       |

## Setup

```sh
pnpm install
pnpm dev
```

`dev` builds the mirror tokens in `packages/base` and `apps/wunschzettel`
first, then starts the site on
port 3000 and the Wunschzettel on port 3001; `pnpm dev:web` and
`pnpm dev:wunschzettel` start one of them. `/cv.pdf` renders on every request in development.
The Wunschzettel applies pending migrations to its local D1 database first,
then replaces the local wishes with the ones in production
(`apps/wunschzettel/scripts/pull-database.mjs`, also `pnpm db:pull` from
`apps/wunschzettel`), so a local run shows the list as it is online. It reads
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
pnpm preview
```

`build` writes the static site to `apps/web/.output/public`, `cv.pdf`
included, and the Wunschzettel’s Worker to `apps/wunschzettel/.output`.
`preview` serves the site the way Cloudflare does, with the same cache
headers and 404 page, on port 8787. `pnpm start:wunschzettel` runs the
Wunschzettel’s production build in workerd, the runtime Cloudflare uses, on
port 3001 against the same local database, sign-in gate included. Canonical
URLs, the links printed on the CV
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
link to a shop in Germany with a fair price and an easy return. It stands
apart from the site’s layer: mirror v2 with the stock tokens and none of the
`robinvey` theme, a white page in the system font, one size of type with a
smaller one for the Edit buttons, a grid of pictures with a caption under
each, no dark mode. The local tokens in `apps/wunschzettel/tokens` merge over
the stock tree: `config.json` points the grey palette at neutral, so
surface, primary and secondary carry no blue, and `application.json` halves
the focus line and its halo, to 1px and 2px. The colours, radii and focus
ring are mirror utilities, fields are underlined, and every button is
`WishButton`, mirror’s `Button` as a ghost that fills in on hover: success
for Save, danger for Remove. A save answers with a toast at the top right,
from vue-equipment’s MagicToast, lined up with the page edge and the header
line; while the drawer is open the toaster moves into it, since a modal
dialog leaves the rest of the page below it and inert. It runs as
a Cloudflare Worker: the pages and `/api` come from one Nitro server, the
wishes live in a D1 database and the pictures in an R2 bucket. Everyone can
read; adding, editing and removing is behind a GitHub sign-in. It is not for
search engines: `robots.txt` disallows everything and every page carries
`noindex`.

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

### Adding a wish

Open `/add` and drag the 🎁 Wish link into the bookmarks bar. On a
shop’s product page, click it: it reads the product from the page’s JSON-LD
and Open Graph tags, name, brand, picture and price, strips tracking
parameters from the address and opens `/add` with the wish in the hash, so
nothing is sent anywhere until you save. Check the preview, fix what the
shop got wrong, compare prices on idealo or Geizhals, then click Save:
the wish is first on the list at once, with a toast that says so. A save that
fails says so too, with the server’s reason when it gave one, such as a
lapsed sign-in. `/add` without a product lists every wish
with a Remove link.

The bookmarklet is `apps/wunschzettel/app/modules/Wish/bookmarklet/index.ts`,
a script in TypeScript. The Wish module minifies it with esbuild at build
time, and the add page links it with the site’s origin filled in, so a
preview build’s bookmarklet opens the preview. The bookmark carries its own
copy of the code: after a change, drag the link again.

### Editing a wish

Signed in, hover a card on the list and click Edit: a drawer slides in
from the right with the wish’s fields, read afresh from the database.
Save keeps the changes and closes the drawer with a toast; a failed save
leaves it open and says so in one. Remove asks first, in mirror’s `AlertDialog`, then
deletes the wish and its picture. Escape or a click beside the drawer closes
it; while the alert asks, Escape answers the alert alone. The id stays when the title changes,
and so does the time the wish was added; a new picture address fetches the
picture again. On a touch screen the Edit buttons show without hovering.

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
`wrangler.jsonc` at the root. The Wunschzettel is a Worker with a server,
from `apps/wunschzettel/wrangler.jsonc`: it names the Worker `wunschzettel`,
binds the D1 database `wunschzettel` as `DB`, the R2 bucket
`wunschzettel-images` as `IMAGES` and the built files as `ASSETS`, and sets
`wunschzettel.robinvey.com` as its Custom Domain; `workers_dev` is off, so
the GitHub redirect URI has one origin to match. Each is its own Workers
Builds project, and Workers Builds deploys every push to `main`. Both builds
run from the repository root:

| Setting        | Site                  | Wunschzettel                                         |
| -------------- | --------------------- | ---------------------------------------------------- |
| Root directory | `/`                   | `/`                                                  |
| Build command  | `pnpm build`          | `pnpm --filter @robinscholz/wunschzettel build`      |
| Deploy command | `npx wrangler deploy` | `pnpm --filter @robinscholz/wunschzettel run deploy` |

The Wunschzettel’s `deploy` script applies pending migrations to the
deployed database with `wrangler d1 migrations apply DB --remote`, then
uploads the Worker; `pnpm deploy:wunschzettel` does the same from a
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

ABC Areal is licensed from Dinamo. The font files are committed, so keep this
repository private.

## Tooling

- [Turborepo](https://turbo.build/repo), pnpm workspaces
- [Nuxt 4](https://nuxt.com), [Nuxt Content](https://content.nuxt.com)
- [mirror v2](https://github.com/magicasaservice/mirror), [vue-equipment](https://github.com/magicasaservice/vue-equipment), [magic-image](https://github.com/magicasaservice/magic-image)
- [`@jasy/pdf`](https://www.npmjs.com/package/@jasy/pdf) for the CV
- [`@nuxt/icon`](https://github.com/nuxt/icon) with the Symbols collection
- ESLint and Prettier presets from `@maas/config`
- [Drizzle](https://orm.drizzle.team) on [Cloudflare D1](https://developers.cloudflare.com/d1/), [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) for the Wunschzettel
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) with static assets, D1 and R2, deployed by Workers Builds
