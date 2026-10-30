<template>
  <!-- The garden out in the open, with no page over it. Dark like the garden
       under the page, whatever the colour mode. -->
  <div
    class="bg-surface-low text-surface fixed inset-0 flex flex-col"
    data-color-mode="dark"
  >
    <header
      class="max-w-[64ch] px-5 pt-6 pb-12 md:px-10 md:pt-10 md:pb-24 lg:px-16 lg:pt-16"
    >
      <h1>{{ title }}</h1>
      <p class="text-surface-muted">{{ error.statusCode }}</p>
      <p class="mt-[1lh]">
        <UiLink to="/">{{ host }}</UiLink>
      </p>
    </header>
    <!-- Loaded with the page, as nothing covers the garden here; lazy all
         the same, so the field stays its own chunk and the home page can
         leave it until it is idle. -->
    <LazyGardenField active class="flex-1" />
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

// The frame around the page is dark with it, whatever the visitor chose.
useThemeColor({ mode: 'dark' })
</script>
