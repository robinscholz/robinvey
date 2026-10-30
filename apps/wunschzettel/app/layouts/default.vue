<template>
  <div class="mx-auto max-w-[125rem] px-6 py-8 md:px-12 md:py-12 xl:px-20">
    <!-- The page is capped where a card in four columns is as wide as the
         widest one in three, so the pictures never outgrow the shops’
         copies. -->
    <wish-header />
    <slot />
    <!-- The colour mode switch sits at the foot of the page, under the list
         and out of its way. -->
    <footer class="mt-20 md:mt-32">
      <ui-color-mode-switch />
    </footer>
    <wish-toaster />
  </div>
</template>
