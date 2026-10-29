<template>
  <main class="pt-20 md:pt-32">
    <WishGrid :wishes="wishes">
      <template v-if="editable" #actions="{ wish }">
        <WishEditButton :wish="wish" />
      </template>
    </WishGrid>
    <WishDrawer v-if="editable" />
  </main>
</template>

<script setup lang="ts">
import { LIST } from '~~/app/modules/Wish/utils/list'

const { wishes } = await useWishes()
const { editable } = useWishEditor()
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
