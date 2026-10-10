import { unrefElement, useEventListener, useTimeoutFn } from '@vueuse/core'
import type { MaybeComputedElementRef, Position } from '@vueuse/core'

interface UseHoldOptions {
  target: MaybeComputedElementRef
  enabled: MaybeRefOrGetter<boolean>
}

// Long enough to tell from a tap.
const DELAY = 450

// A finger that drifts further than this is scrolling, not holding.
const SLOP = 10

// Touch only, so a mouse press of any length stays a click. Scrolling is left
// to the browser, which cancels the press when it takes over.
export function useHold({ target, enabled }: UseHoldOptions) {
  const { isPending, start, stop } = useTimeoutFn(engage, DELAY, {
    immediate: false,
  })

  // Private state
  const element = computed(() => unrefElement(target))
  let touched = false
  let pointer: number | undefined
  let origin: Position | undefined
  let swallow = false

  // Public state
  const held = shallowRef(false)

  // Private functions
  function engage() {
    held.value = true
    swallow = true
  }

  function release() {
    stop()
    pointer = undefined
    origin = undefined
    held.value = false
  }

  function onPointerdown(event: PointerEvent) {
    swallow = false
    touched = event.pointerType === 'touch' && toValue(enabled)
    if (!touched || !event.isPrimary) {
      return
    }
    release()
    pointer = event.pointerId
    origin = { x: event.clientX, y: event.clientY }
    start()
  }

  function onPointermove(event: PointerEvent) {
    if (event.pointerId !== pointer || !origin || held.value) {
      return
    }
    const distance = Math.hypot(
      event.clientX - origin.x,
      event.clientY - origin.y
    )
    if (distance > SLOP) {
      release()
    }
  }

  function onPointerup(event: PointerEvent) {
    if (event.pointerId === pointer) {
      release()
    }
  }

  // Android’s long press, which opens the link menu, may beat the timer; it
  // holds all the same.
  function onContextmenu(event: MouseEvent) {
    if (!touched) {
      return
    }
    event.preventDefault()
    if (isPending.value) {
      stop()
      engage()
    }
  }

  // Some browsers, iOS among them, follow a long press with a click; it must
  // not open the link.
  function onClick(event: MouseEvent) {
    if (!swallow) {
      return
    }
    swallow = false
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  useEventListener(element, 'pointerdown', onPointerdown, { passive: true })
  useEventListener(element, 'pointermove', onPointermove, { passive: true })
  useEventListener(element, ['pointerup', 'pointercancel'], onPointerup, {
    passive: true,
  })
  useEventListener(element, 'contextmenu', onContextmenu)
  useEventListener(element, 'click', onClick, { capture: true })

  return {
    held,
  }
}

export type UseHoldReturn = ReturnType<typeof useHold>
