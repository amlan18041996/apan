<template>
  <div class="data-table">
    <div
      v-if="searchable || $slots.toolbar"
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div v-if="searchable" class="relative max-w-sm flex-1">
        <svg
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="input-field !py-2 !pl-9 !pr-3 text-sm"
          aria-label="Search table"
        />
      </div>
      <slot name="toolbar" />
    </div>

    <div
      v-if="selectable && selectedIds.size > 0"
      class="mb-3 flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-2.5"
    >
      <span class="text-sm font-medium text-primary-700">
        {{ selectedIds.size }} item{{ selectedIds.size === 1 ? '' : 's' }} selected
      </span>
      <div class="flex-1" />
      <slot name="bulk-actions" :selected-rows="selectedRows" :clear-selection="clearSelection" />
    </div>

    <div class="mb-3 flex items-center justify-between">
      <p class="text-sm text-text-muted">
        {{ processedRows.length }} result{{ processedRows.length === 1 ? '' : 's' }}
      </p>
      <AppDropdown v-if="columns.length > 3" v-model="columnMenuOpen" position="bottom-right">
        <template #trigger>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-gray-50 hover:text-text"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Columns
          </button>
        </template>
        <div class="w-48 p-1">
          <label
            v-for="col in columns"
            :key="col.key"
            class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text transition-colors hover:bg-gray-50"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              :checked="columnVisibility[col.key] !== false"
              @change="toggleColumnVisibility(col.key)"
            />
            {{ col.label }}
          </label>
        </div>
      </AppDropdown>
    </div>

    <div v-if="loading" class="overflow-hidden rounded-lg border border-border">
      <div class="flex gap-4 border-b border-border bg-gray-50 px-4 py-3">
        <div
          v-for="col in visibleColumns"
          :key="'sh-' + col.key"
          class="h-4 rounded bg-gray-300"
          :style="{ width: col.width || 'auto', flex: col.width ? 'none' : '1' }"
        />
      </div>
      <div
        v-for="r in skeletonRows"
        :key="'sr-' + r"
        class="flex gap-4 border-b border-border/50 px-4 py-3"
      >
        <div
          v-for="col in visibleColumns"
          :key="'sc-' + r + '-' + col.key"
          class="h-3 rounded bg-gray-200"
          :style="{ width: col.width || 'auto', flex: col.width ? 'none' : '1' }"
        />
      </div>
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <svg
        class="mx-auto h-10 w-10 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p class="mt-3 text-sm font-medium text-red-800">{{ error }}</p>
      <button
        v-if="$slots.retry"
        type="button"
        class="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
        @click="$emit('retry')"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="paginatedRows.length === 0"
      class="rounded-lg border border-border bg-gray-50 px-6 py-16 text-center"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p class="mt-3 text-sm font-medium text-text">{{ emptyText }}</p>
      <p v-if="searchQuery" class="mt-1 text-sm text-text-muted">
        Try adjusting your search or filters.
      </p>
    </div>

    <div v-else class="overflow-hidden rounded-lg border border-border">
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-border bg-gray-50">
              <th v-if="selectable" class="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  :checked="isAllSelected"
                  :indeterminate="isPartialSelected"
                  aria-label="Select all rows"
                  @change="toggleSelectAll"
                />
              </th>
              <th
                v-for="col in visibleColumns"
                :key="col.key"
                class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted"
                :class="
                  col.sortable !== false && sortable
                    ? 'cursor-pointer select-none hover:text-text'
                    : ''
                "
                :style="{ width: col.width }"
                @click="col.sortable !== false && sortable ? toggleSort(col.key) : undefined"
              >
                <span class="inline-flex items-center gap-1.5">
                  {{ col.label }}
                  <span v-if="sortKey === col.key" class="inline-flex text-primary-600">
                    <svg
                      v-if="sortDirection === 'asc'"
                      class="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    <svg
                      v-else
                      class="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                  <svg
                    v-else-if="col.sortable !== false && sortable"
                    class="h-3.5 w-3.5 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/50">
            <tr
              v-for="(row, rowIndex) in paginatedRows"
              :key="getRowId(row)"
              class="transition-colors hover:bg-gray-50"
              :class="{ 'bg-primary-50/50': selectedIds.has(getRowId(row)) }"
              tabindex="0"
              @click="$emit('rowClick', row)"
              @keydown.enter="$emit('rowClick', row)"
            >
              <td v-if="selectable" class="w-10 px-4 py-3" @click.stop>
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  :checked="selectedIds.has(getRowId(row))"
                  :aria-label="`Select row ${rowIndex + 1}`"
                  @change="toggleRowSelection(getRowId(row))"
                />
              </td>
              <td v-for="col in visibleColumns" :key="col.key" class="px-4 py-3 text-text">
                <slot
                  :name="`cell-${col.key}`"
                  :row="row"
                  :value="getNestedValue(row, col.key)"
                  :index="rowIndex"
                >
                  {{ formatCellValue(getNestedValue(row, col.key)) }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:hidden">
        <div
          v-for="(row, rowIndex) in paginatedRows"
          :key="'mobile-' + getRowId(row)"
          class="border-b border-border/50 p-4 transition-colors hover:bg-gray-50 last:border-b-0"
          :class="{ 'bg-primary-50/50': selectedIds.has(getRowId(row)) }"
          @click="$emit('rowClick', row)"
        >
          <div v-if="selectable" class="mb-2" @click.stop>
            <label class="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                :checked="selectedIds.has(getRowId(row))"
                @change="toggleRowSelection(getRowId(row))"
              />
              Select
            </label>
          </div>
          <dl class="space-y-1.5">
            <div
              v-for="col in visibleColumns"
              :key="col.key"
              class="flex items-baseline justify-between gap-2"
            >
              <dt class="shrink-0 text-xs font-medium uppercase tracking-wider text-text-muted">
                {{ col.label }}
              </dt>
              <dd class="min-w-0 text-right text-sm text-text">
                <slot
                  :name="`cell-${col.key}`"
                  :row="row"
                  :value="getNestedValue(row, col.key)"
                  :index="rowIndex"
                >
                  {{ formatCellValue(getNestedValue(row, col.key)) }}
                </slot>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div
      v-if="!loading && !error && processedRows.length > 0"
      class="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
    >
      <div class="flex items-center gap-2 text-sm text-text-muted">
        <label for="dt-page-size">Rows per page</label>
        <select
          id="dt-page-size"
          :value="internalPageSize"
          class="input-field !w-auto !py-1.5 !pr-8 text-sm"
          @change="onPageSizeChange"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          :disabled="currentPage <= 1"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-gray-100 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
          @click="currentPage--"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            class="inline-flex h-8 w-8 items-center justify-center text-sm text-text-muted"
            >&hellip;</span
          >
          <button
            v-else
            type="button"
            :aria-current="p === currentPage ? 'page' : undefined"
            :aria-label="`Page ${p}`"
            class="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            :class="p === currentPage ? 'bg-primary-600 text-white' : 'text-text hover:bg-gray-100'"
            @click="currentPage = p as number"
          >
            {{ p }}
          </button>
        </template>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-gray-100 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
          @click="currentPage++"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <p class="text-sm text-text-muted">Page {{ currentPage }} of {{ totalPages }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  visible?: boolean
  width?: string
}

export interface DataTableProps {
  columns: DataTableColumn[]
  rows: Record<string, unknown>[]
  rowIdKey?: string
  sortable?: boolean
  searchable?: boolean
  selectable?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  loading?: boolean
  error?: string | null
  emptyText?: string
  searchPlaceholder?: string
  skeletonRows?: number
}

const props = withDefaults(defineProps<DataTableProps>(), {
  rowIdKey: 'id',
  sortable: true,
  searchable: true,
  selectable: false,
  pageSize: 10,
  pageSizeOptions: () => [10, 25, 50, 100],
  loading: false,
  error: null,
  emptyText: 'No data available',
  searchPlaceholder: 'Search...',
  skeletonRows: 5,
})

const emit = defineEmits<{
  'update:sort': [value: { key: string; direction: 'asc' | 'desc' } | null]
  'update:page': [value: number]
  'update:pageSize': [value: number]
  selectionChange: [value: unknown[]]
  search: [value: string]
  rowClick: [value: Record<string, unknown>]
  retry: []
}>()

const searchQuery = ref('')
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const internalPageSize = ref(props.pageSize)
const selectedIds = ref(new Set<string | number>())
const columnVisibility = ref<Record<string, boolean>>({})
const columnMenuOpen = ref(false)

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const visibleColumns = computed(() => {
  return props.columns.filter((col) => columnVisibility.value[col.key] !== false)
})

const processedRows = computed(() => {
  let result = [...props.rows]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter((row) =>
      visibleColumns.value.some((col) => {
        const val = getNestedValue(row, col.key)
        return val != null && String(val).toLowerCase().includes(q)
      }),
    )
  }

  if (sortKey.value) {
    const key = sortKey.value
    const dir = sortDirection.value === 'asc' ? 1 : -1
    result.sort((a, b) => {
      const aVal = getNestedValue(a, key)
      const bVal = getNestedValue(b, key)
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir
      return String(aVal).localeCompare(String(bVal)) * dir
    })
  }

  return result
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(processedRows.value.length / internalPageSize.value)),
)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * internalPageSize.value
  return processedRows.value.slice(start, start + internalPageSize.value)
})

const isAllSelected = computed(() => {
  if (paginatedRows.value.length === 0) return false
  return paginatedRows.value.every((row) => selectedIds.value.has(getRowId(row)))
})

const isPartialSelected = computed(() => {
  if (selectedIds.value.size === 0) return false
  return (
    !isAllSelected.value && paginatedRows.value.some((row) => selectedIds.value.has(getRowId(row)))
  )
})

const selectedRows = computed(() => {
  return props.rows.filter((row) => selectedIds.value.has(getRowId(row)))
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const result: (number | '...')[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) result.push(i)
    return result
  }

  result.push(1)
  const rangeStart = Math.max(2, current - 1)
  const rangeEnd = Math.min(total - 1, current + 1)
  if (rangeStart > 2) result.push('...')
  for (let i = rangeStart; i <= rangeEnd; i++) result.push(i)
  if (rangeEnd < total - 1) result.push('...')
  result.push(total)

  return result
})

function getRowId(row: Record<string, unknown>): string | number {
  return (row[props.rowIdKey] as string | number) ?? JSON.stringify(row)
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

function formatCellValue(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}

function toggleSort(key: string) {
  if (sortKey.value === key) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortKey.value = null
      sortDirection.value = 'asc'
    }
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  emit('update:sort', sortKey.value ? { key: sortKey.value, direction: sortDirection.value } : null)
}

function toggleRowSelection(id: string | number) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
  emit('selectionChange', selectedRows.value)
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    const next = new Set(selectedIds.value)
    paginatedRows.value.forEach((row) => next.delete(getRowId(row)))
    selectedIds.value = next
  } else {
    const next = new Set(selectedIds.value)
    paginatedRows.value.forEach((row) => next.add(getRowId(row)))
    selectedIds.value = next
  }
  emit('selectionChange', selectedRows.value)
}

function clearSelection() {
  selectedIds.value = new Set()
  emit('selectionChange', [])
}

function toggleColumnVisibility(key: string) {
  columnVisibility.value = {
    ...columnVisibility.value,
    [key]: columnVisibility.value[key] === false ? true : false,
  }
}

function onPageSizeChange(event: Event) {
  const val = parseInt((event.target as HTMLSelectElement).value, 10)
  internalPageSize.value = val
  currentPage.value = 1
  emit('update:pageSize', val)
  emit('update:page', 1)
}

watch(searchQuery, (val) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    currentPage.value = 1
    emit('search', val)
  }, 300)
})

watch(currentPage, (val) => {
  emit('update:page', val)
})

watch(
  () => props.pageSize,
  (val) => {
    internalPageSize.value = val
  },
)

onMounted(() => {
  const vis: Record<string, boolean> = {}
  props.columns.forEach((col) => {
    vis[col.key] = col.visible !== false
  })
  columnVisibility.value = vis
})
</script>
