<template>
  <div class="container-page py-8">
    <div v-if="!route.query.q && !hasActiveFilters" class="mb-8">
      <h1 class="text-3xl font-bold text-text">Search Products</h1>
      <p class="mt-2 text-text-muted">
        Browse all products or use the search bar above to find what you're looking for.
      </p>
    </div>

    <div v-else class="mb-6">
      <h1 class="text-3xl font-bold text-text">
        {{ route.query.q ? `Results for "${route.query.q}"` : 'All Products' }}
      </h1>
      <p class="mt-1 text-text-muted">
        {{ filteredProducts.length }} product{{ filteredProducts.length === 1 ? '' : 's' }} found
      </p>
    </div>

    <div class="flex gap-8">
      <aside class="hidden w-64 shrink-0 lg:block">
        <div class="sticky top-24 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-text">Filters</h2>
            <button
              v-if="hasActiveFilters"
              class="text-sm text-primary-600 hover:text-primary-700"
              @click="clearAllFilters"
            >
              Clear all
            </button>
          </div>

          <div
            v-for="(filter, key) in filterSections"
            :key="key"
            class="rounded-lg border border-border"
          >
            <button
              class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text hover:bg-gray-50"
              @click="toggleFilterSection(key)"
            >
              {{ filter.label }}
              <svg
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': openFilterSections[key] }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              v-show="openFilterSections[key]"
              class="border-t border-border px-4 py-3 space-y-2"
            >
              <label
                v-for="opt in filter.options"
                :key="opt.value"
                class="flex items-center gap-2 text-sm text-text-muted cursor-pointer hover:text-text"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  :checked="isFilterActive(key, opt.value)"
                  @change="toggleFilter(key, opt.value)"
                />
                {{ opt.label }}
              </label>
            </div>
          </div>

          <div class="rounded-lg border border-border">
            <button
              class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text hover:bg-gray-50"
              @click="openFilterSections.price = !openFilterSections.price"
            >
              Price Range
              <svg
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': openFilterSections.price }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div v-show="openFilterSections.price" class="border-t border-border px-4 py-3">
              <div class="flex items-center gap-2">
                <input
                  v-model.number="priceMin"
                  type="number"
                  placeholder="Min"
                  min="0"
                  class="input-field w-full"
                  @input="debouncedUpdateURL"
                />
                <span class="text-text-muted">—</span>
                <input
                  v-model.number="priceMax"
                  type="number"
                  placeholder="Max"
                  min="0"
                  class="input-field w-full"
                  @input="debouncedUpdateURL"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div class="min-w-0 flex-1">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <button
              class="btn-secondary flex items-center gap-2 lg:hidden"
              @click="mobileFiltersOpen = true"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
              <span
                v-if="activeFilterCount"
                class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white"
                >{{ activeFilterCount }}</span
              >
            </button>
            <div v-if="activeFilterChips.length > 0" class="flex flex-wrap items-center gap-2">
              <span
                v-for="chip in activeFilterChips"
                :key="chip.key"
                class="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
              >
                {{ chip.label }}
                <button
                  class="ml-0.5 text-primary-400 hover:text-primary-600"
                  @click="removeFilterChip(chip)"
                >
                  &times;
                </button>
              </span>
              <button class="text-xs text-text-muted hover:text-text" @click="clearAllFilters">
                Clear all
              </button>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <select v-model="sortBy" class="input-field py-2 pr-8 text-sm" @change="updateURL">
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
            <div class="flex overflow-hidden rounded-lg border border-border">
              <button
                class="p-2 transition-colors"
                :class="
                  viewMode === 'grid'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-text-muted hover:bg-gray-50'
                "
                @click="
                  viewMode = 'grid'
                  updateURL()
                "
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                class="p-2 transition-colors"
                :class="
                  viewMode === 'list'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-text-muted hover:bg-gray-50'
                "
                @click="
                  viewMode = 'list'
                  updateURL()
                "
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="paginatedProducts.length === 0 && !loading"
          class="rounded-lg bg-gray-50 p-16 text-center"
        >
          <svg
            class="mx-auto h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p class="mt-4 text-lg font-medium text-text">No products found</p>
          <p class="mt-1 text-sm text-text-muted">Try adjusting your search or filters.</p>
          <button v-if="hasActiveFilters" class="btn-primary mt-4" @click="clearAllFilters">
            Clear all filters
          </button>
        </div>

        <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="n in 6" :key="n" class="card animate-pulse p-4">
            <div class="mb-4 aspect-square rounded-lg bg-gray-200" />
            <div class="mb-2 h-4 w-3/4 rounded bg-gray-200" />
            <div class="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        </div>

        <div v-else-if="viewMode === 'grid'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard v-for="product in paginatedProducts" :key="product.id" :product="product" />
        </div>

        <div v-else class="space-y-4">
          <NuxtLink
            v-for="product in paginatedProducts"
            :key="product.id"
            :to="`/products/${product.handle}`"
            class="card flex gap-4 overflow-hidden p-4 transition-shadow hover:shadow-soft-lg"
          >
            <div class="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                v-if="product.featuredImage"
                :src="product.featuredImage.url"
                :alt="product.featuredImage.altText ?? product.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div v-else class="flex h-full items-center justify-center text-gray-400">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div class="flex min-w-0 flex-1 flex-col justify-center">
              <h3
                class="font-semibold text-text group-hover:text-primary-600 transition-colors line-clamp-2"
              >
                {{ product.title }}
              </h3>
              <p class="mt-1 text-lg font-bold text-primary-600">
                ${{ formatPrice(product.priceRangeV2.minVariantPrice.amount) }}
              </p>
              <p class="mt-1 text-xs text-text-muted line-clamp-2">{{ product.description }}</p>
            </div>
          </NuxtLink>
        </div>

        <div v-if="totalPages > 1" class="mt-12 flex items-center justify-center gap-2">
          <button
            class="btn-secondary px-3 py-2 text-sm"
            :disabled="page <= 1"
            @click="goToPage(page - 1)"
          >
            Previous
          </button>
          <template v-for="p in visiblePages" :key="p">
            <span v-if="p === '...'" class="px-2 text-text-muted">...</span>
            <button
              v-else
              class="rounded-lg border px-3 py-2 text-sm transition-colors"
              :class="
                p === page
                  ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                  : 'border-border text-text hover:bg-gray-50'
              "
              @click="goToPage(p)"
            >
              {{ p }}
            </button>
          </template>
          <button
            class="btn-secondary px-3 py-2 text-sm"
            :disabled="page >= totalPages"
            @click="goToPage(page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="mobileFiltersOpen" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-black/50" @click="mobileFiltersOpen = false" />
        <div
          class="absolute inset-y-0 right-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-xl"
        >
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-text">Filters</h2>
            <button class="text-text-muted hover:text-text" @click="mobileFiltersOpen = false">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-6">
            <div v-for="(filter, key) in filterSections" :key="key">
              <h3 class="mb-3 text-sm font-medium text-text">{{ filter.label }}</h3>
              <div class="space-y-2">
                <label
                  v-for="opt in filter.options"
                  :key="opt.value"
                  class="flex items-center gap-2 text-sm text-text-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    :checked="isFilterActive(key, opt.value)"
                    @change="toggleFilter(key, opt.value)"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>
            <div>
              <h3 class="mb-3 text-sm font-medium text-text">Price Range</h3>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="priceMin"
                  type="number"
                  placeholder="Min"
                  min="0"
                  class="input-field w-full"
                  @input="debouncedUpdateURL"
                />
                <span class="text-text-muted">—</span>
                <input
                  v-model.number="priceMax"
                  type="number"
                  placeholder="Max"
                  min="0"
                  class="input-field w-full"
                  @input="debouncedUpdateURL"
                />
              </div>
            </div>
          </div>

          <div class="mt-8 flex gap-3">
            <button class="btn-secondary flex-1" @click="clearAllFilters">Clear all</button>
            <button class="btn-primary flex-1" @click="mobileFiltersOpen = false">Apply</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Search Products — APAN Store',
  description: 'Search and filter our full collection of products by category, price, and more.',
})

const route = useRoute()
const router = useRouter()
const { getProducts, searchProducts } = useShopify()

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  label: string
  options: FilterOption[]
}

const sortBy = ref('relevance')
const viewMode = ref<'grid' | 'list'>('grid')
const page = ref(1)
const perPage = 9
const mobileFiltersOpen = ref(false)
const priceMin = ref<number | undefined>(undefined)
const priceMax = ref<number | undefined>(undefined)
const openFilterSections = ref<Record<string, boolean>>({
  category: true,
  price: false,
})

const activeFilters = ref<Record<string, Set<string>>>({
  category: new Set(),
})

const filterSections: Record<string, FilterConfig> = {
  category: {
    label: 'Category',
    options: [
      { value: 'clothing', label: 'Clothing' },
      { value: 'accessories', label: 'Accessories' },
      { value: 'home', label: 'Home & Living' },
      { value: 'bags', label: 'Bags' },
    ],
  },
}

const { data: allProducts, status } = useAsyncData('search-products', () => getProducts(50), {
  transform: (r) => r.products,
  default: () => [],
})

const loading = computed(() => status.value === 'pending')

const filteredProducts = computed(() => {
  let list = allProducts.value

  const query = (route.query.q as string)?.toLowerCase().trim()
  if (query) {
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)),
    )
  }

  const cats = activeFilters.value.category
  if (cats.size > 0) {
    list = list.filter((p) => cats.has(p.productType.toLowerCase()))
  }

  if (priceMin.value !== undefined && !isNaN(priceMin.value)) {
    list = list.filter((p) => parseFloat(p.priceRangeV2.minVariantPrice.amount) >= priceMin.value!)
  }
  if (priceMax.value !== undefined && !isNaN(priceMax.value)) {
    list = list.filter((p) => parseFloat(p.priceRangeV2.minVariantPrice.amount) <= priceMax.value!)
  }

  switch (sortBy.value) {
    case 'price_asc':
      list = [...list].sort(
        (a, b) =>
          parseFloat(a.priceRangeV2.minVariantPrice.amount) -
          parseFloat(b.priceRangeV2.minVariantPrice.amount),
      )
      break
    case 'price_desc':
      list = [...list].sort(
        (a, b) =>
          parseFloat(b.priceRangeV2.minVariantPrice.amount) -
          parseFloat(a.priceRangeV2.minVariantPrice.amount),
      )
      break
    case 'newest':
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      break
    default:
      break
  }

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / perPage)))

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredProducts.value.slice(start, start + perPage)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = page.value
  const pages: (number | string)[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.category.size > 0 ||
    priceMin.value !== undefined ||
    priceMax.value !== undefined
  )
})

const activeFilterCount = computed(() => {
  let count = activeFilters.value.category.size
  if (priceMin.value !== undefined) count++
  if (priceMax.value !== undefined) count++
  return count
})

const activeFilterChips = computed(() => {
  const chips: { key: string; label: string }[] = []
  activeFilters.value.category.forEach((val) => {
    const opt = filterSections.category.options.find((o) => o.value === val)
    chips.push({ key: `cat-${val}`, label: `Category: ${opt?.label ?? val}` })
  })
  if (priceMin.value !== undefined)
    chips.push({ key: 'price-min', label: `Min: $${priceMin.value}` })
  if (priceMax.value !== undefined)
    chips.push({ key: 'price-max', label: `Max: $${priceMax.value}` })
  return chips
})

function isFilterActive(section: string, value: string): boolean {
  return activeFilters.value[section]?.has(value) ?? false
}

function toggleFilter(section: string, value: string) {
  const set = activeFilters.value[section]
  if (!set) return
  if (set.has(value)) set.delete(value)
  else set.add(value)
  page.value = 1
  updateURL()
}

function clearAllFilters() {
  activeFilters.value.category.clear()
  priceMin.value = undefined
  priceMax.value = undefined
  page.value = 1
  updateURL()
}

function removeFilterChip(chip: { key: string }) {
  if (chip.key.startsWith('cat-')) {
    const val = chip.key.replace('cat-', '')
    activeFilters.value.category.delete(val)
  } else if (chip.key === 'price-min') {
    priceMin.value = undefined
  } else if (chip.key === 'price-max') {
    priceMax.value = undefined
  }
  page.value = 1
  updateURL()
}

function toggleFilterSection(key: string) {
  openFilterSections.value[key] = !openFilterSections.value[key]
}

function goToPage(p: number) {
  page.value = p
  updateURL()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function updateURL() {
  const query: Record<string, string | number> = {}

  if (route.query.q) query.q = route.query.q as string
  if (sortBy.value !== 'relevance') query.sort = sortBy.value
  if (viewMode.value !== 'grid') query.view = viewMode.value
  if (page.value > 1) query.page = page.value

  const cats = [...activeFilters.value.category]
  if (cats.length > 0) query.category = cats.join(',')

  if (priceMin.value !== undefined && !isNaN(priceMin.value)) query.minPrice = priceMin.value
  if (priceMax.value !== undefined && !isNaN(priceMax.value)) query.maxPrice = priceMax.value

  router.replace({ query })
}

const debouncedUpdateURL = useDebounceFn(() => {
  page.value = 1
  updateURL()
}, 400)

function formatPrice(amount: string | number): string {
  return parseFloat(String(amount)).toFixed(2)
}

watch(
  () => route.query,
  (q) => {
    sortBy.value = (q.sort as string) || 'relevance'
    viewMode.value = (q.view as 'grid' | 'list') || 'grid'
    page.value = q.page ? parseInt(q.page as string, 10) : 1

    if (q.category) {
      const vals = (q.category as string).split(',')
      activeFilters.value.category = new Set(vals)
    } else {
      activeFilters.value.category = new Set()
    }

    if (q.minPrice) {
      priceMin.value = parseFloat(q.minPrice as string)
    } else {
      priceMin.value = undefined
    }

    if (q.maxPrice) {
      priceMax.value = parseFloat(q.maxPrice as string)
    } else {
      priceMax.value = undefined
    }
  },
  { immediate: true },
)
</script>
