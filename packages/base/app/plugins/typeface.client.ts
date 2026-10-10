import { TypefaceAttribute } from '../modules/Ui/composables/useTypeface'

// Written to <html> directly rather than through useHead, which applies its
// changes a tick later: the scramble and the rules measure the new face as
// soon as it switches.
export default defineNuxtPlugin(() => {
  const { typeface } = useTypeface()

  watch(typeface, (value) => {
    document.documentElement.setAttribute(TypefaceAttribute, value)
  })
})
