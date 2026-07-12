import { z } from 'zod'

const querySchema = z.object({
  country: z.string().min(1, 'Country is required'),
  subtotal: z.coerce.number().min(0).default(0),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const parsed = querySchema.safeParse(query)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  const { country, subtotal } = parsed.data
  const {
    getAvailableShippingMethods,
    getEstimatedDeliveryRange,
    FREE_SHIPPING_THRESHOLD,
    DEFAULT_TAX_RATE,
    calculateTax,
  } = await import('../../utils/shipping')

  const methods = getAvailableShippingMethods(country, subtotal)

  const shippingOptions = methods.map((method) => {
    const delivery = getEstimatedDeliveryRange(method.minDays, method.maxDays)
    return {
      id: method.id,
      title: method.title,
      description: method.description,
      price: method.price,
      estimatedDays: `${method.minDays}–${method.maxDays} business days`,
      estimatedDelivery: delivery.text,
      minDate: delivery.minDate,
      maxDate: delivery.maxDate,
    }
  })

  const tax = calculateTax(subtotal, DEFAULT_TAX_RATE)

  return {
    methods: shippingOptions,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    taxRate: DEFAULT_TAX_RATE,
    tax,
  }
})
