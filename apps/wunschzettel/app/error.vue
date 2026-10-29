<template>
  <NuxtLayout>
    <main class="pt-20 md:pt-32">
      <!-- A card with nothing in it, where the list’s first one would be. -->
      <div
        class="grid grid-cols-1 gap-x-8 sm:grid-cols-2 md:gap-x-12 xl:grid-cols-3"
      >
        <div>
          <div
            class="border-surface aspect-square border border-dashed"
            aria-hidden="true"
          />
          <h2 class="mt-5">{{ title }}</h2>
          <p class="text-surface-muted">{{ error.statusCode }}</p>
          <p class="text-surface-muted">
            <NuxtLink to="/" class="link">Back to the list</NuxtLink>
          </p>
        </div>
      </div>
    </main>
  </NuxtLayout>
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
