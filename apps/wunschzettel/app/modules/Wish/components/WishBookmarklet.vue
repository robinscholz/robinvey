<template>
  <p>Zieh diesen Link in die Lesezeichenleiste:</p>
  <p class="mt-6">
    <a :href="href" class="link" @click.prevent>🎁 Wünschen</a>
  </p>
  <p class="text-muted mt-6">
    Auf einer Produktseite angeklickt, bringt es Titel, Bild und Preis hierher.
    <a href="/auth/logout" class="link">Abmelden</a>
  </p>
</template>

<script setup lang="ts">
const { href } = useBookmarklet()
</script>
