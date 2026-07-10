<template>
  <div class="space-y-4">
    <div class="rounded-lg border border-border">
      <button
        class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text hover:bg-gray-50"
        @click="toggle('category')"
      >
        Category
        <svg
          class="h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-180': open.category }"
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
      <div v-show="open.category" class="border-t border-border px-4 py-3 space-y-2">
        <label
          v-for="cat in categories"
          :key="cat.value"
          class="flex items-center gap-2 text-sm text-text-muted cursor-pointer hover:text-text"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            :checked="selectedCategories.includes(cat.value)"
            @change="toggleCategory(cat.value)"
          />
          {{ cat.label }}
        </label>
        <p v-if="categories.length === 0" class="text-xs text-text-muted">
          No categories available
        </p>
      </div>
    </div>

    <div class="rounded-lg border border-border">
      <button
        class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text hover:bg-gray-50"
        @click="toggle('price')"
      >
        Price Range
        <svg
          class="h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-180': open.price }"
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
      <div v-show="open.price" class="border-t border-border px-4 py-3">
        <PriceRangeSlider
          :model-value="priceValue"
          :min="priceRange[0]"
          :max="priceRange[1]"
          :step="10"
          @update:model-value="$emit('update:priceValue', $event)"
        />
      </div>
    </div>

    <div class="rounded-lg border border-border">
      <button
        class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text hover:bg-gray-50"
        @click="toggle('rating')"
      >
        Rating
        <svg
          class="h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-180': open.rating }"
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
      <div v-show="open.rating" class="border-t border-border px-4 py-3 space-y-2">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
          :class="
            minRating === star
              ? 'bg-primary-50 text-primary-700'
              : 'text-text-muted hover:bg-gray-50 hover:text-text'
          "
          @click="$emit('update:minRating', minRating === star ? 0 : star)"
        >
          <span class="inline-flex items-center gap-0.5">
            <svg
              v-for="s in 5"
              :key="s"
              class="h-4 w-4"
              :class="s <= star ? 'text-yellow-400' : 'text-gray-200'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </span>
          <span>{{ star }}+ stars</span>
        </button>
      </div>
    </div>

    <div class="rounded-lg border border-border">
      <button
        class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text hover:bg-gray-50"
        @click="toggle('brand')"
      >
        Brand
        <svg
          class="h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-180': open.brand }"
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
      <div v-show="open.brand" class="border-t border-border px-4 py-3 space-y-2">
        <label
          v-for="brand in brands"
          :key="brand.value"
          class="flex items-center gap-2 text-sm text-text-muted cursor-pointer hover:text-text"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            :checked="selectedBrands.includes(brand.value)"
            @change="toggleBrand(brand.value)"
          />
          {{ brand.label }}
        </label>
        <p v-if="brands.length === 0" class="text-xs text-text-muted">No brands available</p>
      </div>
    </div>

    <div class="rounded-lg border border-border">
      <button
        class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text hover:bg-gray-50"
        @click="toggle('availability')"
      >
        Availability
        <svg
          class="h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-180': open.availability }"
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
      <div v-show="open.availability" class="border-t border-border px-4 py-3">
        <label
          class="flex cursor-pointer items-center gap-2 text-sm text-text-muted hover:text-text"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            :checked="inStockOnly"
            @change="$emit('update:inStockOnly', !inStockOnly)"
          />
          In Stock Only
        </label>
      </div>
    </div>

    <div class="rounded-lg border border-border">
      <div class="px-4 py-3">
        <label for="sort-select" class="mb-2 block text-sm font-medium text-text">Sort By</label>
        <select
          id="sort-select"
          :value="sortBy"
          class="input-field py-2 pr-8 text-sm"
          @change="$emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
        >
          <option value="relevance">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterOption {
  value: string
  label: string
}

interface Props {
  categories: FilterOption[]
  brands: FilterOption[]
  priceRange: [number, number]
  selectedCategories: string[]
  selectedBrands: string[]
  priceValue: [number, number]
  minRating: number
  inStockOnly: boolean
  sortBy: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:selectedCategories': [value: string[]]
  'update:selectedBrands': [value: string[]]
  'update:priceValue': [value: [number, number]]
  'update:minRating': [value: number]
  'update:inStockOnly': [value: boolean]
  'update:sortBy': [value: string]
}>()

const open = reactive<Record<string, boolean>>({
  category: true,
  price: true,
  rating: false,
  brand: false,
  availability: false,
})

function toggle(section: string) {
  open[section] = !open[section]
}

function toggleCategory(value: string) {
  const current = [...props.selectedCategories]
  const idx = current.indexOf(value)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(value)
  }
  emit('update:selectedCategories', current)
}

function toggleBrand(value: string) {
  const current = [...props.selectedBrands]
  const idx = current.indexOf(value)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(value)
  }
  emit('update:selectedBrands', current)
}
</script>
