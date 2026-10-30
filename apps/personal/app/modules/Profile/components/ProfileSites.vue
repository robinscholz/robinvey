<template>
  <ul>
    <li v-for="site in sites" :key="site.id">
      <UiLink v-slot="{ held }" :to="site.url" :underline="false" hold>
        <UiRow>
          <!-- The arrow stays on the last word’s line. -->
          <UiMarquee :playing="held"
            >{{ splitLastWord(`${site.name}, ${site.kind}`).head }}
            <span class="whitespace-nowrap"
              >{{ splitLastWord(`${site.name}, ${site.kind}`).tail
              }}<UiIcon name="arrow-n-e" class="text-surface-muted ml-[0.25em]"
            /></span>
          </UiMarquee>
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
