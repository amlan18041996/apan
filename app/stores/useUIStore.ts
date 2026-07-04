import { defineStore } from 'pinia'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface UIState {
  isMobileMenuOpen: boolean
  isCartDrawerOpen: boolean
  isSearchOpen: boolean
  isDarkMode: boolean
  activeModal: string | null
  toasts: Toast[]
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    isMobileMenuOpen: false,
    isCartDrawerOpen: false,
    isSearchOpen: false,
    isDarkMode: false,
    activeModal: null,
    toasts: []
  }),

  getters: {
    hasActiveModal: (state) => state.activeModal !== null
  },

  actions: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },

    toggleCartDrawer() {
      this.isCartDrawerOpen = !this.isCartDrawerOpen
    },

    toggleSearch() {
      this.isSearchOpen = !this.isSearchOpen
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      if (import.meta.client) {
        document.documentElement.classList.toggle('dark', this.isDarkMode)
      }
    },

    openModal(modalId: string) {
      this.activeModal = modalId
    },

    closeModal() {
      this.activeModal = null
    },

    addToast(toast: Omit<Toast, 'id'>) {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      this.toasts.push({ ...toast, id })
      const duration = toast.duration ?? 5000
      setTimeout(() => this.removeToast(id), duration)
    },

    removeToast(id: string) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    }
  }
})
