<template>
  <header>
    <h1>
      <NuxtLink to="/" class="focus-inline font-medium">{{
        LIST.title
      }}</NuxtLink>
    </h1>
  </header>
</template>

<script setup lang="ts">
import { LIST } from '../utils/list'
</script>
