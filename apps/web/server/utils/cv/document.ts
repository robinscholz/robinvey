import {
  Box,
  Column,
  Document,
  Expanded,
  Link,
  Padding,
  Page,
  Row,
  Svg,
  Text,
} from '@jasy/pdf'
import { CV_FONT } from './fonts'
import { typeset } from './typeset'
import type {
  JasyDocument,
  PDFElement,
  TextOptions,
  TextStyle,
} from '@jasy/pdf'

interface CvDocumentPayload {
  profile: Profile
  experience: Array<Experience>
  projects: Array<Project>
  cv: Cv
  updated: string
}

interface SectionPayload {
  title: string
  children: Array<PDFElement>
}

interface EntryHeadPayload {
  main: PDFElement
  aside: string
}

interface CopyPayload {
  text: string
  style?: TextStyle
}

interface LinkedPayload {
  content: PDFElement
  href: string
}

const INK = '#1d1d1a'
const MUTED = '#6f6f69'
const SIZE = 9
const LINE_HEIGHT = 1.4
const LABEL_WIDTH = 96
const GUTTER = 16

const MARGIN = { top: 32, right: 40, bottom: 28, left: 40 }

// Space comes in lines: one between the entries of a section, two above a
// section, so the page keeps the rhythm of its text.
const LINE = SIZE * LINE_HEIGHT
const SECTION_SPACE = 2 * LINE

// The Symbols arrow the site marks outbound links with, at weight 300, drawn
// one text size square like the site’s icons.
const ARROW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1152 1152"><path fill="${MUTED}" d="m328 873 475-476v244c0 22 18 40 40 40s40-18 40-40V301c0-22-18-40-40-40H504c-22 0-40 18-40 40s18 40 40 40h243L272 817c-8 8-12 17-12 28 0 22 18 40 40 40 11 0 21-4 28-12"/></svg>`
const ARROW_GAP = 1.5

const muted: TextOptions = { color: MUTED }

// For text that stays on one line: see `typeset` for why paragraphs are left
// to the font’s own kerning.
function copy({ text, style }: CopyPayload) {
  return typeset({ text, size: SIZE, style })
}

function paragraphs(text: string): Array<PDFElement> {
  return text ? [Text(text)] : []
}

// Linked text followed by the site’s arrow, which links too.
function linked({ content, href }: LinkedPayload): PDFElement {
  return Row({ gap: ARROW_GAP, align: 'center' }, [
    content,
    Link({ href }, Svg(ARROW, { width: SIZE })),
  ])
}

// The engine moves a block to the next page only when it sits directly on the
// page, so every entry becomes its own page-level block, kept whole. The first
// carries the label and the space above it, so a heading never ends a page
// alone.
function section({ title, children }: SectionPayload): Array<PDFElement> {
  return children.map((child, index) =>
    Column({ keepTogether: true }, [
      Padding(
        { top: index === 0 ? SECTION_SPACE : LINE },
        Row({ gap: GUTTER, align: 'start' }, [
          Box({ width: LABEL_WIDTH }, index === 0 ? [Text(title, muted)] : []),
          Expanded(child),
        ])
      ),
    ])
  )
}

function entryHead({ main, aside }: EntryHeadPayload): PDFElement {
  return Row({ gap: 12, align: 'start' }, [
    Expanded(main),
    Text(copy({ text: aside }), muted),
  ])
}

// Set like the site’s header: who and where in the margin column, the
// summary beside it.
function header({ profile, cv }: CvDocumentPayload): PDFElement {
  return Row({ gap: GUTTER, align: 'start' }, [
    Box({ width: LABEL_WIDTH }, [
      Text(profile.name, { role: 'h1' }),
      Text(profile.role, muted),
      Text(profile.location, muted),
    ]),
    Expanded(Text(cv.summary)),
  ])
}

function contact(profile: Profile): PDFElement {
  const entries = [
    { text: profile.email, href: `mailto:${profile.email}` },
    ...profile.links.map((link) => ({
      text: formatLink(link.url),
      href: link.url,
    })),
  ]
  return Column(
    entries.map(({ text, href }) =>
      linked({ content: Text(text, { href }), href })
    )
  )
}

function experienceHead(entry: Experience): PDFElement {
  const head = Text([
    ...(entry.role ? copy({ text: `${entry.role}, ` }) : []),
    ...copy({
      text: entry.company,
      style: entry.url ? { href: entry.url } : {},
    }),
  ])
  return entry.url ? linked({ content: head, href: entry.url }) : head
}

function experienceEntry(entry: Experience): PDFElement {
  return Column({ gap: 3, keepTogether: true }, [
    entryHead({ main: experienceHead(entry), aside: entry.period }),
    // The site shows the summary alone; the CV carries on into the highlights,
    // which are written as sentences, so each role reads as one paragraph.
    ...paragraphs([entry.summary, ...entry.highlights].join(' ').trim()),
  ])
}

function projectEntry(project: Project): PDFElement {
  const name = Text(
    copy({
      text: project.name,
      style: project.url ? { href: project.url } : {},
    })
  )
  return Column({ gap: 3, keepTogether: true }, [
    entryHead({
      main: project.url ? linked({ content: name, href: project.url }) : name,
      aside: project.year,
    }),
    Text(project.description),
  ])
}

export function cvDocument(payload: CvDocumentPayload): JasyDocument {
  const { profile, experience, projects, cv, updated } = payload

  const sections: Array<SectionPayload> = [
    { title: 'Experience', children: experience.map(experienceEntry) },
    { title: 'Projects', children: projects.map(projectEntry) },
    {
      title: 'Education',
      children: cv.education.map((entry) =>
        entryHead({
          main: Text(copy({ text: `${entry.degree}, ${entry.institution}` })),
          aside: entry.period,
        })
      ),
    },
    { title: 'Languages', children: paragraphs(cv.languages) },
    { title: 'Interests', children: paragraphs(cv.interests) },
    { title: 'Contact', children: [contact(profile)] },
  ]

  const footer = Padding(
    { top: 12 },
    Text(`Updated ${updated}`, { ...muted, align: 'right' })
  )

  return Document(
    {
      font: CV_FONT,
      size: SIZE,
      lineHeight: LINE_HEIGHT,
      color: INK,
      meta: { title: `${profile.name}, CV`, author: profile.name },
    },
    [
      Page(
        {
          size: 'A4',
          margin: MARGIN,
          footer,
        },
        [header(payload), ...sections.flatMap((entry) => section(entry))]
      ),
    ]
  )
}
