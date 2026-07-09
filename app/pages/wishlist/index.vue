<template>
  <div>
    <section class="border-b border-border bg-gray-50 py-8 md:py-10">
      <div class="container-page">
        <AppBreadcrumbs />
        <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-text md:text-3xl">My Wishlist</h1>
            <span
              class="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary-100 px-2 text-xs font-semibold text-primary-700"
            >
              {{ wishlist.count }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div v-if="wishlist.count > 0" class="flex items-center gap-2">
              <label for="wishlist-sort" class="text-sm text-text-muted">Sort by:</label>
              <select
                id="wishlist-sort"
                v-model="sortBy"
                class="input-field !w-auto !py-1.5 !pr-8 text-sm"
              >
                <option value="recent">Recently Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            <button
              v-if="wishlist.count > 0"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              @click="shareWishlist"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="!isAuthenticated && wishlist.count > 0 && !loginBannerDismissed"
      class="border-b border-border bg-blue-50"
    >
      <div class="container-page flex items-center justify-between gap-4 py-3">
        <p class="text-sm text-blue-800">Sign in to sync your wishlist across devices.</p>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/auth/login"
            class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Sign In
          </NuxtLink>
          <button
            type="button"
            class="rounded-lg p-1 text-blue-400 transition-colors hover:bg-blue-100 hover:text-blue-600"
            aria-label="Dismiss login prompt"
            @click="loginBannerDismissed = true"
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
      </div>
    </div>

    <section class="container-page py-8">
      <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="n in 4" :key="n" class="card animate-pulse p-4">
          <div class="mb-4 aspect-square rounded-lg bg-gray-200" />
          <div class="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div class="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>

      <div v-else-if="paginatedItems.length === 0" class="py-16 text-center">
        <svg
          class="mx-auto h-16 w-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h2 class="mt-6 text-xl font-semibold text-text">Your wishlist is empty</h2>
        <p class="mt-2 text-sm text-text-muted">
          Save items you love by tapping the heart icon on any product.
        </p>
        <NuxtLink to="/products" class="btn-primary mt-8 inline-flex items-center gap-2">
          Start Shopping
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
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </NuxtLink>
      </div>

      <div v-else>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div
            v-for="item in paginatedItems"
            :key="item.productId"
            class="card group relative overflow-hidden transition-shadow hover:shadow-soft-lg"
          >
            <div class="absolute right-3 top-3 z-10 flex flex-col gap-2">
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-100"
                :aria-label="`Remove ${item.title} from wishlist`"
                :disabled="removingIds.has(item.productId)"
                @click="removeItem(item)"
              >
                <svg
                  class="h-5 w-5 text-red-500"
                  fill="currentColor"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

            <NuxtLink :to="`/products/${item.handle}`" class="block">
              <div class="aspect-square overflow-hidden bg-gray-100">
                <img
                  :src="item.image"
                  :alt="item.title"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </NuxtLink>

            <div class="p-4">
              <NuxtLink :to="`/products/${item.handle}`">
                <h3
                  class="mb-1 text-sm font-medium text-text line-clamp-2 transition-colors hover:text-primary-600"
                >
                  {{ item.title }}
                </h3>
              </NuxtLink>

              <p class="mb-3 text-sm font-semibold text-primary-600">
                ${{ formatPrice(item.price) }}
              </p>

              <div class="flex gap-2">
                <button
                  class="btn-primary flex-1 px-3 py-2 text-xs"
                  :disabled="addingCartIds.has(item.productId)"
                  @click="addToCart(item)"
                >
                  <span
                    v-if="addingCartIds.has(item.productId)"
                    class="inline-flex items-center gap-1.5"
                  >
                    <svg class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
                    Adding...
                  </span>
                  <span v-else>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="mt-12">
          <AppPagination
            :current-page="page"
            :total-pages="totalPages"
            :show-range="false"
            @update:current-page="page = $event"
          />
        </div>
      </div>
    </section>

    <Teleport to="body">
      <AppModal v-model="variantModalOpen" title="Select Variant" size="sm">
        <div v-if="variantProduct" class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                :src="variantProduct.image"
                :alt="variantProduct.title"
                class="h-full w-full object-cover"
              />
            </div>
            <div>
              <p class="font-medium text-text">{{ variantProduct.title }}</p>
              <p class="mt-1 text-sm font-semibold text-primary-600">
                ${{ formatPrice(variantProduct.price) }}
              </p>
            </div>
          </div>
          <div v-for="(options, optionName) in variantOptions" :key="optionName" class="space-y-2">
            <p class="text-sm font-medium text-text">{{ optionName }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="value in options"
                :key="value"
                type="button"
                class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
                :class="
                  selectedVariants[optionName] === value
                    ? 'border-primary-600 bg-primary-50 font-medium text-primary-700'
                    : 'border-border text-text hover:border-gray-300'
                "
                @click="selectedVariants[optionName] = value"
              >
                {{ value }}
              </button>
            </div>
          </div>
          <button
            class="btn-primary w-full"
            :disabled="!canAddVariantToCart"
            @click="confirmVariantAdd"
          >
            Add to Cart
          </button>
        </div>
      </AppModal>
    </Teleport>

    <Teleport to="body">
      <Transition name="undo-fade">
        <div
          v-if="undoItem"
          class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 text-white shadow-lg"
        >
          <p class="text-sm">Removed from wishlist</p>
          <button
            class="text-sm font-semibold text-primary-300 transition-colors hover:text-primary-200"
            @click="undoRemove"
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
import type { ShopifyProduct } from '~/types/shopify'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'My Wishlist - APAN Store',
  description: 'View and manage your saved products on APAN Store.',
  robots: 'noindex',
})

interface WishlistDisplayItem {
  productId: string
  title: string
  image: string
  price: number
  handle: string
}

const route = useRoute()
const wishlist = useWishlistStore()
const cart = useCartStore()
const user = useUserStore()
const toast = useToast()

const isAuthenticated = computed(() => user.isAuthenticated)

const sortBy = ref('recent')
const page = ref(1)
const perPage = 12
const removingIds = ref(new Set<string>())
const addingCartIds = ref(new Set<string>())
const loginBannerDismissed = ref(false)

const { getProducts } = useShopify()
const { data: allProducts, status } = useAsyncData('wishlist-products', () => getProducts(250), {
  transform: (r) => r.products,
  default: () => [],
})

const loading = computed(() => status.value === 'pending')

const productMap = computed(() => {
  const map = new Map<string, ShopifyProduct>()
  for (const p of allProducts.value) {
    map.set(p.id, p)
  }
  return map
})

const wishlistItems = computed((): WishlistDisplayItem[] => {
  return wishlist.items.map((item) => {
    const product = productMap.value.get(item.productId)
    return {
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
      handle: product?.handle ?? item.productId,
    }
  })
})

const sortedItems = computed(() => {
  const items = [...wishlistItems.value]
  switch (sortBy.value) {
    case 'price_asc':
      items.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      items.sort((a, b) => b.price - a.price)
      break
    case 'recent':
    default: {
      const addedMap = new Map<string, string>()
      for (const item of wishlist.items) {
        addedMap.set(item.productId, item.addedAt)
      }
      items.sort((a, b) => {
        const da = addedMap.get(a.productId) ?? ''
        const db = addedMap.get(b.productId) ?? ''
        return db.localeCompare(da)
      })
      break
    }
  }
  return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedItems.value.length / perPage)))

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage
  return sortedItems.value.slice(start, start + perPage)
})

watch(
  () => sortBy.value,
  () => {
    page.value = 1
  },
)

watch(
  () => route.query,
  () => {
    page.value = 1
  },
)

const undoItem = ref<WishlistDisplayItem | null>(null)
let undoTimeout: ReturnType<typeof setTimeout> | null = null

function removeItem(item: WishlistDisplayItem) {
  if (undoTimeout) clearTimeout(undoTimeout)

  removingIds.value.add(item.productId)

  wishlist.removeItem(item.productId)

  removingIds.value.delete(item.productId)
  undoItem.value = item

  undoTimeout = setTimeout(() => {
    undoItem.value = null
  }, 5000)
}

function undoRemove() {
  if (undoItem.value) {
    const item = undoItem.value
    wishlist.toggleItem({
      id: item.productId,
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
    })
    undoItem.value = null
    if (undoTimeout) clearTimeout(undoTimeout)
    toast.success('Item restored')
  }
}

function dismissUndo() {
  undoItem.value = null
  if (undoTimeout) clearTimeout(undoTimeout)
}

const variantModalOpen = ref(false)
const variantProduct = ref<WishlistDisplayItem | null>(null)
const selectedVariants = ref<Record<string, string>>({})

const variantOptions = computed(() => {
  const product = variantProduct.value
  if (!product) return {}
  const full = productMap.value.get(product.productId)
  if (!full) return {}
  const options: Record<string, string[]> = {}
  for (const opt of full.options) {
    options[opt.name] = opt.values
  }
  return options
})

const canAddVariantToCart = computed(() => {
  for (const name of Object.keys(variantOptions.value)) {
    if (!selectedVariants.value[name]) return false
  }
  return Object.keys(variantOptions.value).length > 0
})

function addToCart(item: WishlistDisplayItem) {
  const full = productMap.value.get(item.productId)
  if (full && full.variants.length > 1) {
    variantProduct.value = item
    selectedVariants.value = {}
    for (const opt of full.options) {
      selectedVariants.value[opt.name] = opt.values[0]
    }
    variantModalOpen.value = true
    return
  }

  addingCartIds.value.add(item.productId)
  const variantId = full?.variants[0]?.id ?? item.productId
  cart
    .addToCart({
      id: variantId,
      productId: item.productId,
      variantId,
      title: item.title,
      image: item.image,
      price: item.price,
      maxQuantity: 99,
    })
    .then(() => {
      wishlist.removeItem(item.productId)
      if (undoTimeout) clearTimeout(undoTimeout)
      undoItem.value = null
      toast.success('Moved to cart')
    })
    .catch(() => {
      toast.error('Failed to add to cart')
    })
    .finally(() => {
      addingCartIds.value.delete(item.productId)
    })
}

function confirmVariantAdd() {
  const item = variantProduct.value
  if (!item || !canAddVariantToCart.value) return

  const full = productMap.value.get(item.productId)
  if (!full) return

  const selectedVariant = full.variants.find((v) =>
    v.selectedOptions.every((opt) => selectedVariants.value[opt.name] === opt.value),
  )

  if (!selectedVariant) {
    toast.error('Please select all options')
    return
  }

  addingCartIds.value.add(item.productId)
  variantModalOpen.value = false

  cart
    .addToCart({
      id: selectedVariant.id,
      productId: item.productId,
      variantId: selectedVariant.id,
      title: `${item.title} (${selectedVariant.title})`,
      image: selectedVariant.image?.url ?? item.image,
      price: parseFloat(selectedVariant.price),
      maxQuantity: 99,
    })
    .then(() => {
      wishlist.removeItem(item.productId)
      if (undoTimeout) clearTimeout(undoTimeout)
      undoItem.value = null
      toast.success('Moved to cart')
    })
    .catch(() => {
      toast.error('Failed to add to cart')
    })
    .finally(() => {
      addingCartIds.value.delete(item.productId)
    })
}

async function shareWishlist() {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Wishlist link copied!')
  } catch {
    toast.info(`Copy this link: ${url}`)
  }
}

function formatPrice(price: number): string {
  return price.toFixed(2)
}

onMounted(() => {
  wishlist.init()
})
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
