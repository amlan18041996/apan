export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.slice(7)

  const { shopifyAdminFetch } = await import('../../utils/shopify')

  const query = `
    query customerAccessToken($token: String!) {
      customerAccessToken(accessToken: $token) {
        customer {
          id
          email
          firstName
          lastName
          phone
        }
        expiresAt
      }
    }
  `

  const result = await shopifyAdminFetch<{
    customerAccessToken: {
      customer: {
        id: string
        email: string
        firstName: string
        lastName: string
        phone: string | null
      } | null
      expiresAt: string
    } | null
  }>(query, { token })

  if (!result.customerAccessToken?.customer) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }

  const customer = result.customerAccessToken.customer

  return {
    user: {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone ?? undefined,
    },
  }
})
