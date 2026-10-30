<template>
  <magic-accordion-provider
    :id="AccordionIds.Experience"
    :options="{ mode: 'multiple' }"
    as-child
  >
    <ul>
      <template v-for="entry in experience" :key="entry.id">
        <magic-accordion-view v-if="entry.expandable" :id="entry.id" as-child>
          <li>
            <magic-accordion-trigger v-slot="{ viewActive }" as-child>
              <button
                type="button"
                class="block w-full cursor-pointer text-left"
                :aria-expanded="Boolean(viewActive)"
              >
                <ui-row>
                  <profile-experience-title
                    :entry="entry"
                    :playing="viewActive"
                  />
                  <template #meta>{{ entry.years }}</template>
                </ui-row>
              </button>
            </magic-accordion-trigger>
            <magic-accordion-content>
              <!-- The summary is what the row opens for, so it is set in the
                   full ink; only the link under it steps back. -->
              <ui-row as="div" :interactive="false" class="pt-1 pb-[1lh]">
                <p v-if="entry.summary">{{ entry.summary }}</p>
                <p v-if="entry.url" class="text-surface-muted">
                  <ui-link :to="entry.url">{{ entry.link }}</ui-link>
                </p>
              </ui-row>
            </magic-accordion-content>
          </li>
        </magic-accordion-view>
        <li v-else>
          <ui-row :interactive="false">
            <profile-experience-title :entry="entry" />
            <template #meta>{{ entry.years }}</template>
          </ui-row>
        </li>
      </template>
    </ul>
  </magic-accordion-provider>
</template>

<script setup lang="ts">
import { AccordionIds } from '../utils/enums'

interface ProfileExperienceProps {
  experience: Array<Experience>
}

const { experience } = defineProps<ProfileExperienceProps>()
</script>
