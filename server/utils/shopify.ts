import { shopifyApi, ApiVersion } from '@shopify/shopify-api'

let shopifyClient: ReturnType<typeof shopifyApi> | null = null

function getConfig() {
  return {
    storeDomain: process.env.NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '',
    storefrontAccessToken: process.env.NUXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '',
    apiVersion: process.env.NUXT_PUBLIC_SHOPIFY_API_VERSION || ApiVersion.July26,
  }
}

function getClient() {
  if (shopifyClient) return shopifyClient

  const config = getConfig()

  shopifyClient = shopifyApi({
    apiKey: config.storefrontAccessToken,
    apiSecretKey: config.storefrontAccessToken || '',
    apiVersion: config.apiVersion as unknown as ApiVersion,
    scopes: ['unauthenticated_read_product_listings'],
    isEmbeddedApp: false,
    hostName: config.storeDomain.replace('.myshopify.com', ''),
  })

  return shopifyClient
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const config = getConfig()
  const endpoint = `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`

  const response = await $fetch<{ data: T; errors?: { message: string }[] }>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken,
    },
    body: { query, variables },
  })

  if (response.errors?.length) {
    throw new Error(response.errors[0]?.message || 'Shopify API error')
  }

  return response.data
}

export async function shopifyAdminFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const config = getConfig()
  const endpoint = `https://${config.storeDomain}/admin/api/${config.apiVersion}/graphql.json`

  const token = await getAdminToken()

  const response = await $fetch<{ data: T; errors?: { message: string }[] }>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: { query, variables },
  })

  if (response.errors?.length) {
    throw new Error(response.errors[0]?.message || 'Shopify Admin API error')
  }

  return response.data
}

export function getShopifyClient() {
  return getClient()
}
