<template>
  <div>
    <section class="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 py-20 text-white">
      <div class="container-page text-center">
        <h2 class="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Welcome to APAN Store</h2>
        <p class="mx-auto mb-8 max-w-2xl text-lg text-indigo-200">Discover our curated collection of products. Shop with confidence and enjoy a seamless experience.</p>
        <NuxtLink to="/products" class="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-soft transition-colors hover:bg-indigo-50">
          Browse Products
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </NuxtLink>
      </div>
    </section>

    <section class="container-page py-16">
      <h2 class="mb-8 text-2xl font-bold text-text">Featured Products</h2>
      <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="n in 4" :key="n" class="card animate-pulse p-4">
          <div class="mb-4 aspect-square rounded-lg bg-gray-200" />
          <div class="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div class="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
      <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-center">
        <p class="text-red-600">{{ error }}</p>
      </div>
      <div v-else-if="products.length === 0" class="rounded-lg bg-gray-50 p-16 text-center">
        <p class="text-text-muted">Configure your Shopify credentials in the <code class="rounded bg-gray-200 px-2 py-0.5 text-sm font-mono">.env</code> file to display products.</p>
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

const { data: products, error, status } = useAsyncData('home-products', () => getProducts(4), {
  transform: (result) => result.products,
  default: () => []
})

const loading = computed(() => status.value === 'pending')
</script>