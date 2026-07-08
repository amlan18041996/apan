<template>
  <div class="carousel relative" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div
      ref="viewportRef"
      class="overflow-hidden rounded-xl"
      @touchstart.passive="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div
        ref="trackRef"
        class="flex transition-transform duration-300 ease-out will-change-transform"
        :style="trackStyle"
        @transitionend="onTransitionEnd"
      >
        <div
          v-for="(slide, i) in slides"
          :key="slide._key"
          class="shrink-0"
          :style="{ width: slideWidthPx + 'px' }"
        >
          <div v-if="i < slides.length - 1" :style="{ paddingRight: gap + 'px' }">
            <slot name="slide" :item="slide.data" :index="toOriginalIndex(i)">
              <slot :item="slide.data" :index="toOriginalIndex(i)" />
            </slot>
          </div>
          <div v-else>
            <slot name="slide" :item="slide.data" :index="toOriginalIndex(i)">
              <slot :item="slide.data" :index="toOriginalIndex(i)" />
            </slot>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="showArrows"
      class="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-text shadow-md backdrop-blur-sm transition-colors hover:bg-white hover:text-primary-600"
      :class="{ 'opacity-0 pointer-events-none': !canGoPrev }"
      aria-label="Previous slide"
      @click="prev"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <button
      v-if="showArrows"
      class="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-text shadow-md backdrop-blur-sm transition-colors hover:bg-white hover:text-primary-600"
      :class="{ 'opacity-0 pointer-events-none': !canGoNext }"
      aria-label="Next slide"
      @click="next"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <div v-if="showDots && dotCount > 1" class="mt-4 flex items-center justify-center gap-2">
      <button
        v-for="dot in dotCount"
        :key="dot"
        class="h-2 rounded-full transition-all duration-200"
        :class="dot - 1 === activeDot ? 'w-6 bg-primary-600' : 'w-2 bg-gray-300 hover:bg-gray-400'"
        :aria-label="`Go to slide ${dot}`"
        @click="goToDot(dot - 1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface SlideData {
  _key: string
  data: unknown
}

interface Props {
  items: unknown[]
  slidesPerView?: number | Record<string, number>
  autoplay?: number | boolean
  loop?: boolean
  showArrows?: boolean
  showDots?: boolean
  gap?: number
  pauseOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  slidesPerView: 1,
  autoplay: false,
  loop: false,
  showArrows: true,
  showDots: true,
  gap: 16,
  pauseOnHover: true,
})

const emit = defineEmits<{
  'slide-change': [index: number]
}>()

const viewportRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const currentIndex = ref(0)
const isTransitioning = ref(false)
const touchStartX = ref(0)
const touchDeltaX = ref(0)
const isDragging = ref(false)
const autoplayTimer = ref<ReturnType<typeof setInterval> | null>(null)
const isPaused = ref(false)

const effectiveSlidesPerView = computed(() => {
  if (typeof props.slidesPerView === 'number') return props.slidesPerView
  const bps = props.slidesPerView as Record<string, number>
  const sorted = Object.entries(bps).sort(([a], [b]) => Number(b) - Number(a))
  for (const [bp, val] of sorted) {
    if (containerWidth.value >= Number(bp)) return val
  }
  return Object.values(bps)[0] || 1
})

const cloneCount = computed(() => effectiveSlidesPerView.value)

const slides = computed((): SlideData[] => {
  const items = props.items
  if (!items.length) return []

  if (!props.loop) {
    return items.map((data, i) => ({ _key: `orig-${i}`, data }))
  }

  const before = items
    .slice(-cloneCount.value)
    .map((data, i) => ({ _key: `clone-before-${i}`, data }))
  const middle = items.map((data, i) => ({ _key: `orig-${i}`, data }))
  const after = items
    .slice(0, cloneCount.value)
    .map((data, i) => ({ _key: `clone-after-${i}`, data }))

  return [...before, ...middle, ...after]
})

const originalCount = computed(() => props.items.length)
const slideWidthPx = computed(() => {
  if (!containerWidth.value || !effectiveSlidesPerView.value) return 0
  const gaps = (effectiveSlidesPerView.value - 1) * props.gap
  return (containerWidth.value - gaps) / effectiveSlidesPerView.value
})

const trackOffset = computed(() => {
  let rawIndex = currentIndex.value
  const spv = effectiveSlidesPerView.value
  const maxIndex = Math.max(0, originalCount.value - spv)

  if (!props.loop) {
    rawIndex = Math.max(0, Math.min(rawIndex, maxIndex))
  }

  return rawIndex * (slideWidthPx.value + props.gap)
})

const trackStyle = computed(() => {
  const transitioning = isTransitioning.value || !props.loop
  return {
    transform: `translateX(-${trackOffset.value}px)`,
    transitionDuration: transitioning ? '300ms' : '0ms',
  }
})

function toOriginalIndex(displayIndex: number): number {
  const offset = cloneCount.value
  if (displayIndex < offset) {
    return originalCount.value - (offset - displayIndex)
  }
  if (displayIndex >= offset + originalCount.value) {
    return displayIndex - offset - originalCount.value
  }
  return displayIndex - offset
}

const activeDot = computed(() => {
  const spv = effectiveSlidesPerView.value
  const max = Math.max(1, originalCount.value - spv + 1)
  const raw = props.loop ? ((currentIndex.value % max) + max) % max : currentIndex.value
  return Math.min(raw, max - 1)
})

const dotCount = computed(() => {
  const spv = effectiveSlidesPerView.value
  return Math.max(1, originalCount.value - spv + 1)
})

const canGoPrev = computed(() => {
  if (props.loop) return true
  return currentIndex.value > 0
})

const canGoNext = computed(() => {
  if (props.loop) return true
  return currentIndex.value < Math.max(0, originalCount.value - effectiveSlidesPerView.value)
})

function snapIndex(raw: number): number {
  const spv = effectiveSlidesPerView.value
  const maxIndex = Math.max(0, originalCount.value - spv)

  if (props.loop) {
    if (raw < 0) return maxIndex + raw + 1
    if (raw > maxIndex) return raw - maxIndex - 1
    return raw
  }

  return Math.max(0, Math.min(raw, maxIndex))
}

function prev() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentIndex.value = snapIndex(currentIndex.value - 1)
  emit('slide-change', activeDot.value)
}

function next() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentIndex.value = snapIndex(currentIndex.value + 1)
  emit('slide-change', activeDot.value)
}

function goToDot(index: number) {
  if (isTransitioning.value) return
  isTransitioning.value = true

  if (props.loop) {
    const offset = cloneCount.value
    currentIndex.value = offset + index
  } else {
    currentIndex.value = index
  }

  emit('slide-change', index)
}

function onTransitionEnd() {
  isTransitioning.value = false

  if (props.loop) {
    const offset = cloneCount.value
    const maxIndex = Math.max(0, originalCount.value - effectiveSlidesPerView.value)

    if (currentIndex.value < offset) {
      currentIndex.value = offset + maxIndex
    } else if (currentIndex.value > offset + maxIndex) {
      currentIndex.value = offset
    }
  }
}

function onTouchStart(e: TouchEvent) {
  if (props.items.length < 2) return
  touchStartX.value = e.touches[0].clientX
  touchDeltaX.value = 0
  isDragging.value = true
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value
}

function onTouchEnd() {
  if (!isDragging.value) return
  isDragging.value = false

  const threshold = 50
  if (touchDeltaX.value > threshold) {
    prev()
  } else if (touchDeltaX.value < -threshold) {
    next()
  }
  touchDeltaX.value = 0
}

function startAutoplay() {
  if (!props.autoplay || isPaused.value) return
  const interval = typeof props.autoplay === 'number' ? props.autoplay : 5000
  stopAutoplay()
  autoplayTimer.value = setInterval(() => {
    next()
  }, interval)
}

function stopAutoplay() {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
    autoplayTimer.value = null
  }
}

function onMouseEnter() {
  if (props.pauseOnHover) {
    isPaused.value = true
    stopAutoplay()
  }
}

function onMouseLeave() {
  if (props.pauseOnHover) {
    isPaused.value = false
    startAutoplay()
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (viewportRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width
      }
    })
    resizeObserver.observe(viewportRef.value)
  }

  if (props.loop) {
    currentIndex.value = cloneCount.value
  }

  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
  resizeObserver?.disconnect()
})
</script>
