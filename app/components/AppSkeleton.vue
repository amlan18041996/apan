<template>
  <div role="presentation" aria-hidden="true" class="skeleton-base" :class="containerClasses">
    <template v-if="variant === 'text'">
      <div
        v-for="(line, i) in textLines"
        :key="i"
        class="skeleton-pulse rounded"
        :class="[lineHeightClass, line.width]"
      />
    </template>

    <template v-else-if="variant === 'card'">
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="skeleton-shimmer bg-gray-200" :style="{ aspectRatio: resolvedAspectRatio }" />
        <div class="space-y-3 p-4">
          <div class="skeleton-pulse h-4 w-3/4 rounded bg-gray-200" />
          <div class="skeleton-pulse h-4 w-1/2 rounded bg-gray-200" />
          <div class="skeleton-pulse h-3 w-1/3 rounded bg-gray-200" />
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'image'">
      <div
        class="skeleton-shimmer overflow-hidden bg-gray-200"
        :class="radiusClass"
        :style="{ aspectRatio: resolvedAspectRatio }"
      />
    </template>

    <template v-else-if="variant === 'table'">
      <div class="overflow-hidden rounded-lg border border-gray-200">
        <div class="flex gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <div
            v-for="col in resolvedColumns"
            :key="'h-' + col.id"
            class="skeleton-pulse h-4 rounded bg-gray-300"
            :style="{ width: col.width }"
          />
        </div>
        <div v-for="row in rowCount" :key="row" class="flex gap-4 px-4 py-3">
          <div
            v-for="col in resolvedColumns"
            :key="'r-' + row + '-' + col.id"
            class="skeleton-pulse h-3 rounded bg-gray-200"
            :style="{ width: col.width }"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface ColumnDef {
  id: string
  width: string
}

interface Props {
  variant?: 'text' | 'card' | 'image' | 'table'
  lines?: number
  width?: string
  height?: string
  borderRadius?: string
  aspectRatio?: string
  rows?: number
  columns?: ColumnDef[]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  lines: 1,
  width: 'full',
  height: '4',
  borderRadius: 'rounded',
  aspectRatio: '4/3',
  rows: 5,
  columns: undefined,
})

const widthMap: Record<string, string> = {
  full: 'w-full',
  '3/4': 'w-3/4',
  '2/3': 'w-2/3',
  '1/2': 'w-1/2',
  '1/3': 'w-1/3',
  '1/4': 'w-1/4',
}

const heightMap: Record<string, string> = {
  '3': 'h-3',
  '4': 'h-4',
  '5': 'h-5',
  '6': 'h-6',
  '8': 'h-8',
  '10': 'h-10',
  '12': 'h-12',
}

const radiusMap: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  '': 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

const defaultColumns: ColumnDef[] = [
  { id: 'name', width: '40%' },
  { id: 'sku', width: '25%' },
  { id: 'price', width: '20%' },
  { id: 'status', width: '15%' },
]

const containerClasses = computed(() => {
  if (props.variant === 'text') {
    return 'flex flex-col gap-3'
  }
  return ''
})

const lineHeightClass = computed(() => {
  return heightMap[props.height] || `h-${props.height}`
})

const lineWidthClass = computed(() => {
  return widthMap[props.width] || props.width
})

const textLines = computed(() => {
  const count = Math.max(1, props.lines)
  const items: { width: string }[] = []
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1 && count > 1
    items.push({ width: isLast ? 'w-3/4' : lineWidthClass.value })
  }
  return items
})

const resolvedAspectRatio = computed(() => {
  return props.aspectRatio || '4/3'
})

const radiusClass = computed(() => {
  return radiusMap[props.borderRadius] || radiusMap['']
})

const rowCount = computed(() => Math.max(1, props.rows))

const resolvedColumns = computed(() => {
  return props.columns && props.columns.length ? props.columns : defaultColumns
})
</script>

<style scoped>
.skeleton-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: #e5e7eb;
}

.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
