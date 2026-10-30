<template>
  <ul>
    <li v-for="site in sites" :key="site.id">
      <UiLink v-slot="{ held }" :to="site.url" :underline="false" hold>
        <UiRow>
          <UiMarquee :playing="held"
            >{{ site.name }}, {{ site.kind
            }}<UiIcon name="arrow-n-e" class="text-surface-muted ml-[0.25em]"
          /></UiMarquee>
          <template #meta>{{ site.year }}</template>
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
