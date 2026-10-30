<template>
  <magic-accordion-provider
    :id="AccordionIds.Projects"
    :options="{ mode: 'multiple' }"
    as-child
  >
    <ul>
      <magic-accordion-view
        v-for="project in projects"
        :id="project.id"
        :key="project.id"
        as-child
      >
        <li>
          <magic-accordion-trigger v-slot="{ viewActive }" as-child>
            <button
              type="button"
              class="block w-full cursor-pointer text-left"
              :aria-expanded="Boolean(viewActive)"
            >
              <ui-row>
                <ui-marquee :playing="viewActive">{{
                  project.name
                }}</ui-marquee>
                <template #meta>{{ project.year }}</template>
              </ui-row>
            </button>
          </magic-accordion-trigger>
          <magic-accordion-content>
            <!-- The description is what the row opens for, so it is set in
                 the full ink; only the link under it steps back. -->
            <ui-row as="div" :interactive="false" class="pt-1 pb-[1lh]">
              <p>{{ project.description }}</p>
              <p v-if="project.url" class="text-surface-muted">
                <ui-link :to="project.url">{{ project.link }}</ui-link>
              </p>
            </ui-row>
          </magic-accordion-content>
        </li>
      </magic-accordion-view>
    </ul>
  </magic-accordion-provider>
</template>

<script setup lang="ts">
import { AccordionIds } from '../utils/enums'

interface ProfileProjectsProps {
  projects: Array<Project>
}

const { projects } = defineProps<ProfileProjectsProps>()
</script>
