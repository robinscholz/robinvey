<template>
  <m-button
    :class="[BASE, VARIANTS[variant], SIZES[size], flush && PULLS[size]]"
  >
    <slot />
  </m-button>
</template>

<script setup lang="ts">
interface WishButtonProps {
  variant?: 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md'
  // Pulls the padding back, so the label lines up with the text around it.
  flush?: boolean
}

// A fieldset disables its buttons natively, which mirror’s own cursor rule
// does not see.
const BASE = [
  'inline-flex items-center rounded-component-compact-sm transition-colors',
  'outline-hidden focus-visible:focus-shadow',
  'disabled:[--mirror-button-cursor:default] data-[loading=true]:[--mirror-button-disabled-cursor:progress]',
].join(' ')

// Ghost buttons, filling in on hover only.
const VARIANTS = {
  secondary: [
    'text-secondary-on-subtle',
    'enabled:hover:bg-secondary-subtle enabled:active:bg-secondary-subtle-hover',
  ].join(' '),
  success: [
    'text-success-solid',
    'enabled:hover:bg-success-subtle enabled:hover:text-success-solid-hover',
    'enabled:active:bg-success-subtle-hover enabled:active:text-success-solid-active',
  ].join(' '),
  danger: [
    'text-danger-solid',
    'enabled:hover:bg-danger-subtle enabled:hover:text-danger-solid-hover',
    'enabled:active:bg-danger-subtle-hover enabled:active:text-danger-solid-active',
  ].join(' '),
}

const SIZES = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-1.5',
}

const PULLS = {
  sm: '-mx-2.5',
  md: '-mx-3.5',
}

const {
  variant = 'secondary',
  size = 'md',
  flush = true,
} = defineProps<WishButtonProps>()
</script>
