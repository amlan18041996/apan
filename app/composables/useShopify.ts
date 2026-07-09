import type { ShopifyProduct, ShopifyCollection, ShopifyPageInfo } from '~/types/shopify'

export function useShopify() {
  async function getProducts(
    first: number = 20,
    after?: string,
  ): Promise<{ products: ShopifyProduct[]; pageInfo: ShopifyPageInfo }> {
    const params = new URLSearchParams({ first: String(first) })
    if (after) params.set('after', after)

    const data = await $fetch<{ products: { nodes: ShopifyProduct[]; pageInfo: ShopifyPageInfo } }>(
      `/api/products?${params}`,
    )
    return {
      products: data.products.nodes,
      pageInfo: data.products.pageInfo,
    }
  }

  async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
    const data = await $fetch<{ productByHandle: ShopifyProduct | null }>(`/api/products/${handle}`)
    return data.productByHandle
  }

  async function getCollections(first: number = 20): Promise<{ collections: ShopifyCollection[] }> {
    const data = await $fetch<{ collections: { nodes: ShopifyCollection[] } }>(
      `/api/collections?first=${first}`,
    )
    return { collections: data.collections.nodes }
  }

  async function searchProducts(
    query_term: string,
    first: number = 20,
  ): Promise<{ products: ShopifyProduct[] }> {
    const result = await getProducts(first)
    const filtered = result.products.filter(
      (p) =>
        p.title.toLowerCase().includes(query_term.toLowerCase()) ||
        p.description.toLowerCase().includes(query_term.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(query_term.toLowerCase())),
    )
    return { products: filtered }
  }

  return {
    getProducts,
    getProductByHandle,
    getCollections,
    searchProducts,
  }
}
