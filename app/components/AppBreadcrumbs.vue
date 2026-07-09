<template>
  <nav v-if="breadcrumbItems.length" aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-1 text-sm">
      <li v-for="(item, i) in visibleItems" :key="i" class="flex items-center gap-1">
        <svg
          v-if="i > 0"
          class="h-4 w-4 shrink-0 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>

        <button
          v-if="item.isEllipsis"
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded text-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Show full breadcrumb"
          @click="expanded = true"
        >
          &hellip;
        </button>

        <NuxtLink
          v-else-if="item.to"
          :to="item.to"
          class="truncate text-gray-500 transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
        >
          {{ item.label }}
        </NuxtLink>

        <span
          v-else
          class="truncate font-semibold text-gray-900"
          :aria-current="i === breadcrumbItems.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
  isEllipsis?: boolean
}

interface Props {
  items?: BreadcrumbItem[]
  labelMap?: Record<string, string>
  resolveLabel?: (segment: string) => string | undefined
  maxCollapsed?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: undefined,
  labelMap: undefined,
  resolveLabel: undefined,
  maxCollapsed: 3,
})

const route = useRoute()
const config = useRuntimeConfig()

const expanded = ref(false)
const isMobile = ref(false)

function checkMobile() {
  if (import.meta.client) {
    isMobile.value = window.matchMedia('(max-width: 768px)').matches
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const defaultLabelMap: Record<string, string> = {
  products: 'Products',
  collections: 'Collections',
  cart: 'Cart',
  search: 'Search',
  about: 'About Us',
  contact: 'Contact',
  faq: 'FAQ',
  terms: 'Terms & Conditions',
  account: 'My Account',
  wishlist: 'Wishlist',
  orders: 'Orders',
  'order-tracking': 'Order Tracking',
  auth: 'Authentication',
  login: 'Login',
  register: 'Register',
  admin: 'Admin',
  categories: 'Categories',
  brands: 'Brands',
  sale: 'Sale',
  new: 'New Arrivals',
}

function humanize(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function resolveSegmentLabel(segment: string): string {
  const mergedMap = { ...defaultLabelMap, ...props.labelMap }
  if (mergedMap[segment]) return mergedMap[segment]
  if (props.resolveLabel) {
    const custom = props.resolveLabel(segment)
    if (custom) return custom
  }
  const paramMatch = Object.entries(route.params).find(([, value]) => {
    if (Array.isArray(value)) return value.includes(segment)
    return value === segment
  })
  if (paramMatch) {
    const key = paramMatch[0]
    if (props.resolveLabel) {
      const custom = props.resolveLabel(key)
      if (custom) return custom
    }
  }
  return humanize(segment)
}

const breadcrumbItems = computed((): BreadcrumbItem[] => {
  if (props.items) {
    if (props.items.length <= 1) return []
    return props.items
  }

  const path = route.path
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return []

  const result: BreadcrumbItem[] = [{ label: 'Home', to: '/' }]

  let currentPath = ''
  for (const segment of segments) {
    currentPath += '/' + segment
    const label = resolveSegmentLabel(segment)
    result.push({ label, to: currentPath })
  }

  const last = result[result.length - 1]
  last.to = undefined

  return result
})

const visibleItems = computed((): BreadcrumbItem[] => {
  if (!isMobile.value || expanded.value) return breadcrumbItems.value
  if (breadcrumbItems.value.length <= props.maxCollapsed) return breadcrumbItems.value

  const first = breadcrumbItems.value[0]
  const last = breadcrumbItems.value[breadcrumbItems.value.length - 1]

  return [first, { label: '...', isEllipsis: true }, last]
})

const breadcrumbJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbItems.value.map((item, i) => {
    const entry: Record<string, unknown> = {
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
    }
    if (item.to) {
      const baseUrl = config.public.appUrl || ''
      entry.item = `${baseUrl}${item.to}`
    }
    return entry
  }),
}))

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbJsonLd.value),
      key: 'breadcrumb-jsonld',
    },
  ],
})
</script>
