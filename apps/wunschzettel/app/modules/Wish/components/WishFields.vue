<template>
  <wish-field v-model="draft.title" label="Title" />
  <wish-field v-model="draft.url" label="Link" type="url" />
  <wish-field
    v-model="draft.shop"
    label="Shop"
    :placeholder="formatHost(draft.url)"
  />
  <wish-field v-model="draft.price" label="Price" placeholder="0,00" />
  <wish-field v-model="draft.image" label="Picture" type="url" />
  <wish-field v-model="draft.note" label="Note" placeholder="Size, colour …" />
</template>

<script setup lang="ts">
import type { WishDraft } from '../utils/draft'

const draft = defineModel<WishDraft>({ required: true })
</script>
