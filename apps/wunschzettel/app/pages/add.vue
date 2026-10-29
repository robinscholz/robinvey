<template>
  <main class="pt-20 md:pt-32">
    <ClientOnly>
      <div
        v-if="received"
        class="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 md:gap-x-12 md:gap-y-24 xl:grid-cols-3"
      >
        <ul class="contents">
          <WishCard :wish="wish" preview />
        </ul>
        <div class="xl:col-span-2 xl:max-w-xl">
          <form class="flex flex-col gap-y-3" @submit.prevent="submit">
            <WishFields v-model="draft" />
          </form>
          <p class="text-surface-muted mt-8">
            Compare prices:
            <template v-for="(comparison, index) in comparisons" :key="index"
              ><template v-if="index">, </template
              ><a
                :href="comparison.url"
                target="_blank"
                rel="noreferrer"
                class="link"
                >{{ comparison.label }}</a
              ></template
            >
          </p>
          <p class="mt-16">
            <WishButton
              v-if="complete"
              variant="success"
              :loading="saving"
              @click="submit"
            >
              {{ saving ? 'Saving …' : 'Save' }}
            </WishButton>
            <span v-else class="text-surface-muted"
              >Title and link are still missing.</span
            >
          </p>
        </div>
      </div>
      <WishBookmarklet v-else />
    </ClientOnly>
    <section v-if="!received && wishes.length" class="mt-20 md:mt-32">
      <ul class="flex flex-col gap-y-2">
        <li
          v-for="entry in wishes"
          :key="entry.id"
          class="flex items-baseline gap-x-6"
        >
          <span class="min-w-0 flex-1">{{ entry.title }}</span>
          <WishButton @click="remove(entry.id)">Remove</WishButton>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
const { wishes, save, remove } = await useWishes()
const { draft, received, saving, wish, complete, comparisons, submit } =
  useWishDraft({ save })

useSeoMeta({
  title: 'Add a wish',
})
</script>
