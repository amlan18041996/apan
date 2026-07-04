<template>
  <div>
    <section class="bg-gray-50 py-12">
      <div class="container-page">
        <h1 class="text-3xl font-bold text-text">Collections</h1>
        <p class="mt-2 text-text-muted">Browse our curated collections.</p>
      </div>
    </section>

    <section class="container-page py-8">
      <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="card animate-pulse p-4">
          <div class="mb-4 aspect-[3/2] rounded-lg bg-gray-200" />
          <div class="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div class="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
      <div v-else-if="collections.length === 0" class="rounded-lg bg-gray-50 p-16 text-center">
        <p class="text-text-muted">No collections found.</p>
      </div>
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="collection in collections" :key="collection.id" :to="`/collections/${collection.handle}`" class="card group overflow-hidden transition-shadow hover:shadow-soft-lg">
          <div class="aspect-[3/2] overflow-hidden bg-gray-100">
            <img v-if="collection.image" :src="collection.image.url" :alt="collection.image.altText ?? collection.title" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div v-else class="flex h-full items-center justify-center text-text-muted">
              <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold text-text">{{ collection.title }}</h3>
            <p v-if="collection.description" class="mt-1 text-sm text-text-muted line-clamp-2">{{ collection.description }}</p>
            <p class="mt-2 text-xs text-text-muted">{{ collection.productsCount }} products</p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { getCollections } = useShopify()

const { data: collections, status } = useAsyncData('collections', () => getCollections(20), {
  transform: (result) => result.collections,
  default: () => []
})

const loading = computed(() => status.value === 'pending')
</script>