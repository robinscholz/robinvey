<template>
  <!-- The garden out in the open, with no page over it. Dark like the garden
       under the page, whatever the colour mode. -->
  <div
    class="bg-surface-low text-surface fixed inset-0 flex flex-col"
    data-color-mode="dark"
  >
    <header
      class="grid-page items-baseline gap-y-[1lh] px-5 pt-6 pb-12 md:px-10 md:pt-10 md:pb-24"
    >
      <div>
        <h1 class="font-medium">{{ title }}</h1>
        <p class="text-surface-muted">
          <UiReel
            symbol="🥀"
            :symbols="REEL"
            autoplay
            class="mr-[1ch]"
            aria-hidden="true"
          />{{ error.statusCode }}
        </p>
      </div>
      <p>
        <UiLink to="/">{{ host }}</UiLink>
      </p>
    </header>
    <!-- Loaded with the page, as nothing covers the garden here; lazy all
         the same, so the plot stays its own chunk and the home page can
         leave it until it is idle. -->
    <LazyGardenPlot active class="flex-1" />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

interface ErrorProps {
  error: NuxtError
}

// Spun past by the emoji before it lands on the wilted one.
const REEL = ['🌷', '🌹', '🌻', '🌼', '🌸', '💐', '🌺', '🪻']

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
