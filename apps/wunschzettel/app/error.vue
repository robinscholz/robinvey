<template>
  <nuxt-layout>
    <main class="pt-20 md:pt-32">
      <!-- A card with nothing in it, where the list’s first one would be. -->
      <div class="grid-wishes">
        <div>
          <div
            class="border-surface aspect-square border border-dashed"
            aria-hidden="true"
          />
          <h2 class="mt-5">{{ title }}</h2>
          <p class="text-surface-muted">{{ error.statusCode }}</p>
          <p class="text-surface-muted">
            <nuxt-link to="/" class="link">Back to the list</nuxt-link>
          </p>
        </div>
      </div>
    </main>
  </nuxt-layout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

interface ErrorProps {
  error: NuxtError
}

const { error } = defineProps<ErrorProps>()

const title = computed(() =>
  error.statusCode === 404 ? 'Not found' : 'Something went wrong'
)

useSeoMeta({ title })
</script>
