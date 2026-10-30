import {
  Box,
  Column,
  Document,
  Expanded,
  Padding,
  Page,
  Row,
  Text,
} from '@jasy/pdf'
import { CV_FONT } from './fonts'
import { typeset } from './typeset'
import type { JasyDocument, PDFElement, TextOptions } from '@jasy/pdf'
import type { TypesetPart } from './typeset'

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

interface CopyPayload {
  parts: Array<TypesetPart>
}

interface ProsePayload {
  text: string
  names: Array<string>
}

interface HeaderPayload {
  profile: Profile
  cv: Cv
  names: Array<string>
}

interface RowPayload {
  meta: string
  children: Array<PDFElement>
}

interface ExperienceEntryPayload {
  entry: Experience
  names: Array<string>
}

interface ProjectEntryPayload {
  project: Project
  names: Array<string>
}

// The site’s ink and muted ink in sRGB: `app.color.surface.fg` and
// `fg.muted` of the light mode, which the PDF engine takes no oklch() for.
const INK = '#161615'
const MUTED = '#595954'

// The site’s type at the page’s scale: one size, on 1.6 leading, in a
// measure of about 64 characters, flush left in the margin.
const SIZE = 9
const LINE_HEIGHT = 1.6
const MEASURE = 420
const MARGIN = { top: 48, right: 48, bottom: 40, left: 48 }

// The dates beside an entry, as on the site’s rows: a column of ten
// characters in the muted ink, two characters from the text.
const META_WIDTH = 56
const GUTTER = 10

// Space comes in lines: two above a section and half a line under its
// heading, as on the site, and one between the entries of a section.
const LINE = SIZE * LINE_HEIGHT
const SECTION_SPACE = 2 * LINE
const HEADING_SPACE = LINE / 2
const ENTRY_GAP = 3

const muted: TextOptions = { color: MUTED }

const NO_BREAK_SPACE = ' '

// A word of one or two letters, which a line should not end on.
const SHORT_WORD = /(?<=^|\s)(\p{L}{1,2}) /gu

// For text that stays on one line: see `typeset` for why paragraphs are left
// to the font’s own kerning.
function copy({ parts }: CopyPayload): PDFElement {
  return Text(typeset({ parts, size: SIZE }))
}

// Running text, with the names the CV lists kept on one line and each short
// word kept with the word after it: their spaces become no-break spaces,
// which the engine never breaks at. Names go first: with the a in Magic as a
// Service already held, the name would no longer match.
function prose({ text, names }: ProsePayload): string {
  return names
    .reduce(
      (result, name) =>
        result.replaceAll(name, name.replaceAll(' ', NO_BREAK_SPACE)),
      text
    )
    .replace(SHORT_WORD, `$1${NO_BREAK_SPACE}`)
}

function paragraphs(payload: ProsePayload): Array<PDFElement> {
  return payload.text ? [Text(prose(payload))] : []
}

// A row of the site’s lists: the dates in the margin, the entry beside them.
function row({ meta, children }: RowPayload): PDFElement {
  return Row({ gap: GUTTER, align: 'start' }, [
    Box({ width: META_WIDTH }, [
      copy({ parts: [{ text: meta, style: muted }] }),
    ]),
    Expanded(Column({ gap: ENTRY_GAP }, children)),
  ])
}

// The engine moves a block to the next page only when it sits directly on the
// page, so every entry becomes its own page-level block, kept whole. The first
// carries the heading and the space above it, so a heading never ends a page
// alone.
function section({ title, children }: SectionPayload): Array<PDFElement> {
  return children.map((child, index) =>
    Column({ keepTogether: true }, [
      Padding(
        { top: index === 0 ? SECTION_SPACE : LINE },
        index === 0
          ? Column({ gap: HEADING_SPACE }, [Text(title, { role: 'h2' }), child])
          : child
      ),
    ])
  )
}

// Set like the site’s header: the name, a line, then the summary.
function header({ profile, cv, names }: HeaderPayload): PDFElement {
  return Column({ gap: LINE }, [
    Text(profile.name, { role: 'h1' }),
    Text(prose({ text: cv.summary, names })),
  ])
}

function contact(profile: Profile): PDFElement {
  const entries = [
    { text: profile.email, href: `mailto:${profile.email}` },
    ...profile.links.map((url) => ({ text: formatLink(url), href: url })),
  ]
  return Column(entries.map(({ text, href }) => Text(text, { href })))
}

// The link under an entry, in the muted ink, as under an open row on the site.
function linkLine(entry: { url?: string; link: string }): Array<PDFElement> {
  return entry.url ? [Text(entry.link, { ...muted, href: entry.url })] : []
}

// The company leads and the role follows, in the ink. The site shows the
// summary alone; the CV carries on into the highlights, which are written
// as sentences, so each role reads as one paragraph.
function experienceEntry({ entry, names }: ExperienceEntryPayload): PDFElement {
  const head = entry.role ? `${entry.company}, ${entry.role}` : entry.company
  return row({
    meta: entry.period,
    children: [
      Text(head),
      ...paragraphs({
        text: [entry.summary, ...entry.highlights].join(' ').trim(),
        names,
      }),
      ...linkLine(entry),
    ],
  })
}

function projectEntry({ project, names }: ProjectEntryPayload): PDFElement {
  return row({
    meta: String(project.year),
    children: [
      Text(project.name),
      Text(prose({ text: project.description, names })),
      ...linkLine(project),
    ],
  })
}

export function cvDocument(payload: CvDocumentPayload): JasyDocument {
  const { profile, experience, projects, cv, updated } = payload
  const names = [
    ...experience.map((entry) => entry.company),
    ...cv.education.map((entry) => entry.institution),
  ]

  const sections: Array<SectionPayload> = [
    {
      title: 'Experience',
      children: experience.map((entry) => experienceEntry({ entry, names })),
    },
    {
      title: 'Projects',
      children: projects.map((project) => projectEntry({ project, names })),
    },
    {
      title: 'Education',
      children: cv.education.map((entry) =>
        row({
          meta: entry.period,
          children: [Text(`${entry.degree}, ${entry.institution}`)],
        })
      ),
    },
    {
      title: 'Interests',
      children: paragraphs({ text: cv.interests, names }),
    },
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
      Page({ size: 'A4', margin: MARGIN, footer }, [
        Box({ width: MEASURE }, [
          header({ profile, cv, names }),
          ...sections.flatMap((entry) => section(entry)),
        ]),
      ]),
    ]
  )
}
