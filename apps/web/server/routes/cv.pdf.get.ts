import { renderToBytes } from '@jasy/pdf'
import { queryCollection } from '@nuxt/content/server'
import { cvDocument } from '../utils/cv/document'
import { loadCvFonts } from '../utils/cv/fonts'
import { withDocumentInfo } from '../utils/cv/info'

export default defineEventHandler(async (event) => {
  const { updatedAt } = useRuntimeConfig(event).public

  const [profile, experience, projects, cv, fonts] = await Promise.all([
    queryCollection(event, 'profile').first(),
    queryCollection(event, 'experience').order('start', 'DESC').all(),
    queryCollection(event, 'projects').order('stem', 'ASC').all(),
    queryCollection(event, 'cv').first(),
    loadCvFonts(),
  ])

  const person = profileTransformer(profile)
  const title = `${person.name}, CV`

  const document = cvDocument({
    profile: person,
    experience: experience.map(experienceTransformer),
    projects: projects.map(projectTransformer),
    cv: cvTransformer(cv),
    updated: formatLongMonth(updatedAt),
  })

  const rendered = await renderToBytes(document, {
    fonts,
    standardFonts: false,
    accessible: true,
    lang: 'en-GB',
    title,
  })

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="cv.pdf"',
  })

  return withDocumentInfo({ bytes: rendered, title, author: person.name })
})
