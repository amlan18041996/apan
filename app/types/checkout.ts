export type CheckoutStepKey =
  'information' | 'shipping-address' | 'shipping-method' | 'payment' | 'review'

export interface CheckoutStepMeta {
  key: CheckoutStepKey
  label: string
  index: number
}

export const CHECKOUT_STEPS: readonly CheckoutStepMeta[] = [
  { key: 'information', label: 'Information', index: 0 },
  { key: 'shipping-address', label: 'Shipping Address', index: 1 },
  { key: 'shipping-method', label: 'Shipping Method', index: 2 },
  { key: 'payment', label: 'Payment', index: 3 },
  { key: 'review', label: 'Review & Confirm', index: 4 },
] as const

export type StepStatus = 'incomplete' | 'current' | 'complete' | 'error'

export interface Address {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

export interface ShippingMethod {
  id: string
  title: string
  description: string
  price: number
  estimatedDays: string
}

export interface OrderConfirmation {
  orderId: string
  orderNumber: string
  total: number
  email: string
  estimatedDelivery: string
}

export interface CheckoutState {
  step: CheckoutStepKey
  email: string
  shippingAddress: Address
  billingAddress: Address
  sameAsBilling: boolean
  selectedShippingMethod: ShippingMethod | null
  availableShippingMethods: ShippingMethod[]
  paymentToken: string | null
  paymentMethodSummary: string | null
  acceptedTerms: boolean
  isSubmitting: boolean
  orderConfirmation: OrderConfirmation | null
  error: string | null
  idempotencyKey: string | null
}

export type CheckoutPersistableState = Omit<
  CheckoutState,
  'isSubmitting' | 'error' | 'orderConfirmation'
>
