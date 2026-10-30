import { queryCollection } from '@nuxt/content/server'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { SEMI_MONO_FILE } from '../utils/cv/fonts'
import { OG_FONT, OG_SIZE, ogCard } from '../utils/og/card'

// The picture a link to the site shows where it is shared, drawn from the
// same profile as the page and set in the CV’s cut of the face. The build
// prerenders it to a static og.png.
export default defineEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig(event).public

  const [profile, semiMono] = await Promise.all([
    queryCollection(event, 'profile').first(),
    readFont(SEMI_MONO_FILE),
  ])

  const svg = await satori(
    ogCard({
      profile: profileTransformer(profile),
      host: new URL(siteUrl).host,
    }),
    {
      ...OG_SIZE,
      fonts: [
        {
          name: OG_FONT,
          data: Buffer.from(semiMono),
          weight: 400,
          style: 'normal',
        },
      ],
    }
  )

  setResponseHeaders(event, { 'Content-Type': 'image/png' })

  return new Resvg(svg).render().asPng()
})
