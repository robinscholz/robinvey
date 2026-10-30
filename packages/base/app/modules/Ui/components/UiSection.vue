<template>
  <section :aria-labelledby="headingId" class="pb-12">
    <UiRule class="mb-3" />
    <div class="grid-page items-baseline gap-y-3">
      <h2
        :id="headingId"
        class="hover:text-(--ui-hue)"
        data-hue
        @pointerenter="enter"
      >
        <UiEmoji
          v-if="emoji"
          ref="emoji"
          :symbol="emoji"
          class="mr-[1ch] size-[1em]"
        />
        {{ label }}
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
}

const { label, emoji } = defineProps<UiSectionProps>()

const { advance } = useHue()

const headingId = useId()
const emojiRef = useTemplateRef('emoji')

function enter() {
  advance()
  emojiRef.value?.play()
}
</script>
