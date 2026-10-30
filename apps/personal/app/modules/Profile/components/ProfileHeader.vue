<template>
  <header class="max-w-[64ch] pt-8 pb-12 md:pt-12">
    <h1>{{ profile.name }}</h1>
    <content-renderer
      v-if="page.document"
      :value="page.document"
      class="mt-[1lh] [&_p+p]:mt-[1lh]"
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
