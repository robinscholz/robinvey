<template>
  <!-- Once a side is open, the garden is a drag surface for it, so the page
       can be pulled back from anywhere on the garden; a tap closes it too. -->
  <magic-tray-trigger :id="TrayIds.Garden" :side="opened ?? 'right'" as-child>
    <div
      class="bg-surface-low invisible fixed inset-0 z-0 overflow-hidden data-revealed:visible"
      :data-revealed="revealed || null"
      @click="close"
    >
      <!-- Nobody sees the garden before the page is up, so its code is loaded
           and its emoji drawn once the browser is idle, after the page has
           had its first moments. -->
      <LazyGardenField hydrate-on-idle :active="revealed" class="size-full" />
      <!-- The page’s shadow, cast by an empty box the size of the viewport
           that slides with the page. The page clips itself, which would cut
           off its own shadow, and a transform keeps the box on the compositor,
           so the shadow costs nothing while the page moves. -->
      <div
        class="shadow-component pointer-events-none absolute inset-0 will-change-transform"
        :style="{ transform: `translateX(${insets.left - insets.right}px)` }"
      />
    </div>
  </magic-tray-trigger>
</template>

<script setup lang="ts">
import { useGardenTray } from '../composables/private/useGardenTray'
import { TrayIds } from '../utils/enums'

const { revealed, opened, insets, close } = useGardenTray()
</script>
