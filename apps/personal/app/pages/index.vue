<template>
  <div class="px-6 md:px-12 xl:px-20">
    <main>
      <ProfileHeader :page="page" :profile="profile" />
      <div class="pb-12 md:pb-24">
        <ProfileCarousel />
      </div>
      <!-- The lists side by side where there is room, two from xl. -->
      <div class="grid gap-x-12 xl:grid-cols-2">
        <UiSection label="Work">
          <ProfileExperience :experience="experience" />
        </UiSection>
        <UiSection label="Projects">
          <ProfileProjects :projects="projects" />
        </UiSection>
        <UiSection v-if="sites.length" label="Built">
          <ProfileSites :sites="sites" />
        </UiSection>
        <UiSection v-if="writing.length" label="Writing">
          <ProfileWriting :writing="writing" />
        </UiSection>
      </div>
      <UiSection label="Contact">
        <ContentRenderer v-if="contact.document" :value="contact.document" />
      </UiSection>
    </main>
    <ProfileColophon :colophon="page.colophon" :updated="updated" />
  </div>
</template>

<script setup lang="ts">
const {
  page,
  contact,
  profile,
  experience,
  sites,
  projects,
  writing,
  updated,
} = await useProfile()
const { siteUrl } = useRuntimeConfig().public

const title = computed(() => `${profile.value.name}, ${profile.value.role}`)

useSeoMeta({
  title,
  description: () => page.value.description,
  ogTitle: title,
  ogDescription: () => page.value.description,
  ogType: 'website',
  ogUrl: siteUrl,
  ogImage: `${siteUrl}/og.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: title,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
})
</script>
