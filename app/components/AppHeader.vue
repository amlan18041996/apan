<template>
  <header class="sticky top-0 z-50 border-b border-border bg-white">
    <div class="container-page">
      <div class="flex h-16 items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
            :class="isScrolled ? 'flex' : 'md:hidden flex'"
            aria-label="Menu"
            @click="openSidebar"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <NuxtLink to="/" class="shrink-0">
            <img
              src="/apan-logo-desktop.svg"
              alt="APAN Store"
              class="hidden md:block h-10 w-auto"
            />
            <img src="/apan-logo-mobile.svg" alt="APAN Store" class="block md:hidden h-8 w-auto" />
          </NuxtLink>
        </div>

        <div class="hidden md:flex flex-1 justify-center">
          <div class="relative w-full max-w-[55%]">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search Products... or press CTRL + K to focus"
              class="w-full rounded-full border border-border bg-gray-50 py-2 pl-10 pr-9 text-sm text-text placeholder-text-muted transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              @keyup.enter="handleSearch"
            />
            <svg
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <button
              v-if="searchQuery.length > 0"
              class="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-gray-200 hover:text-text"
              @click="clearSearch"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div class="flex items-center gap-1">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-gray-100 hover:text-text md:hidden"
            aria-label="Search"
            @click="toggleMobileSearch"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <NuxtLink
            :to="user.isAuthenticated ? '/account' : '/auth/login'"
            class="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
            :title="user.isAuthenticated ? 'My Account' : 'Sign in'"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </NuxtLink>

          <button
            class="relative flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
            aria-label="Wishlist"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span
              v-if="wishlist.count > 0"
              class="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white h-[18px]"
              >{{ wishlist.count }}</span
            >
          </button>

          <button
            class="relative flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
            aria-label="Cart"
            @click="ui.toggleCartDrawer"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span
              v-if="cart.totalItems > 0"
              class="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-medium text-white h-[18px]"
              >{{ cart.totalItems }}</span
            >
          </button>
        </div>
      </div>
    </div>

    <Transition name="slide-down">
      <div v-if="isMobileSearchOpen" class="border-t border-border bg-white px-4 py-3 md:hidden">
        <div class="relative">
          <input
            ref="mobileSearchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search Products... or press CTRL + K to focus"
            class="w-full rounded-full border border-border bg-gray-50 py-2.5 pl-10 pr-20 text-sm text-text placeholder-text-muted transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            @keyup.enter="handleSearchMobile"
          />
          <svg
            class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              v-if="searchQuery.length > 0"
              class="flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-gray-200 hover:text-text"
              @click="clearSearch"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <button
              class="rounded-full px-2 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
              @click="closeMobileSearch"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <nav
      v-if="!isScrolled"
      class="hidden border-t border-border bg-surface md:block relative"
      @mouseleave="closeMegaMenu"
    >
      <div class="container-page overflow-x-auto scrollbar-hide">
        <ul class="flex items-center gap-6 whitespace-nowrap">
          <li
            v-for="category in menuCategories"
            :key="category.name"
            @mouseenter="activeMenu = category.name"
          >
            <NuxtLink
              :to="category.slug"
              class="flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors"
              :class="
                activeMenu === category.name ? 'text-text' : 'text-text-muted hover:text-text'
              "
            >
              {{ category.name }}
              <svg
                class="h-3.5 w-3.5 transition-transform duration-200"
                :class="activeMenu === category.name ? 'rotate-180' : ''"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <Transition name="mega-fade">
        <div
          v-if="activeMenu"
          class="absolute left-0 right-0 top-full z-50 bg-white shadow-soft-lg border-t border-border"
          @mouseenter="activeMenu = activeMenu"
        >
          <div class="container-page">
            <div class="flex">
              <div class="w-64 shrink-0 border-r border-border p-4 overflow-y-auto max-h-[440px]">
                <ul class="space-y-1">
                  <li
                    v-for="sub in activeCategory?.subcategories ?? []"
                    :key="sub.name"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text cursor-pointer"
                    :class="{ 'bg-gray-100 text-text': activeSub === sub.name }"
                    @mouseenter="activeSub = sub.name"
                  >
                    {{ sub.name }}
                  </li>
                </ul>
              </div>
              <div class="flex-1 p-4 overflow-y-auto max-h-[440px]">
                <div v-if="activeSubCategory" class="grid grid-cols-3 gap-4">
                  <NuxtLink
                    v-for="product in activeSubCategory.products"
                    :key="product.name"
                    :to="product.slug"
                    class="group rounded-lg p-3 transition-colors hover:bg-gray-50"
                  >
                    <div class="mb-2 aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <img
                        :src="product.image"
                        :alt="product.name"
                        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h4 class="text-sm font-medium text-text truncate">{{ product.name }}</h4>
                    <p class="mt-0.5 text-sm font-semibold text-primary-600">{{ product.price }}</p>
                  </NuxtLink>
                </div>
                <div v-else class="flex items-center justify-center py-12 text-sm text-text-muted">
                  Hover over a category to see products
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </nav>

    <Teleport to="body">
      <Transition name="sidebar">
        <div v-if="isSidebarOpen" class="fixed inset-0 z-50">
          <div class="fixed inset-0 bg-black/50" @click="closeSidebar" />

          <div
            class="fixed inset-y-0 left-0 z-10 flex w-80 max-w-[85vw] flex-col bg-white shadow-xl"
          >
            <div class="flex items-center gap-3 border-b border-border px-4 py-4">
              <button
                v-if="sidebarStack.length > 1"
                class="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
                @click="sidebarBack"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 12H5m7 7l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 class="text-lg font-semibold text-text">{{ sidebarTitle }}</h2>
            </div>

            <div class="flex-1 overflow-y-auto p-4">
              <div class="space-y-1">
                <template v-for="item in currentSidebarItems" :key="item.name">
                  <button
                    v-if="item.subcategories && item.subcategories.length > 0"
                    class="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
                    @click="sidebarPush(item)"
                  >
                    {{ item.name }}
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <NuxtLink
                    v-else
                    :to="item.slug ?? '#'"
                    class="flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
                    @click="closeSidebar"
                  >
                    {{ item.name }}
                  </NuxtLink>
                </template>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useCartStore } from '~/stores/useCartStore'
import { useUserStore } from '~/stores/useUserStore'
import { useWishlistStore } from '~/stores/useWishlistStore'

interface MegaMenuProduct {
  name: string
  image: string
  price: string
  slug: string
}

interface MegaMenuSubcategory {
  name: string
  slug: string
  products: MegaMenuProduct[]
}

interface MegaMenuCategory {
  name: string
  slug: string
  subcategories: MegaMenuSubcategory[]
}

interface SidebarItem {
  name: string
  slug?: string
  subcategories?: SidebarItem[]
}

const ui = useUIStore()
const cart = useCartStore()
const user = useUserStore()
const wishlist = useWishlistStore()

const searchQuery = ref('')
const activeMenu = ref<string | null>(null)
const activeSub = ref<string | null>(null)
const isSidebarOpen = ref(false)
const isScrolled = ref(false)
const isMobileSearchOpen = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const mobileSearchInput = ref<HTMLInputElement | null>(null)

const sidebarStack = ref<{ title: string; items: SidebarItem[] }[]>([])

const activeCategory = computed(() => {
  if (!activeMenu.value) return null
  return menuCategories.value.find((c) => c.name === activeMenu.value) ?? null
})

const activeSubCategory = computed(() => {
  if (!activeCategory.value || !activeSub.value) return null
  return activeCategory.value.subcategories.find((s) => s.name === activeSub.value) ?? null
})

const currentSidebarItems = computed(() => {
  const current = sidebarStack.value[sidebarStack.value.length - 1]
  return current?.items ?? []
})

const sidebarTitle = computed(() => {
  return sidebarStack.value[sidebarStack.value.length - 1]?.title ?? 'Menu'
})

function closeMegaMenu() {
  activeMenu.value = null
  activeSub.value = null
}

function clearSearch() {
  searchQuery.value = ''
  searchInput.value?.focus()
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/products?search=${encodeURIComponent(searchQuery.value.trim())}`)
    searchQuery.value = ''
    closeMobileSearch()
  }
}

function toggleMobileSearch() {
  isMobileSearchOpen.value = !isMobileSearchOpen.value
  if (isMobileSearchOpen.value) {
    nextTick(() => mobileSearchInput.value?.focus())
  }
}

function closeMobileSearch() {
  isMobileSearchOpen.value = false
}

function handleSearchMobile() {
  handleSearch()
}

function openSidebar() {
  sidebarStack.value = [
    {
      title: 'Menu',
      items: menuCategories.value.map((c) => ({
        name: c.name,
        slug: c.slug,
        subcategories: c.subcategories.map((s) => ({
          name: s.name,
          slug: s.slug,
        })),
      })),
    },
  ]
  isSidebarOpen.value = true
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function sidebarPush(item: SidebarItem) {
  sidebarStack.value.push({
    title: item.name,
    items: item.subcategories ?? [],
  })
}

function sidebarBack() {
  if (sidebarStack.value.length > 1) {
    sidebarStack.value.pop()
  }
}

function onScroll() {
  isScrolled.value = window.scrollY > 0
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    if (isMobileSearchOpen.value) {
      mobileSearchInput.value?.focus()
    } else {
      searchInput.value?.focus()
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
})

const menuCategories = ref<MegaMenuCategory[]>([
  {
    name: 'Shop More',
    slug: '/collections',
    subcategories: [
      {
        name: 'New Arrivals',
        slug: '/collections/new-arrivals',
        products: [
          {
            name: 'Wireless Headphones',
            image: 'https://picsum.photos/seed/headphones/400/400',
            price: '$79.99',
            slug: '/products/wireless-headphones',
          },
          {
            name: 'Smart Watch',
            image: 'https://picsum.photos/seed/watch/400/400',
            price: '$199.99',
            slug: '/products/smart-watch',
          },
          {
            name: 'Bluetooth Speaker',
            image: 'https://picsum.photos/seed/speaker/400/400',
            price: '$49.99',
            slug: '/products/bluetooth-speaker',
          },
        ],
      },
      {
        name: 'Best Sellers',
        slug: '/collections/best-sellers',
        products: [
          {
            name: 'Organic Green Tea',
            image: 'https://picsum.photos/seed/tea/400/400',
            price: '$14.99',
            slug: '/products/organic-green-tea',
          },
          {
            name: 'Yoga Mat Premium',
            image: 'https://picsum.photos/seed/yoga/400/400',
            price: '$34.99',
            slug: '/products/yoga-mat',
          },
          {
            name: 'Desk Organizer',
            image: 'https://picsum.photos/seed/desk/400/400',
            price: '$24.99',
            slug: '/products/desk-organizer',
          },
        ],
      },
      {
        name: 'Sale',
        slug: '/collections/sale',
        products: [
          {
            name: 'Running Shoes',
            image: 'https://picsum.photos/seed/shoes/400/400',
            price: '$89.99',
            slug: '/products/running-shoes',
          },
          {
            name: 'Backpack Pro',
            image: 'https://picsum.photos/seed/backpack/400/400',
            price: '$59.99',
            slug: '/products/backpack-pro',
          },
          {
            name: 'Sunglasses',
            image: 'https://picsum.photos/seed/sunglasses/400/400',
            price: '$29.99',
            slug: '/products/sunglasses',
          },
        ],
      },
    ],
  },
  {
    name: 'Brands',
    slug: '/brands',
    subcategories: [
      {
        name: 'Premium Brands',
        slug: '/brands/premium',
        products: [
          {
            name: 'Leather Wallet',
            image: 'https://picsum.photos/seed/wallet/400/400',
            price: '$49.99',
            slug: '/products/leather-wallet',
          },
          {
            name: 'Designer Watch',
            image: 'https://picsum.photos/seed/dwatch/400/400',
            price: '$299.99',
            slug: '/products/designer-watch',
          },
          {
            name: 'Silk Scarf',
            image: 'https://picsum.photos/seed/scarf/400/400',
            price: '$39.99',
            slug: '/products/silk-scarf',
          },
        ],
      },
      {
        name: 'Popular Brands',
        slug: '/brands/popular',
        products: [
          {
            name: 'Denim Jacket',
            image: 'https://picsum.photos/seed/jacket/400/400',
            price: '$89.99',
            slug: '/products/denim-jacket',
          },
          {
            name: 'Canvas Sneakers',
            image: 'https://picsum.photos/seed/sneakers/400/400',
            price: '$64.99',
            slug: '/products/canvas-sneakers',
          },
          {
            name: 'Cotton T-Shirt',
            image: 'https://picsum.photos/seed/tshirt/400/400',
            price: '$24.99',
            slug: '/products/cotton-tshirt',
          },
        ],
      },
    ],
  },
  {
    name: 'Clothing',
    slug: '/collections/clothing',
    subcategories: [
      {
        name: 'Men',
        slug: '/collections/men',
        products: [
          {
            name: 'Formal Shirt',
            image: 'https://picsum.photos/seed/formalshirt/400/400',
            price: '$44.99',
            slug: '/products/formal-shirt',
          },
          {
            name: 'Chino Pants',
            image: 'https://picsum.photos/seed/chinopants/400/400',
            price: '$54.99',
            slug: '/products/chino-pants',
          },
          {
            name: 'Blazer',
            image: 'https://picsum.photos/seed/blazer/400/400',
            price: '$129.99',
            slug: '/products/blazer',
          },
        ],
      },
      {
        name: 'Women',
        slug: '/collections/women',
        products: [
          {
            name: 'Summer Dress',
            image: 'https://picsum.photos/seed/dress/400/400',
            price: '$59.99',
            slug: '/products/summer-dress',
          },
          {
            name: 'Handbag',
            image: 'https://picsum.photos/seed/handbag/400/400',
            price: '$79.99',
            slug: '/products/handbag',
          },
          {
            name: 'Heels',
            image: 'https://picsum.photos/seed/heels/400/400',
            price: '$69.99',
            slug: '/products/heels',
          },
        ],
      },
      {
        name: 'Kids',
        slug: '/collections/kids',
        products: [
          {
            name: 'Christmas T-Shirt',
            image: 'https://picsum.photos/seed/kidshirt/400/400',
            price: '$19.99',
            slug: '/products/kids-tshirt',
          },
          {
            name: 'Denim Shorts',
            image: 'https://picsum.photos/seed/kidshorts/400/400',
            price: '$24.99',
            slug: '/products/kids-shorts',
          },
          {
            name: 'Raincoat',
            image: 'https://picsum.photos/seed/raincoat/400/400',
            price: '$34.99',
            slug: '/products/raincoat',
          },
        ],
      },
      {
        name: 'Accessories',
        slug: '/collections/accessories',
        products: [
          {
            name: 'Leather Belt',
            image: 'https://picsum.photos/seed/belt/400/400',
            price: '$29.99',
            slug: '/products/leather-belt',
          },
          {
            name: 'Wool Hat',
            image: 'https://picsum.photos/seed/hat/400/400',
            price: '$22.99',
            slug: '/products/wool-hat',
          },
          {
            name: 'Watch Band',
            image: 'https://picsum.photos/seed/watchband/400/400',
            price: '$14.99',
            slug: '/products/watch-band',
          },
        ],
      },
    ],
  },
  {
    name: 'Fruits',
    slug: '/collections/fruits',
    subcategories: [
      {
        name: 'Fresh Fruits',
        slug: '/collections/fresh-fruits',
        products: [
          {
            name: 'Organic Apples',
            image: 'https://picsum.photos/seed/apples/400/400',
            price: '$5.99',
            slug: '/products/organic-apples',
          },
          {
            name: 'Fresh Oranges',
            image: 'https://picsum.photos/seed/oranges/400/400',
            price: '$4.99',
            slug: '/products/fresh-oranges',
          },
          {
            name: 'Ripe Bananas',
            image: 'https://picsum.photos/seed/bananas/400/400',
            price: '$2.99',
            slug: '/products/ripe-bananas',
          },
        ],
      },
      {
        name: 'Exotic Fruits',
        slug: '/collections/exotic-fruits',
        products: [
          {
            name: 'Dragon Fruit',
            image: 'https://picsum.photos/seed/dragonfruit/400/400',
            price: '$8.99',
            slug: '/products/dragon-fruit',
          },
          {
            name: 'Mango',
            image: 'https://picsum.photos/seed/mango/400/400',
            price: '$3.99',
            slug: '/products/mango',
          },
          {
            name: 'Kiwi',
            image: 'https://picsum.photos/seed/kiwi/400/400',
            price: '$6.99',
            slug: '/products/kiwi',
          },
        ],
      },
      {
        name: 'Dried Fruits',
        slug: '/collections/dried-fruits',
        products: [
          {
            name: 'Almonds',
            image: 'https://picsum.photos/seed/almonds/400/400',
            price: '$12.99',
            slug: '/products/almonds',
          },
          {
            name: 'Cashews',
            image: 'https://picsum.photos/seed/cashews/400/400',
            price: '$14.99',
            slug: '/products/cashews',
          },
          {
            name: 'Raisins',
            image: 'https://picsum.photos/seed/raisins/400/400',
            price: '$7.99',
            slug: '/products/raisins',
          },
        ],
      },
      {
        name: 'Organic Juices',
        slug: '/collections/organic-juices',
        products: [
          {
            name: 'Apple Juice',
            image: 'https://picsum.photos/seed/applejuice/400/400',
            price: '$4.99',
            slug: '/products/apple-juice',
          },
          {
            name: 'Orange Juice',
            image: 'https://picsum.photos/seed/orangejuice/400/400',
            price: '$5.99',
            slug: '/products/orange-juice',
          },
          {
            name: 'Green Smoothie',
            image: 'https://picsum.photos/seed/smoothie/400/400',
            price: '$6.99',
            slug: '/products/green-smoothie',
          },
        ],
      },
    ],
  },
  {
    name: 'Electronics',
    slug: '/collections/electronics',
    subcategories: [
      {
        name: 'Laptops',
        slug: '/collections/laptops',
        products: [
          {
            name: 'Ultrabook Pro 14',
            image: 'https://picsum.photos/seed/laptop1/400/400',
            price: '$1,299.99',
            slug: '/products/ultrabook-pro-14',
          },
          {
            name: 'Gaming Laptop 16',
            image: 'https://picsum.photos/seed/laptop2/400/400',
            price: '$1,899.99',
            slug: '/products/gaming-laptop-16',
          },
          {
            name: 'Business Notebook',
            image: 'https://picsum.photos/seed/laptop3/400/400',
            price: '$999.99',
            slug: '/products/business-notebook',
          },
        ],
      },
      {
        name: 'Mobiles',
        slug: '/collections/mobiles',
        products: [
          {
            name: 'SmartPhone X',
            image: 'https://picsum.photos/seed/phone1/400/400',
            price: '$999.99',
            slug: '/products/smartphone-x',
          },
          {
            name: 'Phone Mini',
            image: 'https://picsum.photos/seed/phone2/400/400',
            price: '$699.99',
            slug: '/products/phone-mini',
          },
          {
            name: 'Pro Max Ultra',
            image: 'https://picsum.photos/seed/phone3/400/400',
            price: '$1,299.99',
            slug: '/products/pro-max-ultra',
          },
        ],
      },
      {
        name: 'Accessories',
        slug: '/collections/electronics-accessories',
        products: [
          {
            name: 'Wireless Earbuds',
            image: 'https://picsum.photos/seed/earbuds/400/400',
            price: '$149.99',
            slug: '/products/wireless-earbuds',
          },
          {
            name: 'USB-C Hub',
            image: 'https://picsum.photos/seed/usbhub/400/400',
            price: '$49.99',
            slug: '/products/usb-c-hub',
          },
          {
            name: 'Laptop Stand',
            image: 'https://picsum.photos/seed/stand/400/400',
            price: '$39.99',
            slug: '/products/laptop-stand',
          },
        ],
      },
      {
        name: 'Tablets',
        slug: '/collections/tablets',
        products: [
          {
            name: 'Tablet Pro 12.9',
            image: 'https://picsum.photos/seed/tablet1/400/400',
            price: '$799.99',
            slug: '/products/tablet-pro',
          },
          {
            name: 'Tab Lite 10',
            image: 'https://picsum.photos/seed/tablet2/400/400',
            price: '$349.99',
            slug: '/products/tab-lite',
          },
          {
            name: 'E-Reader',
            image: 'https://picsum.photos/seed/ereader/400/400',
            price: '$129.99',
            slug: '/products/e-reader',
          },
        ],
      },
      {
        name: 'Gaming',
        slug: '/collections/gaming',
        products: [
          {
            name: 'Console Pro',
            image: 'https://picsum.photos/seed/console/400/400',
            price: '$499.99',
            slug: '/products/console-pro',
          },
          {
            name: 'Gaming Mouse',
            image: 'https://picsum.photos/seed/gmouse/400/400',
            price: '$79.99',
            slug: '/products/gaming-mouse',
          },
          {
            name: 'Mechanical Keyboard',
            image: 'https://picsum.photos/seed/keyboard/400/400',
            price: '$129.99',
            slug: '/products/mechanical-keyboard',
          },
        ],
      },
    ],
  },
  {
    name: 'Sports & Fitness',
    slug: '/collections/sports-fitness',
    subcategories: [
      {
        name: 'Gym Equipment',
        slug: '/collections/gym-equipment',
        products: [
          {
            name: 'Adjustable Dumbbells',
            image: 'https://picsum.photos/seed/dumbbells/400/400',
            price: '$199.99',
            slug: '/products/adjustable-dumbbells',
          },
          {
            name: 'Yoga Mat Premium',
            image: 'https://picsum.photos/seed/ymat/400/400',
            price: '$39.99',
            slug: '/products/yoga-mat-premium',
          },
          {
            name: 'Resistance Bands Set',
            image: 'https://picsum.photos/seed/bands/400/400',
            price: '$24.99',
            slug: '/products/resistance-bands',
          },
        ],
      },
      {
        name: 'Activewear',
        slug: '/collections/activewear',
        products: [
          {
            name: 'Performance T-Shirt',
            image: 'https://picsum.photos/seed/performshirt/400/400',
            price: '$34.99',
            slug: '/products/performance-tshirt',
          },
          {
            name: 'Training Shorts',
            image: 'https://picsum.photos/seed/trainshorts/400/400',
            price: '$29.99',
            slug: '/products/training-shorts',
          },
          {
            name: 'Running Shoes Pro',
            image: 'https://picsum.photos/seed/runningshoes/400/400',
            price: '$129.99',
            slug: '/products/running-shoes-pro',
          },
        ],
      },
      {
        name: 'Outdoor Gear',
        slug: '/collections/outdoor-gear',
        products: [
          {
            name: 'Camping Tent 4P',
            image: 'https://picsum.photos/seed/tent/400/400',
            price: '$249.99',
            slug: '/products/camping-tent',
          },
          {
            name: 'Insulated Water Bottle',
            image: 'https://picsum.photos/seed/bottle/400/400',
            price: '$34.99',
            slug: '/products/insulated-bottle',
          },
          {
            name: 'Hiking Backpack',
            image: 'https://picsum.photos/seed/hikingpack/400/400',
            price: '$89.99',
            slug: '/products/hiking-backpack',
          },
        ],
      },
      {
        name: 'Yoga & Pilates',
        slug: '/collections/yoga-pilates',
        products: [
          {
            name: 'Yoga Block Set',
            image: 'https://picsum.photos/seed/yogablocks/400/400',
            price: '$19.99',
            slug: '/products/yoga-blocks',
          },
          {
            name: 'Pilates Ring',
            image: 'https://picsum.photos/seed/pilatesring/400/400',
            price: '$14.99',
            slug: '/products/pilates-ring',
          },
          {
            name: 'Foam Roller',
            image: 'https://picsum.photos/seed/foamroller/400/400',
            price: '$29.99',
            slug: '/products/foam-roller',
          },
        ],
      },
    ],
  },
  {
    name: 'Beauty',
    slug: '/collections/beauty',
    subcategories: [
      {
        name: 'Skincare',
        slug: '/collections/skincare',
        products: [
          {
            name: 'Vitamin C Serum',
            image: 'https://picsum.photos/seed/vcserum/400/400',
            price: '$34.99',
            slug: '/products/vitamin-c-serum',
          },
          {
            name: 'Moisturizer Cream',
            image: 'https://picsum.photos/seed/moisturizer/400/400',
            price: '$28.99',
            slug: '/products/moisturizer-cream',
          },
          {
            name: 'Face Sunscreen SPF50',
            image: 'https://picsum.photos/seed/sunscreen/400/400',
            price: '$22.99',
            slug: '/products/face-sunscreen',
          },
        ],
      },
      {
        name: 'Makeup',
        slug: '/collections/makeup',
        products: [
          {
            name: 'Foundation Liquid',
            image: 'https://picsum.photos/seed/foundation/400/400',
            price: '$39.99',
            slug: '/products/foundation-liquid',
          },
          {
            name: 'Eyeshadow Palette',
            image: 'https://picsum.photos/seed/eyeshadow/400/400',
            price: '$49.99',
            slug: '/products/eyeshadow-palette',
          },
          {
            name: 'Matte Lipstick',
            image: 'https://picsum.photos/seed/lipstick/400/400',
            price: '$19.99',
            slug: '/products/matte-lipstick',
          },
        ],
      },
      {
        name: 'Haircare',
        slug: '/collections/haircare',
        products: [
          {
            name: 'Argan Oil Hair Mask',
            image: 'https://picsum.photos/seed/hairmask/400/400',
            price: '$24.99',
            slug: '/products/argan-oil-mask',
          },
          {
            name: 'Volumizing Shampoo',
            image: 'https://picsum.photos/seed/shampoo/400/400',
            price: '$16.99',
            slug: '/products/volumizing-shampoo',
          },
          {
            name: 'Hair Dryer Pro',
            image: 'https://picsum.photos/seed/hairdryer/400/400',
            price: '$89.99',
            slug: '/products/hair-dryer-pro',
          },
        ],
      },
      {
        name: 'Fragrance',
        slug: '/collections/fragrance',
        products: [
          {
            name: 'Eau de Parfum 50ml',
            image: 'https://picsum.photos/seed/perfume/400/400',
            price: '$79.99',
            slug: '/products/eau-de-parfum',
          },
          {
            name: 'Body Spray Fresh',
            image: 'https://picsum.photos/seed/bodyspray/400/400',
            price: '$14.99',
            slug: '/products/body-spray',
          },
          {
            name: 'Scented Candle Set',
            image: 'https://picsum.photos/seed/candle/400/400',
            price: '$34.99',
            slug: '/products/scented-candle-set',
          },
        ],
      },
    ],
  },
  {
    name: 'Jewelry',
    slug: '/collections/jewelry',
    subcategories: [
      {
        name: 'Rings',
        slug: '/collections/rings',
        products: [
          {
            name: 'Silver Solitaire Ring',
            image: 'https://picsum.photos/seed/silvering/400/400',
            price: '$89.99',
            slug: '/products/silver-solitaire-ring',
          },
          {
            name: 'Gold Band Ring',
            image: 'https://picsum.photos/seed/goldring/400/400',
            price: '$149.99',
            slug: '/products/gold-band-ring',
          },
          {
            name: 'Stackable Gem Ring',
            image: 'https://picsum.photos/seed/gemring/400/400',
            price: '$59.99',
            slug: '/products/stackable-gem-ring',
          },
        ],
      },
      {
        name: 'Necklaces',
        slug: '/collections/necklaces',
        products: [
          {
            name: 'Pearl Pendant Necklace',
            image: 'https://picsum.photos/seed/pearlnecklace/400/400',
            price: '$129.99',
            slug: '/products/pearl-pendant',
          },
          {
            name: 'Gold Chain 18K',
            image: 'https://picsum.photos/seed/goldchain/400/400',
            price: '$199.99',
            slug: '/products/gold-chain-18k',
          },
          {
            name: 'Layered Necklace Set',
            image: 'https://picsum.photos/seed/layernecklace/400/400',
            price: '$79.99',
            slug: '/products/layered-necklace-set',
          },
        ],
      },
      {
        name: 'Bracelets',
        slug: '/collections/bracelets',
        products: [
          {
            name: 'Tennis Bracelet',
            image: 'https://picsum.photos/seed/tennisbrac/400/400',
            price: '$249.99',
            slug: '/products/tennis-bracelet',
          },
          {
            name: 'Leather Wrap Bracelet',
            image: 'https://picsum.photos/seed/leatherbrac/400/400',
            price: '$44.99',
            slug: '/products/leather-wrap-bracelet',
          },
          {
            name: 'Charm Bracelet',
            image: 'https://picsum.photos/seed/charmbrac/400/400',
            price: '$34.99',
            slug: '/products/charm-bracelet',
          },
        ],
      },
      {
        name: 'Watches',
        slug: '/collections/watches',
        products: [
          {
            name: 'Classic Analog Watch',
            image: 'https://picsum.photos/seed/analogwatch/400/400',
            price: '$199.99',
            slug: '/products/classic-analog-watch',
          },
          {
            name: 'Smart Watch Series',
            image: 'https://picsum.photos/seed/smartwatch/400/400',
            price: '$349.99',
            slug: '/products/smart-watch-series',
          },
          {
            name: 'Minimalist Leather Watch',
            image: 'https://picsum.photos/seed/leatherwatch/400/400',
            price: '$129.99',
            slug: '/products/minimalist-leather-watch',
          },
        ],
      },
    ],
  },
  {
    name: 'Seasonal',
    slug: '/collections/seasonal',
    subcategories: [
      {
        name: 'Summer',
        slug: '/collections/summer',
        products: [
          {
            name: 'Beach Towel XL',
            image: 'https://picsum.photos/seed/beachtowel/400/400',
            price: '$29.99',
            slug: '/products/beach-towel-xl',
          },
          {
            name: 'Polarized Sunglasses',
            image: 'https://picsum.photos/seed/polarshades/400/400',
            price: '$49.99',
            slug: '/products/polarized-sunglasses',
          },
          {
            name: 'Portable Fan',
            image: 'https://picsum.photos/seed/portfan/400/400',
            price: '$19.99',
            slug: '/products/portable-fan',
          },
        ],
      },
      {
        name: 'Winter',
        slug: '/collections/winter',
        products: [
          {
            name: 'Wool Winter Coat',
            image: 'https://picsum.photos/seed/wintercoat/400/400',
            price: '$189.99',
            slug: '/products/wool-winter-coat',
          },
          {
            name: 'Heated Hand Warmers',
            image: 'https://picsum.photos/seed/handwarmers/400/400',
            price: '$24.99',
            slug: '/products/heated-hand-warmers',
          },
          {
            name: 'Cashmere Scarf',
            image: 'https://picsum.photos/seed/cashmerescarf/400/400',
            price: '$59.99',
            slug: '/products/cashmere-scarf',
          },
        ],
      },
      {
        name: 'Holiday',
        slug: '/collections/holiday',
        products: [
          {
            name: 'LED String Lights',
            image: 'https://picsum.photos/seed/stringlights/400/400',
            price: '$34.99',
            slug: '/products/led-string-lights',
          },
          {
            name: 'Gift Box Set',
            image: 'https://picsum.photos/seed/giftbox/400/400',
            price: '$49.99',
            slug: '/products/gift-box-set',
          },
          {
            name: 'Decor Wreath',
            image: 'https://picsum.photos/seed/wreath/400/400',
            price: '$39.99',
            slug: '/products/decor-wreath',
          },
        ],
      },
      {
        name: 'Clearance',
        slug: '/collections/clearance',
        products: [
          {
            name: 'Last Season Jacket',
            image: 'https://picsum.photos/seed/lastseason/400/400',
            price: '$69.99',
            slug: '/products/last-season-jacket',
          },
          {
            name: 'Discontinued Sneakers',
            image: 'https://picsum.photos/seed/discsneakers/400/400',
            price: '$49.99',
            slug: '/products/discontinued-sneakers',
          },
          {
            name: 'Bundle Deal Pack',
            image: 'https://picsum.photos/seed/bundlepack/400/400',
            price: '$29.99',
            slug: '/products/bundle-deal-pack',
          },
        ],
      },
    ],
  },
  {
    name: 'Office',
    slug: '/collections/office',
    subcategories: [
      {
        name: 'Stationery',
        slug: '/collections/stationery',
        products: [
          {
            name: 'Premium Notebook A5',
            image: 'https://picsum.photos/seed/notebook/400/400',
            price: '$19.99',
            slug: '/products/premium-notebook',
          },
          {
            name: 'Gel Pen Set 12pk',
            image: 'https://picsum.photos/seed/gelpen/400/400',
            price: '$14.99',
            slug: '/products/gel-pen-set',
          },
          {
            name: 'Weekly Planner',
            image: 'https://picsum.photos/seed/planner/400/400',
            price: '$24.99',
            slug: '/products/weekly-planner',
          },
        ],
      },
      {
        name: 'Furniture',
        slug: '/collections/office-furniture',
        products: [
          {
            name: 'Ergonomic Office Chair',
            image: 'https://picsum.photos/seed/officechair/400/400',
            price: '$399.99',
            slug: '/products/ergonomic-office-chair',
          },
          {
            name: 'Standing Desk',
            image: 'https://picsum.photos/seed/standingdesk/400/400',
            price: '$549.99',
            slug: '/products/standing-desk',
          },
          {
            name: 'Monitor Stand Riser',
            image: 'https://picsum.photos/seed/monitorstand/400/400',
            price: '$49.99',
            slug: '/products/monitor-stand-riser',
          },
        ],
      },
      {
        name: 'Tech',
        slug: '/collections/office-tech',
        products: [
          {
            name: 'Wireless Mouse',
            image: 'https://picsum.photos/seed/wirelessmouse/400/400',
            price: '$39.99',
            slug: '/products/wireless-mouse',
          },
          {
            name: 'Webcam HD 1080p',
            image: 'https://picsum.photos/seed/webcam/400/400',
            price: '$69.99',
            slug: '/products/webcam-hd',
          },
          {
            name: 'USB-C Docking Station',
            image: 'https://picsum.photos/seed/dockstation/400/400',
            price: '$129.99',
            slug: '/products/usbc-docking-station',
          },
        ],
      },
      {
        name: 'Supplies',
        slug: '/collections/office-supplies',
        products: [
          {
            name: 'Paper Shredder',
            image: 'https://picsum.photos/seed/shredder/400/400',
            price: '$59.99',
            slug: '/products/paper-shredder',
          },
          {
            name: 'Desk Organizer Tray',
            image: 'https://picsum.photos/seed/desktray/400/400',
            price: '$24.99',
            slug: '/products/desk-organizer-tray',
          },
          {
            name: 'Whiteboard Magnetic',
            image: 'https://picsum.photos/seed/whiteboard/400/400',
            price: '$44.99',
            slug: '/products/magnetic-whiteboard',
          },
        ],
      },
    ],
  },
  {
    name: 'Pet Supplies',
    slug: '/collections/pet-supplies',
    subcategories: [
      {
        name: 'Dogs',
        slug: '/collections/dogs',
        products: [
          {
            name: 'Orthopedic Dog Bed',
            image: 'https://picsum.photos/seed/dogbed/400/400',
            price: '$89.99',
            slug: '/products/orthopedic-dog-bed',
          },
          {
            name: 'Leather Leash & Collar',
            image: 'https://picsum.photos/seed/dogleash/400/400',
            price: '$34.99',
            slug: '/products/leather-leash-collar',
          },
          {
            name: 'Interactive Treat Ball',
            image: 'https://picsum.photos/seed/treatball/400/400',
            price: '$14.99',
            slug: '/products/interactive-treat-ball',
          },
        ],
      },
      {
        name: 'Cats',
        slug: '/collections/cats',
        products: [
          {
            name: 'Cat Tree Tower',
            image: 'https://picsum.photos/seed/cattree/400/400',
            price: '$129.99',
            slug: '/products/cat-tree-tower',
          },
          {
            name: 'Self-Cleaning Litter Box',
            image: 'https://picsum.photos/seed/litterbox/400/400',
            price: '$199.99',
            slug: '/products/self-cleaning-litter',
          },
          {
            name: 'Laser Pointer Toy',
            image: 'https://picsum.photos/seed/lasertoy/400/400',
            price: '$9.99',
            slug: '/products/laser-pointer-toy',
          },
        ],
      },
      {
        name: 'Food',
        slug: '/collections/pet-food',
        products: [
          {
            name: 'Premium Dry Dog Food',
            image: 'https://picsum.photos/seed/dogfood/400/400',
            price: '$54.99',
            slug: '/products/premium-dry-dog-food',
          },
          {
            name: 'Wet Cat Food Variety',
            image: 'https://picsum.photos/seed/catfood/400/400',
            price: '$28.99',
            slug: '/products/wet-cat-food-variety',
          },
          {
            name: 'Freeze-Dried Treats',
            image: 'https://picsum.photos/seed/pettreats/400/400',
            price: '$16.99',
            slug: '/products/freeze-dried-treats',
          },
        ],
      },
      {
        name: 'Accessories',
        slug: '/collections/pet-accessories',
        products: [
          {
            name: 'Pet Carrier Backpack',
            image: 'https://picsum.photos/seed/petcarrier/400/400',
            price: '$64.99',
            slug: '/products/pet-carrier-backpack',
          },
          {
            name: 'GPS Tracker Collar',
            image: 'https://picsum.photos/seed/gpscollar/400/400',
            price: '$79.99',
            slug: '/products/gps-tracker-collar',
          },
          {
            name: 'Pet Grooming Kit',
            image: 'https://picsum.photos/seed/groomkit/400/400',
            price: '$39.99',
            slug: '/products/pet-grooming-kit',
          },
        ],
      },
    ],
  },
])
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mega-fade-enter-active,
.mega-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.mega-fade-enter-from,
.mega-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: opacity 0.2s ease;
}
.sidebar-enter-active .fixed.inset-y-0,
.sidebar-leave-active .fixed.inset-y-0 {
  transition: transform 0.25s ease;
}
.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
}
.sidebar-enter-from .fixed.inset-y-0 {
  transform: translateX(-100%);
}
.sidebar-leave-to .fixed.inset-y-0 {
  transform: translateX(-100%);
}
</style>
