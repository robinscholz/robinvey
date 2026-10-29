<template>
  <main class="pt-20 md:pt-32">
    <p>Zum Hinzufügen bitte anmelden.</p>
    <p v-if="available" class="mt-6">
      <a href="/auth/github" class="link">Mit GitHub anmelden</a>
    </p>
    <p v-if="notice" class="text-muted mt-6">{{ notice }}</p>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()

const available = computed(() => route.query.error !== 'unavailable')

const notice = computed(() => {
  switch (route.query.error) {
    case 'denied':
      return `Dieses GitHub-Konto ist hier nicht freigeschaltet. Seine ID: ${route.query.id}`
    case 'failed':
      return 'Die Anmeldung hat nicht geklappt. Versuch es noch einmal.'
    case 'unavailable':
      return 'Die Anmeldung ist auf diesem Server noch nicht eingerichtet.'
    default:
      return ''
  }
})

useSeoMeta({
  title: 'Anmelden',
})
</script>
