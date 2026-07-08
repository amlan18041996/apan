<template>
  <div>
    <Carousel
      :items="heroSlides"
      :autoplay="6000"
      :loop="true"
      :show-dots="true"
      :show-arrows="true"
      :gap="0"
      :pause-on-hover="true"
    >
      <template #slide="{ item }">
        <section class="relative flex min-h-[70vh] items-center overflow-hidden bg-gray-900">
          <img
            :src="item.image"
            :alt="item.alt"
            class="absolute inset-0 h-full w-full object-cover"
            :class="item.imagePriority ? '' : 'loading-lazy'"
            :loading="item.imagePriority ? 'eager' : 'lazy'"
          />
          <div
            class="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent"
          />
          <div class="container-page relative z-10">
            <h2
              class="max-w-2xl text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
            >
              {{ item.heading }}
            </h2>
            <p class="mt-4 max-w-xl text-lg text-gray-300 md:text-xl">{{ item.subtext }}</p>
            <NuxtLink :to="item.ctaTo" class="btn-primary mt-8 inline-flex items-center gap-2">
              {{ item.ctaText }}
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </NuxtLink>
          </div>
        </section>
      </template>
    </Carousel>

    <section class="container-page py-16 md:py-24">
      <div class="mb-10 text-center">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Featured Products</h2>
        <p class="mt-2 text-gray-600">Handpicked favourites just for you.</p>
      </div>

      <div v-if="productsLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="n in 8" :key="n" class="card animate-pulse p-4">
          <div class="mb-4 aspect-square rounded-lg bg-gray-200" />
          <div class="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div class="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
      <div v-else-if="productsError" class="rounded-lg bg-red-50 p-6 text-center">
        <p class="text-red-600">Unable to load products. Please try again later.</p>
      </div>
      <div v-else-if="products.length === 0" />
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </section>

    <section v-if="collections.length > 0" class="bg-gray-50 py-16 md:py-24">
      <div class="container-page">
        <div class="mb-10 text-center">
          <h2 class="text-3xl font-bold tracking-tight text-gray-900">Shop by Collection</h2>
          <p class="mt-2 text-gray-600">Explore our curated categories.</p>
        </div>
        <div v-if="collectionsLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="n in 3" :key="n" class="card animate-pulse overflow-hidden">
            <div class="aspect-[4/3] bg-gray-200" />
            <div class="p-4">
              <div class="mb-2 h-5 w-2/3 rounded bg-gray-200" />
              <div class="h-4 w-1/3 rounded bg-gray-200" />
            </div>
          </div>
        </div>
        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="collection in collections"
            :key="collection.id"
            :to="`/collections/${collection.handle}`"
            class="card group overflow-hidden transition-shadow hover:shadow-soft-lg"
          >
            <div class="aspect-[4/3] overflow-hidden bg-gray-100">
              <img
                v-if="collection.image"
                :src="collection.image.url"
                :alt="collection.image.altText ?? collection.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div v-else class="flex h-full items-center justify-center text-gray-400">
                <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div class="p-4">
              <h3
                class="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors"
              >
                {{ collection.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ collection.productsCount.count }} products
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="border-b border-gray-200 bg-white py-12">
      <div class="container-page">
        <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          <div v-for="badge in trustBadges" :key="badge.label" class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="badge.icon"
                />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">{{ badge.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="container-page py-16 md:py-24">
      <div class="mx-auto max-w-xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Stay in the Loop</h2>
        <p class="mt-2 text-gray-600">
          Be the first to know about new arrivals, exclusive offers, and behind-the-scenes stories.
        </p>
        <form
          v-if="!newsletterSubmitted"
          class="mt-8 flex flex-col gap-3 sm:flex-row"
          @submit.prevent="handleNewsletter"
        >
          <div class="relative flex-1">
            <input
              v-model="newsletterEmail"
              type="email"
              placeholder="Enter your email"
              class="input-field"
              :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500': newsletterError }"
              @input="newsletterError = ''"
            />
            <p v-if="newsletterError" class="mt-1 text-left text-sm text-red-600">
              {{ newsletterError }}
            </p>
          </div>
          <button type="submit" class="btn-primary shrink-0" :disabled="newsletterSubmitting">
            <svg
              v-if="newsletterSubmitting"
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
            {{ newsletterSubmitting ? 'Subscribing...' : 'Subscribe' }}
          </button>
        </form>
        <div v-else class="mt-8 rounded-lg bg-green-50 p-6">
          <p class="text-green-800 font-medium">Thank you for subscribing!</p>
          <p class="mt-1 text-sm text-green-600">We'll send you the latest updates and offers.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'APAN Store — Sustainable & Ethically Made Products',
  description:
    'Discover curated products that blend great design with ethical production. Free shipping, sustainable materials, and a commitment to quality. Shop APAN today.',
  ogTitle: 'APAN Store — Sustainable & Ethically Made Products',
  ogDescription:
    'Discover curated products that blend great design with ethical production. Free shipping, sustainable materials, and a commitment to quality. Shop APAN today.',
  ogImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
})

interface HeroSlide {
  image: string
  alt: string
  heading: string
  subtext: string
  ctaText: string
  ctaTo: string
  imagePriority: boolean
}

interface TrustBadge {
  icon: string
  label: string
}

const heroSlides: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    alt: 'New collection showcase with modern products',
    heading: 'New Collection',
    subtext: 'Explore our latest arrivals — fresh designs crafted with care and intention.',
    ctaText: 'Shop Now',
    ctaTo: '/products',
    imagePriority: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1920&q=80',
    alt: 'Sustainable and eco-friendly product range',
    heading: 'Sustainable Style',
    subtext: 'Every purchase supports ethical production and eco-friendly materials.',
    ctaText: 'Learn More',
    ctaTo: '/products',
    imagePriority: false,
  },
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80',
    alt: 'Free shipping promotion banner',
    heading: 'Free Shipping',
    subtext: 'Enjoy free standard shipping on all orders over $50. Fast and reliable delivery.',
    ctaText: 'Start Shopping',
    ctaTo: '/products',
    imagePriority: false,
  },
]

const trustBadges: TrustBadge[] = [
  {
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    label: 'Free Shipping',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    label: 'Secure Checkout',
  },
  {
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    label: 'Easy Returns',
  },
  {
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    label: 'Ethical Products',
  },
]

const { getProducts, getCollections } = useShopify()

const {
  data: products,
  error: productsError,
  status: productsStatus,
} = useAsyncData('home-featured', () => getProducts(8), {
  transform: (result) => result.products,
  default: () => [],
})

const productsLoading = computed(() => productsStatus.value === 'pending')

const { data: collections, status: collectionsStatus } = useAsyncData(
  'home-collections',
  () => getCollections(6),
  {
    transform: (result) => result.collections,
    default: () => [],
  },
)

const collectionsLoading = computed(() => collectionsStatus.value === 'pending')

const newsletterEmail = ref('')
const newsletterError = ref('')
const newsletterSubmitting = ref(false)
const newsletterSubmitted = ref(false)

function handleNewsletter() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!newsletterEmail.value.trim()) {
    newsletterError.value = 'Please enter your email address.'
    return
  }
  if (!emailPattern.test(newsletterEmail.value.trim())) {
    newsletterError.value = 'Please enter a valid email address.'
    return
  }

  newsletterError.value = ''
  newsletterSubmitting.value = true

  setTimeout(() => {
    newsletterSubmitting.value = false
    newsletterSubmitted.value = true
  }, 1000)
}
</script>
