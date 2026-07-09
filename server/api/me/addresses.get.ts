export default defineEventHandler(async (event) => {
  const { getCustomerFromToken } = await import('../../utils/customer')
  const customer = await getCustomerFromToken(event)

  const { shopifyAdminFetch } = await import('../../utils/shopify')

  const query = `
    query customer($id: ID!) {
      customer(id: $id) {
        addresses(first: 20) {
          nodes {
            id
            address1
            address2
            city
            province
            zip
            country
            phone
            firstName
            lastName
          }
        }
        defaultAddress {
          id
        }
      }
    }
  `

  const result = await shopifyAdminFetch<{
    customer: {
      addresses: {
        nodes: {
          id: string
          address1: string
          address2: string | null
          city: string
          province: string
          zip: string
          country: string
          phone: string | null
          firstName: string
          lastName: string
        }[]
      }
      defaultAddress: { id: string } | null
    }
  }>(query, { id: customer.id })

  const defaultAddressId = result.customer.defaultAddress?.id ?? null

  return {
    addresses: result.customer.addresses.nodes.map((addr) => ({
      ...addr,
      isDefault: addr.id === defaultAddressId,
    })),
  }
})
