<template>
  <div class="accordion-item">
    <button
      :id="headerId"
      type="button"
      class="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left text-sm font-medium text-text transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
      :class="{ 'cursor-not-allowed opacity-50': disabled }"
      :disabled="disabled"
      :aria-expanded="isOpen(value)"
      :aria-controls="contentId"
      @click="handleToggle"
      @keydown.enter.prevent="handleToggle"
      @keydown.space.prevent="handleToggle"
    >
      <slot name="header" :open="isOpen(value)">
        <span>{{ label }}</span>
      </slot>
      <slot name="icon" :open="isOpen(value)">
        <svg
          class="h-4 w-4 shrink-0 text-text-muted transition-transform duration-200"
          :class="{ 'rotate-180': isOpen(value) }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </slot>
    </button>
    <div
      :id="contentId"
      role="region"
      :aria-labelledby="headerId"
      class="overflow-hidden transition-[max-height] duration-300 ease-out"
      :style="{ maxHeight: panelHeight + 'px' }"
    >
      <div ref="contentRef" class="px-4 pb-4 text-sm text-text-muted">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AccordionProvide {
  toggle: (value: string | number) => void
  isOpen: (value: string | number) => boolean
}

interface Props {
  value: string | number
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
})

const accordion = inject<AccordionProvide>('accordion')

if (!accordion) {
  throw new Error('AccordionItem must be used within an Accordion')
}

const { toggle, isOpen } = accordion

const contentRef = ref<HTMLElement | null>(null)
const contentHeight = ref(0)

const isOpenNow = computed(() => isOpen(props.value))

const panelHeight = computed(() => (isOpenNow.value ? contentHeight.value : 0))

watch(isOpenNow, (open) => {
  if (open) {
    nextTick(() => {
      contentHeight.value = contentRef.value?.scrollHeight ?? 0
    })
  }
})

onMounted(() => {
  if (isOpenNow.value) {
    contentHeight.value = contentRef.value?.scrollHeight ?? 0
  }
})

let idCounter = 0
const instanceId = `accordion-${++idCounter}-${Math.random().toString(36).slice(2, 8)}`
const headerId = `${instanceId}-header`
const contentId = `${instanceId}-panel`

function handleToggle() {
  if (!props.disabled) {
    toggle(props.value)
  }
}
</script>
