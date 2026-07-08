<template>
  <div class="container-page py-8">
    <h1 class="text-3xl font-bold text-text">Shopping Cart</h1>

    <div v-if="cart.isEmpty && cart.savedForLater.length === 0" class="mt-12 text-center">
      <svg
        class="mx-auto h-24 w-24 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      <p class="mt-4 text-xl font-medium text-text">Your cart feels lonely</p>
      <p class="mt-1 text-text-muted">Add some products to get started.</p>
      <NuxtLink to="/products" class="btn-primary mt-6 inline-flex items-center gap-2">
        Start Shopping
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </NuxtLink>
    </div>

    <div v-else class="mt-8 grid gap-8 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-6">
        <div v-for="item in cart.items" :key="item.id" class="card flex gap-4 p-4">
          <NuxtLink
            :to="`/products/${item.productId}`"
            class="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
          >
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div v-else class="flex h-full items-center justify-center text-gray-400">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </NuxtLink>
          <div class="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2">
                <NuxtLink
                  :to="`/products/${item.productId}`"
                  class="font-medium text-text hover:text-primary-600 transition-colors line-clamp-1"
                  >{{ item.title }}</NuxtLink
                >
                <button
                  class="shrink-0 text-text-muted hover:text-red-500 transition-colors"
                  @click="cart.removeItem(item.id)"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-sm font-medium text-primary-600">
                ${{ formatPrice(item.price) }}
              </p>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <div class="flex items-center rounded-lg border border-border">
                <button
                  class="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:bg-gray-100 disabled:opacity-30"
                  :disabled="item.quantity <= 1"
                  @click="cart.updateQuantity(item.id, item.quantity - 1)"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span class="flex h-8 w-10 items-center justify-center text-sm text-text">{{
                  item.quantity
                }}</span>
                <button
                  class="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:bg-gray-100 disabled:opacity-30"
                  :disabled="item.quantity >= (item.maxQuantity || 99)"
                  @click="cart.updateQuantity(item.id, item.quantity + 1)"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
              <div class="flex items-center gap-3">
                <button
                  class="text-xs text-text-muted hover:text-text transition-colors"
                  @click="cart.saveForLater(item.id)"
                >
                  Save for later
                </button>
                <span class="text-sm font-semibold text-text"
                  >${{ formatPrice(item.price * item.quantity) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div v-if="cart.savedForLater.length > 0">
          <h3 class="mb-4 text-lg font-semibold text-text">
            Saved for Later ({{ cart.savedForLater.length }})
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in cart.savedForLater"
              :key="item.id"
              class="card flex items-center gap-4 p-4"
            >
              <NuxtLink
                :to="`/products/${item.productId}`"
                class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100"
              >
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <div v-else class="flex h-full items-center justify-center text-gray-400">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </NuxtLink>
              <div class="flex min-w-0 flex-1 items-center justify-between">
                <div>
                  <NuxtLink
                    :to="`/products/${item.productId}`"
                    class="text-sm font-medium text-text hover:text-primary-600 transition-colors"
                    >{{ item.title }}</NuxtLink
                  >
                  <p class="text-sm text-primary-600">${{ formatPrice(item.price) }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    class="text-xs text-primary-600 hover:text-primary-700 transition-colors"
                    @click="cart.moveToCart(item.id)"
                  >
                    Move to cart
                  </button>
                  <button
                    class="text-xs text-text-muted hover:text-red-500 transition-colors"
                    @click="cart.removeSaved(item.id)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="card sticky top-24 p-6">
          <h2 class="text-lg font-semibold text-text">Order Summary</h2>
          <div class="mt-4 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-text-muted">Subtotal</span>
              <span class="text-text">${{ formatPrice(cart.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-text-muted">Shipping</span>
              <span class="text-text">{{ cart.subtotal >= 50 ? 'Free' : '$5.99' }}</span>
            </div>
            <div v-if="cart.discount > 0" class="flex justify-between text-sm">
              <span class="text-text-muted"
                >Discount{{ cart.couponCode ? ` (${cart.couponCode})` : '' }}</span
              >
              <span class="text-green-600">-${{ formatPrice(cart.discount) }}</span>
            </div>
            <hr class="border-border" />
            <div class="flex justify-between text-base font-semibold">
              <span class="text-text">Total</span>
              <span class="text-text"
                >${{ formatPrice(cart.total + (cart.subtotal >= 50 ? 0 : 5.99)) }}</span
              >
            </div>
          </div>

          <div class="mt-6">
            <div v-if="!cart.couponCode" class="flex gap-2">
              <input
                v-model="couponInput"
                type="text"
                placeholder="Coupon code"
                class="input-field flex-1"
                @keyup.enter="applyCoupon"
              />
              <button
                class="btn-secondary shrink-0"
                :disabled="!couponInput.trim()"
                @click="applyCoupon"
              >
                Apply
              </button>
            </div>
            <div
              v-else
              class="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm"
            >
              <span class="text-green-700"
                >Code: <strong>{{ cart.couponCode }}</strong></span
              >
              <button class="text-green-600 hover:text-green-800" @click="cart.removeCoupon()">
                Remove
              </button>
            </div>
            <p v-if="couponError" class="mt-1 text-sm text-red-600">{{ couponError }}</p>
          </div>

          <button
            class="btn-primary mt-6 w-full"
            :disabled="cart.isEmpty || cart.loading"
            @click="checkout"
          >
            <svg
              v-if="cart.loading"
              class="mr-2 inline-block h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Proceed to Checkout
          </button>
          <NuxtLink
            to="/products"
            class="mt-3 block text-center text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >Continue Shopping</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Shopping Cart — APAN Store',
  description: 'Review and manage your cart before checkout.',
})

const ui = useUIStore()
const cart = useCartStore()

const couponInput = ref('')
const couponError = ref('')

function formatPrice(amount: number): string {
  return amount.toFixed(2)
}

async function applyCoupon() {
  couponError.value = ''
  if (!couponInput.value.trim()) return
  const result = await cart.applyCoupon(couponInput.value.trim())
  if (result.ok) {
    couponInput.value = ''
  } else {
    couponError.value = result.message
  }
}

function checkout() {
  cart.loading = true
  setTimeout(() => {
    cart.loading = false
    ui.addToast({ type: 'info', message: 'Checkout coming soon!' })
  }, 500)
}
</script>
