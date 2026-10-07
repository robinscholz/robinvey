<template>
  <ul>
    <li v-for="article in writing" :key="article.id">
      <UiLink :to="article.url" :underline="false">
        <UiRow>
          {{ article.title }}
          <template #meta>{{ article.month }}</template>
          <template #mark><UiIcon name="arrow-n-e" /></template>
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
