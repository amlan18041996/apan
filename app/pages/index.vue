<template>
  <div class="min-h-screen bg-background">
    <header class="border-b border-border bg-surface">
      <div class="container-page flex h-16 items-center justify-between">
        <div class="flex items-center gap-8">
          <h1 class="text-xl font-bold text-text">APAN Store</h1>
          <nav class="hidden items-center gap-6 md:flex">
            <NuxtLink to="/" class="text-sm font-medium text-text-muted transition-colors hover:text-text">Home</NuxtLink>
            <NuxtLink to="/products" class="text-sm font-medium text-text-muted transition-colors hover:text-text">Products</NuxtLink>
            <NuxtLink to="/collections" class="text-sm font-medium text-text-muted transition-colors hover:text-text">Collections</NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <button class="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 hover:text-text" @click="ui.toggleSearch">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </button>
          <button class="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 hover:text-text" @click="ui.toggleCartDrawer">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span v-if="cart.totalItems > 0" class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">{{ cart.totalItems }}</span>
          </button>
        </div>
      </div>
    </header>

    <main>
      <section class="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 py-20 text-white">
        <div class="container-page text-center">
          <h2 class="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Welcome to APAN Store</h2>
          <p class="mx-auto mb-8 max-w-2xl text-lg text-indigo-200">Discover our curated collection of products. Shop with confidence and enjoy a seamless experience.</p>
          <NuxtLink to="/products" class="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-soft transition-colors hover:bg-indigo-50">Browse Products
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
          <NuxtLink v-for="product in products" :key="product.id" :to="`/products/${product.handle}`" class="card group overflow-hidden transition-shadow hover:shadow-soft-lg">
            <div class="aspect-square overflow-hidden bg-gray-100">
              <img v-if="product.featuredImage" :src="product.featuredImage.url" :alt="product.featuredImage.altText ?? product.title" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div v-else class="flex h-full items-center justify-center text-text-muted">
                <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
            </div>
            <div class="p-4">
              <h3 class="mb-1 text-sm font-medium text-text">{{ product.title }}</h3>
              <p class="text-lg font-semibold text-primary-600">${{ parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2) }}</p>
            </div>
          </NuxtLink>
        </div>
      </section>
    </main>

    <footer class="border-t border-border bg-surface">
      <div class="container-page flex h-16 items-center justify-between">
        <p class="text-sm text-text-muted">&copy; {{ new Date().getFullYear() }} APAN Store. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <button class="text-sm text-text-muted transition-colors hover:text-text" @click="ui.toggleDarkMode">
            <svg v-if="!ui.isDarkMode" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </button>
        </div>
      </div>
    </footer>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="ui.isCartDrawerOpen" class="fixed inset-0 z-50 bg-black/50" @click="ui.toggleCartDrawer" />
      </Transition>
      <Transition name="slide">
        <div v-if="ui.isCartDrawerOpen" class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface shadow-xl">
          <div class="flex h-full flex-col">
            <div class="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 class="text-lg font-semibold text-text">Cart ({{ cart.totalItems }})</h2>
              <button class="rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 hover:text-text" @click="ui.toggleCartDrawer">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div v-if="cart.isEmpty" class="flex flex-1 items-center justify-center">
              <p class="text-text-muted">Your cart is empty</p>
            </div>
            <div v-else class="flex-1 overflow-y-auto px-6 py-4">
              <div v-for="item in cart.items" :key="item.id" class="mb-4 flex gap-4 rounded-lg border border-border p-3">
                <img :src="item.image" :alt="item.title" class="h-20 w-20 rounded-lg object-cover" />
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-text">{{ item.title }}</h3>
                  <p class="text-sm font-semibold text-primary-600">${{ item.price.toFixed(2) }}</p>
                  <div class="mt-2 flex items-center gap-2">
                    <button class="flex h-7 w-7 items-center justify-center rounded border border-border text-text-muted transition-colors hover:bg-gray-100" @click="cart.updateQuantity(item.id, item.quantity - 1)">-</button>
                    <span class="w-8 text-center text-sm text-text">{{ item.quantity }}</span>
                    <button class="flex h-7 w-7 items-center justify-center rounded border border-border text-text-muted transition-colors hover:bg-gray-100" @click="cart.updateQuantity(item.id, item.quantity + 1)">+</button>
                    <button class="ml-auto text-sm text-red-500 transition-colors hover:text-red-700" @click="cart.removeItem(item.id)">Remove</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!cart.isEmpty" class="border-t border-border px-6 py-4">
              <div class="mb-4 flex items-center justify-between">
                <span class="text-text-muted">Subtotal</span>
                <span class="text-lg font-semibold text-text">${{ cart.subtotal.toFixed(2) }}</span>
              </div>
              <button class="btn-primary w-full">Checkout</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useCartStore } from '~/stores/useCartStore'

const ui = useUIStore()
const cart = useCartStore()
const { getProducts } = useShopify()

const { data: products, error, status } = useAsyncData('home-products', () => getProducts(4), {
  transform: (result) => result.products,
  default: () => []
})

const loading = computed(() => status.value === 'pending')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(100%);
}
</style>