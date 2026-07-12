interface StripeCardElement {
  mount(selector: string | HTMLElement): void
  unmount(): void
  on(event: string, handler: (event: StripeCardEvent) => void): void
  update(options: Record<string, unknown>): void
  focus(): void
  blur(): void
  clear(): void
}

interface StripeCardEvent {
  error?: {
    type: string
    code?: string
    message: string
    decline_code?: string
  }
  brand?: string
  complete?: boolean
  empty?: boolean
}

interface StripePaymentMethodResult {
  paymentMethod?: {
    id: string
    card?: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
    }
  }
  error?: {
    type: string
    code?: string
    message: string
    decline_code?: string
  }
}

interface StripeInstance {
  elements(options?: Record<string, unknown>): StripeElements
  createPaymentMethod(options: {
    type: string
    card: StripeCardElement
    billing_details?: Record<string, unknown>
  }): Promise<StripePaymentMethodResult>
}

interface StripeElements {
  create(type: string, options?: Record<string, unknown>): StripeCardElement
}

declare global {
  interface Window {
    Stripe?: (key: string) => StripeInstance
  }
}

let stripePromise: Promise<StripeInstance> | null = null

function loadStripeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="https://js.stripe.com/v3/"]')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Stripe.js'))
    document.head.appendChild(script)
  })
}

export function useStripe() {
  const config = useRuntimeConfig()
  const stripeKey = config.public.stripePublishableKey as string

  async function getStripe(): Promise<StripeInstance> {
    if (!stripeKey) {
      throw new Error(
        'Stripe publishable key not configured. Set NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env file.',
      )
    }

    if (stripePromise) return stripePromise

    stripePromise = loadStripeScript().then(() => {
      if (!window.Stripe) {
        throw new Error('Stripe.js failed to load')
      }
      return window.Stripe(stripeKey)
    })

    return stripePromise
  }

  async function createCardElement(
    stripe: StripeInstance,
    container: string | HTMLElement,
  ): Promise<StripeCardElement> {
    const elements = stripe.elements({
      appearance: {
        variables: {
          colorPrimary: '#4f46e5',
          colorBackground: '#ffffff',
          colorText: '#111827',
          colorDanger: '#ef4444',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          borderRadius: '0.5rem',
          spacingUnit: '4px',
          spacingGridRow: '16px',
        },
        rules: {
          '.Input': {
            border: '1px solid #d1d5db',
            boxShadow: 'none',
          },
          '.Input:focus': {
            border: '1px solid #4f46e5',
            boxShadow: '0 0 0 1px #4f46e5',
          },
          '.Input--invalid': {
            border: '1px solid #ef4444',
          },
        },
      },
    })

    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#111827',
          '::placeholder': { color: '#9ca3af' },
        },
        invalid: {
          color: '#ef4444',
        },
      },
      hidePostalCode: true,
    })

    card.mount(container)
    return card
  }

  async function createPaymentMethod(
    stripe: StripeInstance,
    card: StripeCardElement,
    billingDetails?: Record<string, unknown>,
  ): Promise<StripePaymentMethodResult> {
    return stripe.createPaymentMethod({
      type: 'card',
      card,
      billing_details: billingDetails,
    })
  }

  function getBrandDisplayName(brand: string): string {
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      diners: 'Diners Club',
      jcb: 'JCB',
      unionpay: 'UnionPay',
    }
    return brands[brand.toLowerCase()] || 'Card'
  }

  return {
    getStripe,
    createCardElement,
    createPaymentMethod,
    getBrandDisplayName,
  }
}
