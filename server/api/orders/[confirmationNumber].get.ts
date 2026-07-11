export default defineEventHandler(async (event) => {
  const confirmationNumber = getRouterParam(event, 'confirmationNumber')
  if (!confirmationNumber) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Confirmation number is required',
    })
  }

  const { shopifyAdminFetch } = await import('../../utils/shopify')
  const { mapOrderResponse, ORDER_GRAPHQL_FRAGMENT } = await import('../../utils/orders')

  const query = `
    query ordersByConfirmation($query: String!) {
      orders(first: 1, query: $query) {
        nodes {
          ${ORDER_GRAPHQL_FRAGMENT}
        }
      }
    }
  `

  const result = await shopifyAdminFetch<{
    orders: {
      nodes: {
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
        customAttributes: {
          key: string
          value: string
        }[]
      }[]
    }
  }>(query, {
    query: `confirmation_number:${confirmationNumber} OR name:${confirmationNumber}`,
  })

  const order = result.orders.nodes[0]
  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found',
    })
  }

  const mapped = mapOrderResponse(order)

  const confirmAttr = order.customAttributes?.find(
    (a: { key: string; value: string }) => a.key === 'confirmation_number',
  )
  mapped.confirmationNumber = confirmAttr?.value ?? confirmationNumber

  return { order: mapped }
})
