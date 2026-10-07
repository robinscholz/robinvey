<template>
  <section :aria-labelledby="headingId" class="pb-12">
    <UiRule v-if="rule !== undefined" :position="rule" class="mb-3" />
    <div class="grid-page items-baseline gap-y-3">
      <h2 :id="headingId" class="text-surface-muted">
        <UiReel
          v-if="emoji"
          :symbol="emoji"
          :symbols="reel"
          class="mr-[1ch]"
          aria-hidden="true"
        />{{ label }}
      </h2>
      <div>
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface UiSectionProps {
  label: string
  emoji?: string
  reel?: Array<string>
  rule?: number
}

const { label, emoji, reel, rule } = defineProps<UiSectionProps>()

const headingId = useId()
</script>
