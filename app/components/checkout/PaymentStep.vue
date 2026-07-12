<script setup lang="ts">
interface Props {
  subtotal: number
}

defineProps<Props>()

const emit = defineEmits<{
  submit: []
  back: []
}>()

const { state, setPaymentToken, goToStep } = useCheckout()
const { getStripe, createCardElement, createPaymentMethod, getBrandDisplayName } = useStripe()

const cardContainer = ref<HTMLElement | null>(null)
const loading = ref(true)
const processing = ref(false)
const error = ref<string | null>(null)
const cardBrand = ref<string>('')
const cardComplete = ref(false)
const cardError = ref<string | null>(null)
const stripeReady = ref(false)

const billingAddress = computed(() =>
  state.value.sameAsBilling ? state.value.shippingAddress : state.value.billingAddress,
)

const billingSummary = computed(() => {
  const addr = billingAddress.value
  if (!addr || !addr.address1) return null
  const parts = [
    addr.address1,
    addr.address2,
    addr.city,
    addr.state,
    addr.zip,
    addr.country,
  ].filter(Boolean)
  return parts.join(', ')
})

const isFormValid = computed(() => stripeReady.value && cardComplete.value && !cardError.value)

let stripeInstance: Awaited<ReturnType<typeof getStripe>> | null = null
let cardElement: ReturnType<typeof createCardElement> extends Promise<infer R> ? R : never | null =
  null

onMounted(async () => {
  try {
    stripeInstance = await getStripe()
    await nextTick()
    if (cardContainer.value) {
      cardElement = await createCardElement(stripeInstance, cardContainer.value)
      cardElement.on('change', (event) => {
        cardError.value = event.error?.message || null
        cardBrand.value = event.brand || ''
        cardComplete.value = event.complete || false
      })
      stripeReady.value = true
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to initialize payment form'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (cardElement) {
    cardElement.unmount()
  }
})

function handleEditBilling() {
  goToStep('shipping-address')
}

async function handleSubmit() {
  if (!isFormValid.value || !stripeInstance || !cardElement) return

  processing.value = true
  error.value = null

  try {
    const addr = billingAddress.value
    const billingDetails: Record<string, unknown> = {}
    if (addr) {
      billingDetails.name = [addr.firstName, addr.lastName].filter(Boolean).join(' ')
      billingDetails.email = state.value.email
      billingDetails.address = {
        line1: addr.address1,
        line2: addr.address2,
        city: addr.city,
        state: addr.state,
        postal_code: addr.zip,
        country: addr.country,
      }
      if (addr.phone) billingDetails.phone = addr.phone
    }

    const result = await createPaymentMethod(stripeInstance, cardElement, billingDetails)

    if (result.error) {
      if (result.error.code === 'card_declined') {
        error.value = 'Your card was declined. Please try a different payment method.'
      } else {
        error.value = 'A payment error occurred. Please check your details and try again.'
      }
      return
    }

    if (result.paymentMethod) {
      const pm = result.paymentMethod
      const card = pm.card
      const brand = card ? getBrandDisplayName(card.brand) : 'Card'
      const last4 = card?.last4 ? `•••• ${card.last4}` : ''
      const summary = `${brand} ${last4}`
      setPaymentToken(pm.id, summary)
      emit('submit')
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('network') || msg.includes('timeout') || msg.includes('fetch')) {
      error.value = 'A network error occurred. Please check your connection and try again.'
    } else {
      error.value = 'An unexpected error occurred. Please try again.'
    }
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
      <h2 class="text-lg font-semibold text-gray-900">Payment</h2>
      <p class="mt-1 text-sm text-gray-500">Enter your card details to complete the purchase.</p>
    </div>

    <div v-if="billingSummary" class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-gray-500">Billing Address</p>
          <p class="mt-0.5 text-sm text-gray-900">{{ billingSummary }}</p>
        </div>
        <button
          type="button"
          class="text-sm font-medium text-primary-600 hover:text-primary-700"
          @click="handleEditBilling"
        >
          Edit
        </button>
      </div>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
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
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="animate-pulse space-y-3">
        <div class="h-10 rounded-lg bg-gray-200" />
        <div class="h-4 w-32 rounded bg-gray-200" />
      </div>
    </div>

    <div v-else class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Card Details <span class="text-red-500">*</span>
        </label>
        <div class="mt-1">
          <div class="relative">
            <div
              ref="cardContainer"
              class="stripe-card-element rounded-lg border border-gray-300 bg-white p-3 transition-colors focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500"
            />
            <div v-if="cardBrand" class="absolute right-3 top-1/2 -translate-y-1/2">
              <span class="text-xs font-medium text-gray-500">
                {{ getBrandDisplayName(cardBrand) }}
              </span>
            </div>
          </div>
          <p v-if="cardError" class="mt-1 text-xs text-red-500">
            {{ cardError }}
          </p>
        </div>
      </div>

      <p class="text-xs text-gray-400">
        Your payment is secured by Stripe. Card data is encrypted and never stored on our servers.
      </p>
    </div>

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
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!isFormValid || processing"
        @click="handleSubmit"
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
        {{ processing ? 'Processing payment...' : 'Continue to Review' }}
        <svg
          v-if="!processing"
          class="h-4 w-4"
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

<style scoped>
.stripe-card-element {
  min-height: 44px;
}
</style>
