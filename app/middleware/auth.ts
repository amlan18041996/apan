import { useUserStore } from '~/stores/useUserStore'

export default defineNuxtRouteMiddleware(async (_to) => {
  if (import.meta.server) return

  const userStore = useUserStore()

  if (!userStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }
})
