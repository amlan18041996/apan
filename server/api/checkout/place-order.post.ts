import { z } from 'zod'

const lineItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  title: z.string().min(1),
})

const addressSchema = z.object({
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
})

const bodySchema = z.object({
  lineItems: z.array(lineItemSchema).min(1, 'Cart must contain at least one item'),
  email: z.string().email('Please enter a valid email address'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsBilling: z.boolean().default(true),
  shippingMethod: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    price: z.number().min(0),
  }),
  paymentToken: z.string().min(1, 'Payment token is required'),
  idempotencyKey: z.string().uuid('Invalid idempotency key'),
  customerId: z.string().optional(),
})

const idempotencyCache = new Map<string, { result: unknown; timestamp: number }>()
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000

function getCachedResult(key: string) {
  const cached = idempotencyCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > IDEMPOTENCY_TTL) {
    idempotencyCache.delete(key)
    return null
  }
  return cached.result
}

function setCachedResult(key: string, result: unknown) {
  idempotencyCache.set(key, { result, timestamp: Date.now() })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  const {
    lineItems,
    email,
    shippingAddress,
    billingAddress,
    sameAsBilling,
    shippingMethod,
    idempotencyKey,
    customerId,
  } = parsed.data

  const cachedResult = getCachedResult(idempotencyKey)
  if (cachedResult) {
    return cachedResult
  }

  // TODO: Validate parsed.data.paymentToken with payment gateway before creating order

  const { shopifyAdminFetch } = await import('../../utils/shopify')
  const {
    buildOrderPayload,
    mapOrderResponse,
    generateConfirmationNumber,
    mapShopifyUserError,
    ORDER_GRAPHQL_FRAGMENT,
  } = await import('../../utils/orders')

  const effectiveBillingAddress = sameAsBilling ? shippingAddress : billingAddress

  const payload = buildOrderPayload(
    lineItems,
    { email, firstName: shippingAddress.firstName, lastName: shippingAddress.lastName },
    {
      ...shippingAddress,
      province: shippingAddress.state,
    },
    effectiveBillingAddress
      ? { ...effectiveBillingAddress, province: effectiveBillingAddress.state }
      : null,
    shippingMethod,
  )

  const confirmationNumber = generateConfirmationNumber()

  const createDraftMutation = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          invoiceNumber
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `

  const createResult = await shopifyAdminFetch<{
    draftOrderCreate: {
      draftOrder: {
        id: string
        invoiceNumber: string
      } | null
      userErrors: { code: string; field: string[]; message: string }[]
    }
  }>(createDraftMutation, {
    input: {
      lineItems: payload.lineItems,
      email: payload.email,
      shippingAddress: payload.shippingAddress,
      billingAddress: payload.billingAddress,
      shippingLine: payload.shippingLine,
      customAttributes: [
        ...payload.customAttributes,
        { key: 'confirmation_number', value: confirmationNumber },
      ],
      customerId: customerId || undefined,
      usePresentCurrency: true,
      taxExempt: false,
    },
  })

  if (createResult.draftOrderCreate.userErrors.length > 0) {
    const message = mapShopifyUserError(createResult.draftOrderCreate.userErrors)
    throw createError({
      statusCode: 400,
      statusMessage: message,
    })
  }

  const draftOrderId = createResult.draftOrderCreate.draftOrder!.id

  const markPaidMutation = `
    mutation draftOrderInvoiceSend($id: ID!) {
      draftOrderInvoiceSend(id: $id) {
        draftOrder {
          id
          order {
            ${ORDER_GRAPHQL_FRAGMENT}
          }
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `

  const completeResult = await shopifyAdminFetch<{
    draftOrderInvoiceSend: {
      draftOrder: {
        id: string
        order: {
          id: string
          name: string
          orderNumber: number
          totalPrice: string
          subtotalPrice: string
          totalTax: string
          totalShippingPrice: { amount: string } | null
          currencyCode: string
          email: string
          fulfillmentStatus: string | null
          financialStatus: string | null
          createdAt: string
          shippingAddress: {
            address1: string
            address2: string | null
            city: string
            province: string
            zip: string
            country: string
            firstName: string
            lastName: string
            phone: string | null
          } | null
          billingAddress: {
            address1: string
            address2: string | null
            city: string
            province: string
            zip: string
            country: string
            firstName: string
            lastName: string
            phone: string | null
          } | null
          lineItems: {
            nodes: {
              title: string
              quantity: number
              originalTotalPrice: { amount: string; currencyCode: string }
              variant: { id: string } | null
            }[]
          }
          customer: {
            id: string
            email: string
            firstName: string
            lastName: string
          } | null
        } | null
      } | null
      userErrors: { code: string; field: string[]; message: string }[]
    }
  }>(markPaidMutation, { id: draftOrderId })

  if (completeResult.draftOrderInvoiceSend.userErrors.length > 0) {
    const message = mapShopifyUserError(completeResult.draftOrderInvoiceSend.userErrors)
    throw createError({
      statusCode: 400,
      statusMessage: message,
    })
  }

  const shopifyOrder = completeResult.draftOrderInvoiceSend.draftOrder?.order
  if (!shopifyOrder) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Order was created but could not be retrieved',
    })
  }

  const orderResponse = mapOrderResponse(shopifyOrder)
  orderResponse.confirmationNumber = confirmationNumber

  const result = {
    order: {
      orderId: orderResponse.orderId,
      orderNumber: orderResponse.orderNumber,
      confirmationNumber: orderResponse.confirmationNumber,
      total: parseFloat(orderResponse.totalPrice),
      email: orderResponse.email,
      status: orderResponse.status,
      estimatedDelivery: getEstimatedDelivery(),
      createdAt: orderResponse.createdAt,
    },
    fullOrder: orderResponse,
  }

  setCachedResult(idempotencyKey, result)

  return result
})

function getEstimatedDelivery(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
