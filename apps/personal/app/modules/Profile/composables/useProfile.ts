export async function useProfile() {
  const { updatedAt } = useRuntimeConfig().public

  const { data } = await useAsyncData('profile', async () => {
    const [page, contact, profile, experience, sites, projects, writing] =
      await Promise.all([
        queryCollection('pages').path('/').first(),
        queryCollection('contact').first(),
        queryCollection('profile').first(),
        queryCollection('experience').order('start', 'DESC').all(),
        queryCollection('sites')
          .order('year', 'DESC')
          .order('stem', 'ASC')
          .all(),
        queryCollection('projects').order('stem', 'ASC').all(),
        queryCollection('writing').order('date', 'DESC').all(),
      ])

    const companies = experience.map(experienceTransformer)
    const works = projects.map(projectTransformer)
    const places = sites.map(siteTransformer)

    // The names the page lists, the companies, the projects and the sites,
    // stay on one line wherever they appear.
    const names = [...companies, ...works, ...places].map((entry) =>
      'company' in entry ? entry.company : entry.name
    )
    function hold(text: string): string {
      return holdNames({ text, names })
    }

    const summary = pageTransformer(page)
    const person = profileTransformer(profile)

    return {
      page: { ...summary, colophon: hold(summary.colophon) },
      contact: contactTransformer(contact),
      profile: { ...person, now: hold(person.now) },
      experience: companies.map((entry) => ({
        ...entry,
        company: hold(entry.company),
        summary: hold(entry.summary),
      })),
      sites: places.map((site) => ({ ...site, name: hold(site.name) })),
      projects: works.map((project) => ({
        ...project,
        name: hold(project.name),
        description: hold(project.description),
      })),
      writing: writing
        .map(writingTransformer)
        .map((article) => ({ ...article, title: hold(article.title) })),
    }
  })

  // Public state
  const page = computed(() => data.value?.page ?? pageTransformer(null))
  const contact = computed(
    () => data.value?.contact ?? contactTransformer(null)
  )
  const profile = computed(
    () => data.value?.profile ?? profileTransformer(null)
  )
  const experience = computed(() => data.value?.experience ?? [])
  const sites = computed(() => data.value?.sites ?? [])
  const projects = computed(() => data.value?.projects ?? [])
  const writing = computed(() => data.value?.writing ?? [])
  const updated = computed(() => formatLongMonth(updatedAt))

  return {
    page,
    contact,
    profile,
    experience,
    sites,
    projects,
    writing,
    updated,
  }
}

export type UseProfileReturn = Awaited<ReturnType<typeof useProfile>>
