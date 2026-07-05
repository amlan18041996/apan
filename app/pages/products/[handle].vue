<template>
  <div v-if="loading" class="container-page py-12">
    <div class="grid gap-8 md:grid-cols-2">
      <div class="aspect-square animate-pulse rounded-xl bg-gray-200" />
      <div>
        <div class="mb-4 h-8 w-3/4 animate-pulse rounded bg-gray-200" />
        <div class="mb-2 h-4 w-1/4 animate-pulse rounded bg-gray-200" />
        <div class="mb-6 h-10 w-1/3 animate-pulse rounded bg-gray-200" />
        <div class="space-y-2">
          <div v-for="n in 4" :key="n" class="h-4 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="error" class="container-page py-12">
    <div class="rounded-lg bg-red-50 p-8 text-center">
      <p class="text-red-600">{{ error }}</p>
      <NuxtLink to="/products" class="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">&larr; Back to products</NuxtLink>
    </div>
  </div>

  <div v-else-if="product" class="container-page py-8">
    <nav class="mb-6 text-sm text-text-muted">
      <NuxtLink to="/products" class="hover:text-text">Products</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-text">{{ product.title }}</span>
    </nav>

    <div class="grid gap-8 md:grid-cols-2">
      <div class="space-y-4">
        <div class="aspect-square overflow-hidden rounded-xl bg-gray-100">
          <img v-if="product.featuredImage" :src="product.featuredImage.url" :alt="product.featuredImage.altText ?? product.title" class="h-full w-full object-cover" />
          <div v-else class="flex h-full items-center justify-center text-text-muted">
            <svg class="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
        </div>
        <div v-if="product.images.length > 1" class="grid grid-cols-4 gap-2">
          <button v-for="(img, idx) in product.images" :key="img.id" class="aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 transition-colors hover:border-primary-500" :class="{ 'border-primary-600': idx === selectedImage }" @click="selectedImage = idx">
            <img :src="img.url" :alt="img.altText ?? `${product.title} ${idx + 1}`" class="h-full w-full object-cover" />
          </button>
        </div>
      </div>

      <div>
        <h1 class="text-3xl font-bold text-text">{{ product.title }}</h1>
        <p v-if="product.vendor" class="mt-1 text-sm text-text-muted">by {{ product.vendor }}</p>
        <p class="mt-4 text-3xl font-bold text-primary-600">${{ formatPrice(product.priceRangeV2.minVariantPrice.amount) }}</p>
        <p v-if="product.status === 'ACTIVE'" class="mt-1 text-sm text-green-600">In Stock ({{ product.totalInventory }} available)</p>
        <p v-else class="mt-1 text-sm text-red-600">Out of Stock</p>

        <hr class="my-6 border-border" />

        <div v-if="product.options.length" class="space-y-4">
          <div v-for="option in product.options" :key="option.id">
            <label class="mb-2 block text-sm font-medium text-text">{{ option.name }}</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="val in option.values" :key="val" class="rounded-lg border px-4 py-2 text-sm transition-colors hover:border-primary-500 hover:text-primary-600" :class="selectedOptions[option.name] === val ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-border text-text'" @click="selectedOptions[option.name] = val">{{ val }}</button>
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-center gap-4">
          <div class="flex items-center rounded-lg border border-border">
            <button class="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:bg-gray-100" @click="quantity = Math.max(1, quantity - 1)">-</button>
            <span class="flex h-10 w-12 items-center justify-center text-sm text-text">{{ quantity }}</span>
            <button class="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:bg-gray-100" @click="quantity = Math.min(product.totalInventory || 99, quantity + 1)">+</button>
          </div>
          <button class="btn-primary flex-1" :disabled="product.status !== 'ACTIVE'" @click="addToCart">Add to Cart</button>
          <button class="rounded-lg border border-border p-2.5 text-text-muted transition-colors hover:border-red-300 hover:text-red-500" @click="toggleWishlist">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </button>
        </div>

        <hr class="my-6 border-border" />

        <div class="prose prose-sm max-w-none text-text-muted" v-html="product.descriptionHtml" />
      </div>
    </div>
  </div>

  <div v-else class="container-page py-12">
    <div class="rounded-lg bg-gray-50 p-16 text-center">
      <p class="text-text-muted">Product not found.</p>
      <NuxtLink to="/products" class="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">&larr; Back to products</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShopifyProduct } from '~/types/shopify'
import { useUIStore } from '~/stores/useUIStore'
import { useCartStore } from '~/stores/useCartStore'
import { useWishlistStore } from '~/stores/useWishlistStore'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const ui = useUIStore()
const cart = useCartStore()
const wishlist = useWishlistStore()
const { getProductByHandle } = useShopify()

const handle = computed(() => route.params.handle as string)

const { data: product, error, status } = useAsyncData(`product-${handle.value}`, () => getProductByHandle(handle.value), {
  watch: [handle]
})

const loading = computed(() => status.value === 'pending')
const selectedImage = ref(0)
const selectedOptions = ref<Record<string, string>>({})
const quantity = ref(1)

watch(() => product.value, (p) => {
  if (p?.options.length) {
    const opts: Record<string, string> = {}
    for (const option of p.options) {
      opts[option.name] = option.values[0]
    }
    selectedOptions.value = opts
  }
  quantity.value = 1
  selectedImage.value = 0
})

function formatPrice(amount: string | number): string {
  return parseFloat(String(amount)).toFixed(2)
}

function addToCart() {
  if (!product.value) return
  cart.addToCart({
    id: `${product.value.id}-${JSON.stringify(selectedOptions.value)}`,
    productId: product.value.id,
    variantId: product.value.variants[0]?.id ?? '',
    title: product.value.title,
    image: product.value.featuredImage?.url ?? '',
    price: parseFloat(product.value.priceRangeV2.minVariantPrice.amount),
    quantity: quantity.value
  })
  ui.addToast({ type: 'success', message: `${product.value.title} added to cart` })
}

function toggleWishlist() {
  if (!product.value) return
  wishlist.toggleItem({
    id: product.value.id,
    productId: product.value.id,
    title: product.value.title,
    image: product.value.featuredImage?.url ?? '',
    price: parseFloat(product.value.priceRangeV2.minVariantPrice.amount)
  })
  ui.addToast({ type: 'info', message: wishlist.isInWishlist(product.value.id) ? 'Added to wishlist' : 'Removed from wishlist' })
}
</script>