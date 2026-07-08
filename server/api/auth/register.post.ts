import { z } from 'zod'

const bodySchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  const { firstName, lastName, email, password } = parsed.data

  const { shopifyAdminFetch } = await import('../../utils/shopify')

  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
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
    customerCreate: {
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
    input: { firstName, lastName, email, password },
  })

  const { customer, customerUserErrors } = result.customerCreate

  if (customerUserErrors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: customerUserErrors[0].message,
    })
  }

  return {
    user: {
      id: customer!.id,
      email: customer!.email,
      firstName: customer!.firstName,
      lastName: customer!.lastName,
      phone: customer!.phone ?? undefined,
    },
    accessToken: '',
  }
})
