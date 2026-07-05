import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  const { email, password } = parsed.data

  const { shopifyAdminFetch } = await import('../../utils/shopify')

  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `

  const result = await shopifyAdminFetch<{
    customerAccessTokenCreate: {
      customerAccessToken: { accessToken: string; expiresAt: string } | null
      customerUserErrors: { code: string; field: string[]; message: string }[]
    }
  }>(query, {
    input: { email, password }
  })

  const { customerAccessToken, customerUserErrors } = result.customerAccessTokenCreate

  if (customerUserErrors.length > 0) {
    throw createError({
      statusCode: 401,
      statusMessage: customerUserErrors[0].message
    })
  }

  const customerQuery = `
    query customer($email: String!) {
      customers(first: 1, query: "email:${email}") {
        nodes {
          id
          email
          firstName
          lastName
          phone
        }
      }
    }
  `

  const customerResult = await shopifyAdminFetch<{
    customers: {
      nodes: { id: string; email: string; firstName: string; lastName: string; phone: string | null }[]
    }
  }>(customerQuery, { email })

  const customer = customerResult.customers.nodes[0]

  return {
    user: {
      id: customer?.id ?? '',
      email: customer?.email ?? email,
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      phone: customer?.phone ?? undefined
    },
    accessToken: customerAccessToken!.accessToken
  }
})
