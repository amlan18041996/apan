<template>
  <div ref="wrapperRef" class="relative inline-flex">
    <div
      ref="triggerRef"
      @click="onTriggerClick"
      @mouseenter="onTriggerMouseEnter"
      @mouseleave="onTriggerMouseLeave"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger" :toggle="toggle" :is-open="modelValue" />
    </div>
    <Transition name="dropdown">
      <div
        v-if="modelValue"
        ref="menuRef"
        role="menu"
        class="absolute z-50 rounded-lg border border-gray-200 bg-white py-1 shadow-lg focus:outline-none"
        :style="menuStyle"
        @click="onMenuClick"
        @keydown="onMenuKeydown"
        @mouseenter="onMenuMouseEnter"
        @mouseleave="onMenuMouseLeave"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const MENU_ITEM_SELECTOR =
  '[role="menuitem"], a:not([role]), button:not([role]):not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'

interface Props {
  modelValue?: boolean
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  closeOnSelect?: boolean
  closeOnOutside?: boolean
  triggerOn?: 'click' | 'hover'
  offset?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  position: 'bottom-left',
  closeOnSelect: true,
  closeOnOutside: true,
  triggerOn: 'click',
  offset: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const triggerWidth = ref(0)

let hoverTimer: ReturnType<typeof setTimeout> | null = null

const basePositionStyles: Record<string, Record<string, string>> = {
  'bottom-left': { top: '100%', left: '0' },
  'bottom-right': { top: '100%', right: '0' },
  'top-left': { bottom: '100%', left: '0' },
  'top-right': { bottom: '100%', right: '0' },
}

const menuStyle = computed(() => {
  const pos = basePositionStyles[props.position]
  const style: Record<string, string> = { ...pos }

  if (props.position.startsWith('bottom')) {
    style.marginTop = `${props.offset}px`
  } else {
    style.marginBottom = `${props.offset}px`
  }

  if (triggerWidth.value) {
    style.minWidth = `${triggerWidth.value}px`
  }

  return style
})

function getMenuItems(): HTMLElement[] {
  if (!menuRef.value) return []
  return Array.from(menuRef.value.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR))
}

function focusItem(items: HTMLElement[], index: number) {
  if (items[index]) items[index].focus()
}

function open() {
  if (props.modelValue) return
  triggerWidth.value = triggerRef.value?.offsetWidth || 0
  emit('update:modelValue', true)
}

function close() {
  if (!props.modelValue) return
  emit('update:modelValue', false)
}

function toggle() {
  if (props.modelValue) close()
  else open()
}

function onTriggerClick() {
  if (props.triggerOn !== 'click') return
  toggle()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggle()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!props.modelValue) open()
    nextTick(() => {
      const items = getMenuItems()
      if (items.length) focusItem(items, 0)
    })
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!props.modelValue) open()
    nextTick(() => {
      const items = getMenuItems()
      if (items.length) focusItem(items, items.length - 1)
    })
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  const items = getMenuItems()
  if (!items.length) return

  const currentIndex = items.indexOf(document.activeElement as HTMLElement)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusItem(items, (currentIndex + 1) % items.length)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusItem(items, (currentIndex - 1 + items.length) % items.length)
      break
    case 'Home':
      event.preventDefault()
      focusItem(items, 0)
      break
    case 'End':
      event.preventDefault()
      focusItem(items, items.length - 1)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      ;(document.activeElement as HTMLElement)?.click()
      break
    case 'Escape':
      event.preventDefault()
      close()
      nextTick(() => triggerRef.value?.querySelector('button, a, [tabindex]')?.focus())
      break
    case 'Tab':
      close()
      break
  }
}

function checkBoundary() {
  const menu = menuRef.value
  if (!menu) return

  const rect = menu.getBoundingClientRect()
  let dx = 0
  let dy = 0

  if (rect.right > window.innerWidth) dx = window.innerWidth - rect.right - 8
  if (rect.left < 0) dx = -rect.left + 8
  if (rect.bottom > window.innerHeight) dy = window.innerHeight - rect.bottom - 8
  if (rect.top < 0) dy = -rect.top + 8

  if (dx !== 0 || dy !== 0) {
    menu.style.transform = `translate(${dx}px, ${dy}px)`
  }
}

function onMenuClick(event: MouseEvent) {
  if (!props.closeOnSelect) return
  const target = event.target as HTMLElement
  if (target.closest(MENU_ITEM_SELECTOR)) {
    close()
  }
}

function onDocumentMousedown(event: MouseEvent) {
  if (!props.closeOnOutside) return
  if (!wrapperRef.value?.contains(event.target as Node)) {
    close()
  }
}

function onTriggerMouseEnter() {
  if (props.triggerOn !== 'hover') return
  if (hoverTimer) clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => open(), 150)
}

function onTriggerMouseLeave() {
  if (props.triggerOn !== 'hover') return
  if (hoverTimer) clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => close(), 300)
}

function onMenuMouseEnter() {
  if (props.triggerOn !== 'hover') return
  if (hoverTimer) clearTimeout(hoverTimer)
}

function onMenuMouseLeave() {
  if (props.triggerOn !== 'hover') return
  if (hoverTimer) clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => close(), 300)
}

function addDocumentListener() {
  document.addEventListener('mousedown', onDocumentMousedown)
}

function removeDocumentListener() {
  document.removeEventListener('mousedown', onDocumentMousedown)
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      checkBoundary()
      if (props.triggerOn === 'click') {
        addDocumentListener()
      }
    } else {
      removeDocumentListener()
      if (hoverTimer) clearTimeout(hoverTimer)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  removeDocumentListener()
  if (hoverTimer) clearTimeout(hoverTimer)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
