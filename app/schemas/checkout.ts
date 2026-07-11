import { z } from 'zod'

const phoneRegex = /^\+?[\d\s-()]{7,15}$/

export const informationSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().min(1, 'Address line 1 is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  zipCode: z.string().min(1, 'ZIP/Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional(),
})

export const shippingMethodSchema = z.object({
  methodId: z.string().min(1, 'Please select a shipping method'),
})

export const paymentSchema = z.object({
  cardholderName: z.string().min(1, 'Cardholder name is required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Please enter a valid card number'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY format'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Please enter a valid CVV'),
  sameAsBilling: z.boolean().default(true),
})

export const orderReviewSchema = z.object({
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
})

export type InformationInput = z.infer<typeof informationSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ShippingMethodInput = z.infer<typeof shippingMethodSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
