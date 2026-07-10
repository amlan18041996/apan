<template>
  <div class="product-filters">
    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="mobileOpen"
          class="fixed inset-0 z-40 bg-black/50 lg:hidden"
          @click="closeMobile"
        />
      </Transition>
      <Transition name="slide-left">
        <div
          v-if="mobileOpen"
          class="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white shadow-xl lg:hidden"
        >
          <div class="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 class="text-lg font-semibold text-text">
              Filters
              <span
                v-if="activeFilterCount > 0"
                class="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white"
              >
                {{ activeFilterCount }}
              </span>
            </h2>
            <button
              class="rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
              aria-label="Close filters"
              @click="closeMobile"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <FilterSections
              :categories="categories"
              :brands="brands"
              :price-range="priceBounds"
              :selected-categories="selectedCategories"
              :selected-brands="selectedBrands"
              :price-value="localPrice"
              :min-rating="minRating"
              :in-stock-only="inStockOnly"
              :sort-by="sortBy"
              @update:selected-categories="onCategoriesChange"
              @update:selected-brands="onBrandsChange"
              @update:price-value="onPriceChange"
              @update:min-rating="onRatingChange"
              @update:in-stock-only="onStockChange"
              @update:sort-by="onSortChange"
            />
          </div>
          <div class="flex gap-3 border-t border-border px-6 py-4">
            <button class="btn-secondary flex-1" @click="clearAll">Clear all</button>
            <button class="btn-primary flex-1" @click="closeMobile">Apply</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <aside class="hidden lg:block">
      <div class="sticky top-24 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-text">
            Filters
            <span
              v-if="activeFilterCount > 0"
              class="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white"
            >
              {{ activeFilterCount }}
            </span>
          </h2>
          <button
            v-if="activeFilterCount > 0"
            class="text-sm text-primary-600 hover:text-primary-700"
            @click="clearAll"
          >
            Clear all
          </button>
        </div>

        <div v-if="activeFilterChips.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="chip in activeFilterChips"
            :key="chip.key"
            class="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
          >
            {{ chip.label }}
            <button
              class="ml-0.5 text-primary-400 hover:text-primary-600"
              :aria-label="`Remove filter: ${chip.label}`"
              @click="removeChip(chip)"
            >
              &times;
            </button>
          </span>
        </div>

        <FilterSections
          :categories="categories"
          :brands="brands"
          :price-range="priceBounds"
          :selected-categories="selectedCategories"
          :selected-brands="selectedBrands"
          :price-value="localPrice"
          :min-rating="minRating"
          :in-stock-only="inStockOnly"
          :sort-by="sortBy"
          @update:selected-categories="onCategoriesChange"
          @update:selected-brands="onBrandsChange"
          @update:price-value="onPriceChange"
          @update:min-rating="onRatingChange"
          @update:in-stock-only="onStockChange"
          @update:sort-by="onSortChange"
        />
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
interface FilterOption {
  value: string
  label: string
}

interface Chip {
  key: string
  label: string
}

interface FilterState {
  categories: string[]
  brands: string[]
  priceMin: number
  priceMax: number
  minRating: number
  inStockOnly: boolean
  sortBy: string
}

interface Props {
  categories: FilterOption[]
  brands: FilterOption[]
  priceBounds: [number, number]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterState]
}>()

const route = useRoute()
const router = useRouter()

const selectedCategories = ref<string[]>([])
const selectedBrands = ref<string[]>([])
const localPrice = ref<[number, number]>([...props.priceBounds])
const minRating = ref(0)
const inStockOnly = ref(false)
const sortBy = ref('relevance')
const mobileOpen = ref(false)

const activeFilterCount = computed(() => {
  let count = 0
  count += selectedCategories.value.length
  count += selectedBrands.value.length
  if (
    localPrice.value[0] !== props.priceBounds[0] ||
    localPrice.value[1] !== props.priceBounds[1]
  ) {
    count++
  }
  if (minRating.value > 0) count++
  if (inStockOnly.value) count++
  return count
})

const activeFilterChips = computed<Chip[]>(() => {
  const chips: Chip[] = []

  for (const cat of selectedCategories.value) {
    const opt = props.categories.find((c) => c.value === cat)
    chips.push({ key: `cat-${cat}`, label: `Category: ${opt?.label ?? cat}` })
  }

  for (const brand of selectedBrands.value) {
    const opt = props.brands.find((b) => b.value === brand)
    chips.push({ key: `brand-${brand}`, label: `Brand: ${opt?.label ?? brand}` })
  }

  if (localPrice.value[0] !== props.priceBounds[0]) {
    chips.push({ key: 'price-min', label: `Min: $${localPrice.value[0]}` })
  }
  if (localPrice.value[1] !== props.priceBounds[1]) {
    chips.push({ key: 'price-max', label: `Max: $${localPrice.value[1]}` })
  }

  if (minRating.value > 0) {
    chips.push({ key: 'rating', label: `${minRating.value}+ stars` })
  }

  if (inStockOnly.value) {
    chips.push({ key: 'availability', label: 'In Stock Only' })
  }

  return chips
})

function emitState() {
  emit('update:modelValue', {
    categories: [...selectedCategories.value],
    brands: [...selectedBrands.value],
    priceMin: localPrice.value[0],
    priceMax: localPrice.value[1],
    minRating: minRating.value,
    inStockOnly: inStockOnly.value,
    sortBy: sortBy.value,
  })
}

function syncURL() {
  const query: Record<string, string> = {}

  if (route.query.q) query.q = route.query.q as string

  if (selectedCategories.value.length > 0) {
    query.category = selectedCategories.value.join(',')
  }
  if (selectedBrands.value.length > 0) {
    query.brand = selectedBrands.value.join(',')
  }
  if (localPrice.value[0] !== props.priceBounds[0]) {
    query.minPrice = String(localPrice.value[0])
  }
  if (localPrice.value[1] !== props.priceBounds[1]) {
    query.maxPrice = String(localPrice.value[1])
  }
  if (minRating.value > 0) {
    query.rating = String(minRating.value)
  }
  if (inStockOnly.value) {
    query.inStock = 'true'
  }
  if (sortBy.value !== 'relevance') {
    query.sort = sortBy.value
  }

  router.replace({ query })
}

function readURL() {
  const q = route.query

  if (q.category) {
    selectedCategories.value = (q.category as string).split(',')
  } else {
    selectedCategories.value = []
  }

  if (q.brand) {
    selectedBrands.value = (q.brand as string).split(',')
  } else {
    selectedBrands.value = []
  }

  if (q.minPrice) {
    localPrice.value = [parseFloat(q.minPrice as string), localPrice.value[1]]
  } else {
    localPrice.value = [props.priceBounds[0], localPrice.value[1]]
  }

  if (q.maxPrice) {
    localPrice.value = [localPrice.value[0], parseFloat(q.maxPrice as string)]
  } else {
    localPrice.value = [localPrice.value[0], props.priceBounds[1]]
  }

  minRating.value = q.rating ? parseInt(q.rating as string, 10) : 0
  inStockOnly.value = q.inStock === 'true'
  sortBy.value = (q.sort as string) || 'relevance'
}

function onCategoriesChange(val: string[]) {
  selectedCategories.value = val
  syncURL()
  emitState()
}

function onBrandsChange(val: string[]) {
  selectedBrands.value = val
  syncURL()
  emitState()
}

function onPriceChange(val: [number, number]) {
  localPrice.value = val
  syncURL()
  emitState()
}

function onRatingChange(val: number) {
  minRating.value = val
  syncURL()
  emitState()
}

function onStockChange(val: boolean) {
  inStockOnly.value = val
  syncURL()
  emitState()
}

function onSortChange(val: string) {
  sortBy.value = val
  syncURL()
  emitState()
}

function removeChip(chip: Chip) {
  if (chip.key.startsWith('cat-')) {
    const val = chip.key.replace('cat-', '')
    selectedCategories.value = selectedCategories.value.filter((c) => c !== val)
  } else if (chip.key.startsWith('brand-')) {
    const val = chip.key.replace('brand-', '')
    selectedBrands.value = selectedBrands.value.filter((b) => b !== val)
  } else if (chip.key === 'price-min') {
    localPrice.value = [props.priceBounds[0], localPrice.value[1]]
  } else if (chip.key === 'price-max') {
    localPrice.value = [localPrice.value[0], props.priceBounds[1]]
  } else if (chip.key === 'rating') {
    minRating.value = 0
  } else if (chip.key === 'availability') {
    inStockOnly.value = false
  }
  syncURL()
  emitState()
}

function clearAll() {
  selectedCategories.value = []
  selectedBrands.value = []
  localPrice.value = [...props.priceBounds]
  minRating.value = 0
  inStockOnly.value = false
  sortBy.value = 'relevance'
  syncURL()
  emitState()
}

function openMobile() {
  mobileOpen.value = true
}

function closeMobile() {
  mobileOpen.value = false
}

watch(
  () => route.query,
  () => {
    readURL()
    emitState()
  },
  { immediate: true },
)

watch(
  () => props.priceBounds,
  (val) => {
    localPrice.value = [...val]
  },
)

defineExpose({ openMobile, clearAll })
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 250ms ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 300ms ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
