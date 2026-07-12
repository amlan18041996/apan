<script setup lang="ts">
import type { OrderResponse } from '~/types/checkout'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const orderNumber = computed(() => route.params.orderNumber as string)

const { state: checkoutState } = useCheckout()

const order = ref<OrderResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const accountDismissed = ref(false)

const isGuestOrder = computed(() => !checkoutState.value.email)

const shippingMethod = computed(() => checkoutState.value.selectedShippingMethod)

const paymentSummary = computed(() => checkoutState.value.paymentMethodSummary)

const orderDate = computed(() => {
  if (!order.value?.createdAt) return null
  return new Date(order.value.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
})

const subtotal = computed(() => {
  if (!order.value?.lineItems) return 0
  return order.value.lineItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  )
})

const taxAmount = computed(() => {
  if (!order.value?.totalTax) return 0
  return parseFloat(order.value.totalTax)
})

const shippingAmount = computed(() => {
  if (!order.value?.totalShipping) return 0
  return parseFloat(order.value.totalShipping)
})

const totalAmount = computed(() => {
  if (!order.value?.totalPrice) return 0
  return parseFloat(order.value.totalPrice)
})

function formatAddress(
  addr: {
    firstName: string
    lastName: string
    address1: string
    address2?: string | null
    city: string
    province: string
    zip: string
    country: string
    phone?: string | null
  } | null,
) {
  if (!addr) return []
  const lines = [
    `${addr.firstName} ${addr.lastName}`,
    addr.address1,
    addr.address2,
    `${addr.city}, ${addr.province} ${addr.zip}`,
    addr.country,
  ].filter(Boolean)
  if (addr.phone) lines.push(addr.phone)
  return lines
}

function formatPrice(amount: number): string {
  return amount.toFixed(2)
}

function dismissAccount() {
  accountDismissed.value = true
}

async function fetchOrder() {
  loading.value = true
  error.value = null

  try {
    const data = await $fetch<{ order: OrderResponse }>(`/api/orders/${orderNumber.value}`)
    order.value = data.order
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Order not found'
    error.value = msg
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrder()
})

useSeoMeta({
  title: () =>
    order.value
      ? `Order #${order.value.orderNumber} Confirmed — APAN Store`
      : 'Order Confirmation — APAN Store',
  description: () =>
    order.value
      ? `Your order #${order.value.orderNumber} has been placed successfully. Thank you for shopping with APAN Store.`
      : 'Order confirmation page.',
  robots: 'noindex',
})
</script>

<template>
  <div class="container-page py-8">
    <div v-if="loading" class="mx-auto max-w-2xl space-y-6">
      <div class="animate-pulse space-y-4">
        <div class="mx-auto h-20 w-20 rounded-full bg-gray-200" />
        <div class="mx-auto h-6 w-64 rounded bg-gray-200" />
        <div class="mx-auto h-4 w-48 rounded bg-gray-200" />
      </div>
      <div class="space-y-3">
        <div class="h-4 w-full rounded bg-gray-200" />
        <div class="h-4 w-3/4 rounded bg-gray-200" />
        <div class="h-4 w-1/2 rounded bg-gray-200" />
      </div>
    </div>

    <div v-else-if="error || !order" class="mx-auto max-w-2xl text-center">
      <svg
        class="mx-auto h-24 w-24 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h1 class="mt-4 text-2xl font-bold text-gray-900">Order not found</h1>
      <p class="mt-2 text-gray-600">
        We couldn't find an order with that number. Please check your confirmation email or contact
        support.
      </p>
      <NuxtLink
        to="/"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        Return to Home
      </NuxtLink>
    </div>

    <div v-else class="mx-auto max-w-2xl space-y-8">
      <div class="text-center">
        <div class="success-icon mx-auto">
          <svg
            class="h-20 w-20 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 class="mt-4 text-2xl font-bold text-gray-900">Thank you for your order!</h1>
        <p class="mt-2 text-gray-600">
          Your order
          <NuxtLink
            :to="`/orders/${order.orderNumber}`"
            class="font-semibold text-primary-600 hover:text-primary-700"
          >
            #{{ order.orderNumber }}
          </NuxtLink>
          has been placed successfully.
        </p>
        <p v-if="orderDate" class="mt-1 text-sm text-gray-500">{{ orderDate }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <p class="text-sm text-gray-600">
          We sent a confirmation email to
          <span class="font-medium text-gray-900">{{ order.email }}</span
          >. Please check your inbox.
        </p>
        <p class="mt-1 text-xs text-gray-500">
          Did not receive the email? Check your spam folder or
          <button type="button" class="text-primary-600 hover:text-primary-700">resend</button>.
        </p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-6">
        <h2 class="text-lg font-semibold text-gray-900">Order Summary</h2>
        <div class="mt-4 divide-y divide-gray-100">
          <div
            v-for="(item, idx) in order.lineItems"
            :key="idx"
            class="flex items-center gap-4 py-3"
          >
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-medium text-gray-900">{{ item.title }}</p>
              <p class="mt-0.5 text-xs text-gray-500">Qty: {{ item.quantity }}</p>
            </div>
            <span class="shrink-0 text-sm font-medium text-gray-900">
              ${{ formatPrice(parseFloat(item.price) * item.quantity) }}
            </span>
          </div>
        </div>

        <div class="mt-4 space-y-2 border-t border-gray-100 pt-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Subtotal</span>
            <span class="font-medium text-gray-900">${{ formatPrice(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Shipping</span>
            <span
              class="font-medium"
              :class="shippingAmount === 0 ? 'text-green-600' : 'text-gray-900'"
            >
              {{ shippingAmount === 0 ? 'Free' : `$${formatPrice(shippingAmount)}` }}
            </span>
          </div>
          <div v-if="taxAmount > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">Tax</span>
            <span class="font-medium text-gray-900">${{ formatPrice(taxAmount) }}</span>
          </div>
          <div class="border-t border-gray-200 pt-2">
            <div class="flex justify-between">
              <span class="text-sm font-semibold text-gray-900">Total</span>
              <span class="text-base font-bold text-gray-900">${{ formatPrice(totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        <div class="rounded-xl border border-gray-200 bg-white p-6">
          <h3 class="text-sm font-semibold text-gray-900">Shipping Address</h3>
          <div class="mt-3 space-y-0.5">
            <p
              v-for="(line, idx) in formatAddress(order.shippingAddress)"
              :key="idx"
              class="text-sm text-gray-700"
            >
              {{ line }}
            </p>
          </div>
        </div>

        <div class="space-y-6">
          <div v-if="shippingMethod" class="rounded-xl border border-gray-200 bg-white p-6">
            <h3 class="text-sm font-semibold text-gray-900">Shipping Method</h3>
            <div class="mt-3">
              <p class="text-sm font-medium text-gray-900">{{ shippingMethod.title }}</p>
              <p class="mt-1 text-xs text-gray-500">
                {{ shippingMethod.estimatedDays }} business days
              </p>
            </div>
          </div>

          <div
            v-if="order.estimatedDelivery"
            class="rounded-xl border border-primary-200 bg-primary-50 p-6"
          >
            <h3 class="text-sm font-semibold text-primary-900">Estimated Delivery</h3>
            <p class="mt-2 text-sm font-medium text-primary-800">
              {{ order.estimatedDelivery }}
            </p>
          </div>

          <div v-if="paymentSummary" class="rounded-xl border border-gray-200 bg-white p-6">
            <h3 class="text-sm font-semibold text-gray-900">Payment Method</h3>
            <div class="mt-3 flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
                <svg
                  class="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                  />
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ paymentSummary }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isGuestOrder && !accountDismissed"
        class="rounded-xl border border-primary-200 bg-primary-50 p-6"
      >
        <h3 class="text-lg font-semibold text-primary-900">Save your order history</h3>
        <p class="mt-2 text-sm text-primary-800">
          Create an account to track your orders, save your addresses, and enjoy a faster checkout
          next time.
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <NuxtLink
            :to="`/auth/register?email=${encodeURIComponent(order.email)}`"
            class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Create Account
          </NuxtLink>
          <button
            type="button"
            class="text-sm text-primary-600 hover:text-primary-700"
            @click="dismissAccount"
          >
            No thanks, I'll check out as a guest
          </button>
        </div>
      </div>

      <div
        class="flex flex-col items-center gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:justify-center sm:gap-6"
      >
        <NuxtLink
          to="/products"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Continue Shopping
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
        <NuxtLink
          :to="`/orders/${order.orderNumber}`"
          class="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View your order
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-icon {
  animation: success-draw 0.6s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .success-icon {
    animation: none;
  }
}

@keyframes success-draw {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
