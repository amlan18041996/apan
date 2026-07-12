export interface ShippingMethodConfig {
  id: string
  title: string
  description: string
  price: number
  minDays: number
  maxDays: number
  countries: string[]
}

export const FREE_SHIPPING_THRESHOLD = 50
export const DEFAULT_TAX_RATE = 0.08

export const SHIPPING_METHODS: ShippingMethodConfig[] = [
  {
    id: 'standard',
    title: 'Standard Shipping',
    description: 'Tracked delivery with signature',
    price: 5.99,
    minDays: 5,
    maxDays: 8,
    countries: ['US', 'CA'],
  },
  {
    id: 'express',
    title: 'Express Shipping',
    description: 'Priority tracked delivery',
    price: 12.99,
    minDays: 2,
    maxDays: 3,
    countries: ['US', 'CA'],
  },
  {
    id: 'overnight',
    title: 'Overnight Shipping',
    description: 'Next business day delivery',
    price: 24.99,
    minDays: 1,
    maxDays: 1,
    countries: ['US'],
  },
  {
    id: 'free-standard',
    title: 'Free Standard Shipping',
    description: 'Tracked delivery on orders over $50',
    price: 0,
    minDays: 7,
    maxDays: 12,
    countries: ['US', 'CA'],
  },
  {
    id: 'international',
    title: 'International Shipping',
    description: 'Tracked international delivery',
    price: 19.99,
    minDays: 10,
    maxDays: 21,
    countries: ['UK', 'AU', 'DE', 'FR', 'JP', 'IN', 'BR'],
  },
]

export function getAvailableShippingMethods(
  country: string,
  subtotal: number,
): ShippingMethodConfig[] {
  return SHIPPING_METHODS.filter((method) => {
    if (!method.countries.includes(country)) return false
    if (method.id === 'free-standard' && subtotal < FREE_SHIPPING_THRESHOLD) return false
    return true
  })
}

function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day !== 0 && day !== 6) {
      added++
    }
  }
  return result
}

function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getEstimatedDeliveryRange(
  minDays: number,
  maxDays: number,
): { text: string; minDate: string; maxDate: string } {
  const today = new Date()
  const minDate = addBusinessDays(today, minDays)
  const maxDate = addBusinessDays(today, maxDays)
  return {
    text: `${formatDeliveryDate(minDate)} – ${formatDeliveryDate(maxDate)}`,
    minDate: minDate.toISOString(),
    maxDate: maxDate.toISOString(),
  }
}

export function calculateTax(subtotal: number, taxRate: number = DEFAULT_TAX_RATE): number {
  return Math.round(subtotal * taxRate * 100) / 100
}
