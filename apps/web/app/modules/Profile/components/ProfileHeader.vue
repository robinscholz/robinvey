<template>
  <header class="grid-page items-baseline gap-y-[1lh] pt-6 pb-24 md:pt-10">
    <div>
      <h1 class="font-medium">{{ profile.name }}</h1>
      <p class="text-surface-muted">
        {{ profile.role }}<br />
        {{ profile.location }}
      </p>
    </div>
    <ContentRenderer
      v-if="page.document"
      :value="page.document"
      class="[&_p+p]:mt-[1lh]"
    />
    <!-- Below lg the switch lives in the colophon; there’s no room up here.
         The negative margin sits its smaller label on the name’s baseline. -->
    <div class="fixed top-10 right-10 z-10 -mt-0.5 hidden lg:block">
      <UiColorModeSwitch placement="bottom-end" variant="button" />
    </div>
  </header>
</template>

<script setup lang="ts">
interface ProfileHeaderProps {
  page: Page
  profile: Profile
}

const { page, profile } = defineProps<ProfileHeaderProps>()
</script>
