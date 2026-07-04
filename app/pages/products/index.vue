<template>
  <div>
    <section class="bg-gray-50 py-12">
      <div class="container-page">
        <h1 class="text-3xl font-bold text-text">All Products</h1>
        <p class="mt-2 text-text-muted">Browse our full collection of products.</p>
      </div>
    </section>

    <section class="container-page py-8">
      <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="n in 8" :key="n" class="card animate-pulse p-4">
          <div class="mb-4 aspect-square rounded-lg bg-gray-200" />
          <div class="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div class="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
      <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-center">
        <p class="text-red-600">{{ error }}</p>
      </div>
      <div v-else-if="products.length === 0" class="rounded-lg bg-gray-50 p-16 text-center">
        <p class="text-text-muted">No products found.</p>
      </div>
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { getProducts } = useShopify()

const { data: products, error, status } = useAsyncData('products', () => getProducts(20), {
  transform: (result) => result.products,
  default: () => []
})

const loading = computed(() => status.value === 'pending')
</script>