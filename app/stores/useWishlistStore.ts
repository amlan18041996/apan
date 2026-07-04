import { defineStore } from 'pinia'

export interface WishlistItem {
  id: string
  productId: string
  title: string
  image: string
  price: number
  addedAt: string
}

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] as WishlistItem[]
  }),

  getters: {
    count: (state) => state.items.length,
    isInWishlist: (state) => (productId: string) =>
      state.items.some(i => i.productId === productId)
  },

  actions: {
    async toggleItem(product: Omit<WishlistItem, 'addedAt'>) {
      const existing = this.items.find(i => i.productId === product.productId)
      if (existing) {
        this.items = this.items.filter(i => i.productId !== product.productId)
      } else {
        this.items.push({ ...product, addedAt: new Date().toISOString() })
      }
    },

    async removeItem(productId: string) {
      this.items = this.items.filter(i => i.productId !== productId)
    },

    async clearWishlist() {
      this.items = []
    }
  }
})
