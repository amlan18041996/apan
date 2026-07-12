import { z } from 'zod'

const phoneRegex = /^\+?[\d\s-()]{7,15}$/

export const ZIP_PATTERNS: Record<string, { pattern: RegExp; example: string }> = {
  US: { pattern: /^\d{5}(-\d{4})?$/, example: '12345 or 12345-6789' },
  CA: { pattern: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i, example: 'A1A 1A1' },
  UK: { pattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, example: 'SW1A 1AA' },
  DE: { pattern: /^\d{5}$/, example: '10115' },
  FR: { pattern: /^\d{5}$/, example: '75001' },
  AU: { pattern: /^\d{4}$/, example: '2000' },
  JP: { pattern: /^\d{3}-?\d{4}$/, example: '100-0001' },
  IN: { pattern: /^\d{6}$/, example: '110001' },
  BR: { pattern: /^\d{5}-?\d{3}$/, example: '01001-000' },
}

export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States', hasStates: true },
  { code: 'CA', name: 'Canada', hasStates: true },
  { code: 'UK', name: 'United Kingdom', hasStates: false },
  { code: 'AU', name: 'Australia', hasStates: false },
  { code: 'DE', name: 'Germany', hasStates: false },
  { code: 'FR', name: 'France', hasStates: false },
  { code: 'JP', name: 'Japan', hasStates: false },
  { code: 'IN', name: 'India', hasStates: false },
  { code: 'BR', name: 'Brazil', hasStates: false },
] as const

export const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
] as const

export const CANADIAN_PROVINCES = [
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
] as const

export function getZipPattern(countryCode: string): { pattern: RegExp; example: string } | null {
  return ZIP_PATTERNS[countryCode] ?? null
}

export function validateZipForCountry(zip: string, countryCode: string): boolean {
  const entry = ZIP_PATTERNS[countryCode]
  if (!entry) return zip.length > 0
  return entry.pattern.test(zip)
}

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

export const shippingAddressSchema = addressSchema
export const billingAddressSchema = addressSchema

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
