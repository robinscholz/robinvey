<template>
  <p>Zieh diesen Link in die Lesezeichenleiste:</p>
  <p class="mt-[1lh]">
    <a
      :href="href"
      class="underline decoration-1 underline-offset-[0.2em] hover:text-(--ui-hue)"
      @click.prevent
      @pointerenter="advance"
      >🎁 Wünschen</a
    >
  </p>
  <p class="text-surface-muted mt-[1lh]">
    Auf einer Produktseite angeklickt, liest es Titel, Bild und Preis aus und
    öffnet diese Seite mit dem Wunsch.
  </p>
</template>

<script setup lang="ts">
const { href } = useBookmarklet()
const { advance } = useHue()
</script>
