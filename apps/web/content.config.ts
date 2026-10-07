import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

const period = z
  .string()
  .regex(/^\d{4}(-\d{2})?$/, 'Write years as YYYY, or months as YYYY-MM')
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Write days as YYYY-MM-DD')

export default defineContentConfig({
  collections: {
    pages: defineCollection({
      type: 'page',
      source: 'index.md',
      schema: z.object({
        colophon: z.string().optional(),
      }),
    }),
    contact: defineCollection({
      type: 'page',
      source: 'contact.md',
    }),
    profile: defineCollection({
      type: 'data',
      source: 'profile.yml',
      schema: z.object({
        name: z.string(),
        role: z.string(),
        location: z.string(),
        email: z.string(),
        now: z.string(),
        links: z.array(z.object({ label: z.string(), url: z.string() })),
      }),
    }),
    experience: defineCollection({
      type: 'data',
      source: 'experience/*.yml',
      schema: z.object({
        company: z.string(),
        url: z.string().optional(),
        role: z.string().optional(),
        location: z.string().optional(),
        start: period,
        end: period.optional(),
        summary: z.string().optional(),
        highlights: z.array(z.string()).optional(),
      }),
    }),
    projects: defineCollection({
      type: 'data',
      source: 'projects/*.yml',
      schema: z.object({
        name: z.string(),
        description: z.string(),
        year: z.number(),
        url: z.string().optional(),
        image: z.object({ src: z.string(), alt: z.string() }).optional(),
      }),
    }),
    sites: defineCollection({
      type: 'data',
      source: 'sites/*.yml',
      schema: z.object({
        name: z.string(),
        kind: z.string(),
        year: z.number(),
        url: z.string(),
      }),
    }),
    writing: defineCollection({
      type: 'data',
      source: 'writing/*.yml',
      schema: z.object({
        title: z.string(),
        date: day,
        url: z.string(),
      }),
    }),
    cv: defineCollection({
      type: 'data',
      source: 'cv.yml',
      schema: z.object({
        summary: z.string(),
        education: z
          .array(
            z.object({
              institution: z.string(),
              degree: z.string(),
              start: period.optional(),
              end: period,
            })
          )
          .optional(),
        languages: z.array(z.object({ name: z.string(), level: z.string() })),
        interests: z.string().optional(),
      }),
    }),
  },
})
