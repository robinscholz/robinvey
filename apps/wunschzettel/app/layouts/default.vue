<template>
  <div
    class="mx-auto max-w-[125rem] px-6 pt-8 pb-24 md:px-12 md:pt-12 md:pb-40 xl:px-20"
  >
    <!-- The page is capped where a card in four columns is as wide as the
         widest one in three, so the pictures never outgrow the shops’
         copies. -->
    <WishHeader />
    <slot />
    <WishToaster />
  </div>
</template>
