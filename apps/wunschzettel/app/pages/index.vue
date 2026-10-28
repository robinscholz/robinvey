<template>
  <div class="px-5 md:px-10" data-scramble>
    <!-- Below lg the switch lives in the colophon; there’s no room up here. -->
    <div class="sticky top-10 z-10 hidden h-0 justify-end lg:flex">
      <div class="-mt-0.5">
        <UiColorModeSwitch placement="bottom-end" variant="button" />
      </div>
    </div>
    <main>
      <WishHeader :list="list" :updated="updated" />
      <section class="pb-12">
        <UiRule :position="0" class="mb-[1lh]" />
        <WishGrid :wishes="wishes" />
      </section>
    </main>
    <WishColophon :updated="updated" :rule="1" />
  </div>
</template>

<script setup lang="ts">
const { list, wishes, updated } = await useWishes()
const { siteUrl } = useRuntimeConfig().public

const title = computed(() =>
  list.value.name ? `${list.value.title}, ${list.value.name}` : list.value.title
)

useSeoMeta({
  title,
  description: () => list.value.description,
  ogTitle: title,
  ogDescription: () => list.value.description,
  ogType: 'website',
  ogUrl: siteUrl,
  twitterCard: 'summary',
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
})
</script>
