import { z } from 'zod'

const bodySchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
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
      customer: { id: string; email: string } | null
      customerUserErrors: { code: string; field: string[]; message: string }[]
    }
  }>(query, {
    input: {
      id: customer.id,
      password: parsed.data.newPassword,
    },
  })

  if (result.customerUpdate.customerUserErrors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: result.customerUpdate.customerUserErrors[0].message,
    })
  }

  return { success: true }
})
