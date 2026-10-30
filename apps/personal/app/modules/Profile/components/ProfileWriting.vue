<template>
  <ul>
    <li v-for="article in writing" :key="article.id">
      <UiLink v-slot="{ held }" :to="article.url" :underline="false" hold>
        <UiRow>
          <UiMarquee :playing="held"
            >{{ article.title }}
            <UiIcon name="arrow-n-e" class="text-surface-muted"
          /></UiMarquee>
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
