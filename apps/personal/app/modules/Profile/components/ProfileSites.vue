<template>
  <ul>
    <li v-for="site in sites" :key="site.id">
      <ui-link v-slot="{ held }" :to="site.url" :underline="false" hold>
        <ui-row>
          <!-- The arrow stays on the last word’s line. -->
          <ui-marquee :playing="held"
            >{{ splitLastWord(`${site.name}, ${site.kind}`).head }}
            <span class="whitespace-nowrap"
              >{{ splitLastWord(`${site.name}, ${site.kind}`).tail
              }}<ui-icon
                name="arrow-n-e"
                class="text-surface-muted ml-[0.25em]"
            /></span>
          </ui-marquee>
          <template #meta>{{ site.year }}</template>
        </ui-row>
      </ui-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
interface ProfileSitesProps {
  sites: Array<Site>
}

const { sites } = defineProps<ProfileSitesProps>()
</script>
