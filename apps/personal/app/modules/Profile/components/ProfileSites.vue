<template>
  <ul>
    <li v-for="site in sites" :key="site.id">
      <UiLink v-slot="{ held }" :to="site.url" :underline="false" hold>
        <UiRow>
          <UiMarquee :playing="held"
            >{{ site.name
            }}<span class="text-surface-muted"
              >, {{ site.kind }}</span
            ></UiMarquee
          >
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
