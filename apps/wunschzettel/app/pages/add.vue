<template>
  <div class="px-5 md:px-10">
    <main>
      <header class="grid-page items-baseline gap-y-[1lh] pt-6 pb-12 md:pt-10">
        <div>
          <h1 class="font-medium">Wunsch hinzufügen</h1>
          <p class="text-surface-muted">Wunschzettel</p>
        </div>
        <p>
          Ein Lesezeichen bringt ein Produkt von jeder Seite hierher. Prüfen,
          anpassen und auf GitHub speichern; der Zettel baut sich danach neu.
        </p>
      </header>
      <ClientOnly>
        <template v-if="received">
          <UiSection label="Vorschau" :rule="0">
            <ul class="grid grid-cols-1 sm:grid-cols-2">
              <WishCard :wish="wish" />
            </ul>
          </UiSection>
          <UiSection label="Angaben" :rule="1">
            <form class="flex flex-col gap-y-[0.5lh]" @submit.prevent>
              <WishField v-model="draft.title" label="Titel" />
              <WishField v-model="draft.url" label="Link" type="url" />
              <WishField
                v-model="draft.shop"
                label="Shop"
                :placeholder="formatHost(draft.url)"
              />
              <WishField
                v-model="draft.price"
                label="Preis"
                placeholder="0,00"
              />
              <WishField v-model="draft.image" label="Bild" type="url" />
              <WishField
                v-model="draft.note"
                label="Notiz"
                placeholder="Größe, Farbe …"
              />
            </form>
            <p class="text-surface-muted mt-[1lh]">
              Preise vergleichen:
              <template v-for="(comparison, index) in comparisons" :key="index"
                ><template v-if="index">, </template
                ><UiLink :to="comparison.url">{{
                  comparison.label
                }}</UiLink></template
              >
            </p>
          </UiSection>
          <UiSection label="Speichern" :rule="2">
            <p v-if="complete" class="flex items-baseline gap-x-[1ch]">
              <UiLink :to="commitUrl">Auf GitHub anlegen</UiLink>
              <span class="text-surface-muted" aria-hidden="true">
                <UiIcon name="arrow-n-e" />
              </span>
            </p>
            <p v-else class="text-surface-muted">Titel und Link fehlen noch.</p>
            <p class="text-surface-muted mt-[1lh]">
              Öffnet {{ filename }} zum Commit auf main. Nach dem Build steht
              der Wunsch auf dem Zettel.
            </p>
            <p class="mt-[1lh]">
              <button
                type="button"
                class="cursor-pointer underline decoration-1 underline-offset-[0.2em] hover:text-(--ui-hue)"
                @click="copyYaml"
                @pointerenter="advance"
              >
                {{ copied ? 'Kopiert' : 'YAML kopieren' }}
              </button>
            </p>
          </UiSection>
        </template>
        <UiSection v-else label="Lesezeichen" :rule="0">
          <WishBookmarklet />
        </UiSection>
      </ClientOnly>
    </main>
  </div>
</template>

<script setup lang="ts">
const {
  draft,
  received,
  wish,
  complete,
  filename,
  commitUrl,
  comparisons,
  read,
  copy,
} = useWishDraft()
const { advance } = useHue()

const copied = shallowRef(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copyYaml() {
  await copy()
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    copied.value = false
  }, 2000)
}

// The hash is read before the client-only part renders, so the form shows
// at once rather than after the bookmarklet instructions.
if (import.meta.client) {
  read()
}

onScopeDispose(() => clearTimeout(timer))

useSeoMeta({
  title: 'Wunsch hinzufügen',
})
</script>
