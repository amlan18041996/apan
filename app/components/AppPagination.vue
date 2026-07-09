<template>
  <div>
    <nav
      v-if="!skeleton"
      role="navigation"
      aria-label="Pagination"
      class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
    >
      <p
        v-if="showRange && totalItems !== undefined && totalItems > 0"
        class="text-sm text-text-muted"
      >
        Showing {{ rangeStart }}-{{ rangeEnd }} of {{ totalItems }} results
      </p>
      <div v-else />

      <div class="flex items-center gap-1">
        <button
          type="button"
          :disabled="currentPage <= 1"
          :aria-label="'Previous page'"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-gray-100 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
          @click="goToPage(currentPage - 1)"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <template v-for="(p, i) in visiblePages" :key="`${p}-${i}`">
          <span
            v-if="p === '...'"
            class="inline-flex h-9 w-9 items-center justify-center text-sm text-text-muted"
            aria-hidden="true"
          >
            &hellip;
          </span>
          <button
            v-else
            type="button"
            :aria-current="p === currentPage ? 'page' : undefined"
            :aria-label="`Page ${p}`"
            class="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            :class="p === currentPage ? 'bg-primary-600 text-white' : 'text-text hover:bg-gray-100'"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
        </template>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          :aria-label="'Next page'"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-gray-100 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
          @click="goToPage(currentPage + 1)"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div
        v-if="showPerPage && perPageOptions && perPageOptions.length"
        class="flex items-center gap-2 text-sm text-text-muted"
      >
        <label :for="perPageSelectId">Per page</label>
        <select
          :id="perPageSelectId"
          :value="perPage"
          class="input-field !w-auto !py-1.5 !pr-8 text-sm"
          @change="onPerPageChange"
        >
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </nav>

    <div v-else class="flex animate-pulse items-center justify-center gap-2" aria-hidden="true">
      <div class="h-9 w-9 rounded-lg bg-gray-200" />
      <div class="h-9 w-9 rounded-lg bg-gray-200" />
      <div class="h-9 w-9 rounded-lg bg-gray-200" />
      <div class="h-9 w-9 rounded-lg bg-gray-200" />
      <div class="h-9 w-9 rounded-lg bg-gray-200" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
  totalItems?: number
  perPage?: number
  perPageOptions?: number[]
  showPerPage?: boolean
  showRange?: boolean
  pageParam?: string
  perPageParam?: string
  skeleton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 12,
  totalItems: 0,
  perPageOptions: () => [12, 24, 48],
  showPerPage: false,
  showRange: true,
  pageParam: 'page',
  perPageParam: 'perPage',
  skeleton: false,
})

const emit = defineEmits<{
  'update:currentPage': [value: number]
  'update:perPage': [value: number]
}>()

const route = useRoute()
const router = useRouter()

const lastSyncedPage = ref(props.currentPage)
const lastSyncedPerPage = ref(props.perPage)

const rangeStart = computed(() => {
  return (props.currentPage - 1) * props.perPage + 1
})

const rangeEnd = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.totalItems ?? Infinity)
})

const perPageSelectId = `pagination-per-page-${Math.random().toString(36).slice(2, 8)}`

const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const result: (number | '...')[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) result.push(i)
    return result
  }

  result.push(1)

  const rangeStart = Math.max(2, current - 1)
  const rangeEnd = Math.min(total - 1, current + 1)

  if (rangeStart > 2) result.push('...')

  for (let i = rangeStart; i <= rangeEnd; i++) {
    result.push(i)
  }

  if (rangeEnd < total - 1) result.push('...')

  result.push(total)

  return result
})

watch(
  () => route.query[props.pageParam],
  (urlPageVal) => {
    if (!urlPageVal) return
    const urlPage = parseInt(urlPageVal as string, 10)
    if (
      !isNaN(urlPage) &&
      urlPage !== lastSyncedPage.value &&
      urlPage >= 1 &&
      urlPage <= props.totalPages
    ) {
      emit('update:currentPage', urlPage)
    }
  },
  { immediate: true },
)

watch(
  () => route.query[props.perPageParam],
  (urlPerPageVal) => {
    if (!urlPerPageVal) return
    const urlPerPage = parseInt(urlPerPageVal as string, 10)
    if (!isNaN(urlPerPage) && urlPerPage !== lastSyncedPerPage.value && urlPerPage > 0) {
      emit('update:perPage', urlPerPage)
    }
  },
  { immediate: true },
)

function goToPage(p: number) {
  if (p === props.currentPage || p < 1 || p > props.totalPages) return
  lastSyncedPage.value = p
  emit('update:currentPage', p)
  syncURL()
}

function onPerPageChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = parseInt(target.value, 10)
  if (isNaN(value) || value === props.perPage) return
  lastSyncedPerPage.value = value
  emit('update:perPage', value)
  syncURL()
}

function syncURL() {
  const query: Record<string, string> = {}

  for (const [key, val] of Object.entries(route.query)) {
    if (key !== props.pageParam && key !== props.perPageParam) {
      query[key] = val as string
    }
  }

  if (props.currentPage > 1) {
    query[props.pageParam] = String(props.currentPage)
  }
  if (props.perPage !== 12 && props.showPerPage) {
    query[props.perPageParam] = String(props.perPage)
  }

  router.replace({ query })
}
</script>
