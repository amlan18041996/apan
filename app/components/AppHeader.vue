<template>
  <header class="border-b border-border bg-surface">
    <div class="container-page flex h-16 items-center justify-between">
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="text-xl font-bold text-text">APAN Store</NuxtLink>
        <nav class="hidden items-center gap-6 md:flex">
          <NuxtLink to="/products" class="text-sm font-medium text-text-muted transition-colors hover:text-text">Products</NuxtLink>
          <NuxtLink to="/collections" class="text-sm font-medium text-text-muted transition-colors hover:text-text">Collections</NuxtLink>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink v-if="!user.isAuthenticated" to="/auth/login" class="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text">Sign in</NuxtLink>
        <NuxtLink v-if="!user.isAuthenticated" to="/auth/register" class="btn-primary text-sm">Sign up</NuxtLink>
        <NuxtLink v-if="user.isAuthenticated" to="/account" class="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text">{{ user.fullName || 'My Account' }}</NuxtLink>
        <button v-if="user.isAuthenticated" class="rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 hover:text-text" @click="user.logout()">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
        <button class="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 hover:text-text" @click="ui.toggleSearch">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </button>
        <button class="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 hover:text-text" @click="ui.toggleCartDrawer">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <span v-if="cart.totalItems > 0" class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">{{ cart.totalItems }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useCartStore } from '~/stores/useCartStore'
import { useUserStore } from '~/stores/useUserStore'

const ui = useUIStore()
const cart = useCartStore()
const user = useUserStore()
</script>