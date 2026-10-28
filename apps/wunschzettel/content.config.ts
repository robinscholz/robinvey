import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Write days as YYYY-MM-DD')

export default defineContentConfig({
  collections: {
    list: defineCollection({
      type: 'data',
      source: 'index.yml',
      schema: z.object({
        title: z.string(),
        name: z.string(),
        description: z.string(),
        intro: z.string(),
      }),
    }),
    wishes: defineCollection({
      type: 'data',
      source: 'wishes/*.yml',
      schema: z.object({
        title: z.string(),
        url: z.url(),
        shop: z.string().optional(),
        price: z.number().optional(),
        image: z.url().optional(),
        note: z.string().optional(),
        added: day,
      }),
    }),
  },
})
