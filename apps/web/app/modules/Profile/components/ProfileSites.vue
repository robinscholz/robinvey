<template>
  <ul>
    <li v-for="site in sites" :key="site.id">
      <UiLink :to="site.url" :underline="false">
        <UiRow>
          {{ site.name
          }}<span class="text-surface-muted">, {{ site.kind }}</span>
          <template #meta>{{ site.year }}</template>
          <template #mark><UiIcon name="arrow-n-e" /></template>
        </UiRow>
      </UiLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
interface ProfileSitesProps {
  sites: Array<Site>
}

const { sites } = defineProps<ProfileSitesProps>()
</script>
