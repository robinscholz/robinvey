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
            <WishField v-model="draft.title" label="Titel" />
            <WishField v-model="draft.url" label="Link" type="url" />
            <WishField
              v-model="draft.shop"
              label="Shop"
              :placeholder="formatHost(draft.url)"
            />
            <WishField v-model="draft.price" label="Preis" placeholder="0,00" />
            <WishField v-model="draft.image" label="Bild" type="url" />
            <WishField
              v-model="draft.note"
              label="Notiz"
              placeholder="Größe, Farbe …"
            />
          </form>
          <p class="text-muted mt-8">
            Preise vergleichen:
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
            <button
              v-if="complete"
              type="button"
              class="link cursor-pointer disabled:cursor-wait"
              :disabled="saving"
              @click="submit"
            >
              {{ saving ? 'Speichern …' : 'Speichern' }}
            </button>
            <span v-else class="text-muted">Titel und Link fehlen noch.</span>
          </p>
          <p v-if="failed" class="text-muted">Speichern hat nicht geklappt.</p>
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
          <button
            type="button"
            class="text-muted hover:text-ink cursor-pointer"
            @click="remove(entry.id)"
          >
            Entfernen
          </button>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
const { wishes, save, remove } = await useWishes()
const { draft, received, saving, failed, wish, complete, comparisons, submit } =
  useWishDraft({ save })

useSeoMeta({
  title: 'Wunsch hinzufügen',
})
</script>
