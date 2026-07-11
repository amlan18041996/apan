<template>
  <div>
    <label v-if="label" class="mb-2 block text-sm font-medium text-text">{{ label }}</label>
    <div
      ref="containerRef"
      role="radiogroup"
      :aria-label="label || 'Color selection'"
      class="flex flex-wrap gap-3"
    >
      <div v-for="(option, index) in options" :key="option.value" class="relative">
        <button
          :ref="(el) => setButtonRef(el, index)"
          type="button"
          role="radio"
          :aria-checked="modelValue === option.value"
          :aria-label="option.label"
          :aria-disabled="option.disabled"
          :disabled="option.disabled"
          :title="option.label"
          class="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          :class="{
            'cursor-pointer hover:scale-110': !option.disabled,
            'cursor-not-allowed opacity-40': option.disabled,
            'ring-2 ring-primary-600 ring-offset-2':
              modelValue === option.value && !option.disabled,
            'border border-gray-200 hover:border-gray-400':
              modelValue !== option.value && !option.disabled,
          }"
          :style="{ backgroundColor: option.color }"
          @click="selectOption(option)"
          @keydown="onKeydown($event, index)"
        >
          <svg
            v-if="modelValue === option.value && !option.disabled"
            class="h-5 w-5 drop-shadow-sm"
            :class="isLightColor(option.color) ? 'text-gray-800' : 'text-white'"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg
            v-if="option.disabled"
            class="absolute left-1/2 top-1/2 h-[calc(100%-6px)] w-[2px] -translate-x-1/2 -translate-y-1/2 rotate-45"
            :style="{
              backgroundColor: isLightColor(option.color)
                ? 'rgba(0,0,0,0.4)'
                : 'rgba(255,255,255,0.6)',
            }"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue'

export interface ColorSwatchOption {
  value: string
  label: string
  color: string
  disabled?: boolean
}

interface Props {
  modelValue: string | null
  options: ColorSwatchOption[]
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const buttonRefs = ref<HTMLElement[]>([])

function setButtonRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLElement) {
    buttonRefs.value[index] = el
  }
}

function selectOption(option: ColorSwatchOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
}

function onKeydown(event: KeyboardEvent, currentIndex: number) {
  const enabledIndices = props.options
    .map((opt, i) => (opt.disabled ? -1 : i))
    .filter((i) => i !== -1)

  if (enabledIndices.length === 0) return

  const posInEnabled = enabledIndices.indexOf(currentIndex)
  let nextIndex: number

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      nextIndex = enabledIndices[(posInEnabled + 1) % enabledIndices.length]
      buttonRefs.value[nextIndex]?.focus()
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      nextIndex = enabledIndices[(posInEnabled - 1 + enabledIndices.length) % enabledIndices.length]
      buttonRefs.value[nextIndex]?.focus()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectOption(props.options[currentIndex])
      break
  }
}

function isLightColor(color: string): boolean {
  if (!color) return false
  const hex = color.replace('#', '')
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 186
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 186
  }
  return false
}
</script>
