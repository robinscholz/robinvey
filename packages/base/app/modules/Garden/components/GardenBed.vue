<template>
  <!-- Always dark, whatever the page’s colour mode: the attribute scopes the
       dark tokens and the font’s dark axis to the garden. -->
  <div
    class="bg-surface-low invisible fixed inset-0 z-0 overflow-hidden data-revealed:visible"
    data-color-mode="dark"
    :data-revealed="revealed || null"
    @click="close"
  >
    <!-- Nobody sees the garden before the page is up, so its code is loaded
         and its plants grown once the browser is idle, after the page has
         had its first moments. -->
    <LazyGardenPlot hydrate-on-idle :active="revealed" class="size-full" />
    <!-- The page’s shadow, cast by an empty box over the part of the page in
         view. The page clips itself, which would cut off its own shadow. -->
    <div
      class="shadow-component pointer-events-none absolute inset-y-0 right-(--garden-page-right) left-(--garden-page-left) opacity-0 transition-opacity duration-150 ease-out data-settled:opacity-100 data-settled:duration-300"
      :data-settled="settled || null"
      :style="{
        '--garden-page-left': `${insets.left}px`,
        '--garden-page-right': `${insets.right}px`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { useGardenTray } from '../composables/private/useGardenTray'

const { revealed, settled, insets, close } = useGardenTray()
</script>
