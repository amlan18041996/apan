<template>
  <div
    class="inline-flex items-center gap-1.5"
    :class="[textSizeClasses[size]]"
    :role="readonly ? 'img' : 'radiogroup'"
    :aria-label="readonly ? `Rating: ${displayValue} out of ${max} stars` : 'Rating'"
  >
    <div class="inline-flex items-center" :class="gapClasses[size]">
      <component
        :is="readonly ? 'span' : 'button'"
        v-for="star in max"
        :key="star"
        :type="readonly ? undefined : 'button'"
        :disabled="readonly"
        :role="readonly ? undefined : 'radio'"
        :aria-checked="readonly ? undefined : star <= Math.round(displayValue)"
        :aria-label="readonly ? undefined : `${star} star${star > 1 ? 's' : ''}`"
        class="relative inline-flex shrink-0 focus:outline-none"
        :class="[
          sizeClasses[size],
          readonly
            ? ''
            : 'cursor-pointer rounded-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
        ]"
        @click="readonly ? undefined : setRating(star)"
        @mouseenter="readonly ? undefined : setHover(star)"
        @mouseleave="readonly ? undefined : clearHover"
        @keydown="readonly ? undefined : handleKeyboard($event, star)"
      >
        <svg
          class="text-gray-300"
          :class="sizeClasses[size]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path :d="starPath" />
        </svg>
        <svg
          class="absolute inset-0 text-yellow-400 transition-[clip-path] duration-100"
          :class="sizeClasses[size]"
          fill="currentColor"
          viewBox="0 0 20 20"
          :style="{ clipPath: starClip(star) }"
        >
          <path :d="starPath" />
        </svg>
      </component>
    </div>

    <span v-if="showValue" class="font-medium text-text" :class="textSizeClasses[size]">
      {{ displayValue }}
    </span>

    <span v-if="reviewCount !== undefined" class="text-text-muted" :class="textSizeClasses[size]">
      ({{ reviewCount }})
    </span>
  </div>
</template>

<script setup lang="ts">
const starPath =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

interface Props {
  modelValue?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  reviewCount?: number
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  max: 5,
  size: 'md',
  showValue: false,
  reviewCount: undefined,
  readonly: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoveredValue = ref(0)
const isHovering = ref(false)

const displayValue = computed(() => {
  return isHovering.value ? hoveredValue.value : props.modelValue
})

function fillAmount(star: number): number {
  const value = displayValue.value
  if (value >= star) return 1
  if (value >= star - 0.5) return value - star + 1
  return 0
}

function starClip(star: number): string {
  const fill = fillAmount(star)
  return `inset(0 ${(1 - fill) * 100}% 0 0)`
}

function setRating(value: number) {
  emit('update:modelValue', value)
}

function setHover(value: number) {
  hoveredValue.value = value
  isHovering.value = true
}

function clearHover() {
  isHovering.value = false
  hoveredValue.value = 0
}

function handleKeyboard(event: KeyboardEvent, _star: number) {
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault()
    const next = Math.min(props.modelValue + 1, props.max)
    emit('update:modelValue', next)
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault()
    const prev = Math.max(props.modelValue - 1, 0)
    emit('update:modelValue', prev)
  } else if (event.key === 'Home') {
    event.preventDefault()
    emit('update:modelValue', 0)
  } else if (event.key === 'End') {
    event.preventDefault()
    emit('update:modelValue', props.max)
  }
}

const sizeClasses: Record<string, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

const gapClasses: Record<string, string> = {
  sm: 'gap-0.5',
  md: 'gap-0.5',
  lg: 'gap-1',
}

const textSizeClasses: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}
</script>
