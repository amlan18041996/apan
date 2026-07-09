<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Order History</h2>

    <div v-if="loading" class="text-sm text-text-muted">Loading orders...</div>

    <div v-else-if="error" class="text-sm text-red-500">{{ error }}</div>

    <div v-else-if="orders.length === 0" class="text-sm text-text-muted">
      You haven't placed any orders yet.
    </div>

    <div v-else class="space-y-3">
      <div v-for="order in orders" :key="order.id" class="border border-border rounded-lg p-4">
        <div class="flex justify-between items-start mb-2">
          <div>
            <p class="font-medium text-sm">{{ order.name }}</p>
            <p class="text-xs text-text-muted">{{ formatDate(order.processedAt) }}</p>
          </div>
          <div class="text-right">
            <p class="font-medium text-sm">${{ order.totalPrice }}</p>
            <p class="text-xs" :class="statusClass(order.financialStatus)">
              {{ order.financialStatus }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs text-text-muted">
          <span>{{ order.itemCount }} item{{ order.itemCount !== 1 ? 's' : '' }}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{{ order.fulfillmentStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore()

interface Order {
  id: string
  name: string
  totalPrice: string
  processedAt: string
  fulfillmentStatus: string
  financialStatus: string
  itemCount: number
}

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const data = await $fetch<{ orders: Order[] }>('/api/me/orders', {
      headers: { authorization: `Bearer ${userStore.accessToken}` },
    })
    orders.value = data.orders
  } catch (err) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e.data?.statusMessage || e.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusClass(status: string) {
  if (status === 'PAID') return 'text-green-600'
  if (status === 'REFUNDED') return 'text-orange-500'
  if (status === 'PENDING') return 'text-yellow-600'
  return 'text-text-muted'
}
</script>
