# robinvey

Robin Vey’s personal website and CV, and a Wunschzettel for the family. Two
Nuxt 4 apps: the site, generated as a static site from Nuxt Content on a
layer with mirror v2 and vue-equipment, and the Wunschzettel, a Cloudflare
Worker with a D1 database and an R2 bucket behind it. The CV is the same
content as the site rendered to `/cv.pdf` at build time.

## Apps and packages

Each has a README of its own.

| Path                                               | Package                     | Contents                                                                                                                    |
| -------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [`apps/personal`](apps/personal/README.md)         | `@robinscholz/personal`     | The one-page site, the content collections, the Profile module, the `/cv.pdf` route and the preview image                   |
| [`apps/wunschzettel`](apps/wunschzettel/README.md) | `@robinscholz/wunschzettel` | The wish list: the Wish module, the pages, the API, the picture store, the sign-in gate and the bookmarklet                 |
| [`packages/base`](packages/base/README.md)         | `@robinscholz/base`         | The site’s Nuxt layer: mirror and vue-equipment wiring, the token theme and its fonts, type system, Ui and the emoji canvas |
| [`packages/database`](packages/database/README.md) | `@robinscholz/database`     | The Wunschzettel’s D1 database: Drizzle schema, migrations, the wishes repository and the seed                              |

## Setup

```sh
pnpm install
pnpm dev
```

`dev` builds the mirror tokens in `packages/base` and `apps/wunschzettel`
first, then starts the site on port 3000 and the Wunschzettel on port 3001;
`pnpm dev:personal` and `pnpm dev:wunschzettel` start one of them. The
Wunschzettel applies pending migrations to its local D1 database first, then
replaces the local wishes with the ones in production, so a local run shows
the list as it is online; its README has the details.

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

## Deploy

Each app is a Cloudflare Worker with a `wrangler.jsonc` of its own, and each
is its own Workers Builds project; Workers Builds deploys every push to
`main`. Both builds run from the repository root:

| Setting        | Site                                             | Wunschzettel                                         |
| -------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Root directory | `/`                                              | `/`                                                  |
| Build command  | `pnpm build:personal`                            | `pnpm build:wunschzettel`                            |
| Deploy command | `pnpm --filter @robinscholz/personal run deploy` | `pnpm --filter @robinscholz/wunschzettel run deploy` |

Each `deploy` script uploads its Worker, the Wunschzettel’s after applying
pending migrations to the deployed database, for which the build’s API token
needs D1 edit access on top of what Workers Builds gives it.
`pnpm deploy:personal` and `pnpm deploy:wunschzettel` do the same from a
checkout, after a build. The `run` matters: without it, pnpm starts its own
`deploy` command instead. What each Worker needs set up once, and how it
serves, is in its README.

## Fonts

Mirage is Dreamtype’s face. The site takes it from `fonts.maas.engineering`,
and the CV embeds the cut in `apps/personal/server/assets/fonts`. ABC Areal,
licensed from Dinamo, is gone from the tree but stays in the history, so keep
this repository private unless that history is rewritten.

## Tooling

- [Turborepo](https://turbo.build/repo), pnpm workspaces
- [Nuxt 4](https://nuxt.com), [Nuxt Content](https://content.nuxt.com)
- [mirror v2](https://github.com/magicasaservice/mirror), [vue-equipment](https://github.com/magicasaservice/vue-equipment), [magic-image](https://github.com/magicasaservice/magic-image)
- [`@jasy/pdf`](https://www.npmjs.com/package/@jasy/pdf) for the CV, [resvg](https://github.com/thx/resvg-js) for the preview image
- [`@nuxt/icon`](https://github.com/nuxt/icon) with the Symbols collection
- ESLint and Prettier presets from `@maas/config`
- [Drizzle](https://orm.drizzle.team) on [Cloudflare D1](https://developers.cloudflare.com/d1/), [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) for the Wunschzettel
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) with static assets, D1 and R2, deployed by Workers Builds
