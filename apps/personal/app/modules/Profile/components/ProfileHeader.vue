<template>
  <header
    class="grid-page items-baseline gap-y-[1lh] pt-6 pb-12 md:pt-10 md:pb-24"
  >
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
  </header>
</template>

<script setup lang="ts">
interface ProfileHeaderProps {
  page: Page
  profile: Profile
}

const { page, profile } = defineProps<ProfileHeaderProps>()
</script>
