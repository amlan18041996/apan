import { z } from 'zod'

const bodySchema = z.object({
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  setDefault: z.boolean().optional(),
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

  const { setDefault, ...address } = parsed.data

  const query = `
    mutation customerAddressCreate($customerId: ID!, $address: MailingAddressInput!) {
      customerAddressCreate(customerId: $customerId, address: $address) {
        customerAddress {
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
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `

  const result = await shopifyAdminFetch<{
    customerAddressCreate: {
      customerAddress: {
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
      } | null
      customerUserErrors: { code: string; field: string[]; message: string }[]
    }
  }>(query, { customerId: customer.id, address })

  if (result.customerAddressCreate.customerUserErrors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: result.customerAddressCreate.customerUserErrors[0].message,
    })
  }

  if (setDefault && result.customerAddressCreate.customerAddress) {
    const defaultQuery = `
      mutation customerDefaultAddressUpdate($customerId: ID!, $addressId: ID!) {
        customerDefaultAddressUpdate(customerId: $customerId, addressId: $addressId) {
          customer { id }
          customerUserErrors { code field message }
        }
      }
    `
    await shopifyAdminFetch(defaultQuery, {
      customerId: customer.id,
      addressId: result.customerAddressCreate.customerAddress.id,
    })
  }

  return { address: { ...result.customerAddressCreate.customerAddress, isDefault: !!setDefault } }
})
