<template>
  <ul>
    <li v-for="article in writing" :key="article.id">
      <UiLink v-slot="{ held }" :to="article.url" :underline="false" hold>
        <UiRow>
          <!-- The arrow stays on the last word’s line. -->
          <UiMarquee :playing="held"
            >{{ splitLastWord(article.title).head }}
            <span class="whitespace-nowrap"
              >{{ splitLastWord(article.title).tail
              }}<UiIcon name="arrow-n-e" class="text-surface-muted ml-[0.25em]"
            /></span>
          </UiMarquee>
          <template #meta>{{ article.month }}</template>
        </UiRow>
      </UiLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
interface ProfileWritingProps {
  writing: Array<Writing>
}

const { writing } = defineProps<ProfileWritingProps>()
</script>
