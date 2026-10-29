# @robinscholz/database

One Cloudflare D1 database for the Wunschzettel. Drizzle owns the schema,
drizzle-kit owns the migrations, and the app only ever talks to the
repository exported from `index.ts`. Every function takes the database as
its first argument and returns a promise; the app’s `useDatabase()` builds
it from the `DB` binding.

## The table

`wishes` holds one row per wish: `id` (the slug of the title, also the
picture’s name), `title`, `url`, `shop`, `price`, `note`, `added` (a day,
`YYYY-MM-DD`), and the picture as `image_source`, its address on the shop,
with `image_version`, a number that changes whenever the source does, and
`image_transparent`, whether the stored copy came with transparency (null
until it is checked). The picture itself lives in the app’s R2 bucket under
the id; see the app’s README.

## Where the database lives

The deployed database is the D1 database `wunschzettel`, bound as `DB` in
`apps/wunschzettel/wrangler.jsonc`. Locally, wrangler keeps it as a SQLite
file under `apps/wunschzettel/.wrangler/state`, ignored by git, and
`nuxt dev` and `wrangler dev` share it. `pnpm db:studio` opens that file in
drizzle-kit studio.

An empty database is seeded with the wishes in `seed/wishes.ts` on the first
API request of a Worker isolate.

## Migrations

Schema changes go through drizzle-kit:

```sh
pnpm db:generate --name <what-changed>
```

That diffs `src/schema.ts` against `migrations/meta` and writes a new SQL
migration. Commit the result. The app’s `dev` and `start` scripts apply
pending migrations to the local database, and its `deploy` script applies
them to the deployed one before uploading the Worker.
