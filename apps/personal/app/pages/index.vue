<template>
  <div class="px-6 md:px-12 xl:px-20">
    <main>
      <profile-header :page="page" :profile="profile" />
      <div class="pb-12 md:pb-24">
        <profile-carousel />
      </div>
      <!-- The lists side by side where there is room, two from xl. -->
      <div class="grid grid-cols-1 gap-x-12 xl:grid-cols-2">
        <ui-section label="Work">
          <profile-experience :experience="experience" />
        </ui-section>
        <ui-section label="Projects">
          <profile-projects :projects="projects" />
        </ui-section>
        <ui-section v-if="sites.length" label="Built">
          <profile-sites :sites="sites" />
        </ui-section>
        <ui-section v-if="writing.length" label="Writing">
          <profile-writing :writing="writing" />
        </ui-section>
      </div>
      <ui-section label="Contact">
        <content-renderer v-if="contact.document" :value="contact.document" />
      </ui-section>
    </main>
    <profile-colophon :colophon="page.colophon" :updated="updated" />
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
