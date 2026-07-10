<template>
  <div class="price-range-slider">
    <div
      ref="trackRef"
      class="relative h-2 w-full cursor-pointer rounded-full bg-gray-200"
      @mousedown="onTrackClick"
      @touchstart.passive="onTrackTouch"
    >
      <div
        class="absolute top-0 h-full rounded-full bg-primary-600"
        :style="{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }"
      />

      <div
        ref="minHandleRef"
        class="price-range-handle"
        :class="{ 'z-20': activeHandle === 'min', 'z-10': activeHandle !== 'min' }"
        role="slider"
        :aria-valuenow="localValue[0]"
        :aria-valuemin="min"
        :aria-valuemax="localValue[1]"
        aria-label="Minimum price"
        tabindex="0"
        :style="{ left: `${minPercent}%` }"
        @mousedown.stop="startDrag($event, 'min')"
        @touchstart.stop.passive="startDrag($event, 'min')"
        @keydown="onKeydown($event, 'min')"
      />

      <div
        ref="maxHandleRef"
        class="price-range-handle"
        :class="{ 'z-20': activeHandle === 'max', 'z-10': activeHandle !== 'max' }"
        role="slider"
        :aria-valuenow="localValue[1]"
        :aria-valuemin="localValue[0]"
        :aria-valuemax="max"
        aria-label="Maximum price"
        tabindex="0"
        :style="{ left: `${maxPercent}%` }"
        @mousedown.stop="startDrag($event, 'max')"
        @touchstart.stop.passive="startDrag($event, 'max')"
        @keydown="onKeydown($event, 'max')"
      />
    </div>

    <div class="mt-4 flex items-center gap-3">
      <div class="relative flex-1">
        <span
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          >$</span
        >
        <input
          type="text"
          :value="localValue[0]"
          aria-label="Minimum price"
          class="input-field !py-2 pl-7 pr-2 text-sm"
          @input="onMinInputChange"
          @blur="onMinInputBlur"
        />
      </div>
      <span class="text-gray-400">&ndash;</span>
      <div class="relative flex-1">
        <span
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          >$</span
        >
        <input
          type="text"
          :value="localValue[1]"
          aria-label="Maximum price"
          class="input-field !py-2 pl-7 pr-2 text-sm"
          @input="onMaxInputChange"
          @blur="onMaxInputBlur"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: [number, number]
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 1000,
  step: 10,
})

const emit = defineEmits<{
  'update:modelValue': [value: [number, number]]
}>()

const trackRef = ref<HTMLDivElement | null>(null)
const minHandleRef = ref<HTMLDivElement | null>(null)
const maxHandleRef = ref<HTMLDivElement | null>(null)
const activeHandle = ref<'min' | 'max' | null>(null)
const localValue = ref<[number, number]>([...props.modelValue])

const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)
let rafId = 0

const minPercent = computed(() => {
  return ((localValue.value[0] - props.min) / (props.max - props.min)) * 100
})

const maxPercent = computed(() => {
  return ((localValue.value[1] - props.min) / (props.max - props.min)) * 100
})

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = [...val]
  },
  { deep: true },
)

function clamp(value: number): number {
  const clamped = Math.round(value / props.step) * props.step
  return Math.max(props.min, Math.min(props.max, clamped))
}

function valueFromX(clientX: number): number {
  if (!trackRef.value) return props.min
  const rect = trackRef.value.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  return props.min + ratio * (props.max - props.min)
}

function startDrag(event: MouseEvent | TouchEvent, handle: 'min' | 'max') {
  activeHandle.value = handle
  document.addEventListener('mousemove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

function onDrag(event: MouseEvent | TouchEvent) {
  if (!activeHandle.value) return
  event.preventDefault()

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const rawValue = valueFromX(clientX)
  const stepped = clamp(rawValue)

  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    if (activeHandle.value === 'min') {
      const clamped = Math.min(stepped, localValue.value[1])
      if (clamped !== localValue.value[0]) {
        localValue.value = [clamped, localValue.value[1]]
      }
    } else {
      const clamped = Math.max(stepped, localValue.value[0])
      if (clamped !== localValue.value[1]) {
        localValue.value = [localValue.value[0], clamped]
      }
    }
  })

  debouncedEmit()
}

function stopDrag() {
  activeHandle.value = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

function onTrackClick(event: MouseEvent) {
  const clientX = event.clientX
  const rawValue = valueFromX(clientX)
  const stepped = clamp(rawValue)
  const distToMin = Math.abs(stepped - localValue.value[0])
  const distToMax = Math.abs(stepped - localValue.value[1])

  if (distToMin <= distToMax) {
    const clamped = Math.min(stepped, localValue.value[1])
    localValue.value = [clamped, localValue.value[1]]
    minHandleRef.value?.focus()
  } else {
    const clamped = Math.max(stepped, localValue.value[0])
    localValue.value = [localValue.value[0], clamped]
    maxHandleRef.value?.focus()
  }

  debouncedEmit()
}

function onTrackTouch(event: TouchEvent) {
  if (!trackRef.value) return
  const touch = event.touches[0]
  const clientX = touch.clientX
  const rawValue = valueFromX(clientX)
  const stepped = clamp(rawValue)
  const distToMin = Math.abs(stepped - localValue.value[0])
  const distToMax = Math.abs(stepped - localValue.value[1])

  if (distToMin <= distToMax) {
    const clamped = Math.min(stepped, localValue.value[1])
    localValue.value = [clamped, localValue.value[1]]
    activeHandle.value = 'min'
  } else {
    const clamped = Math.max(stepped, localValue.value[0])
    localValue.value = [localValue.value[0], clamped]
    activeHandle.value = 'max'
  }

  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
  debouncedEmit()
}

function onKeydown(event: KeyboardEvent, handle: 'min' | 'max') {
  const increment = event.shiftKey ? props.step * 10 : props.step
  let newValue = localValue.value[handle === 'min' ? 0 : 1]

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      newValue = clamp(newValue + increment)
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      newValue = clamp(newValue - increment)
      break
    case 'Home':
      newValue = props.min
      break
    case 'End':
      newValue = props.max
      break
    default:
      return
  }

  event.preventDefault()

  if (handle === 'min') {
    localValue.value = [Math.min(newValue, localValue.value[1]), localValue.value[1]]
  } else {
    localValue.value = [localValue.value[0], Math.max(newValue, localValue.value[0])]
  }

  debouncedEmit()
}

function onMinInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  const parsed = parseFloat(target.value.replace(/[^0-9.]/g, ''))
  if (!isNaN(parsed)) {
    const clamped = clamp(parsed)
    localValue.value = [Math.min(clamped, localValue.value[1]), localValue.value[1]]
    debouncedEmit()
  }
}

function onMinInputBlur() {
  localValue.value = [...localValue.value]
  debouncedEmit()
}

function onMaxInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  const parsed = parseFloat(target.value.replace(/[^0-9.]/g, ''))
  if (!isNaN(parsed)) {
    const clamped = clamp(parsed)
    localValue.value = [localValue.value[0], Math.max(clamped, localValue.value[0])]
    debouncedEmit()
  }
}

function onMaxInputBlur() {
  localValue.value = [...localValue.value]
  debouncedEmit()
}

function debouncedEmit() {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
  debounceTimer.value = setTimeout(() => {
    emit('update:modelValue', [...localValue.value] as [number, number])
  }, 300)
}

onUnmounted(() => {
  if (debounceTimer.value) clearTimeout(debounceTimer.value)
  cancelAnimationFrame(rafId)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.price-range-handle {
  @apply absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white bg-primary-600 shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:cursor-grabbing;
}
</style>
