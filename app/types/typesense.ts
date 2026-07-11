export interface TypesenseConfig {
  host: string
  port: number
  apiKey: string
  protocol: string
}

export interface TypesenseProduct {
  id: string
  title: string
  handle: string
  description: string
  productType: string
  vendor: string
  tags: string[]
  price: number
  minPrice: number
  maxPrice: number
  image: string
  inventory: number
  status: string
  createdAt: number
  popularityScore: number
}

export interface TypesenseSearchResponse<T> {
  found: number
  hits: TypesenseSearchHit<T>[]
  page: number
  per_page: number
  total_pages: number
  search_time_ms: number
}

export interface TypesenseSearchHit<T> {
  document: T
  highlight?: Record<string, TypesenseHighlightField>
  snippet?: Record<string, string>
  distances?: number[]
}

export interface TypesenseHighlightField {
  snippet: string
  matched_tokens: string[]
}

export interface TypesenseCollectionSchema {
  name: string
  fields: TypesenseField[]
  default_sorting_field?: string
  token_separators?: string[]
  symbols_to_index?: string[]
}

export interface TypesenseField {
  name: string
  type: TypesenseFieldType
  facet?: boolean
  sort?: boolean
  optional?: boolean
}

export type TypesenseFieldType =
  'string' | 'string[]' | 'int32' | 'int64' | 'float' | 'bool' | 'auto'
