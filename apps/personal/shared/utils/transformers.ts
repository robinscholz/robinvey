import { formatLink, formatMonth, formatPeriod, formatYears } from './format'
import type {
  ContactCollectionItem,
  CvCollectionItem,
  ExperienceCollectionItem,
  PagesCollectionItem,
  ProfileCollectionItem,
  ProjectsCollectionItem,
  SitesCollectionItem,
  WritingCollectionItem,
} from '@nuxt/content'

// The document itself stays whole, since ContentRenderer is what reads it.
export function pageTransformer(item: PagesCollectionItem | null) {
  return {
    document: item,
    description: item?.description ?? '',
    colophon: item?.colophon ?? '',
  }
}

export function contactTransformer(item: ContactCollectionItem | null) {
  return { document: item }
}

export function profileTransformer(item: ProfileCollectionItem | null) {
  return {
    name: item?.name ?? '',
    role: item?.role ?? '',
    location: item?.location ?? '',
    email: item?.email ?? '',
    links: item?.links ?? [],
  }
}

export function experienceTransformer(item: ExperienceCollectionItem) {
  const summary = item.summary ?? ''
  const url = item.url ?? ''
  return {
    id: item.id,
    company: item.company,
    url,
    link: url ? formatLink(url) : '',
    role: item.role ?? '',
    years: formatYears({ start: item.start, end: item.end }),
    period: formatPeriod({ start: item.start, end: item.end }),
    summary,
    highlights: item.highlights ?? [],
    expandable: Boolean(summary || url),
  }
}

export function projectTransformer(item: ProjectsCollectionItem) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    year: String(item.year),
    url: item.url ?? '',
    link: item.url ? formatLink(item.url) : '',
  }
}

export function siteTransformer(item: SitesCollectionItem) {
  return {
    id: item.id,
    name: item.name,
    kind: item.kind,
    year: String(item.year),
    url: item.url,
  }
}

export function writingTransformer(item: WritingCollectionItem) {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    month: formatMonth(item.date),
  }
}

export function cvTransformer(item: CvCollectionItem | null) {
  return {
    summary: item?.summary ?? '',
    education: (item?.education ?? []).map((entry) => ({
      institution: entry.institution,
      degree: entry.degree,
      period: formatPeriod({ start: entry.start, end: entry.end }),
    })),
    interests: item?.interests ?? '',
  }
}

export type Page = ReturnType<typeof pageTransformer>
export type Contact = ReturnType<typeof contactTransformer>
export type Profile = ReturnType<typeof profileTransformer>
export type Experience = ReturnType<typeof experienceTransformer>
export type Project = ReturnType<typeof projectTransformer>
export type Site = ReturnType<typeof siteTransformer>
export type Writing = ReturnType<typeof writingTransformer>
export type Cv = ReturnType<typeof cvTransformer>
