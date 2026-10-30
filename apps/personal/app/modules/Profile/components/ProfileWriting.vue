<template>
  <ul>
    <li v-for="article in writing" :key="article.id">
      <ui-link v-slot="{ held }" :to="article.url" :underline="false" hold>
        <ui-row>
          <!-- The arrow stays on the last word’s line. -->
          <ui-marquee :playing="held"
            >{{ splitLastWord(article.title).head }}
            <span class="whitespace-nowrap"
              >{{ splitLastWord(article.title).tail
              }}<ui-icon
                name="arrow-n-e"
                class="text-surface-muted ml-[0.25em]"
            /></span>
          </ui-marquee>
          <template #meta>{{ article.month }}</template>
        </ui-row>
      </ui-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
interface ProfileWritingProps {
  writing: Array<Writing>
}

const { writing } = defineProps<ProfileWritingProps>()
</script>
