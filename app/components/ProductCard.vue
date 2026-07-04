<template>
  <NuxtLink :to="`/products/${product.handle}`" class="card group overflow-hidden transition-shadow hover:shadow-soft-lg">
    <div class="aspect-square overflow-hidden bg-gray-100">
      <img v-if="product.featuredImage" :src="product.featuredImage.url" :alt="product.featuredImage.altText ?? product.title" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div v-else class="flex h-full items-center justify-center text-text-muted">
        <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      </div>
    </div>
    <div class="p-4">
      <h3 class="mb-1 text-sm font-medium text-text">{{ product.title }}</h3>
      <p class="text-lg font-semibold text-primary-600">${{ formatPrice(product.priceRange.minVariantPrice.amount) }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ShopifyProduct } from '~/types/shopify'

defineProps<{
  product: ShopifyProduct
}>()

function formatPrice(amount: string | number): string {
  return parseFloat(String(amount)).toFixed(2)
}
</script>