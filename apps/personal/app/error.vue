<template>
  <!-- The canvas out in the open, with no page over it. -->
  <div class="bg-surface-low text-surface fixed inset-0 flex flex-col">
    <header
      class="max-w-[64ch] px-6 pt-8 pb-12 md:px-12 md:pt-12 md:pb-24 xl:px-20"
    >
      <h1>{{ title }}</h1>
      <p class="text-surface-muted">{{ error.statusCode }}</p>
      <p class="mt-[1lh]">
        <UiLink to="/">{{ host }}</UiLink>
      </p>
    </header>
    <!-- Loaded with the page, as nothing covers the canvas here; lazy all
         the same, so the field stays its own chunk and the home page can
         leave it until it is idle. -->
    <LazyEmojiCanvas active class="flex-1" />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

interface ErrorProps {
  error: NuxtError
}

const { error } = defineProps<ErrorProps>()

const { siteUrl } = useRuntimeConfig().public

const title = computed(() =>
  error.statusCode === 404 ? 'Not found' : 'Something broke'
)

const host = new URL(siteUrl).host

useSeoMeta({ title })
</script>
