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
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    fullName: (state) =>
      state.user ? `${state.user.firstName} ${state.user.lastName}`.trim() || state.user.email : '',
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      try {
        const data = await $fetch<{ user: User; accessToken: string }>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        this.user = data.user
        this.accessToken = data.accessToken
        return true
      } catch (err: any) {
        throw new Error(err.data?.statusMessage || err.message || 'Login failed')
      } finally {
        this.loading = false
      }
    },

    async register(data: { email: string; password: string; firstName: string; lastName: string }) {
      this.loading = true
      try {
        const result = await $fetch<{ user: User; accessToken: string }>('/api/auth/register', {
          method: 'POST',
          body: data,
        })
        this.user = result.user
        this.accessToken = result.accessToken
        return true
      } catch (err: any) {
        throw new Error(err.data?.statusMessage || err.message || 'Registration failed')
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
        const data = await $fetch<{ user: User }>('/api/auth/me', {
          headers: { authorization: `Bearer ${this.accessToken}` },
        })
        this.user = data.user
      } catch {
        this.user = null
        this.accessToken = null
      } finally {
        this.loading = false
      }
    },
  },
})
