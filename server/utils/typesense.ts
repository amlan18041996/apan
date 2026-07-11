import TypesenseClient from 'typesense'
import type { TypesenseCollectionSchema } from '~/types/typesense'

let typesenseClient: InstanceType<typeof TypesenseClient> | null = null

function getConfig() {
  return {
    host: process.env.NUXT_TYPESENSE_HOST || 'localhost',
    port: parseInt(process.env.NUXT_TYPESENSE_PORT || '8108', 10),
    apiKey: process.env.NUXT_TYPESENSE_API_KEY || '',
    protocol: process.env.NUXT_TYPESENSE_PROTOCOL || 'http',
  }
}

function getClient() {
  if (typesenseClient) return typesenseClient

  const config = getConfig()

  if (!config.apiKey) {
    throw new Error(
      'Typesense API key not configured. Set NUXT_TYPESENSE_API_KEY in your .env file.',
    )
  }

  typesenseClient = new TypesenseClient({
    nodes: [
      {
        host: config.host,
        port: config.port,
        protocol: config.protocol,
      },
    ],
    apiKey: config.apiKey,
    connectionTimeoutSeconds: 2,
  })

  return typesenseClient
}

export function getTypesenseClient() {
  return getClient()
}

export const PRODUCTS_COLLECTION_NAME = 'products'

export const productsCollectionSchema: TypesenseCollectionSchema = {
  name: PRODUCTS_COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string', optional: true },
    { name: 'title', type: 'string', sort: true },
    { name: 'handle', type: 'string', optional: true },
    { name: 'description', type: 'string' },
    { name: 'productType', type: 'string', facet: true },
    { name: 'vendor', type: 'string', facet: true, sort: true },
    { name: 'tags', type: 'string[]', facet: true },
    { name: 'price', type: 'float', sort: true, facet: true },
    { name: 'minPrice', type: 'float' },
    { name: 'maxPrice', type: 'float' },
    { name: 'image', type: 'string', optional: true },
    { name: 'inventory', type: 'int32', facet: true },
    { name: 'status', type: 'string', facet: true },
    { name: 'createdAt', type: 'int64', sort: true },
    { name: 'popularityScore', type: 'float', sort: true },
  ],
  default_sorting_field: 'popularityScore',
  token_separators: ['-', '/', '_', '&'],
  symbols_to_index: ['@', '.', '-', '_'],
}

export async function ensureProductsCollection() {
  const client = getClient()
  try {
    await client.collections(PRODUCTS_COLLECTION_NAME).retrieve()
  } catch {
    await client.collections().create(productsCollectionSchema)
  }
}

export async function typesenseSearch<T>(
  collection: string,
  params: Record<string, unknown>,
): Promise<T> {
  const client = getClient()
  return client.collections(collection).documents().search(params) as T
}

export async function typesenseUpsertDocuments(
  collection: string,
  documents: Record<string, unknown>[],
) {
  const client = getClient()
  return client.collections(collection).documents().import(documents, { action: 'upsert' })
}

export async function typesenseDeleteDocument(collection: string, documentId: string) {
  const client = getClient()
  return client.collections(collection).documents(documentId).delete()
}

export async function typesenseDeleteAllDocuments(collection: string) {
  const client = getClient()
  return client.collections(collection).documents().delete()
}
