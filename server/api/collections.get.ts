export default defineEventHandler(async (_event) => {
  const { shopifyAdminFetch } = await import('../utils/shopify')

  const query = `
    {
      collections(first: 20) {
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
          productsCount {
            count
          }
        }
      }
    }
  `

  return shopifyAdminFetch(query)
})
