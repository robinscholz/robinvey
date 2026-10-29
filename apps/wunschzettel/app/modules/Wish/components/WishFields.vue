<template>
  <WishField v-model="draft.title" label="Title" />
  <WishField v-model="draft.url" label="Link" type="url" />
  <WishField
    v-model="draft.shop"
    label="Shop"
    :placeholder="formatHost(draft.url)"
  />
  <WishField v-model="draft.price" label="Price" placeholder="0,00" />
  <WishField v-model="draft.image" label="Picture" type="url" />
  <WishField v-model="draft.note" label="Note" placeholder="Size, colour …" />
</template>

<script setup lang="ts">
import type { WishDraft } from '../utils/draft'

const draft = defineModel<WishDraft>({ required: true })
</script>
