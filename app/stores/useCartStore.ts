import { defineStore } from 'pinia'

export interface CartItem {
  id: string
  productId: string
  variantId: string
  title: string
  image: string
  price: number
  quantity: number
  maxQuantity: number
}

export interface CartState {
  items: CartItem[]
  cartId: string | null
  loading: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    cartId: null,
    loading: false
  }),

  getters: {
    totalItems: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: (state) => state.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    async addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
      const existing = this.items.find(i => i.id === item.id)
      if (existing) {
        existing.quantity += item.quantity ?? 1
      } else {
        this.items.push({ ...item, quantity: item.quantity ?? 1 })
      }
    },

    async updateQuantity(itemId: string, quantity: number) {
      const item = this.items.find(i => i.id === itemId)
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.maxQuantity))
      }
    },

    async removeItem(itemId: string) {
      this.items = this.items.filter(i => i.id !== itemId)
    },

    async clearCart() {
      this.items = []
      this.cartId = null
    }
  }
})
