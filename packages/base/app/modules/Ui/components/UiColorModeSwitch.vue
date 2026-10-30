<template>
  <color-scheme tag="div">
    <magic-menu-provider
      :id="menu.id"
      :options="{
        mode: 'dropdown',
        scrollLock: false,
        floating: { strategy: 'fixed' },
        transition: { content: { default: 'ui-color-mode-menu' } },
      }"
    >
      <magic-menu-view :id="menu.viewId" :placement="placement">
        <magic-menu-trigger as-child>
          <button
            type="button"
            :class="[
              rowClass,
              variant === 'button'
                ? [
                    boxClass,
                    'hover:bg-primary-subtle-hover data-[active=true]:bg-primary-subtle-active rounded-component-compact-sm px-[1ch] py-[0.25lh]',
                  ]
                : 'text-surface-muted data-[active=true]:text-surface',
            ]"
            :aria-label="`Colour mode: ${current.label}`"
          >
            <ui-icon :name="current.icon" />
            <span>{{ current.label }}</span>
          </button>
        </magic-menu-trigger>
        <magic-menu-content :arrow="false">
          <div :class="[boxClass, 'rounded-component-xs p-1', menu.gapClass]">
            <!-- Rows sit on the box's tint, so a second layer of it is enough
                 to highlight them. Their radius is the box's minus its
                 padding. -->
            <magic-menu-item
              v-for="option in options"
              :key="option.value"
              :class="[
                rowClass,
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
    <template #placeholder>
      <span :class="[rowClass, 'invisible']" aria-hidden="true">
        <ui-icon :name="SYSTEM.icon" />
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

type ColorModeMenuPlacement = 'top-start' | 'bottom-end'

interface UiColorModeSwitchProps {
  placement?: ColorModeMenuPlacement
  variant?: 'plain' | 'button'
}

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

const options: Array<ColorModeOption> = [
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'light', label: 'Light', icon: 'sun' },
  SYSTEM,
]

// The menu’s icons, fetched as soon as the switch is on the page, so the
// menu opens with them in place and the trigger changes without a gap.
const ICONS = [...options.map((option) => option.icon), 'check', 'spacer'].map(
  (name) => iconName({ name })
)

// Each placement is its own instance on the page, so each needs its own menu.
const MENUS = {
  'top-start': {
    id: MenuIds.ColorModeTop,
    viewId: MenuViewIds.ColorModeTop,
    gapClass: 'mb-1.5',
  },
  'bottom-end': {
    id: MenuIds.ColorModeBottom,
    viewId: MenuViewIds.ColorModeBottom,
    gapClass: 'mt-1.5',
  },
} satisfies Record<ColorModeMenuPlacement, unknown>

const rowClass =
  'flex cursor-pointer items-center gap-x-[1ch] whitespace-nowrap text-xs'

// The primary tint is translucent, so the blur keeps content scrolling
// underneath legible.
const boxClass = 'bg-primary-subtle text-primary-on-subtle backdrop-blur-md'

const { placement = 'top-start', variant = 'plain' } =
  defineProps<UiColorModeSwitchProps>()

const menu = computed(() => MENUS[placement])

const colorMode = useColorMode()
const { run } = useSwitch()

const preference = computed<ColorModePreference>(
  () =>
    options.find((entry) => entry.value === colorMode.preference)?.value ??
    'system'
)

const current = computed(
  () => options.find((entry) => entry.value === preference.value) ?? SYSTEM
)

function systemValue(): ColorModeValue {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// The page changes mode through the switch: a cross-fade, where the browser
// has one. A choice that leaves the page as it
// is, such as System on a system already in the mode shown, is kept
// without the switch.
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
