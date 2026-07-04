import { defineStore } from 'pinia'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
}

export interface UserState {
  user: User | null
  accessToken: string | null
  loading: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    accessToken: null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : ''
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      try {

      } finally {
        this.loading = false
      }
    },

    async register(data: { email: string; password: string; firstName: string; lastName: string }) {
      this.loading = true
      try {

      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      this.accessToken = null
    },

    async fetchProfile() {
      if (!this.accessToken) return
      this.loading = true
      try {

      } finally {
        this.loading = false
      }
    }
  }
})
