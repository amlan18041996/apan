<script setup lang="ts">
import type { ShippingMethod } from '~/types/checkout'

interface ShippingOption {
  id: string
  title: string
  description: string
  price: number
  estimatedDays: string
  estimatedDelivery: string
  minDate: string
  maxDate: string
}

interface Props {
  subtotal: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [method: ShippingMethod]
  back: []
}>()

const { state, setShippingMethod, setAvailableShippingMethods } = useCheckout()

const loading = ref(true)
const error = ref<string | null>(null)
const methods = ref<ShippingOption[]>([])
const selectedId = ref(state.value.selectedShippingMethod?.id || '')
const freeShippingThreshold = ref(50)
const taxRate = ref(0.08)
const tax = ref(0)

const selectedMethod = computed(() => methods.value.find((m) => m.id === selectedId.value) || null)

const shippingCost = computed(() => selectedMethod.value?.price ?? 0)

const freeShippingProgress = computed(() => {
  if (props.subtotal >= freeShippingThreshold.value) return null
  const remaining = freeShippingThreshold.value - props.subtotal
  const progress = Math.min((props.subtotal / freeShippingThreshold.value) * 100, 100)
  return { remaining: remaining.toFixed(2), progress }
})

const orderTotal = computed(() => {
  const subtotal = props.subtotal
  const shipping = shippingCost.value
  const taxAmount = tax.value
  return {
    subtotal: subtotal.toFixed(2),
    shipping: shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`,
    tax: `$${taxAmount.toFixed(2)}`,
    total: (subtotal + shipping + taxAmount).toFixed(2),
  }
})

async function fetchShippingMethods() {
  loading.value = true
  error.value = null

  try {
    const country = state.value.shippingAddress.country || 'US'
    const data = await $fetch<{
      methods: ShippingOption[]
      freeShippingThreshold: number
      taxRate: number
      tax: number
    }>('/api/shipping/methods', {
      params: { country, subtotal: props.subtotal },
    })

    methods.value = data.methods
    freeShippingThreshold.value = data.freeShippingThreshold
    taxRate.value = data.taxRate
    tax.value = data.tax
    setAvailableShippingMethods(
      data.methods.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        price: m.price,
        estimatedDays: m.estimatedDays,
      })),
    )

    if (!selectedId.value && data.methods.length > 0) {
      const cheapest = [...data.methods].sort((a, b) => a.price - b.price)[0]
      selectMethod(cheapest.id)
    }
  } catch {
    error.value = 'Failed to load shipping methods. Please try again.'
  } finally {
    loading.value = false
  }
}

function selectMethod(id: string) {
  selectedId.value = id
  const method = methods.value.find((m) => m.id === id)
  if (method) {
    setShippingMethod({
      id: method.id,
      title: method.title,
      description: method.description,
      price: method.price,
      estimatedDays: method.estimatedDays,
    })
  }
}

function handleSubmit() {
  if (!selectedMethod.value) return
  emit('submit', {
    id: selectedMethod.value.id,
    title: selectedMethod.value.title,
    description: selectedMethod.value.description,
    price: selectedMethod.value.price,
    estimatedDays: selectedMethod.value.estimatedDays,
  })
}

function handleBack() {
  emit('back')
}

onMounted(fetchShippingMethods)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-gray-900">Shipping Method</h2>
      <p class="mt-1 text-sm text-gray-500">Choose how you'd like your order delivered.</p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="animate-pulse rounded-xl border border-gray-200 p-4">
        <div class="flex items-center gap-4">
          <div class="h-5 w-5 rounded-full bg-gray-200" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-40 rounded bg-gray-200" />
            <div class="h-3 w-60 rounded bg-gray-200" />
          </div>
          <div class="h-5 w-16 rounded bg-gray-200" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
      <p class="text-sm text-red-600">{{ error }}</p>
      <button
        type="button"
        class="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700"
        @click="fetchShippingMethods"
      >
        Try again
      </button>
    </div>

    <div
      v-else-if="methods.length === 0"
      class="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center"
    >
      <p class="text-sm text-gray-600">
        We could not find any shipping methods for your address. Please contact support.
      </p>
    </div>

    <template v-else>
      <div
        v-if="freeShippingProgress"
        class="rounded-xl border border-primary-200 bg-primary-50 p-4"
      >
        <div class="flex items-center gap-2 text-sm text-primary-700">
          <svg
            class="h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
            />
          </svg>
          <span
            >Add <strong>${{ freeShippingProgress.remaining }}</strong> more for free shipping</span
          >
        </div>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-primary-200">
          <div
            class="h-full rounded-full bg-primary-600 transition-all duration-500"
            :style="{ width: `${freeShippingProgress.progress}%` }"
          />
        </div>
      </div>

      <div class="space-y-3">
        <button
          v-for="method in methods"
          :key="method.id"
          type="button"
          class="w-full rounded-xl border-2 p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          :class="
            selectedId === method.id
              ? 'border-primary-500 bg-primary-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          "
          @click="selectMethod(method.id)"
        >
          <div class="flex items-start gap-4">
            <span
              class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors"
              :class="
                selectedId === method.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
              "
            >
              <span v-if="selectedId === method.id" class="h-2 w-2 rounded-full bg-white" />
            </span>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-900">{{ method.title }}</span>
                <span
                  v-if="method.price === 0"
                  class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                >
                  Free
                </span>
              </div>
              <p class="mt-0.5 text-sm text-gray-500">{{ method.description }}</p>
              <p class="mt-1 text-xs text-gray-500">
                Estimated delivery: <strong>{{ method.estimatedDelivery }}</strong>
              </p>
            </div>

            <span class="text-sm font-semibold text-gray-900">
              {{ method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}` }}
            </span>
          </div>
        </button>
      </div>

      <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 class="text-sm font-semibold text-gray-900">Order Summary</h3>
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
          <div class="border-t border-gray-200 pt-2">
            <div class="flex justify-between">
              <span class="text-sm font-semibold text-gray-900">Total</span>
              <span class="text-sm font-semibold text-gray-900">${{ orderTotal.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="flex items-center justify-between border-t border-gray-200 pt-4">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
        class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!selectedId || loading"
        @click="handleSubmit"
      >
        Continue to Payment
        <svg
          class="ml-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  </div>
</template>
