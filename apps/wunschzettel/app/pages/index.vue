<template>
  <main class="pt-20 md:pt-32">
    <WishGrid :wishes="wishes" />
  </main>
</template>

<script setup lang="ts">
import { LIST } from '~~/app/modules/Wish/utils/list'

const { wishes } = await useWishes()
const { siteUrl } = useRuntimeConfig().public

useSeoMeta({
  title: LIST.title,
  description: LIST.description,
  ogTitle: LIST.title,
  ogDescription: LIST.description,
  ogType: 'website',
  ogUrl: siteUrl,
  twitterCard: 'summary',
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
})
</script>
