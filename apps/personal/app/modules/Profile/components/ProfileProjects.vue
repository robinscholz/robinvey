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
              @click="viewActive || pin(project.id)"
            >
              <UiRow :hue="viewActive ? pinned(project.id) : 0">
                <UiMarquee :playing="viewActive">{{ project.name }}</UiMarquee>
                <template #meta>{{ project.year }}</template>
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
            <!-- The description is what the row opens for, so it is set in
                 the full ink; only the link under it steps back. -->
            <UiRow as="div" :interactive="false" class="pt-1 pb-[1lh]">
              <p>{{ project.description }}</p>
              <p v-if="project.url" class="text-surface-muted">
                <UiLink :to="project.url">{{ project.link }}</UiLink>
              </p>
            </UiRow>
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

const { pin, pinned } = useHue()
</script>
