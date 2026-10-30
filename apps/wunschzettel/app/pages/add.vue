<template>
  <main class="pt-20 md:pt-32">
    <ClientOnly>
      <div v-if="received" class="grid-wishes">
        <ul class="contents">
          <WishCard :wish="wish" preview />
        </ul>
        <div class="xl:col-span-2 xl:max-w-xl">
          <form class="flex flex-col gap-y-1" @submit.prevent="submit">
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
      <!-- The bookmarklet comes with the page, so it is there before the
           script is. Arriving with a product, it is hidden until the form
           has taken its place. -->
      <template #fallback>
        <div :[WishBookmarkletAttribute]="''">
          <WishBookmarklet />
        </div>
      </template>
    </ClientOnly>
    <section
      v-if="!received && wishes.length"
      :[WishBookmarkletAttribute]="''"
      class="mt-20 md:mt-32"
    >
      <ul class="flex flex-col gap-y-2">
        <li
          v-for="entry in wishes"
          :key="entry.id"
          class="flex items-baseline gap-x-6"
        >
          <span class="min-w-0 flex-1">{{ entry.title }}</span>
          <WishButton :loading="removing === entry.id" @click="ask(entry)">
            {{ removing === entry.id ? 'Removing …' : 'Remove' }}
          </WishButton>
        </li>
      </ul>
    </section>
    <WishRemoveDialog
      v-model:open="asking"
      :title="asked?.title ?? ''"
      @confirm="discard"
    />
  </main>
</template>

<script setup lang="ts">
import { useWishToast } from '~~/app/modules/Wish/composables/private/useWishToast'
import {
  WishBookmarkletAttribute,
  WishReceivedAttribute,
} from '~~/app/modules/Wish/utils/enums'

const { wishes, save, remove } = await useWishes()
const { draft, received, saving, wish, complete, comparisons, submit } =
  useWishDraft({ save })
const { announceRemoveFailure } = useWishToast()

// The wish the alert asks about, and the one on its way out.
const asked = shallowRef<Wish | null>(null)
const asking = shallowRef(false)
const removing = shallowRef<string | null>(null)

function ask(entry: Wish) {
  asked.value = entry
  asking.value = true
}

// Removing asks first, here as in the drawer.
async function discard() {
  const entry = asked.value
  if (!entry) {
    return
  }
  removing.value = entry.id
  try {
    await remove(entry.id)
  } catch (error) {
    announceRemoveFailure(error)
  } finally {
    removing.value = null
  }
}

// The bookmarklet puts the product in the hash, encoded once over; arriving
// with one, the page is marked before it paints so the bookmarklet and the
// list never show first. The mark goes once the form is up.
useHead({
  script: [
    {
      innerHTML: `/url%3D/i.test(location.hash) && document.documentElement.setAttribute('${WishReceivedAttribute}', '')`,
      tagPriority: 'critical',
    },
  ],
})

onMounted(async () => {
  await nextTick()
  document.documentElement.removeAttribute(WishReceivedAttribute)
})

useSeoMeta({
  title: 'Add a wish',
})
</script>
