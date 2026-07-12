export interface OrderLineItem {
  variantId: string
  quantity: number
  price: number
  title: string
}

export interface OrderCustomerInfo {
  email: string
  firstName: string
  lastName: string
  phone?: string
}

export interface OrderAddress {
  address1: string
  address2?: string
  city: string
  province: string
  zip: string
  country: string
  firstName: string
  lastName: string
  phone?: string
}

export interface OrderShippingMethod {
  id: string
  title: string
  price: number
}

export interface OrderItem {
  variantId: string
  quantity: number
  price: string
  title: string
}

export interface OrderResponse {
  orderId: string
  orderNumber: string
  confirmationNumber: string
  totalPrice: string
  subtotalPrice: string
  totalTax: string
  totalShipping: string
  currencyCode: string
  email: string
  fulfillmentStatus: string
  financialStatus: string
  status: string
  statusColor: string
  createdAt: string
  shippingAddress: OrderAddress | null
  billingAddress: OrderAddress | null
  lineItems: OrderItem[]
  customer: {
    id: string
    email: string
    firstName: string
    lastName: string
  } | null
}

export interface OrderListEntry {
  id: string
  orderNumber: string
  confirmationNumber: string
  totalPrice: string
  currencyCode: string
  status: string
  statusColor: string
  fulfillmentStatus: string
  financialStatus: string
  processedAt: string
  itemCount: number
}

export type ShopifyOrderStatus =
  | 'OPEN'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_FULFILLED'
  | 'UNFULFILLED'
  | string

export function mapOrderStatus(
  fulfillmentStatus: string,
  financialStatus: string,
): { status: string; statusColor: string } {
  if (financialStatus === 'VOIDED' || fulfillmentStatus === 'CANCELLED') {
    return { status: 'Cancelled', statusColor: 'red' }
  }

  switch (fulfillmentStatus) {
    case 'FULFILLED':
      return { status: 'Shipped', statusColor: 'green' }
    case 'PARTIALLY_FULFILLED':
      return { status: 'Partially Shipped', statusColor: 'yellow' }
    case 'IN_PROGRESS':
      return { status: 'Preparing', statusColor: 'yellow' }
    case 'UNFULFILLED':
      if (financialStatus === 'PAID' || financialStatus === 'PARTIALLY_PAID') {
        return { status: 'Processing', statusColor: 'yellow' }
      }
      return { status: 'Pending', statusColor: 'gray' }
    case 'OPEN':
      return { status: 'Processing', statusColor: 'yellow' }
    default:
      return { status: 'Unknown', statusColor: 'gray' }
  }
}

function shopifyAddressToOrderAddress(
  addr: {
    address1: string
    address2: string | null
    city: string
    province: string
    zip: string
    country: string
    firstName: string
    lastName: string
    phone: string | null
  } | null,
): OrderAddress | null {
  if (!addr) return null
  return {
    address1: addr.address1,
    address2: addr.address2 ?? undefined,
    city: addr.city,
    province: addr.province,
    zip: addr.zip,
    country: addr.country,
    firstName: addr.firstName,
    lastName: addr.lastName,
    phone: addr.phone ?? undefined,
  }
}

export function mapOrderResponse(shopifyOrder: {
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
      variant: {
        id: string
      } | null
    }[]
  }
  customer: {
    id: string
    email: string
    firstName: string
    lastName: string
  } | null
}): OrderResponse {
  const fulfillmentStatus = shopifyOrder.fulfillmentStatus ?? 'UNFULFILLED'
  const financialStatus = shopifyOrder.financialStatus ?? 'PENDING'
  const { status, statusColor } = mapOrderStatus(fulfillmentStatus, financialStatus)

  return {
    orderId: shopifyOrder.id,
    orderNumber: shopifyOrder.name,
    confirmationNumber: shopifyOrder.name,
    totalPrice: shopifyOrder.totalPrice,
    subtotalPrice: shopifyOrder.subtotalPrice,
    totalTax: shopifyOrder.totalTax,
    totalShipping: shopifyOrder.totalShippingPrice?.amount ?? '0.0',
    currencyCode: shopifyOrder.currencyCode,
    email: shopifyOrder.email,
    fulfillmentStatus,
    financialStatus,
    status,
    statusColor,
    createdAt: shopifyOrder.createdAt,
    shippingAddress: shopifyAddressToOrderAddress(shopifyOrder.shippingAddress),
    billingAddress: shopifyAddressToOrderAddress(shopifyOrder.billingAddress),
    lineItems: shopifyOrder.lineItems.nodes.map((li) => ({
      variantId: li.variant?.id ?? '',
      quantity: li.quantity,
      price: li.originalTotalPrice.amount,
      title: li.title,
    })),
    customer: shopifyOrder.customer,
  }
}

export function buildOrderPayload(
  lineItems: OrderLineItem[],
  customerInfo: OrderCustomerInfo,
  shippingAddress: OrderAddress,
  billingAddress: OrderAddress | null,
  shippingMethod: OrderShippingMethod,
): {
  lineItems: { variantId: string; quantity: number }[]
  email: string
  shippingAddress: Record<string, unknown>
  billingAddress: Record<string, unknown>
  shippingLine: { title: string; price: { amount: string; currencyCode: string } }
  customAttributes: { key: string; value: string }[]
} {
  return {
    lineItems: lineItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    })),
    email: customerInfo.email,
    shippingAddress: {
      address1: shippingAddress.address1,
      address2: shippingAddress.address2,
      city: shippingAddress.city,
      province: shippingAddress.province,
      zip: shippingAddress.zip,
      country: shippingAddress.country,
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      phone: shippingAddress.phone,
    },
    billingAddress: billingAddress
      ? {
          address1: billingAddress.address1,
          address2: billingAddress.address2,
          city: billingAddress.city,
          province: billingAddress.province,
          zip: billingAddress.zip,
          country: billingAddress.country,
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          phone: billingAddress.phone,
        }
      : undefined,
    shippingLine: {
      title: shippingMethod.title,
      price: {
        amount: String(shippingMethod.price),
        currencyCode: 'USD',
      },
    },
    customAttributes: [{ key: 'confirmation_number', value: generateConfirmationNumber() }],
  }
}

export function generateConfirmationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `APAN-${timestamp}-${random}`
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID()
}

const SHOPIFY_ERROR_MAP: Record<string, string> = {
  INVENTORY_NOT_AVAILABLE: 'One or more items are no longer in stock. Please review your cart.',
  PRICE_HAS_CHANGED: 'The price of some items has changed. Please review your cart.',
  CUSTOMER_DOES_NOT_EXIST: 'There was an issue with your account. Please try logging in again.',
}

const GENERIC_ERROR_MESSAGE =
  'We could not process your order. Please try again or contact support.'

export function mapShopifyUserError(
  errors: { code: string; field: string[]; message: string }[],
): string {
  if (errors.length === 0) return GENERIC_ERROR_MESSAGE

  console.error('[Order Creation] Shopify userErrors:', JSON.stringify(errors, null, 2))

  const first = errors[0]
  const mapped = SHOPIFY_ERROR_MAP[first.code]
  if (mapped) return mapped

  if (first.message.toLowerCase().includes('inventory')) {
    return SHOPIFY_ERROR_MAP.INVENTORY_NOT_AVAILABLE
  }
  if (first.message.toLowerCase().includes('price')) {
    return SHOPIFY_ERROR_MAP.PRICE_HAS_CHANGED
  }
  if (first.message.toLowerCase().includes('customer')) {
    return SHOPIFY_ERROR_MAP.CUSTOMER_DOES_NOT_EXIST
  }

  return GENERIC_ERROR_MESSAGE
}

export const ORDER_GRAPHQL_FRAGMENT = `
  id
  name
  orderNumber
  totalPrice
  subtotalPrice
  totalTax
  totalShippingPrice {
    amount
  }
  currencyCode
  email
  fulfillmentStatus
  financialStatus
  createdAt
  shippingAddress {
    address1
    address2
    city
    province
    zip
    country
    firstName
    lastName
    phone
  }
  billingAddress {
    address1
    address2
    city
    province
    zip
    country
    firstName
    lastName
    phone
  }
  lineItems(first: 50) {
    nodes {
      title
      quantity
      originalTotalPrice {
        amount
        currencyCode
      }
      variant {
        id
      }
    }
  }
  customer {
    id
    email
    firstName
    lastName
  }
`
