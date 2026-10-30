<template>
  <color-scheme tag="div">
    <magic-menu-provider
      :id="MenuIds.ColorMode"
      :options="{
        mode: 'dropdown',
        scrollLock: false,
        floating: { strategy: 'fixed' },
        transition: { content: { default: 'ui-color-mode-menu' } },
      }"
    >
      <magic-menu-view :id="MenuViewIds.ColorMode" placement="top-start">
        <magic-menu-trigger as-child>
          <button
            type="button"
            :class="[
              ROW,
              BOX,
              'rounded-component-compact-sm focus-visible:focus-shadow px-[1ch] py-[0.25lh] outline-hidden',
              'hover:bg-primary-subtle-hover data-[active=true]:bg-primary-subtle-active',
            ]"
            :aria-label="`Colour mode: ${current.label}`"
          >
            <ui-icon :name="current.icon" />
            <span>{{ current.label }}</span>
          </button>
        </magic-menu-trigger>
        <magic-menu-content :arrow="false">
          <div :class="[BOX, 'rounded-component-xs mb-1.5 p-1']">
            <!-- Rows sit on the box's tint, so a second layer of it is enough
                 to highlight them. Their radius is the box's minus its
                 padding. -->
            <magic-menu-item
              v-for="option in OPTIONS"
              :key="option.value"
              :class="[
                ROW,
                'rounded-component-compact-sm data-[active=true]:bg-primary-subtle px-[1ch] py-[0.125lh]',
              ]"
              @click="select(option.value)"
            >
              <ui-icon
                :name="option.value === preference ? 'check' : 'spacer'"
              />
              <ui-icon :name="option.icon" />
              <span>{{ option.label }}</span>
            </magic-menu-item>
          </div>
        </magic-menu-content>
      </magic-menu-view>
    </magic-menu-provider>
    <!-- The server does not know the choice, so it holds the button's place
         with a blank the size of the icon and the button's padding; an icon
         here would have the Worker fetch it on every render. -->
    <template #placeholder>
      <span :class="[ROW, 'invisible px-[1ch] py-[0.25lh]']" aria-hidden="true">
        <span class="inline-block size-[1em]" />
        <span>{{ SYSTEM.label }}</span>
      </span>
    </template>
  </color-scheme>
</template>

<script setup lang="ts">
import { loadIcons } from '@iconify/vue'
import { MenuIds, MenuViewIds } from '../utils/enums'
import { iconName } from '../utils/icon'

type ColorModePreference = 'system' | 'light' | 'dark'

type ColorModeValue = Exclude<ColorModePreference, 'system'>

interface ColorModeOption {
  value: ColorModePreference
  label: string
  icon: string
}

const SYSTEM: ColorModeOption = {
  value: 'system',
  label: 'System',
  icon: 'device-phone',
}

const OPTIONS: Array<ColorModeOption> = [
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'light', label: 'Light', icon: 'sun' },
  SYSTEM,
]

// The menu’s icons, fetched as soon as the switch is on the page, so the
// menu opens with them in place and the trigger changes without a gap.
const ICONS = [...OPTIONS.map((option) => option.icon), 'check', 'spacer'].map(
  (name) => iconName({ name })
)

const ROW =
  'flex cursor-pointer items-center gap-x-[1ch] whitespace-nowrap text-xs'

// The primary tint is translucent, so the blur keeps content scrolling
// underneath legible.
const BOX = 'bg-primary-subtle text-primary-on-subtle backdrop-blur-md'

const colorMode = useColorMode()
const { run } = useSwitch()

const preference = computed<ColorModePreference>(
  () =>
    OPTIONS.find((entry) => entry.value === colorMode.preference)?.value ??
    'system'
)

const current = computed(
  () => OPTIONS.find((entry) => entry.value === preference.value) ?? SYSTEM
)

function systemValue(): ColorModeValue {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// The page changes mode through the switch: a cross-fade, where the browser
// has one. A choice that leaves the page as it is, such as System on a
// system already in the mode shown, is kept without the switch.
function select(value: ColorModePreference) {
  const next = value === 'system' ? systemValue() : value
  if (next === colorMode.value) {
    colorMode.preference = value
    return
  }
  run(async () => {
    colorMode.preference = value
    await nextTick()
  })
}

onMounted(() => {
  loadIcons(ICONS)
})
</script>
