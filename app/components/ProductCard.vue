<template>
  <div class="card group relative overflow-hidden transition-shadow hover:shadow-soft-lg">
    <div
      class="absolute right-3 top-3 z-10 flex translate-x-2 flex-col gap-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
    >
      <button
        class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-100"
        aria-label="Add to wishlist"
        @click.stop
      >
        <svg
          class="h-5 w-5 text-gray-600 transition-colors hover:text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
      <button
        class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-100"
        aria-label="Compare"
        @click.stop
      >
        <svg
          class="h-5 w-5 text-gray-600 transition-colors hover:text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>
    </div>

    <NuxtLink :to="`/products/${product.handle}`" class="block">
      <div class="aspect-square overflow-hidden bg-gray-100">
        <img
          v-if="product.featuredImage"
          :src="product.featuredImage.url"
          :alt="product.featuredImage.altText ?? product.title"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div v-else class="flex h-full items-center justify-center text-text-muted">
          <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </NuxtLink>

    <div class="p-4">
      <NuxtLink :to="`/products/${product.handle}`">
        <h3
          class="mb-2 text-sm font-medium text-text line-clamp-2 hover:text-primary-600 transition-colors"
        >
          {{ product.title }}
        </h3>
      </NuxtLink>

      <div class="flex items-center justify-between">
        <span
          v-if="isAvailable"
          class="inline-flex items-center gap-1 text-xs font-medium text-green-600"
        >
          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          In Stock
        </span>
        <span v-else class="inline-flex items-center gap-1 text-xs font-medium text-red-500">
          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          Out of Stock
        </span>

        <Ratings :model-value="rating" size="sm" show-value />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShopifyProduct } from '~/types/shopify'

const props = defineProps<{
  product: ShopifyProduct
  rating?: number
}>()

const rating = props.rating ?? 4.5

const isAvailable = computed(() => {
  return props.product.status === 'ACTIVE' && props.product.totalInventory > 0
})
</script>
