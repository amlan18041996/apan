export default defineEventHandler(async (event) => {
  const { shopifyAdminFetch } = await import('../../utils/shopify')
  const handle = getRouterParam(event, 'handle')

  const query = `
    query productByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
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
    }
  `

  const result = await shopifyAdminFetch<{ productByHandle: any }>(query, { handle })
  return result
})
