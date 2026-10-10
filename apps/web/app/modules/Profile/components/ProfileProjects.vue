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
                  <UiIcon :name="viewActive ? 'minus' : 'plus'" />
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
              <p>{{ project.description }}</p>
              <MagicImage
                v-if="project.image"
                :src="project.image.src"
                :alt="project.image.alt"
                class="mt-[1lh] block w-full"
              />
              <p v-if="project.url" :class="{ 'mt-[1lh]': project.image }">
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
