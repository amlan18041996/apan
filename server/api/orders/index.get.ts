export default defineEventHandler(async (event) => {
  const { getCustomerFromToken } = await import('../../utils/customer')
  const customer = await getCustomerFromToken(event)

  const { shopifyAdminFetch } = await import('../../utils/shopify')
  const { mapOrderStatus } = await import('../../utils/orders')

  const query = `
    query customerOrders($id: ID!, $first: Int!, $after: String) {
      customer(id: $id) {
        orders(first: $first, sortKey: CREATED_AT, reverse: true, after: $after) {
          nodes {
            id
            name
            orderNumber
            totalPrice
            currencyCode
            processedAt
            fulfillmentStatus
            financialStatus
            lineItems(first: 10) {
              nodes {
                title
                quantity
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
        }
      }
    }
  `

  const result = await shopifyAdminFetch<{
    customer: {
      orders: {
        nodes: {
          id: string
          name: string
          orderNumber: number
          totalPrice: string
          currencyCode: string
          processedAt: string
          fulfillmentStatus: string | null
          financialStatus: string | null
          lineItems: {
            nodes: { title: string; quantity: number }[]
          }
        }[]
        pageInfo: {
          hasNextPage: boolean
          hasPreviousPage: boolean
          endCursor: string | null
          startCursor: string | null
        }
      }
    }
  }>(query, {
    id: customer.id,
    first: 20,
    after: getQuery(event).after as string | undefined,
  })

  if (!result.customer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Customer not found',
    })
  }

  const { orders } = result.customer

  return {
    orders: orders.nodes.map((order) => {
      const { status, statusColor } = mapOrderStatus(
        order.fulfillmentStatus ?? 'UNFULFILLED',
        order.financialStatus ?? 'PENDING',
      )

      return {
        id: order.id,
        orderNumber: order.name,
        confirmationNumber: order.name,
        totalPrice: order.totalPrice,
        currencyCode: order.currencyCode,
        status,
        statusColor,
        fulfillmentStatus: order.fulfillmentStatus ?? 'UNFULFILLED',
        financialStatus: order.financialStatus ?? 'PENDING',
        processedAt: order.processedAt,
        itemCount: order.lineItems.nodes.reduce((sum, li) => sum + li.quantity, 0),
      }
    }),
    pageInfo: orders.pageInfo,
  }
})
