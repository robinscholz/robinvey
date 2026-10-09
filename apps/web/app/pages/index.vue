<template>
  <div class="px-5 md:px-10" data-scramble>
    <main>
      <ProfileHeader :page="page" :profile="profile" />
      <UiSection label="Now" emoji="⏳" :reel="REELS.now" :rule="0">
        <p>{{ profile.now }}</p>
      </UiSection>
      <UiSection label="Work" emoji="💼" :reel="REELS.work" :rule="1">
        <ProfileExperience :experience="experience" />
      </UiSection>
      <UiSection
        v-if="sites.length"
        label="Sites"
        emoji="🌐"
        :reel="REELS.sites"
        :rule="2"
      >
        <ProfileSites :sites="sites" />
      </UiSection>
      <UiSection label="Projects" emoji="🧰" :reel="REELS.projects" :rule="3">
        <ProfileProjects :projects="projects" />
      </UiSection>
      <UiSection
        v-if="writing.length"
        label="Writing"
        emoji="✍️"
        :reel="REELS.writing"
        :rule="4"
      >
        <ProfileWriting :writing="writing" />
      </UiSection>
      <UiSection label="Contact" emoji="🐌" :reel="REELS.contact" :rule="5">
        <ContentRenderer v-if="contact.document" :value="contact.document" />
      </UiSection>
    </main>
    <ProfileColophon :colophon="page.colophon" :updated="updated" :rule="6" />
  </div>
</template>

<script setup lang="ts">
// Spun past by each section’s emoji before it lands.
const REELS = {
  now: ['⌛', '⏰', '⏱️', '🕰️', '⌚', '📅', '🗓️', '🕒'],
  work: ['💻', '🖥️', '⌨️', '🖱️', '🏢', '📎', '🗂️', '📇'],
  sites: ['🌍', '🌎', '🌏', '🗺️', '🧭', '🔗', '🕸️', '📡'],
  projects: ['🔧', '🔨', '🪛', '🔩', '⚙️', '🛠️', '📐', '🧪'],
  writing: ['📝', '✏️', '🖊️', '📖', '📚', '📜', '🗒️', '📓'],
  contact: ['✉️', '📮', '📫', '📬', '📨', '💌', '🕊️', '📯'],
}

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
  twitterCard: 'summary',
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
})
</script>
