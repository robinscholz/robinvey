<template>
  <footer>
    <UiSection label="Colophon">
      <p>
        <template v-for="(part, index) in parts" :key="index"
          ><UiTypefaceSwitch v-if="index % 2" /><template v-else>{{
            part
          }}</template></template
        >
        Updated {{ updated }}.
      </p>
      <div class="mt-[1lh]">
        <UiColorModeSwitch variant="button" />
      </div>
    </UiSection>
  </footer>
</template>

<script setup lang="ts">
interface ProfileColophonProps {
  colophon: string
  updated: string
}

// The face’s name in the colophon doubles as the typeface switch, so
// splitting around it leaves the switch at every odd index.
const SWITCH = /(Semi Mono)/

const { colophon, updated } = defineProps<ProfileColophonProps>()

const parts = computed(() => colophon.split(SWITCH))
</script>
