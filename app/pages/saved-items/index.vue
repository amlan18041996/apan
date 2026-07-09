<template>
  <div>
    <div class="border-b border-border bg-gray-50">
      <div class="container-page py-3">
        <AppBreadcrumbs :items="breadcrumbs" />
      </div>
    </div>

    <section class="container-page py-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-text">
            Saved for Later
            <span
              v-if="cart.savedCount > 0"
              class="ml-2 inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700"
            >
              {{ cart.savedCount }}
            </span>
          </h1>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink
            v-if="!cart.isEmpty"
            to="/cart"
            class="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            &larr; Back to Cart
          </NuxtLink>
          <NuxtLink
            to="/products"
            class="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Continue Shopping &rarr;
          </NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="savedItems.length > 0" class="container-page pb-16">
      <div class="space-y-4">
        <div
          v-for="item in savedItems"
          :key="item.id"
          class="flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm"
        >
          <NuxtLink :to="`/products/${item.handle}`" class="shrink-0">
            <img
              :src="item.image"
              :alt="item.title"
              class="h-16 w-16 rounded-lg object-cover"
              loading="lazy"
            />
          </NuxtLink>

          <div class="min-w-0 flex-1">
            <NuxtLink
              :to="`/products/${item.handle}`"
              class="text-sm font-medium text-text transition-colors hover:text-primary-600"
            >
              {{ item.title }}
            </NuxtLink>
            <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span class="text-sm font-semibold text-text">
                ${{ formatPrice(item.currentPrice ?? item.price) }}
              </span>
              <span v-if="item.priceChanged" class="text-xs text-text-muted line-through">
                ${{ formatPrice(item.price) }}
              </span>
              <span
                v-if="item.inStock"
                class="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
              >
                In Stock
              </span>
              <span
                v-else
                class="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700"
              >
                Back in stock soon
              </span>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <button
              class="btn-primary text-sm"
              :disabled="movingIds.has(item.id)"
              @click="moveToCart(item)"
            >
              <svg
                v-if="movingIds.has(item.id)"
                class="h-4 w-4 animate-spin"
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
              <span v-else>Move to Cart</span>
            </button>
            <button
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-50 hover:text-error"
              :disabled="removingIds.has(item.id)"
              aria-label="Remove"
              @click="removeSaved(item)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="container-page py-16">
      <div class="mx-auto max-w-md text-center">
        <svg
          class="mx-auto h-16 w-16 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-text">No saved items</h2>
        <p class="mt-2 text-sm text-text-muted">Items you save from your cart will appear here.</p>
        <NuxtLink to="/products" class="btn-primary mt-6 inline-flex"> Start Shopping </NuxtLink>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="undo-fade">
        <div
          v-if="undoItem"
          class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 text-white shadow-lg"
        >
          <p class="text-sm">{{ undoMessage }}</p>
          <button
            class="text-sm font-semibold text-primary-300 transition-colors hover:text-primary-200"
            @click="undoAction"
          >
            Undo
          </button>
          <button
            class="ml-1 rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-300"
            aria-label="Dismiss"
            @click="dismissUndo"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { CartItem } from '~/stores/useCartStore'
import { useCartStore } from '~/stores/useCartStore'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Saved for Later - APAN Store',
  description: 'View items you have saved from your cart for future purchase.',
  robots: 'noindex',
})

const cart = useCartStore()
const toast = useToast()

const breadcrumbs = [
  { label: 'Home', to: '/' },
  { label: 'Cart', to: '/cart' },
  { label: 'Saved for Later', to: '/saved-items' },
]

const removingIds = ref(new Set<string>())
const movingIds = ref(new Set<string>())

const { getProducts } = useShopify()
const { data: allProducts } = useAsyncData('saved-items-products', () => getProducts(250), {
  transform: (r) => r.products,
  default: () => [],
})

const variantMap = computed(() => {
  const map = new Map<
    string,
    { price: number; inventoryQuantity: number; handle: string; variantTitle: string }
  >()
  for (const p of allProducts.value) {
    for (const v of p.variants) {
      map.set(v.id, {
        price: parseFloat(v.price),
        inventoryQuantity: v.inventoryQuantity,
        handle: p.handle,
        variantTitle: v.title,
      })
    }
  }
  return map
})

interface SavedDisplayItem {
  id: string
  productId: string
  variantId: string
  title: string
  image: string
  price: number
  currentPrice: number | null
  priceChanged: boolean
  handle: string
  inStock: boolean
}

const savedItems = computed((): SavedDisplayItem[] => {
  return cart.savedForLater.map((item: CartItem) => {
    const variantInfo = variantMap.value.get(item.variantId)
    const currentPrice = variantInfo?.price ?? null
    const priceChanged = currentPrice !== null && Math.abs(currentPrice - item.price) > 0.01
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      image: item.image,
      price: item.price,
      currentPrice,
      priceChanged,
      handle: variantInfo?.handle ?? item.productId,
      inStock: variantInfo ? variantInfo.inventoryQuantity > 0 : true,
    }
  })
})

function formatPrice(price: number): string {
  return price.toFixed(2)
}

const undoItem = ref<SavedDisplayItem | null>(null)
const undoMessage = ref('')
let undoTimeout: ReturnType<typeof setTimeout> | null = null
let undoHandler: (() => void) | null = null

function moveToCart(item: SavedDisplayItem) {
  movingIds.value.add(item.id)

  const variantInfo = variantMap.value.get(item.variantId)
  const isOutOfStock = variantInfo !== undefined && variantInfo.inventoryQuantity <= 0

  if (isOutOfStock) {
    if (
      !confirm(
        'This item is currently out of stock. Are you sure you want to move it to your cart?',
      )
    ) {
      movingIds.value.delete(item.id)
      return
    }
  }

  cart.moveToCart(item.id)
  movingIds.value.delete(item.id)

  if (undoTimeout) clearTimeout(undoTimeout)
  undoItem.value = item
  undoMessage.value = 'Moved to cart'
  undoHandler = () => {
    cart.saveForLater(item.id)
    toast.success('Item restored')
  }
  undoTimeout = setTimeout(() => {
    undoItem.value = null
    undoHandler = null
  }, 5000)

  toast.success('Moved to cart')
}

function removeSaved(item: SavedDisplayItem) {
  if (undoTimeout) clearTimeout(undoTimeout)

  const savedItem = cart.savedForLater.find((i: CartItem) => i.id === item.id)
  if (!savedItem) return

  removingIds.value.add(item.id)
  cart.removeSaved(item.id)
  removingIds.value.delete(item.id)

  undoItem.value = item
  undoMessage.value = 'Removed'
  undoHandler = () => {
    cart.savedForLater.push(savedItem)
    cart.persist()
    toast.success('Item restored')
  }
  undoTimeout = setTimeout(() => {
    undoItem.value = null
    undoHandler = null
  }, 5000)
}

function undoAction() {
  if (undoHandler) {
    undoHandler()
  }
  undoItem.value = null
  if (undoTimeout) clearTimeout(undoTimeout)
  undoHandler = null
}

function dismissUndo() {
  undoItem.value = null
  if (undoTimeout) clearTimeout(undoTimeout)
  undoHandler = null
}
</script>

<style scoped>
.undo-fade-enter-active,
.undo-fade-leave-active {
  transition: all 0.3s ease;
}
.undo-fade-enter-from,
.undo-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
