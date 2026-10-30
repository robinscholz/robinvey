# @robinscholz/wunschzettel

A wish list for the family: a grid of things, each a link to a shop in
Germany with a fair price and an easy return. It stands apart from the
site’s layer, [`@robinscholz/base`](../../packages/base/README.md): mirror
v2 with the stock tokens and none of the `robinvey` theme, a white page set
in Mirage like the site, at 14px on 20px in one weight, with a smaller size
for the Edit buttons and the fields at 16px on a touch screen, where a
smaller one would make iOS zoom in, a grid of pictures with a caption under
each, one to a row on a phone and up to four on a wide screen, on a page
capped at 2000px so a card in four columns is never wider than the widest in
three. In dark mode the page is black. It follows the system’s colour mode
until the switch at its foot, `UiColorModeSwitch` with Dark, Light and
System as on the site, is set: the choice stays in the browser, a change
cross-fades the page where the browser can, and the `theme-color` tags
follow, white or black. The switch renders in the browser alone and fetches
its Symbols icons from there, so the Worker never asks for one. The local
tokens in `tokens` merge over the stock tree: `config.json` points the grey
palette at neutral, so surface, primary and secondary carry no blue, and
`application.json` halves the focus line and its halo, to 1px and 2px. The
colours, radii and focus ring are mirror utilities, fields are underlined,
the drawer slides in from the right under the shadow the site’s page casts
onto its canvas and blurs and dims the page behind it, and every button is
`WishButton`, mirror’s `Button` as a ghost that fills in on hover: success
for Save, danger for Remove. A save answers with a toast 1rem in from the top
right corner, from vue-equipment’s MagicToast; while the drawer is open the
toaster moves into it, since a modal dialog leaves the rest of the page below
it and inert. It runs as a Cloudflare Worker: the pages and `/api` come from
one Nitro server, the wishes live in a D1 database and the pictures in an R2
bucket. Everyone can read; adding, editing and removing is behind a GitHub
sign-in. It is not for search engines: `robots.txt` disallows everything and
every page carries `noindex`.

Its icons are the 🎁 emoji, drawn on white by `scripts/icons.swift` at the
repository root, as the site’s are; from there:

```sh
swift scripts/icons.swift 🎁 '#ffffff' apps/wunschzettel/public
```

The database is [`packages/database`](../../packages/database/README.md):
the Drizzle schema, the migrations, the wishes repository and the seed, with
a README of its own. The API handlers in `server/api/wishes` are thin: `GET`
lists, `GET /:id` reads one, `PUT /:id` upserts after `toWishForStorage` in
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

## Pictures

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

## Adding a wish

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

The bookmarklet is `app/modules/Wish/bookmarklet/index.ts`, a script in
TypeScript. The Wish module minifies it with esbuild at build time, and the
add page links it with the site’s origin filled in, so a preview build’s
bookmarklet opens the preview. The bookmark carries its own copy of the
code: after a change, drag the link again.

## Editing a wish

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

## Sorting

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

## Preview image

`public/og.png` is the picture a shared link shows, 1200 by 630: the site’s
emoji canvas with fewer and larger tiles, six by three dot matrices of twelve
dots a side on white, tiled with 🎁 🎀 🎄 ⭐ 🎈 🔔 as the site’s is with its
mountains, each in turn along a row and four on from one row to the next, so
no two neighbours show the same. `scripts/og-canvas.swift` at the repository
root samples the emoji from Apple’s own art as `og-tiles.swift` does for the
site, draws the canvas and writes the picture; it is drawn there rather than
at build time, so the Worker carries no resvg. Run it again from the root to
change the emoji; at twelve dots a side only the ones with a strong outline
survive, which is why these six:

```sh
swift scripts/og-canvas.swift apps/wunschzettel/public 🎁 🎀 🎄 ⭐ 🎈 🔔
```

The list page’s Open Graph tags point at it from the site’s origin, so a
preview deploy shows its own copy.

## Not found

An address the Worker has no page for renders `app/error.vue` on the server,
in the same layout as every page: the header, then a single empty card where
the list’s first one would be, a dashed square with the status under it and a
link back to the list. Other errors get the same card with “Something went
wrong”.

## Sign in

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
with `pnpm exec wrangler secret put <NAME>` from this folder, or in `.env`
for `wrangler dev`:

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

## Development

`pnpm dev:wunschzettel` builds the mirror tokens first, then starts the app
on port 3001. It applies pending migrations to its local D1 database first,
then replaces the local wishes with the ones in production
(`scripts/pull-database.mjs`, also `pnpm db:pull`), so a local run shows the
list as it is online. It reads them with a plain query, since
`wrangler d1 export` holds up the live database while it runs, and drops the
local copy of any picture whose address changed. Offline or signed out of
wrangler, it keeps the local wishes and the run goes on. Saves, edits and
removals in development stay local and are gone at the next pull. Nuxt then
emulates the Cloudflare bindings through wrangler, and the first API request
seeds an empty database with the wishes in `packages/database/seed`.
Wrangler keeps that database and the local bucket under `.wrangler/state`,
ignored by git; `pnpm db:studio` opens the database in drizzle-kit studio.

`pnpm build:wunschzettel` writes the Worker to `.output`, and
`pnpm start:wunschzettel` runs that build in workerd, the runtime Cloudflare
uses, on port 3001 against the same local database, sign-in gate included.
Canonical URLs start from `https://wunschzettel.robinvey.com`; set
`NUXT_PUBLIC_SITE_URL` for a preview deploy, and the bookmarklet follows.

## Deploy

The Wunschzettel is a Worker with a server, from `wrangler.jsonc`: it names
the Worker `wunschzettel`, binds the D1 database `wunschzettel` as `DB`, the
R2 bucket `wunschzettel-images` as `IMAGES` and the built files as `ASSETS`,
and sets `wunschzettel.robinvey.com` as its Custom Domain; `workers_dev` is
off, so the GitHub redirect URI has one origin to match. The `deploy` script
applies pending migrations to the deployed database with
`wrangler d1 migrations apply DB --remote` first, then uploads the Worker;
Workers Builds runs it on every push to `main`, from the repository root,
with the settings in the root README, and `pnpm deploy:wunschzettel` does
the same from a checkout, after a build. For the migrations, the build’s API
token needs D1 edit access on top of what Workers Builds gives it. Set the
Worker up once, from this folder:

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

Nitro writes the cache headers: the hashed files in `/_nuxt` are cached for
a year, everything else revalidates on every request, so a deploy shows up
at once. The Nitro preset is `cloudflare-module`, and `wrangler.jsonc` is
written by hand, since the generated one would know neither the database
nor the bucket.

D1 keeps 30 days of point-in-time history. Roll the database back with
`wrangler d1 time-travel restore wunschzettel --timestamp=<time>`, or write a
dump with `wrangler d1 export wunschzettel --remote --output=wishes.sql`.
