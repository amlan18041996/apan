import { defineStore } from 'pinia'

const STORAGE_KEY = 'apan-wishlist'

export interface WishlistItem {
  id: string
  productId: string
  title: string
  image: string
  price: number
  addedAt: string
}

function loadPersistedState(): WishlistItem[] {
  if (import.meta.client) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      /* ignore */
    }
  }
  return []
}

function persistState(items: WishlistItem[]) {
  if (import.meta.client) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }
}

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] as WishlistItem[],
  }),

  getters: {
    count: (state) => state.items.length,
    isInWishlist: (state) => (productId: string) =>
      state.items.some((i) => i.productId === productId),
  },

  actions: {
    init() {
      this.items = loadPersistedState()
    },

    async toggleItem(product: Omit<WishlistItem, 'addedAt'>) {
      const existing = this.items.find((i) => i.productId === product.productId)
      if (existing) {
        this.items = this.items.filter((i) => i.productId !== product.productId)
      } else {
        this.items.push({ ...product, addedAt: new Date().toISOString() })
      }
      persistState(this.items)
    },

    async removeItem(productId: string) {
      this.items = this.items.filter((i) => i.productId !== productId)
      persistState(this.items)
    },

    async clearWishlist() {
      this.items = []
      persistState(this.items)
    },
  },
})
