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
  'inline-flex items-center rounded-lg border border-border': true,
  'h-8 text-sm': props.size === 'sm',
  'h-10 text-sm': props.size === 'lg',
}))

const buttonClasses = computed(() => ({
  'flex items-center justify-center text-text-muted transition-colors hover:bg-gray-100': true,
  'h-8 w-8': props.size === 'sm',
  'h-10 w-10': props.size === 'lg',
}))

const inputClasses = computed(() => ({
  'flex items-center justify-center border-x border-border bg-transparent text-center font-medium text-text tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none': true,
  'h-8 w-10 text-sm': props.size === 'sm',
  'h-10 w-14 text-sm': props.size === 'lg',
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
      :class="[buttonClasses, { 'cursor-not-allowed opacity-30': isAtMin }]"
      :disabled="isAtMin"
      :aria-label="`Decrease quantity by ${step}`"
      @click="decrement"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
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
      :class="[buttonClasses, { 'cursor-not-allowed opacity-30': isAtMax }]"
      :disabled="isAtMax"
      :aria-label="`Increase quantity by ${step}`"
      @click="increment"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </div>
</template>
