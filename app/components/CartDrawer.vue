<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="ui.isCartDrawerOpen"
        class="fixed inset-0 z-50 bg-black/50"
        @click="ui.toggleCartDrawer"
      />
    </Transition>
    <Transition name="slide">
      <div
        v-if="ui.isCartDrawerOpen"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface shadow-xl"
      >
        <div class="flex h-full flex-col">
          <div class="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 class="text-lg font-semibold text-text">Cart ({{ cart.totalItems }})</h2>
            <button
              class="rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
              @click="ui.toggleCartDrawer"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div v-if="cart.isEmpty" class="flex flex-1 items-center justify-center">
            <p class="text-text-muted">Your cart is empty</p>
          </div>
          <div v-else class="flex-1 overflow-y-auto px-6 py-4">
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="mb-4 flex gap-4 rounded-lg border border-border p-3"
            >
              <img :src="item.image" :alt="item.title" class="h-20 w-20 rounded-lg object-cover" />
              <div class="flex-1">
                <h3 class="text-sm font-medium text-text">{{ item.title }}</h3>
                <p class="text-sm font-semibold text-primary-600">${{ item.price.toFixed(2) }}</p>
                <div class="mt-2 flex items-center gap-2">
                  <button
                    class="flex h-7 w-7 items-center justify-center rounded border border-border text-text-muted transition-colors hover:bg-gray-100"
                    @click="cart.updateQuantity(item.id, item.quantity - 1)"
                  >
                    -
                  </button>
                  <span class="w-8 text-center text-sm text-text">{{ item.quantity }}</span>
                  <button
                    class="flex h-7 w-7 items-center justify-center rounded border border-border text-text-muted transition-colors hover:bg-gray-100"
                    @click="cart.updateQuantity(item.id, item.quantity + 1)"
                  >
                    +
                  </button>
                  <button
                    class="ml-auto text-sm text-red-500 transition-colors hover:text-red-700"
                    @click="cart.removeItem(item.id)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!cart.isEmpty" class="border-t border-border px-6 py-4">
            <div class="mb-4 flex items-center justify-between">
              <span class="text-text-muted">Subtotal</span>
              <span class="text-lg font-semibold text-text">${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <button class="btn-primary w-full">Checkout</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useCartStore } from '~/stores/useCartStore'

const ui = useUIStore()
const cart = useCartStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(100%);
}
</style>
