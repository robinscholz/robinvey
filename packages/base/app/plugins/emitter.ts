import mitt from 'mitt'
import type { UiEvents } from '../modules/Ui/composables/useUiEmitter'

// One emitter per app, so pages rendered on the server never share
// listeners. A plugin rather than a component-keyed store, as the intro
// emits from outside any component.
export default defineNuxtPlugin(() => ({
  provide: {
    uiEmitter: mitt<UiEvents>(),
  },
}))
