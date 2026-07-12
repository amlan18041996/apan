import { ref, computed, watch, type Ref } from 'vue'
import {
  CHECKOUT_STEPS,
  type CheckoutStepKey,
  type CheckoutState,
  type CheckoutPersistableState,
  type StepStatus,
  type Address,
  type ShippingMethod,
  type OrderConfirmation,
} from '~/types/checkout'
import {
  informationSchema,
  addressSchema,
  shippingMethodSchema,
  paymentSchema,
  orderReviewSchema,
} from '~/schemas/checkout'

const STORAGE_KEY = 'apan-checkout'

function createEmptyAddress(): Address {
  return {
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
  }
}

function createInitialState(): CheckoutState {
  return {
    step: 'information',
    email: '',
    shippingAddress: createEmptyAddress(),
    billingAddress: createEmptyAddress(),
    sameAsBilling: true,
    selectedShippingMethod: null,
    availableShippingMethods: [],
    paymentToken: null,
    paymentMethodSummary: null,
    acceptedTerms: false,
    isSubmitting: false,
    orderConfirmation: null,
    error: null,
    idempotencyKey: null,
  }
}

function loadPersistedState(): Partial<CheckoutPersistableState> | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CheckoutPersistableState>
    if (!parsed.step || !CHECKOUT_STEPS.some((s) => s.key === parsed.step)) return null
    return parsed
  } catch {
    return null
  }
}

function persistState(state: CheckoutState) {
  if (!import.meta.client) return
  try {
    const persistable: CheckoutPersistableState = {
      step: state.step,
      email: state.email,
      shippingAddress: state.shippingAddress,
      billingAddress: state.billingAddress,
      sameAsBilling: state.sameAsBilling,
      selectedShippingMethod: state.selectedShippingMethod,
      availableShippingMethods: state.availableShippingMethods,
      paymentToken: state.paymentToken,
      paymentMethodSummary: state.paymentMethodSummary,
      acceptedTerms: state.acceptedTerms,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
  } catch {
    /* ignore */
  }
}

function clearPersistedState() {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

const STEP_VALIDATORS: Record<CheckoutStepKey, (state: CheckoutState) => boolean> = {
  information: (state) => informationSchema.safeParse({ email: state.email }).success,
  'shipping-address': (state) => addressSchema.safeParse(state.shippingAddress).success,
  'shipping-method': (state) =>
    state.selectedShippingMethod !== null &&
    shippingMethodSchema.safeParse({ methodId: state.selectedShippingMethod.id }).success,
  payment: (state) =>
    paymentSchema.safeParse({
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      sameAsBilling: state.sameAsBilling,
    }).success && state.paymentToken !== null,
  review: (state) => orderReviewSchema.safeParse({ acceptTerms: state.acceptedTerms }).success,
}

const STEP_ERRORS: Record<CheckoutStepKey, string> = {
  information: 'Please enter a valid email address',
  'shipping-address': 'Please fill in all required address fields',
  'shipping-method': 'Please select a shipping method',
  payment: 'Please complete payment information',
  review: 'Please accept the terms and conditions',
}

function getStepIndex(stepKey: CheckoutStepKey): number {
  return CHECKOUT_STEPS.findIndex((s) => s.key === stepKey)
}

let instanceCount = 0

export function useCheckout() {
  const persisted = loadPersistedState()
  const initial = createInitialState()

  const state: Ref<CheckoutState> = ref(
    persisted ? { ...initial, ...persisted } : initial,
  ) as Ref<CheckoutState>

  const currentIndex = computed(() => getStepIndex(state.value.step))
  const currentStep = computed(() => CHECKOUT_STEPS[currentIndex.value])
  const totalSteps = CHECKOUT_STEPS.length

  const canGoPrev = computed(() => currentIndex.value > 0)
  const canGoNext = computed(() => {
    const validator = STEP_VALIDATORS[state.value.step]
    return validator ? validator(state.value) : false
  })
  const isComplete = computed(() => state.value.orderConfirmation !== null)

  function validateCurrentStep(): { valid: boolean; error: string | null } {
    const validator = STEP_VALIDATORS[state.value.step]
    if (!validator) return { valid: true, error: null }
    if (validator(state.value)) return { valid: true, error: null }
    return { valid: false, error: STEP_ERRORS[state.value.step] ?? 'Invalid step data' }
  }

  function getStepStatus(stepKey: CheckoutStepKey): StepStatus {
    if (stepKey === state.value.step) {
      const result = validateCurrentStep()
      return result.valid ? 'current' : 'error'
    }
    const stepIdx = getStepIndex(stepKey)
    if (stepIdx < currentIndex.value) return 'complete'
    return 'incomplete'
  }

  function goToStep(stepKey: CheckoutStepKey) {
    const targetIndex = getStepIndex(stepKey)
    if (targetIndex < 0 || targetIndex >= totalSteps) return
    if (targetIndex > currentIndex.value) {
      for (let i = currentIndex.value; i < targetIndex; i++) {
        const step = CHECKOUT_STEPS[i]
        const validator = STEP_VALIDATORS[step.key]
        if (validator && !validator(state.value)) {
          state.value.error = STEP_ERRORS[step.key]
          return
        }
      }
    }
    state.value.step = stepKey
    state.value.error = null
  }

  function next() {
    const result = validateCurrentStep()
    if (!result.valid) {
      state.value.error = result.error
      return
    }
    state.value.error = null
    const nextIndex = currentIndex.value + 1
    if (nextIndex < totalSteps) {
      state.value.step = CHECKOUT_STEPS[nextIndex].key
    }
  }

  function prev() {
    const prevIndex = currentIndex.value - 1
    if (prevIndex >= 0) {
      state.value.step = CHECKOUT_STEPS[prevIndex].key
      state.value.error = null
    }
  }

  function reset() {
    state.value = createInitialState()
    clearPersistedState()
  }

  function completeOrder(confirmation: OrderConfirmation) {
    state.value.orderConfirmation = confirmation
    state.value.isSubmitting = false
    state.value.error = null
    clearPersistedState()
  }

  function setError(error: string) {
    state.value.error = error
    state.value.isSubmitting = false
  }

  function clearError() {
    state.value.error = null
  }

  function setShippingAddress(address: Address) {
    state.value.shippingAddress = address
    if (state.value.sameAsBilling) {
      state.value.billingAddress = { ...address }
    }
  }

  function setBillingAddress(address: Address) {
    state.value.billingAddress = address
  }

  function setSameAsBilling(value: boolean) {
    state.value.sameAsBilling = value
    if (value) {
      state.value.billingAddress = { ...state.value.shippingAddress }
    }
  }

  function setShippingMethod(method: ShippingMethod) {
    state.value.selectedShippingMethod = method
  }

  function setAvailableShippingMethods(methods: ShippingMethod[]) {
    state.value.availableShippingMethods = methods
  }

  function setPaymentToken(token: string, summary: string) {
    state.value.paymentToken = token
    state.value.paymentMethodSummary = summary
  }

  function setEmail(email: string) {
    state.value.email = email
  }

  function setAcceptedTerms(value: boolean) {
    state.value.acceptedTerms = value
  }

  async function submitOrder(
    lineItems: { variantId: string; quantity: number; price: number; title: string }[],
    cart: { clearCart: () => Promise<void> },
  ): Promise<OrderConfirmation> {
    if (state.value.isSubmitting && state.value.idempotencyKey) {
      const result = await $fetch<{ order: OrderConfirmation }>('/api/checkout/place-order', {
        method: 'POST',
        body: {
          lineItems,
          email: state.value.email,
          shippingAddress: state.value.shippingAddress,
          billingAddress: state.value.sameAsBilling ? undefined : state.value.billingAddress,
          sameAsBilling: state.value.sameAsBilling,
          shippingMethod: {
            id: state.value.selectedShippingMethod!.id,
            title: state.value.selectedShippingMethod!.title,
            price: state.value.selectedShippingMethod!.price,
          },
          paymentToken: state.value.paymentToken,
          idempotencyKey: state.value.idempotencyKey,
        },
      })
      completeOrder({
        orderId: result.order.orderId,
        orderNumber: result.order.orderNumber,
        total: result.order.total,
        email: result.order.email,
        estimatedDelivery: result.order.estimatedDelivery,
      })
      await cart.clearCart()
      return result.order
    }

    const key = state.value.idempotencyKey || crypto.randomUUID()
    state.value.idempotencyKey = key
    state.value.isSubmitting = true
    state.value.error = null

    try {
      const result = await $fetch<{ order: OrderConfirmation }>('/api/checkout/place-order', {
        method: 'POST',
        body: {
          lineItems,
          email: state.value.email,
          shippingAddress: state.value.shippingAddress,
          billingAddress: state.value.sameAsBilling ? undefined : state.value.billingAddress,
          sameAsBilling: state.value.sameAsBilling,
          shippingMethod: {
            id: state.value.selectedShippingMethod!.id,
            title: state.value.selectedShippingMethod!.title,
            price: state.value.selectedShippingMethod!.price,
          },
          paymentToken: state.value.paymentToken,
          idempotencyKey: key,
        },
      })

      completeOrder({
        orderId: result.order.orderId,
        orderNumber: result.order.orderNumber,
        total: result.order.total,
        email: result.order.email,
        estimatedDelivery: result.order.estimatedDelivery,
      })

      await cart.clearCart()

      return result.order
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to place order. Please try again.'
      setError(msg)
      throw e
    }
  }

  watch(
    state,
    (newState) => {
      persistState(newState)
    },
    { deep: true },
  )

  if (instanceCount === 0 && import.meta.client) {
    window.addEventListener('beforeunload', () => {
      persistState(state.value)
    })
  }
  instanceCount++

  return {
    state,
    currentStep,
    currentIndex,
    totalSteps,
    canGoNext,
    canGoPrev,
    isComplete,
    steps: CHECKOUT_STEPS,
    validateCurrentStep,
    getStepStatus,
    goToStep,
    next,
    prev,
    reset,
    completeOrder,
    setError,
    clearError,
    setShippingAddress,
    setBillingAddress,
    setSameAsBilling,
    setShippingMethod,
    setAvailableShippingMethods,
    setPaymentToken,
    setEmail,
    setAcceptedTerms,
    submitOrder,
  }
}

export type UseCheckoutReturn = ReturnType<typeof useCheckout>
