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

    return {
      page: pageTransformer(page),
      contact: contactTransformer(contact),
      profile: profileTransformer(profile),
      experience: experience.map(experienceTransformer),
      sites: sites.map(siteTransformer),
      projects: projects.map(projectTransformer),
      writing: writing.map(writingTransformer),
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
