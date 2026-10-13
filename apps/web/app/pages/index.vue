<template>
  <div class="px-5 md:px-10" data-scramble>
    <!-- Below lg the switch lives in the colophon; there’s no room up here.
         Sticky rather than fixed, so it slides aside with the page over the
         garden. A sticky box ignores its own margin, so a box inside it
         carries the nudge that sits the smaller label on the name’s
         baseline. -->
    <div class="sticky top-10 z-10 hidden h-0 justify-end lg:flex">
      <div class="-mt-0.5">
        <UiColorModeSwitch placement="bottom-end" variant="button" />
      </div>
    </div>
    <main>
      <ProfileHeader :page="page" :profile="profile" />
      <UiSection label="Now" emoji="⏳" :reel="REELS.now" :rule="0">
        <p>{{ profile.now }}</p>
      </UiSection>
      <UiSection label="Work" emoji="🌀" :reel="REELS.work" :rule="1">
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
