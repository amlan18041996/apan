export async function getCustomerFromToken(event: { headers: HeadersInit }) {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.slice(7)
  const { shopifyAdminFetch } = await import('./shopify')

  const query = `
    query customerAccessToken($token: String!) {
      customerAccessToken(accessToken: $token) {
        customer {
          id
          email
          firstName
          lastName
          phone
          acceptsMarketing
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
        acceptsMarketing: boolean
      } | null
      expiresAt: string
    } | null
  }>(query, { token })

  if (!result.customerAccessToken?.customer) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }

  return {
    ...result.customerAccessToken.customer,
    accessToken: token,
  }
}
