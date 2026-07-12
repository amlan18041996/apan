<script setup lang="ts">
import type { ShippingMethod, Address } from '~/types/checkout'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Checkout — APAN Store',
  description: 'Complete your purchase at APAN Store.',
  robots: 'noindex',
})

const router = useRouter()
const { state, getStepStatus, goToStep, next, prev, submitOrder, clearError } = useCheckout()
const cart = useCartStore()

const stepError = ref<string | null>(null)

const stepStatuses = computed(() =>
  useCheckout().steps.map((step) => ({
    ...step,
    status: getStepStatus(step.key),
  })),
)

const subtotal = computed(() => cart.subtotal)

const shippingCost = computed(() => state.value.selectedShippingMethod?.price ?? 0)

const taxAmount = computed(() => subtotal.value * 0.08)

const discountAmount = computed(() => cart.discount || 0)

const orderTotal = computed(() => {
  const sub = subtotal.value
  const shipping = shippingCost.value
  const tax = taxAmount.value
  const discount = discountAmount.value
  return {
    subtotal: sub.toFixed(2),
    shipping: shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`,
    shippingValue: shipping,
    tax: `$${tax.toFixed(2)}`,
    discount: cart.couponCode ? `-$${discount.toFixed(2)}` : null,
    total: (sub + shipping + tax - discount).toFixed(2),
  }
})

function handleStepClick(stepKey: string) {
  goToStep(stepKey as 'information' | 'shipping-address' | 'shipping-method' | 'payment' | 'review')
}

function handleInformationSubmit() {
  next()
}

function handleShippingAddressSubmit(_address: Address) {
  next()
}

function handleShippingMethodSubmit(_method: ShippingMethod) {
  next()
}

function handlePaymentSubmit() {
  next()
}

async function handleReviewSubmit() {
  try {
    const lineItems = cart.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      title: item.title,
    }))

    const confirmation = await submitOrder(lineItems, cart)
    await router.push(`/order/confirmation/${confirmation.orderNumber}`)
  } catch {
    stepError.value = state.value.error || 'Failed to place order. Please try again.'
  }
}

function handleBack() {
  stepError.value = null
  clearError()
  prev()
}

onMounted(() => {
  if (cart.isEmpty) {
    router.push('/cart')
  }
})

watch(
  () => state.value.error,
  (newError) => {
    if (newError) stepError.value = newError
  },
)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8">
        <NuxtLink to="/" class="text-sm font-medium text-primary-600 hover:text-primary-700">
          APAN Store
        </NuxtLink>
        <h1 class="mt-2 text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      <CheckoutStepper :steps="stepStatuses" @step-click="handleStepClick" />

      <div
        v-if="stepError"
        class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
        role="alert"
      >
        <div class="flex items-start gap-3">
          <svg
            class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <div class="flex-1">
            <p class="text-sm text-red-700">{{ stepError }}</p>
            <button
              type="button"
              class="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              @click="stepError = null"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8 grid gap-8 lg:grid-cols-5">
        <div class="lg:col-span-3">
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <InformationStep
              v-if="state.step === 'information'"
              :subtotal="subtotal"
              @submit="handleInformationSubmit"
              @back="handleBack"
            />

            <ShippingAddressForm
              v-else-if="state.step === 'shipping-address'"
              :subtotal="subtotal"
              @submit="handleShippingAddressSubmit"
              @back="handleBack"
            />

            <ShippingMethodStep
              v-else-if="state.step === 'shipping-method'"
              :subtotal="subtotal"
              @submit="handleShippingMethodSubmit"
              @back="handleBack"
            />

            <PaymentStep
              v-else-if="state.step === 'payment'"
              :subtotal="subtotal"
              @submit="handlePaymentSubmit"
              @back="handleBack"
            />

            <OrderReviewStep
              v-else-if="state.step === 'review'"
              :subtotal="subtotal"
              @submit="handleReviewSubmit"
              @back="handleBack"
            />
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-900">Order Summary</h2>

            <div v-if="cart.isEmpty" class="mt-4 text-center">
              <p class="text-sm text-gray-500">Your cart is empty.</p>
              <NuxtLink
                to="/products"
                class="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Continue Shopping
              </NuxtLink>
            </div>

            <div v-else class="mt-4">
              <div class="max-h-64 space-y-3 overflow-y-auto">
                <div v-for="item in cart.items" :key="item.id" class="flex items-center gap-3">
                  <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.title"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div v-else class="flex h-full items-center justify-center text-gray-400">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-gray-900">{{ item.title }}</p>
                    <p class="text-xs text-gray-500">Qty: {{ item.quantity }}</p>
                  </div>
                  <span class="shrink-0 text-sm font-medium text-gray-900">
                    ${{ (item.price * item.quantity).toFixed(2) }}
                  </span>
                </div>
              </div>

              <div class="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-medium text-gray-900">${{ orderTotal.subtotal }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Shipping</span>
                  <span
                    class="font-medium"
                    :class="shippingCost === 0 ? 'text-green-600' : 'text-gray-900'"
                  >
                    {{ orderTotal.shipping }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Estimated Tax</span>
                  <span class="font-medium text-gray-900">{{ orderTotal.tax }}</span>
                </div>
                <div v-if="orderTotal.discount" class="flex justify-between text-sm">
                  <span class="text-gray-600">Discount</span>
                  <span class="font-medium text-green-600">{{ orderTotal.discount }}</span>
                </div>
                <div class="border-t border-gray-200 pt-2">
                  <div class="flex justify-between">
                    <span class="text-sm font-semibold text-gray-900">Total</span>
                    <span class="text-base font-bold text-gray-900">${{ orderTotal.total }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 border-t border-gray-100 pt-4">
              <h3 class="text-sm font-medium text-gray-900">Have a coupon?</h3>
              <div class="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="button"
                  class="shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Apply
                </button>
              </div>
            </div>

            <div class="mt-6 space-y-2 text-xs text-gray-500">
              <div class="flex items-center gap-2">
                <svg
                  class="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span>Secure checkout powered by Stripe</span>
              </div>
              <div class="flex items-center gap-2">
                <svg
                  class="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
                <span>256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
