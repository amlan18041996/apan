export default defineEventHandler(async (event) => {
  const { getCustomerFromToken } = await import('../../../utils/customer')
  const customer = await getCustomerFromToken(event)

  const addressId = getRouterParam(event, 'id')
  if (!addressId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing address ID' })
  }

  const { shopifyAdminFetch } = await import('../../../utils/shopify')

  const query = `
    mutation customerAddressDelete($customerId: ID!, $addressId: ID!) {
      customerAddressDelete(customerId: $customerId, addressId: $addressId) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `

  const result = await shopifyAdminFetch<{
    customerAddressDelete: {
      customerUserErrors: { code: string; field: string[]; message: string }[]
    }
  }>(query, { customerId: customer.id, addressId })

  if (result.customerAddressDelete.customerUserErrors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: result.customerAddressDelete.customerUserErrors[0].message,
    })
  }

  return { success: true }
})
