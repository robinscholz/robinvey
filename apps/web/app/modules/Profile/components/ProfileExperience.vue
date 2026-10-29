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
                @click="viewActive || pin(entry.id)"
              >
                <UiRow :hue="viewActive ? pinned(entry.id) : 0">
                  <ProfileExperienceTitle
                    :entry="entry"
                    :playing="viewActive"
                  />
                  <template #meta><UiRange :value="entry.years" /></template>
                  <template #mark>
                    <!-- Both marks are in the HTML, so the first click waits
                         for no icon. -->
                    <UiIcon name="plus" :class="{ hidden: viewActive }" />
                    <UiIcon name="minus" :class="{ hidden: !viewActive }" />
                  </template>
                </UiRow>
              </button>
            </magic-accordion-trigger>
            <magic-accordion-content>
              <UiRow
                as="div"
                :interactive="false"
                class="text-surface-muted pt-1 pb-[1lh]"
              >
                <p v-if="entry.summary">{{ entry.summary }}</p>
                <p v-if="entry.url">
                  <UiLink :to="entry.url">{{ entry.link }}</UiLink>
                </p>
              </UiRow>
            </magic-accordion-content>
          </li>
        </magic-accordion-view>
        <li v-else>
          <UiRow :interactive="false">
            <ProfileExperienceTitle :entry="entry" />
            <template #meta><UiRange :value="entry.years" /></template>
          </UiRow>
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

const { pin, pinned } = useHue()
</script>
