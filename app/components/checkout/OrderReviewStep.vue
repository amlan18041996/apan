<script setup lang="ts">
import type { ShippingMethod } from '~/types/checkout'

interface Props {
  subtotal: number
}

defineProps<Props>()

const emit = defineEmits<{
  submit: []
  back: []
}>()

const { state, goToStep, setAcceptedTerms, setError, clearError } = useCheckout()
const cart = useCartStore()

const processing = ref(false)
const showTermsError = ref(false)

const shippingCost = computed(() => state.value.selectedShippingMethod?.price ?? 0)

const orderTotal = computed(() => {
  const sub = cart.subtotal
  const shipping = shippingCost.value
  const tax = sub * 0.08
  const discount = cart.discount || 0
  return {
    subtotal: sub.toFixed(2),
    shipping: shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`,
    shippingValue: shipping,
    tax: `$${tax.toFixed(2)}`,
    taxValue: tax,
    discount: cart.couponCode ? `-$${discount.toFixed(2)}` : null,
    discountValue: discount,
    total: (sub + shipping + tax - discount).toFixed(2),
    totalValue: sub + shipping + tax - discount,
  }
})

const isDisabled = computed(() => processing.value)

function formatAddress(addr: {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}) {
  const lines = [
    `${addr.firstName} ${addr.lastName}`,
    addr.address1,
    addr.address2,
    `${addr.city}, ${addr.state} ${addr.zip}`,
    addr.country,
  ].filter(Boolean)
  if (addr.phone) lines.push(addr.phone)
  return lines
}

function handleTermsChange(checked: boolean) {
  setAcceptedTerms(checked)
  if (checked) showTermsError.value = false
}

async function handlePlaceOrder() {
  if (!state.value.acceptedTerms) {
    showTermsError.value = true
    return
  }

  processing.value = true
  clearError()

  try {
    const lineItems = cart.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      title: item.title,
    }))

    const method = state.value.selectedShippingMethod as ShippingMethod

    await $fetch('/api/checkout/place-order', {
      method: 'POST',
      body: {
        lineItems,
        email: state.value.email,
        shippingAddress: state.value.shippingAddress,
        billingAddress: state.value.sameAsBilling ? undefined : state.value.billingAddress,
        sameAsBilling: state.value.sameAsBilling,
        shippingMethod: {
          id: method.id,
          title: method.title,
          price: method.price,
        },
        paymentToken: state.value.paymentToken,
      },
    })

    emit('submit')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to place order. Please try again.'
    setError(msg)
  } finally {
    processing.value = false
  }
}

function handleBack() {
  emit('back')
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-gray-900">Review & Confirm</h2>
      <p class="mt-1 text-sm text-gray-500">
        Please review your order details before placing your order.
      </p>
    </div>

    <div v-if="state.error" class="rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
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
          <p class="text-sm text-red-700">{{ state.error }}</p>
          <button
            type="button"
            class="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
            @click="handlePlaceOrder"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>

    <div
      class="grid gap-6 lg:grid-cols-5"
      :class="{ 'pointer-events-none opacity-60': isDisabled }"
    >
      <div class="space-y-6 lg:col-span-3">
        <div>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Order Items</h3>
            <span class="text-xs text-gray-500"
              >{{ cart.totalItems }} item{{ cart.totalItems === 1 ? '' : 's' }}</span
            >
          </div>
          <div class="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            <div v-for="item in cart.items" :key="item.id" class="flex gap-3 p-4">
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <div v-else class="flex h-full items-center justify-center text-gray-400">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div class="flex min-w-0 flex-1 items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-gray-900">{{ item.title }}</p>
                  <p class="mt-0.5 text-xs text-gray-500">Qty: {{ item.quantity }}</p>
                </div>
                <span class="shrink-0 text-sm font-medium text-gray-900">
                  ${{ (item.price * item.quantity).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Shipping Address</h3>
            <button
              type="button"
              class="text-sm font-medium text-primary-600 hover:text-primary-700"
              :disabled="isDisabled"
              @click="goToStep('shipping-address')"
            >
              Edit
            </button>
          </div>
          <div class="mt-3 rounded-xl border border-gray-200 bg-white p-4">
            <div class="space-y-0.5">
              <p
                v-for="(line, idx) in formatAddress(state.shippingAddress)"
                :key="idx"
                class="text-sm text-gray-700"
              >
                {{ line }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Billing Address</h3>
            <button
              type="button"
              class="text-sm font-medium text-primary-600 hover:text-primary-700"
              :disabled="isDisabled"
              @click="goToStep('shipping-address')"
            >
              Edit
            </button>
          </div>
          <div class="mt-3 rounded-xl border border-gray-200 bg-white p-4">
            <p v-if="state.sameAsBilling" class="text-sm text-gray-700 italic">
              Same as shipping address
            </p>
            <div v-else class="space-y-0.5">
              <p
                v-for="(line, idx) in formatAddress(state.billingAddress)"
                :key="idx"
                class="text-sm text-gray-700"
              >
                {{ line }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Payment Method</h3>
            <button
              type="button"
              class="text-sm font-medium text-primary-600 hover:text-primary-700"
              :disabled="isDisabled"
              @click="goToStep('payment')"
            >
              Edit
            </button>
          </div>
          <div class="mt-3 rounded-xl border border-gray-200 bg-white p-4">
            <div class="flex items-center gap-3">
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
              <span class="text-sm font-medium text-gray-900">
                {{ state.paymentMethodSummary || 'Payment method on file' }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Shipping Method</h3>
            <button
              type="button"
              class="text-sm font-medium text-primary-600 hover:text-primary-700"
              :disabled="isDisabled"
              @click="goToStep('shipping-method')"
            >
              Edit
            </button>
          </div>
          <div class="mt-3 rounded-xl border border-gray-200 bg-white p-4">
            <div v-if="state.selectedShippingMethod" class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ state.selectedShippingMethod.title }}
                </p>
                <p class="mt-0.5 text-xs text-gray-500">
                  {{ state.selectedShippingMethod.estimatedDays }} business days
                </p>
              </div>
              <span class="text-sm font-medium text-gray-900">
                {{
                  state.selectedShippingMethod.price === 0
                    ? 'Free'
                    : `$${state.selectedShippingMethod.price.toFixed(2)}`
                }}
              </span>
            </div>
            <p v-else class="text-sm text-gray-500 italic">No shipping method selected</p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="sticky top-6 space-y-4">
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 class="text-sm font-semibold text-gray-900">Price Summary</h3>
            <div class="mt-3 space-y-2">
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

          <div class="rounded-xl border border-gray-200 bg-white p-4">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                :checked="state.acceptedTerms"
                class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                :disabled="isDisabled"
                @change="handleTermsChange(($event.target as HTMLInputElement).checked)"
              />
              <span class="text-sm text-gray-700">
                I have read and agree to the
                <NuxtLink
                  to="/terms"
                  class="font-medium text-primary-600 hover:text-primary-700"
                  target="_blank"
                >
                  Terms & Conditions
                </NuxtLink>
                and
                <NuxtLink
                  to="/privacy"
                  class="font-medium text-primary-600 hover:text-primary-700"
                  target="_blank"
                >
                  Privacy Policy </NuxtLink
                >.
              </span>
            </label>
            <p v-if="showTermsError" class="mt-2 text-xs text-red-500">
              You must accept the terms and conditions to continue.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="processing"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-3">
        <svg class="h-8 w-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span class="text-sm font-medium text-gray-700">Placing your order...</span>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-gray-200 pt-4">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        :disabled="isDisabled"
        @click="handleBack"
      >
        <svg
          class="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!state.acceptedTerms || processing"
        @click="handlePlaceOrder"
      >
        <svg v-if="processing" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ processing ? 'Processing...' : `Place Order — $${orderTotal.total}` }}
      </button>
    </div>
  </div>
</template>
