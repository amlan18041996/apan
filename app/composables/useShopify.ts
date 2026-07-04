import type { ShopifyProduct, ShopifyCollection } from '~/types/shopify'

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    vendor
    productType
    tags
    availableForSale
    totalInventory
    createdAt
    updatedAt
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        sku
        price
        compareAtPrice
        availableForSale
        inventoryQuantity
        selectedOptions {
          name
          value
        }
        image {
          id
          url
          altText
          width
          height
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      id
      name
      values
    }
    seo {
      title
      description
    }
  }
`

export function useShopify() {
  const config = useRuntimeConfig()

  async function storefrontFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const endpoint = `https://${config.public.shopifyStoreDomain}/api/${config.public.shopifyApiVersion}/graphql.json`

    const { data, error } = await useFetch<{ data: T }>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': config.public.shopifyStorefrontToken
      },
      body: { query, variables }
    })

    if (error.value) throw new Error(error.value.message)
    return data.value!.data
  }

  async function getProducts(first: number = 20, after?: string): Promise<{ products: any; pageInfo: any }> {
    const query = `
      ${PRODUCT_FRAGMENT}
      query Products($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          nodes {
            ...ProductFields
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
        }
      }
    `

    const result = await storefrontFetch<{
      products: {
        nodes: any[]
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      }
    }>(query, { first, after })

    return {
      products: result.products.nodes,
      pageInfo: result.products.pageInfo
    }
  }

  async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
    const query = `
      ${PRODUCT_FRAGMENT}
      query Product($handle: String!) {
        productByHandle(handle: $handle) {
          ...ProductFields
        }
      }
    `

    const result = await storefrontFetch<{ productByHandle: any | null }>(query, { handle })
    return result.productByHandle
  }

  async function getCollections(first: number = 20): Promise<{ collections: ShopifyCollection[] }> {
    const query = `
      query Collections($first: Int!) {
        collections(first: $first) {
          nodes {
            id
            title
            handle
            description
            image {
              id
              url
              altText
              width
              height
            }
            productsCount
          }
        }
      }
    `

    const result = await storefrontFetch<{
      collections: { nodes: ShopifyCollection[] }
    }>(query, { first })

    return { collections: result.collections.nodes }
  }

  async function searchProducts(query_term: string, first: number = 20): Promise<{ products: ShopifyProduct[] }> {
    const query = `
      ${PRODUCT_FRAGMENT}
      query Search($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          nodes {
            ...ProductFields
          }
        }
      }
    `

    const result = await storefrontFetch<{
      products: { nodes: ShopifyProduct[] }
    }>(query, { query: query_term, first })

    return { products: result.products.nodes }
  }

  return {
    getProducts,
    getProductByHandle,
    getCollections,
    searchProducts,
    storefrontFetch
  }
}
