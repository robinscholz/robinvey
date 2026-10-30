<template>
  <header>
    <h1>
      <nuxt-link to="/" class="focus-inline">{{ LIST.title }}</nuxt-link>
    </h1>
  </header>
</template>

<script setup lang="ts">
import { LIST } from '../utils/list'
</script>
