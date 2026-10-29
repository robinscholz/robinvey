<template>
  <header>
    <h1>
      <NuxtLink to="/">{{ LIST.title }}</NuxtLink>
    </h1>
  </header>
</template>

<script setup lang="ts">
import { LIST } from '../utils/list'
</script>
