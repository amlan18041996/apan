import type { ShopifyProduct } from '~/types/shopify'
import type { TypesenseProduct } from '~/types/typesense'

const BATCH_SIZE = 100

const PRODUCT_QUERY = `
  query products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        description
        vendor
        productType
        tags
        status
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
        priceRangeV2 {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`

const SINGLE_PRODUCT_QUERY = `
  query productByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      vendor
      productType
      tags
      status
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
      priceRangeV2 {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`

export function transformShopifyProduct(product: ShopifyProduct): TypesenseProduct {
  const minPrice = parseFloat(product.priceRangeV2.minVariantPrice.amount)
  const maxPrice = parseFloat(product.priceRangeV2.maxVariantPrice.amount)

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description || '',
    productType: product.productType || '',
    vendor: product.vendor || '',
    tags: product.tags || [],
    price: minPrice,
    minPrice,
    maxPrice,
    image: product.featuredImage?.url || '',
    inventory: product.totalInventory,
    status: product.status.toLowerCase(),
    createdAt: new Date(product.createdAt).getTime(),
    popularityScore: 0,
  }
}

export async function fetchAllShopifyProducts(): Promise<ShopifyProduct[]> {
  const { shopifyAdminFetch } = await import('./shopify')

  const allProducts: ShopifyProduct[] = []
  let cursor: string | null = null
  let hasNextPage = true

  while (hasNextPage) {
    const result = await shopifyAdminFetch<{
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
        nodes: ShopifyProduct[]
      }
    }>(PRODUCT_QUERY, { first: BATCH_SIZE, after: cursor })

    allProducts.push(...result.products.nodes)
    hasNextPage = result.products.pageInfo.hasNextPage
    cursor = result.products.pageInfo.endCursor
  }

  return allProducts
}

export async function fetchShopifyProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const { shopifyAdminFetch } = await import('./shopify')

  const result = await shopifyAdminFetch<{
    productByHandle: ShopifyProduct | null
  }>(SINGLE_PRODUCT_QUERY, { handle })

  return result.productByHandle
}

export async function syncAllProductsToTypesense(): Promise<{
  indexed: number
  errors: string[]
}> {
  const { ensureProductsCollection, typesenseUpsertDocuments, PRODUCTS_COLLECTION_NAME } =
    await import('./typesense')

  await ensureProductsCollection()

  const products = await fetchAllShopifyProducts()
  const errors: string[] = []
  let indexed = 0

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)
    const docs = batch.map(transformShopifyProduct)

    try {
      await typesenseUpsertDocuments(PRODUCTS_COLLECTION_NAME, docs)
      indexed += docs.length
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${msg}`)
    }
  }

  return { indexed, errors }
}

export async function upsertProductToTypesense(product: ShopifyProduct): Promise<void> {
  const { ensureProductsCollection, typesenseUpsertDocuments, PRODUCTS_COLLECTION_NAME } =
    await import('./typesense')

  await ensureProductsCollection()

  const doc = transformShopifyProduct(product)
  await typesenseUpsertDocuments(PRODUCTS_COLLECTION_NAME, [doc])
}

export async function deleteProductFromTypesense(handle: string): Promise<void> {
  const { typesenseDeleteDocument, PRODUCTS_COLLECTION_NAME } = await import('./typesense')

  try {
    await typesenseDeleteDocument(PRODUCTS_COLLECTION_NAME, handle)
  } catch (e) {
    if (e instanceof Error && e.message.includes('Could not find')) {
      return
    }
    throw e
  }
}
