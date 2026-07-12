import crypto from 'crypto'

function verifyShopifyHmac(body: string, hmacHeader: string, secret: string): boolean {
  const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64')
  return hash === hmacHeader
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const webhookSecret = config.shopifyAdminToken

  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Empty request body' })
  }

  const hmacHeader = getHeader(event, 'x-shopify-hmac-sha256')
  if (!hmacHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Missing HMAC header' })
  }

  if (webhookSecret && !verifyShopifyHmac(rawBody, hmacHeader, webhookSecret)) {
    console.error('[Webhook] Invalid HMAC signature')
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  const topic = getHeader(event, 'x-shopify-topic')
  const body = JSON.parse(rawBody)

  try {
    if (topic === 'products/create' || topic === 'products/update') {
      const { fetchShopifyProductByHandle, upsertProductToTypesense } =
        await import('../../utils/shopify-to-typesense')

      const handle = body.handle
      if (!handle) {
        console.error('[Webhook] Missing product handle in payload')
        return { success: false, message: 'Missing product handle' }
      }

      const product = await fetchShopifyProductByHandle(handle)
      if (product) {
        await upsertProductToTypesense(product)
        return { success: true, action: 'upsert', handle }
      }

      console.warn(`[Webhook] Product not found: ${handle}`)
      return { success: false, message: 'Product not found' }
    }

    if (topic === 'products/delete') {
      const { deleteProductFromTypesense } = await import('../../utils/shopify-to-typesense')

      const handle = body.handle
      if (!handle) {
        console.error('[Webhook] Missing product handle in delete payload')
        return { success: false, message: 'Missing product handle' }
      }

      await deleteProductFromTypesense(handle)
      return { success: true, action: 'delete', handle }
    }

    return { success: true, message: `Unhandled topic: ${topic}` }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error(`[Webhook] Error processing ${topic}:`, msg)
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed',
    })
  }
})
