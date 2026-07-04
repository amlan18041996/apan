export interface ShopifyConfig {
  storeDomain: string
  storefrontAccessToken: string
  apiVersion: string
  adminAccessToken?: string
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  vendor: string
  productType: string
  tags: string[]
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  availableForSale: boolean
  totalInventory: number
  createdAt: string
  updatedAt: string
  featuredImage: ShopifyImage | null
  images: ShopifyImage[]
  variants: ShopifyProductVariant[]
  priceRange: ShopifyPriceRange
  options: ShopifyProductOption[]
  seo: ShopifySeo
}

export interface ShopifyProductVariant {
  id: string
  title: string
  sku: string
  price: number
  compareAtPrice: number | null
  availableForSale: boolean
  inventoryQuantity: number
  selectedOptions: { name: string; value: string }[]
  image: ShopifyImage | null
}

export interface ShopifyImage {
  id: string
  url: string
  altText: string | null
  width: number
  height: number
}

export interface ShopifyPriceRange {
  minVariantPrice: number
  maxVariantPrice: number
}

export interface ShopifyProductOption {
  id: string
  name: string
  values: string[]
}

export interface ShopifyCollection {
  id: string
  title: string
  handle: string
  description: string
  image: ShopifyImage | null
  productsCount: number
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: { amount: number; currencyCode: string }
    totalAmount: { amount: number; currencyCode: string }
    totalTaxAmount: { amount: number; currencyCode: string }
  }
  lines: ShopifyCartLine[]
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  cost: {
    totalAmount: { amount: number; currencyCode: string }
  }
  merchandise: {
    id: string
    title: string
    product: { title: string; handle: string }
    image: ShopifyImage | null
    price: number
  }
}

export interface ShopifyCustomer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  acceptsMarketing: boolean
  defaultAddress: ShopifyAddress | null
  addresses: ShopifyAddress[]
  orders: any[]
}

export interface ShopifyAddress {
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
  isDefault: boolean
}

export interface ShopifySeo {
  title: string
  description: string
}

export interface ShopifyPageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  endCursor: string | null
  startCursor: string | null
}

export interface ShopifyPaginatedResponse<T> {
  items: T[]
  pageInfo: ShopifyPageInfo
}
