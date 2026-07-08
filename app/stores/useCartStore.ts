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
  savedForLater: CartItem[]
  couponCode: string | null
  discount: number
}

const STORAGE_KEY = 'apan-cart'

function loadPersistedState(): Partial<CartState> {
  if (import.meta.client) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      /* ignore */
    }
  }
  return {}
}

function persistState(state: CartState) {
  if (import.meta.client) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          items: state.items,
          savedForLater: state.savedForLater,
          cartId: state.cartId,
          couponCode: state.couponCode,
          discount: state.discount,
        }),
      )
    } catch {
      /* ignore */
    }
  }
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    cartId: null,
    loading: false,
    savedForLater: [],
    couponCode: null,
    discount: 0,
    ...loadPersistedState(),
  }),

  getters: {
    totalItems: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: (state) => state.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0,
    savedCount: (state) => state.savedForLater.length,
    total: (state) => {
      const sub = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
      return Math.max(0, sub - state.discount)
    },
  },

  actions: {
    init() {
      const persisted = loadPersistedState()
      if (persisted.items) this.items = persisted.items
      if (persisted.savedForLater) this.savedForLater = persisted.savedForLater
      if (persisted.cartId) this.cartId = persisted.cartId
      if (persisted.couponCode) this.couponCode = persisted.couponCode
      if (persisted.discount) this.discount = persisted.discount
    },

    persist() {
      persistState(this.$state)
    },

    async addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
      this.loading = true
      const existing = this.items.find((i) => i.id === item.id)
      if (existing) {
        existing.quantity += item.quantity ?? 1
      } else {
        this.items.push({
          ...item,
          quantity: item.quantity ?? 1,
          maxQuantity: item.maxQuantity ?? 99,
        })
      }
      this.loading = false
      this.persist()
    },

    async updateQuantity(itemId: string, quantity: number) {
      const item = this.items.find((i) => i.id === itemId)
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.maxQuantity || 99))
      }
      this.persist()
    },

    async removeItem(itemId: string) {
      this.items = this.items.filter((i) => i.id !== itemId)
      this.persist()
    },

    async clearCart() {
      this.items = []
      this.cartId = null
      this.couponCode = null
      this.discount = 0
      this.persist()
    },

    async saveForLater(itemId: string) {
      const idx = this.items.findIndex((i) => i.id === itemId)
      if (idx !== -1) {
        this.savedForLater.push(this.items[idx])
        this.items.splice(idx, 1)
      }
      this.persist()
    },

    async moveToCart(itemId: string) {
      const idx = this.savedForLater.findIndex((i) => i.id === itemId)
      if (idx !== -1) {
        this.items.push(this.savedForLater[idx])
        this.savedForLater.splice(idx, 1)
      }
      this.persist()
    },

    async removeSaved(itemId: string) {
      this.savedForLater = this.savedForLater.filter((i) => i.id !== itemId)
      this.persist()
    },

    async applyCoupon(code: string) {
      if (code.toLowerCase() === 'save10') {
        const discount = this.subtotal * 0.1
        this.couponCode = code
        this.discount = discount
        this.persist()
        return { ok: true, message: '10% discount applied!' }
      }
      return { ok: false, message: 'Invalid or expired coupon code.' }
    },

    async removeCoupon() {
      this.couponCode = null
      this.discount = 0
      this.persist()
    },
  },
})
