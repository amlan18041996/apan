let cachedToken: { token: string; expiresAt: number } | null = null
let fetchingPromise: Promise<string> | null = null

function getCredentials() {
  return {
    clientId: process.env.NUXT_SHOPIFY_CLIENT_ID || '',
    clientSecret: process.env.NUXT_SHOPIFY_CLIENT_SECRET || '',
    storeDomain: process.env.NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN || ''
  }
}

async function fetchNewToken(): Promise<string> {
  const { clientId, clientSecret, storeDomain } = getCredentials()

  if (!clientId || !clientSecret || !storeDomain) {
    throw new Error('Shopify Admin OAuth credentials not configured. Set NUXT_SHOPIFY_CLIENT_ID and NUXT_SHOPIFY_CLIENT_SECRET in .env')
  }

  const response = await $fetch<{
    access_token: string
    expires_in: number
    scope?: string
  }>(`https://${storeDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  })

  if (!response.access_token) {
    throw new Error('Failed to obtain Shopify Admin API token')
  }

  const expiresIn = response.expires_in || 86399
  const buffer = Math.min(Math.floor(expiresIn * 0.2), 300)
  cachedToken = {
    token: response.access_token,
    expiresAt: Date.now() + (expiresIn - buffer) * 1000
  }

  return response.access_token
}

export async function getAdminToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  if (fetchingPromise) {
    return fetchingPromise
  }

  fetchingPromise = fetchNewToken().finally(() => {
    fetchingPromise = null
  })

  return fetchingPromise
}

export function clearAdminToken() {
  cachedToken = null
}
