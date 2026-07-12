<script setup lang="ts">
interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  size?: 'sm' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  min: 1,
  max: 99,
  step: 1,
  size: 'sm',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const displayValue = computed({
  get: () => props.modelValue,
  set: (val: number) => {
    const clamped = Math.min(Math.max(val, props.min), props.max)
    if (clamped !== props.modelValue) {
      emit('update:modelValue', clamped)
      emit('change', clamped)
    }
  },
})

const isAtMin = computed(() => props.modelValue <= props.min)
const isAtMax = computed(() => props.modelValue >= props.max)

function decrement() {
  if (isAtMin.value) return
  const next = Math.max(props.modelValue - props.step, props.min)
  emit('update:modelValue', next)
  emit('change', next)
}

function increment() {
  if (isAtMax.value) return
  const next = Math.min(props.modelValue + props.step, props.max)
  emit('update:modelValue', next)
  emit('change', next)
}

const containerClasses = computed(() => ({
  'inline-flex items-center rounded-lg border border-gray-300': true,
  'h-8 text-sm': props.size === 'sm',
  'h-11 text-base': props.size === 'lg',
}))

const buttonClasses = computed(() => ({
  'flex items-center justify-center text-gray-600 transition-colors': true,
  'hover:bg-gray-100 active:bg-gray-200': true,
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset': true,
  'h-8 w-8': props.size === 'sm',
  'h-11 w-11': props.size === 'lg',
}))

const inputClasses = computed(() => ({
  'flex items-center justify-center border-x border-gray-300 bg-white text-center font-medium text-gray-900 tabular-nums focus:outline-none': true,
  'h-8 w-10 text-sm': props.size === 'sm',
  'h-11 w-14 text-base': props.size === 'lg',
}))
</script>

<template>
  <div
    :class="containerClasses"
    role="group"
    :aria-label="`Quantity selector, current value ${modelValue}`"
    :aria-valuenow="modelValue"
    :aria-valuemin="min"
    :aria-valuemax="max"
  >
    <button
      type="button"
      :class="buttonClasses"
      :disabled="isAtMin"
      :aria-label="`Decrease quantity by ${step}`"
      @click="decrement"
    >
      <svg
        class="h-4 w-4"
        :class="{ 'h-3.5 w-3.5': size === 'sm' }"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
      </svg>
    </button>

    <input
      type="text"
      :class="inputClasses"
      :value="displayValue"
      readonly
      :aria-label="`Quantity: ${modelValue}`"
    />

    <button
      type="button"
      :class="buttonClasses"
      :disabled="isAtMax"
      :aria-label="`Increase quantity by ${step}`"
      @click="increment"
    >
      <svg
        class="h-4 w-4"
        :class="{ 'h-3.5 w-3.5': size === 'sm' }"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
</style>
