import { z } from 'zod'

const bodySchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const { getCustomerFromToken } = await import('../../utils/customer')
  const customer = await getCustomerFromToken(event)

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  const { shopifyAdminFetch } = await import('../../utils/shopify')

  const query = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
          phone
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
    customerUpdate: {
      customer: {
        id: string
        email: string
        firstName: string
        lastName: string
        phone: string | null
      } | null
      customerUserErrors: { code: string; field: string[]; message: string }[]
    }
  }>(query, {
    input: {
      id: customer.id,
      ...parsed.data,
    },
  })

  if (result.customerUpdate.customerUserErrors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: result.customerUpdate.customerUserErrors[0].message,
    })
  }

  return { user: result.customerUpdate.customer }
})
