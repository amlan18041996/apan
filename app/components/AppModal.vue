<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="modelValue"
        aria-hidden="true"
        class="fixed inset-0 z-40 bg-black/50"
        :class="{ 'cursor-pointer': closeOnBackdrop }"
        @click="onBackdropClick"
      />
    </Transition>
    <Transition name="panel" @after-leave="onAfterLeave">
      <div
        v-if="modelValue"
        ref="panelRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="fixed z-50 overflow-y-auto outline-none"
        :class="panelOuterClasses"
        @keydown="onKeydown"
      >
        <div
          class="mx-auto flex max-h-full flex-col rounded-xl bg-white shadow-xl"
          :class="panelInnerClasses"
        >
          <div
            class="flex items-start justify-between rounded-t-xl border-b border-gray-200 px-6 py-4"
          >
            <slot name="header">
              <h2 v-if="title" :id="titleId" class="text-lg font-semibold text-gray-900">
                {{ title }}
              </h2>
            </slot>
            <button
              type="button"
              class="-mr-1.5 -mt-1.5 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              :aria-label="`Close ${title || 'dialog'}`"
              @click="close"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <slot />
          </div>
          <div v-if="$slots.footer" class="rounded-b-xl border-t border-gray-200 px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface Props {
  modelValue: boolean
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnBackdrop: true,
  closeOnEscape: true,
  title: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const panelRef = ref<HTMLElement | null>(null)
let triggerElement: HTMLElement | null = null
let uid = 0

const titleId = computed(() => `app-modal-title-${uid}`)

const isFullscreen = computed(() => props.size === 'fullscreen')

const panelOuterClasses = computed(() => {
  if (isFullscreen.value) {
    return 'inset-4'
  }
  return 'inset-0 flex items-center justify-center p-4'
})

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  fullscreen: 'h-full w-full',
}

const panelInnerClasses = computed(() => {
  if (isFullscreen.value) {
    return 'h-full w-full'
  }
  return sizeClasses[props.size] || sizeClasses.md
})

function focusFirstElement() {
  const panel = panelRef.value
  if (!panel) return
  const focusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTORS)
  if (focusable) {
    focusable.focus()
  } else {
    panel.focus()
  }
}

function trapFocus(event: KeyboardEvent) {
  const panel = panelRef.value
  if (!panel) return
  const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closeOnEscape) {
    event.stopPropagation()
    close()
  }
  if (event.key === 'Tab') {
    trapFocus(event)
  }
}

function close() {
  emit('update:modelValue', false)
}

function onAfterLeave() {
  triggerElement?.focus()
  triggerElement = null
}

onMounted(() => {
  uid = Date.now() + Math.floor(Math.random() * 1000)
})

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      triggerElement = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      await nextTick()
      focusFirstElement()
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 250ms ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
