import { z } from 'zod'

const bodySchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
})

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const adminApiKey = config.typesenseApiKey

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  if (!adminApiKey || parsed.data.apiKey !== adminApiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: invalid API key',
    })
  }

  const { syncAllProductsToTypesense } = await import('../../utils/shopify-to-typesense')

  try {
    const result = await syncAllProductsToTypesense()

    return {
      success: true,
      indexed: result.indexed,
      errors: result.errors,
      message:
        result.errors.length > 0
          ? `Indexed ${result.indexed} products with ${result.errors.length} errors`
          : `Successfully indexed ${result.indexed} products`,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Sync failed'
    console.error('[Typesense Sync] Full reindex failed:', msg)
    throw createError({
      statusCode: 500,
      statusMessage: 'Sync failed: ' + msg,
    })
  }
})
