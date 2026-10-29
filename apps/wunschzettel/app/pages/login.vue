<template>
  <main class="pt-20 md:pt-32">
    <p>Sign in to add things.</p>
    <p v-if="available" class="mt-6">
      <a href="/auth/github" class="link">Sign in with GitHub</a>
    </p>
    <p v-if="notice" class="text-surface-muted mt-6">{{ notice }}</p>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()

const available = computed(() => route.query.error !== 'unavailable')

const notice = computed(() => {
  switch (route.query.error) {
    case 'denied':
      return `This GitHub account is not allowed here. Its ID: ${route.query.id}`
    case 'failed':
      return 'Signing in did not work. Try again.'
    case 'unavailable':
      return 'Signing in is not set up on this server yet.'
    default:
      return ''
  }
})

useSeoMeta({
  title: 'Sign in',
})
</script>
