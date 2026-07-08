<template>
  <div>
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
        <NuxtLink
          to="/products"
          class="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
          >&larr; Back to products</NuxtLink
        >
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
          <button
            class="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100"
            @click="lightboxOpen = true"
          >
            <img
              :src="currentImage.url"
              :alt="currentImage.altText ?? product.title"
              class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div class="absolute inset-0 bg-black/0 transition-colors hover:bg-black/5" />
          </button>
          <div v-if="product.images.length > 1" class="grid grid-cols-5 gap-2">
            <button
              v-for="(img, idx) in product.images"
              :key="img.id"
              class="aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 transition-colors hover:border-primary-500"
              :class="{ 'border-primary-600': idx === selectedImage }"
              @click="selectedImage = idx"
            >
              <img
                :src="img.url"
                :alt="img.altText ?? `${product.title} ${idx + 1}`"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          </div>
        </div>

        <div>
          <h1 class="text-3xl font-bold text-text">{{ product.title }}</h1>
          <p v-if="product.vendor" class="mt-1 text-sm text-text-muted">by {{ product.vendor }}</p>
          <div class="mt-4 flex items-center gap-3">
            <span class="text-3xl font-bold text-primary-600"
              >${{ formatPrice(currentPrice) }}</span
            >
            <span
              v-if="currentComparePrice > currentPrice"
              class="text-lg text-gray-400 line-through"
              >${{ formatPrice(currentComparePrice) }}</span
            >
          </div>

          <div class="mt-2 flex items-center gap-2">
            <Ratings :model-value="4.5" size="sm" show-value />
            <span class="text-sm text-text-muted">(12 reviews)</span>
          </div>

          <div class="mt-2">
            <span
              v-if="stockStatus === 'in_stock'"
              class="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-green-500" /> In Stock
            </span>
            <span
              v-else-if="stockStatus === 'low_stock'"
              class="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-yellow-500" /> Only
              {{ currentVariant?.inventoryQuantity ?? product.totalInventory }} left
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-red-500" /> Out of Stock
            </span>
          </div>

          <hr class="my-6 border-border" />

          <div v-if="product.options.length" class="space-y-5">
            <div v-for="option in product.options" :key="option.id">
              <label class="mb-2 block text-sm font-medium text-text">{{ option.name }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="val in option.values"
                  :key="val"
                  class="rounded-lg border px-4 py-2 text-sm transition-all"
                  :class="
                    selectedOptions[option.name] === val
                      ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                      : 'border-border text-text hover:border-primary-500 hover:text-primary-600'
                  "
                  @click="selectOption(option.name, val)"
                >
                  {{ val }}
                </button>
              </div>
            </div>
          </div>

          <div class="mt-6 flex items-center gap-4">
            <div class="flex items-center rounded-lg border border-border">
              <button
                class="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:bg-gray-100 disabled:opacity-30"
                :disabled="quantity <= 1"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <input
                :value="quantity"
                type="number"
                min="1"
                :max="maxQuantity"
                class="h-10 w-14 border-x border-border bg-transparent text-center text-sm text-text [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                @input="onQuantityInput"
              />
              <button
                class="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:bg-gray-100 disabled:opacity-30"
                :disabled="quantity >= maxQuantity"
                @click="quantity = Math.min(maxQuantity, quantity + 1)"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
            <button
              class="btn-primary flex-1"
              :disabled="stockStatus === 'out_of_stock' || cartLoading"
              @click="addToCart"
            >
              <svg
                v-if="cartLoading"
                class="mr-2 inline-block h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {{ stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart' }}
            </button>
            <button
              class="rounded-lg border border-border p-2.5 text-text-muted transition-colors hover:border-red-300 hover:text-red-500"
              :class="{ 'border-red-300 text-red-500': isWishlisted }"
              @click="toggleWishlist"
            >
              <svg
                class="h-5 w-5"
                :fill="isWishlisted ? 'currentColor' : 'none'"
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
          </div>

          <hr class="my-6 border-border" />

          <div class="space-y-3">
            <div
              v-for="(section, idx) of accordionSections"
              :key="section.title"
              class="rounded-lg border border-border"
            >
              <button
                class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text transition-colors hover:bg-gray-50"
                @click="toggleAccordion(idx)"
              >
                {{ section.title }}
                <svg
                  class="h-4 w-4 transition-transform duration-200"
                  :class="{ 'rotate-180': openAccordion === idx }"
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
                v-show="openAccordion === idx"
                class="border-t border-border px-4 py-3 text-sm text-text-muted leading-relaxed"
                v-html="section.content"
              />
            </div>
          </div>
        </div>
      </div>

      <section v-if="relatedProducts.length > 0" class="mt-16">
        <h2 class="mb-8 text-2xl font-bold text-text">You May Also Like</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCard v-for="p in relatedProducts" :key="p.id" :product="p" />
        </div>
      </section>

      <section v-if="recentlyViewed.length > 0" class="mt-16">
        <h2 class="mb-8 text-2xl font-bold text-text">Recently Viewed</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCard v-for="p in recentlyViewed" :key="p.id" :product="p" />
        </div>
      </section>
    </div>

    <div v-else class="container-page py-12">
      <div class="rounded-lg bg-gray-50 p-16 text-center">
        <p class="text-text-muted">Product not found.</p>
        <NuxtLink
          to="/products"
          class="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
          >&larr; Back to products</NuxtLink
        >
      </div>
    </div>
    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        @click.self="lightboxOpen = false"
        @keydown.escape="lightboxOpen = false"
      >
        <button
          class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
          @click="lightboxOpen = false"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          v-if="product && product.images.length > 1"
          class="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
          @click="prevImage"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <img
          v-if="product"
          :src="currentImage.url"
          :alt="currentImage.altText ?? product.title"
          class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        />
        <button
          v-if="product && product.images.length > 1"
          class="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
          @click="nextImage"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ShopifyProduct } from '~/types/shopify'
import { useUIStore } from '~/stores/useUIStore'
import { useCartStore } from '~/stores/useCartStore'
import { useWishlistStore } from '~/stores/useWishlistStore'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const ui = useUIStore()
const cart = useCartStore()
const wishlist = useWishlistStore()
const { getProductByHandle, getProducts } = useShopify()

const handle = computed(() => route.params.handle as string)

const {
  data: product,
  error,
  status,
} = useAsyncData(`product-${handle.value}`, () => getProductByHandle(handle.value), {
  watch: [handle],
})
const loading = computed(() => status.value === 'pending')

const selectedImage = ref(0)
const selectedOptions = ref<Record<string, string>>({})
const quantity = ref(1)
const cartLoading = ref(false)
const lightboxOpen = ref(false)
const openAccordion = ref<number | null>(null)
const { data: relatedProducts } = useAsyncData(`related-${handle.value}`, () => getProducts(4), {
  transform: (r) => r.products.filter((p) => p.handle !== handle.value).slice(0, 4),
  default: () => [],
})

watch(product, (p) => {
  if (p?.options.length) {
    const opts: Record<string, string> = {}
    for (const option of p.options) {
      opts[option.name] = option.values[0]
    }
    selectedOptions.value = opts
  }
  quantity.value = 1
  selectedImage.value = 0
  if (p) trackRecentlyViewed(p)
})

const currentVariant = computed(() => {
  if (!product.value) return null
  const opts = selectedOptions.value
  return (
    product.value.variants.find((v) => v.selectedOptions.every((o) => opts[o.name] === o.value)) ??
    product.value.variants[0]
  )
})

const currentPrice = computed(() => {
  if (currentVariant.value) return parseFloat(currentVariant.value.price)
  return parseFloat(product.value?.priceRangeV2.minVariantPrice.amount ?? '0')
})

const currentComparePrice = computed(() => {
  if (currentVariant.value?.compareAtPrice) return parseFloat(currentVariant.value.compareAtPrice)
  return currentPrice.value
})

const currentImage = computed(() => {
  if (!product.value) return { url: '', altText: null }
  if (currentVariant.value?.image) return currentVariant.value.image
  return (
    product.value.images[selectedImage.value] ??
    product.value.featuredImage ??
    product.value.images[0] ?? { url: '', altText: null }
  )
})

const stockStatus = computed(() => {
  if (!product.value) return 'out_of_stock'
  if (product.value.status !== 'ACTIVE') return 'out_of_stock'
  const inv = currentVariant.value?.inventoryQuantity ?? product.value.totalInventory
  if (inv <= 0) return 'out_of_stock'
  if (inv <= 5) return 'low_stock'
  return 'in_stock'
})

const maxQuantity = computed(() => Math.min(currentVariant.value?.inventoryQuantity ?? 99, 99))

const isWishlisted = computed(() => wishlist.isInWishlist(product.value?.id ?? ''))

function formatPrice(amount: string | number): string {
  return parseFloat(String(amount)).toFixed(2)
}

function selectOption(name: string, value: string) {
  selectedOptions.value = { ...selectedOptions.value, [name]: value }
}

function onQuantityInput(e: Event) {
  const target = e.target as HTMLInputElement
  const val = parseInt(target.value, 10)
  if (!isNaN(val)) {
    quantity.value = Math.max(1, Math.min(val, maxQuantity.value))
  }
}

function toggleAccordion(idx: number) {
  openAccordion.value = openAccordion.value === idx ? null : idx
}

function prevImage() {
  if (!product.value) return
  selectedImage.value =
    (selectedImage.value - 1 + product.value.images.length) % product.value.images.length
}

function nextImage() {
  if (!product.value) return
  selectedImage.value = (selectedImage.value + 1) % product.value.images.length
}

async function addToCart() {
  if (!product.value) return
  cartLoading.value = true
  await cart.addToCart({
    id: `${product.value.id}-${JSON.stringify(selectedOptions.value)}`,
    productId: product.value.id,
    variantId: currentVariant.value?.id ?? '',
    title: product.value.title,
    image: currentImage.value?.url ?? '',
    price: currentPrice.value,
    quantity: quantity.value,
    maxQuantity: maxQuantity.value,
  })
  cartLoading.value = false
  ui.addToast({ type: 'success', message: `${product.value.title} added to cart` })
}

function toggleWishlist() {
  if (!product.value) return
  wishlist.toggleItem({
    id: product.value.id,
    productId: product.value.id,
    title: product.value.title,
    image: product.value.featuredImage?.url ?? '',
    price: parseFloat(product.value.priceRangeV2.minVariantPrice.amount),
  })
  ui.addToast({
    type: 'info',
    message: wishlist.isInWishlist(product.value.id)
      ? 'Added to wishlist'
      : 'Removed from wishlist',
  })
}

const recentlyViewed = ref<ShopifyProduct[]>([])

function trackRecentlyViewed(p: ShopifyProduct) {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem('apan-recently-viewed')
    let list: string[] = raw ? JSON.parse(raw) : []
    list = [p.id, ...list.filter((id) => id !== p.id)].slice(0, 8)
    localStorage.setItem('apan-recently-viewed', JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

onMounted(async () => {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem('apan-recently-viewed')
    if (raw) {
      const ids: string[] = JSON.parse(raw)
      const { getProducts } = useShopify()
      const all = await getProducts(20)
      recentlyViewed.value = all.products.filter((p) => ids.includes(p.id)).slice(0, 4)
    }
  } catch {
    /* ignore */
  }
})

const accordionSections = computed(() => {
  if (!product.value) return []
  return [
    {
      title: 'Details',
      content: product.value.descriptionHtml || '<p>No additional details available.</p>',
    },
    {
      title: 'Shipping & Returns',
      content:
        '<p>Free standard shipping on all orders over $50. Orders typically arrive within 5–8 business days.</p><p class="mt-2">Easy returns within 30 days of delivery. Items must be unused and in original packaging. Start a return through your account or contact our support team.</p>',
    },
    {
      title: 'Care Instructions',
      content:
        '<p>Follow the care label instructions on each product. Generally, we recommend gentle washing in cold water and air drying to extend the life of your garments.</p>',
    },
  ]
})

useSeoMeta({
  title: () => (product.value ? `${product.value.title} — APAN Store` : 'APAN Store'),
  description: () => product.value?.description?.slice(0, 160) ?? '',
  ogTitle: () => (product.value ? `${product.value.title} — APAN Store` : 'APAN Store'),
  ogDescription: () => product.value?.description?.slice(0, 160) ?? '',
  ogImage: () => product.value?.featuredImage?.url ?? '',
})

useHead({
  script: computed(() => {
    if (!product.value) return []
    return [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.value.title,
          description: product.value.description,
          image: product.value.featuredImage?.url,
          sku: product.value.variants[0]?.sku ?? product.value.id,
          mpn: product.value.id,
          brand: { '@type': 'Brand', name: product.value.vendor },
          offers: {
            '@type': 'Offer',
            price: currentPrice.value,
            priceCurrency: product.value.priceRangeV2.minVariantPrice.currencyCode,
            availability:
              stockStatus.value === 'out_of_stock'
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock',
          },
        }),
      },
    ]
  }),
})
</script>
