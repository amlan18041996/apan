export default defineEventHandler(async (event) => {
  const { getCustomerFromToken } = await import('../../utils/customer')
  const customer = await getCustomerFromToken(event)

  const { shopifyAdminFetch } = await import('../../utils/shopify')

  const query = `
    query customer($id: ID!) {
      customer(id: $id) {
        orders(first: 50, sortKey: CREATED_AT, reverse: true) {
          nodes {
            id
            name
            totalPrice
            processedAt
            fulfillmentStatus
            financialStatus
            lineItems(first: 10) {
              nodes {
                title
                quantity
                originalTotalPrice
              }
            }
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
          totalPrice: string
          processedAt: string
          fulfillmentStatus: string
          financialStatus: string
          lineItems: {
            nodes: { title: string; quantity: number; originalTotalPrice: string }[]
          }
        }[]
      }
    }
  }>(query, { id: customer.id })

  return {
    orders: result.customer.orders.nodes.map((order) => ({
      id: order.id,
      name: order.name,
      totalPrice: order.totalPrice,
      processedAt: order.processedAt,
      fulfillmentStatus: order.fulfillmentStatus,
      financialStatus: order.financialStatus,
      itemCount: order.lineItems.nodes.reduce((sum, li) => sum + li.quantity, 0),
    })),
  }
})
