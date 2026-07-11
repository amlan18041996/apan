<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <label v-if="label" class="text-sm font-medium text-text">{{ label }}</label>
      <button
        v-if="sizeGuideUrl || $slots.sizeGuide"
        type="button"
        class="text-sm font-medium text-primary-600 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
        @click="sizeGuideOpen = true"
      >
        Size Guide
      </button>
    </div>
    <div
      ref="containerRef"
      role="radiogroup"
      :aria-label="label || 'Size selection'"
      class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
    >
      <button
        v-for="(option, index) in options"
        :key="option.value"
        :ref="(el) => setButtonRef(el, index)"
        type="button"
        role="radio"
        :aria-checked="modelValue === option.value"
        :aria-label="option.label"
        :aria-disabled="option.disabled"
        :disabled="option.disabled"
        class="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
        :class="{
          'border-primary-600 bg-primary-600 text-white shadow-sm':
            modelValue === option.value && !option.disabled,
          'border-border bg-white text-text hover:border-primary-500 hover:text-primary-600':
            modelValue !== option.value && !option.disabled,
          'cursor-not-allowed border-border bg-gray-50 text-gray-400 opacity-50': option.disabled,
          'cursor-pointer': !option.disabled,
        }"
        @click="selectOption(option)"
        @keydown="onKeydown($event, index)"
      >
        <span v-if="option.disabled" class="absolute inset-0 flex items-center justify-center">
          <span class="h-[2px] w-[calc(100%-12px)] -rotate-45 bg-gray-400 opacity-60" />
        </span>
        {{ option.label }}
      </button>
    </div>

    <AppModal v-model="sizeGuideOpen" size="md" title="Size Guide">
      <slot name="sizeGuide">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-2 pr-4 font-medium text-gray-900">Size</th>
                <th class="py-2 pr-4 font-medium text-gray-900">Chest (in)</th>
                <th class="py-2 pr-4 font-medium text-gray-900">Waist (in)</th>
                <th class="py-2 font-medium text-gray-900">Hips (in)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-100">
                <td class="py-2 pr-4 text-gray-900">XS</td>
                <td class="py-2 pr-4 text-gray-600">32–34</td>
                <td class="py-2 pr-4 text-gray-600">26–28</td>
                <td class="py-2 text-gray-600">34–36</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-2 pr-4 text-gray-900">S</td>
                <td class="py-2 pr-4 text-gray-600">35–37</td>
                <td class="py-2 pr-4 text-gray-600">29–31</td>
                <td class="py-2 text-gray-600">37–39</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-2 pr-4 text-gray-900">M</td>
                <td class="py-2 pr-4 text-gray-600">38–40</td>
                <td class="py-2 pr-4 text-gray-600">32–34</td>
                <td class="py-2 text-gray-600">40–42</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-2 pr-4 text-gray-900">L</td>
                <td class="py-2 pr-4 text-gray-600">41–43</td>
                <td class="py-2 pr-4 text-gray-600">35–37</td>
                <td class="py-2 text-gray-600">43–45</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-2 pr-4 text-gray-900">XL</td>
                <td class="py-2 pr-4 text-gray-600">44–46</td>
                <td class="py-2 pr-4 text-gray-600">38–40</td>
                <td class="py-2 text-gray-600">46–48</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 text-gray-900">XXL</td>
                <td class="py-2 pr-4 text-gray-600">47–49</td>
                <td class="py-2 pr-4 text-gray-600">41–43</td>
                <td class="py-2 text-gray-600">49–51</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-4 text-xs text-text-muted">
          Measurements are in inches. For the best fit, measure yourself and compare with the chart
          above.
        </p>
      </slot>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue'

export interface SizePickerOption {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | null
  options: SizePickerOption[]
  label?: string
  sizeGuideUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  sizeGuideUrl: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const buttonRefs = ref<HTMLElement[]>([])
const sizeGuideOpen = ref(false)

function setButtonRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLElement) {
    buttonRefs.value[index] = el
  }
}

function selectOption(option: SizePickerOption) {
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
</script>
