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
import { CV_EMOJI_FONT, CV_FONT } from './fonts'
import { typeset } from './typeset'
import type {
  JasyDocument,
  PDFElement,
  TextOptions,
  TextStyle,
} from '@jasy/pdf'
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
  emoji: string
  children: Array<PDFElement>
}

interface CopyPayload {
  parts: Array<TypesetPart>
}

interface LinkedPayload {
  content: PDFElement
  href: string
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

interface ExperienceEntryPayload {
  entry: Experience
  names: Array<string>
}

interface ProjectEntryPayload {
  project: Project
  names: Array<string>
}

const INK = '#000000'
// The site’s light muted text, `app.color.surface.fg.muted` (stone 10), in
// sRGB: the PDF engine takes no oklch().
const MUTED = '#595954'
const SIZE = 9
const LINE_HEIGHT = 1.4
const LABEL_WIDTH = 96
const GUTTER = 16

const MARGIN = { top: 32, right: 40, bottom: 28, left: 40 }

// Space comes in lines: one between the entries of a section, two above a
// section, so the page keeps the rhythm of its text.
const LINE = SIZE * LINE_HEIGHT
const SECTION_SPACE = 2 * LINE

// The role and place under the name, all that follows the lead of a title
// and the footer step back in tone; everything else is set in black.
const muted: TextOptions = { color: MUTED }

// The Symbols arrow the site marks outbound links with, at weight 300, drawn
// one text size square like the site’s icons.
const ARROW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1152 1152"><path fill="${INK}" d="m328 873 475-476v244c0 22 18 40 40 40s40-18 40-40V301c0-22-18-40-40-40H504c-22 0-40 18-40 40s18 40 40 40h243L272 817c-8 8-12 17-12 28 0 22 18 40 40 40 11 0 21-4 28-12"/></svg>`
const ARROW_GAP = 1.5

const NO_BREAK_SPACE = '\u00A0'

// A word of one or two letters, which a line should not end on.
const SHORT_WORD = /(?<=^|\s)(\p{L}{1,2}) /gu

// For text that stays on one line: see `typeset` for why paragraphs are left
// to the font’s own kerning.
function copy({ parts }: CopyPayload): PDFElement {
  return Text(typeset({ parts, size: SIZE }))
}

// Running text, with the names the CV lists kept on one line and each short
// word kept with the word after it: their spaces become no-break spaces,
// which the engine never breaks at. The CV’s face draws them as narrow as its
// word space. Names go first: with the a in Magic as a Service already held,
// the name would no longer match.
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
function section({
  title,
  emoji,
  children,
}: SectionPayload): Array<PDFElement> {
  return children.map((child, index) =>
    Column({ keepTogether: true }, [
      Padding(
        { top: index === 0 ? SECTION_SPACE : LINE },
        Row({ gap: GUTTER, align: 'start' }, [
          Box(
            { width: LABEL_WIDTH },
            index === 0 ? [Text(`${emoji} ${title}`)] : []
          ),
          Expanded(child),
        ])
      ),
    ])
  )
}

// Set like the site’s header: who and where in the margin column, the
// summary beside it.
function header({ profile, cv, names }: HeaderPayload): PDFElement {
  return Row({ gap: GUTTER, align: 'start' }, [
    Box({ width: LABEL_WIDTH }, [
      Text(profile.name, { role: 'h1' }),
      Text(profile.role, muted),
      Text(profile.location, muted),
    ]),
    Expanded(Text(prose({ text: cv.summary, names }))),
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
  return Column(entries.map(({ text, href }) => Text(text, { href })))
}

// The role leads, and the company and years after it step back. An entry
// without a role leads with its company.
function experienceHead(entry: Experience): PDFElement {
  const link: TextStyle = entry.url ? { href: entry.url } : {}
  const head: Array<TypesetPart> = entry.role
    ? [
        { text: entry.role },
        { text: ', ', style: muted },
        { text: entry.company, style: { ...muted, ...link } },
      ]
    : [{ text: entry.company, style: link }]
  return copy({
    parts: [...head, { text: `, ${entry.period}`, style: muted }],
  })
}

function experienceEntry({ entry, names }: ExperienceEntryPayload): PDFElement {
  return Column({ gap: 3, keepTogether: true }, [
    experienceHead(entry),
    // The site shows the summary alone; the CV carries on into the highlights,
    // which are written as sentences, so each role reads as one paragraph.
    ...paragraphs({
      text: [entry.summary, ...entry.highlights].join(' ').trim(),
      names,
    }),
  ])
}

function projectEntry({ project, names }: ProjectEntryPayload): PDFElement {
  const head = copy({
    parts: [
      { text: project.name, style: project.url ? { href: project.url } : {} },
      { text: `, ${project.year}`, style: muted },
    ],
  })
  return Column({ gap: 3, keepTogether: true }, [
    project.url ? linked({ content: head, href: project.url }) : head,
    Text(prose({ text: project.description, names })),
  ])
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
      emoji: '🌀',
      children: experience.map((entry) => experienceEntry({ entry, names })),
    },
    {
      title: 'Projects',
      emoji: '🧰',
      children: projects.map((project) => projectEntry({ project, names })),
    },
    {
      title: 'Education',
      emoji: '🧩',
      children: cv.education.map((entry) =>
        copy({
          parts: [
            { text: entry.degree },
            { text: `, ${entry.institution}, ${entry.period}`, style: muted },
          ],
        })
      ),
    },
    {
      title: 'Interests',
      emoji: '🌍',
      children: paragraphs({ text: cv.interests, names }),
    },
    { title: 'Contact', emoji: '🐌', children: [contact(profile)] },
  ]

  const footer = Padding(
    { top: 12 },
    Text(`Updated ${updated}`, { ...muted, align: 'right' })
  )

  return Document(
    {
      font: CV_FONT,
      emoji: CV_EMOJI_FONT,
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
        [
          header({ profile, cv, names }),
          ...sections.flatMap((entry) => section(entry)),
        ]
      ),
    ]
  )
}
